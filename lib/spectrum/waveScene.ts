/**
 * Plane electromagnetic wave in three.js. Loaded only on the client through dynamic import
 * so three never reaches the Worker bundle.
 *
 * Physics drawn: E and B perpendicular to each other and to k, in phase, with B = (1/c) k̂ × E.
 * B is drawn scaled by c so both have the same length on screen.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export type Polarization = 'linear' | 'circular';
export type WaveView = 'oblique' | 'side' | 'front';

export interface WaveHandle {
  setPolarization: (p: Polarization) => void;
  setTint: (rgb: readonly [number, number, number]) => void;
  setView: (v: WaveView) => void;
  setRunning: (on: boolean) => void;
  /** Stops the render loop entirely while the canvas is off screen. */
  setVisible: (on: boolean) => void;
  dispose: () => void;
}

const LAMBDA = 2;
const LENGTH = 3 * LAMBDA;
const AMP = 0.95;
const SAMPLES = 240;
const STEMS = 36;
const E_COLOR = 0xff7a45;
const B_COLOR = 0x4cc3ff;
const VIEWS: Record<WaveView, [number, number, number]> = {
  oblique: [5.6, 3.1, 5.4], side: [8.6, 0.01, 0], front: [0.01, 0.01, 8.2],
};

/** Field vectors at depth z and phase φ. Returns [E, B] as (x, y) pairs. */
function fields(z: number, phase: number, pol: Polarization): [number, number, number, number] {
  const a = (2 * Math.PI * z) / LAMBDA - phase;
  if (pol === 'linear') return [0, AMP * Math.sin(a), -AMP * Math.sin(a), 0];
  const ex = AMP * Math.cos(a), ey = AMP * Math.sin(a);
  return [ex, ey, -ey, ex];
}

function makeLine(color: number, width: number, opacity: number) {
  const material = new LineMaterial({ color, linewidth: width, transparent: opacity < 1, opacity,
    blending: opacity < 1 ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: opacity >= 1 });
  const line = new Line2(new LineGeometry(), material);
  line.frustumCulled = false;
  return line;
}

function makeStems(color: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STEMS * 6), 3));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
  const stems = new THREE.LineSegments(geometry, material);
  stems.frustumCulled = false;
  return stems;
}

function makeFronts(): THREE.Mesh[] {
  const geometry = new THREE.PlaneGeometry(2.6, 2.6);
  return Array.from({ length: 4 }, () => new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.07, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));
}

function makeStage(scene: THREE.Scene) {
  const axis = makeLine(0xcfd8e6, 1.5, 0.6);
  axis.geometry.setPositions([0, 0, -LENGTH / 2 - 0.4, 0, 0, LENGTH / 2 + 0.6]);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 20), new THREE.MeshBasicMaterial({ color: 0xcfd8e6 }));
  head.rotation.x = Math.PI / 2;
  head.position.z = LENGTH / 2 + 0.7;
  const grid = new THREE.GridHelper(LENGTH + 2, 16, 0x1c2a40, 0x121b2b);
  grid.position.y = -1.6;
  scene.add(axis, head, grid);
}

interface Parts { e: Line2; eGlow: Line2; b: Line2; bGlow: Line2; eStems: THREE.LineSegments; bStems: THREE.LineSegments; fronts: THREE.Mesh[] }

function update(parts: Parts, phase: number, pol: Polarization) {
  const ep: number[] = [], bp: number[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const z = -LENGTH / 2 + (LENGTH * i) / SAMPLES;
    const [ex, ey, bx, by] = fields(z, phase, pol);
    ep.push(ex, ey, z); bp.push(bx, by, z);
  }
  for (const [line, pts] of [[parts.e, ep], [parts.eGlow, ep], [parts.b, bp], [parts.bGlow, bp]] as const) {
    line.geometry.setPositions(pts);
  }
  const es = parts.eStems.geometry.getAttribute('position') as THREE.BufferAttribute;
  const bs = parts.bStems.geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < STEMS; i++) {
    const z = -LENGTH / 2 + (LENGTH * (i + 0.5)) / STEMS;
    const [ex, ey, bx, by] = fields(z, phase, pol);
    es.setXYZ(2 * i, 0, 0, z); es.setXYZ(2 * i + 1, ex, ey, z);
    bs.setXYZ(2 * i, 0, 0, z); bs.setXYZ(2 * i + 1, bx, by, z);
  }
  es.needsUpdate = true; bs.needsUpdate = true;
  const crest = ((phase / (2 * Math.PI)) * LAMBDA + LAMBDA / 4) % LAMBDA;
  parts.fronts.forEach((front, i) => {
    const z = -LENGTH / 2 + crest + i * LAMBDA;
    front.visible = z <= LENGTH / 2;
    front.position.z = z;
  });
}

export function mountWave(canvas: HTMLCanvasElement, interactive: boolean): WaveHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x05070d);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 9, 18);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = interactive;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  makeStage(scene);
  const parts: Parts = {
    e: makeLine(E_COLOR, 3.2, 1), eGlow: makeLine(E_COLOR, 11, 0.16),
    b: makeLine(B_COLOR, 3.2, 1), bGlow: makeLine(B_COLOR, 11, 0.16),
    eStems: makeStems(E_COLOR), bStems: makeStems(B_COLOR), fronts: makeFronts(),
  };
  scene.add(parts.eGlow, parts.bGlow, parts.e, parts.b, parts.eStems, parts.bStems, ...parts.fronts);
  return runLoop({ renderer, scene, camera, controls, parts, canvas });
}

interface LoopInput {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera;
  controls: OrbitControls; parts: Parts; canvas: HTMLCanvasElement;
}

function runLoop({ renderer, scene, camera, controls, parts, canvas }: LoopInput): WaveHandle {
  let pol: Polarization = 'linear', running = true, visible = true, phase = 0, last = performance.now(), raf = 0;
  const setView = (v: WaveView) => { camera.position.set(...VIEWS[v]); controls.target.set(0, 0, 0); controls.update(); };
  setView('oblique');
  const frame = (now: number) => {
    if (!visible) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      for (const l of [parts.e, parts.eGlow, parts.b, parts.bGlow]) l.material.resolution.set(w, h);
    }
    if (running) phase += ((now - last) / 1000) * Math.PI; // one period every 2 s of animation
    last = now;
    update(parts, phase, pol);
    controls.update();
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);
  return {
    setPolarization: (p) => { pol = p; },
    setTint: (rgb) => parts.fronts.forEach((f) => (f.material as THREE.MeshBasicMaterial).color.setRGB(...rgb)),
    setView,
    setRunning: (on) => { running = on; },
    setVisible: (on) => {
      visible = on;
      if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    },
    dispose: () => { cancelAnimationFrame(raf); controls.dispose(); renderer.dispose(); renderer.forceContextLoss(); },
  };
}
