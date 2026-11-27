import { beam, coefficients, MODES, peakAmplitude, type Drive } from './plate.ts';
import { AMP_SIZE, BEAM_ROWS, FIELD_FS, GRAIN_FS, GRAIN_VS, LUT_SIZE, PLATE_FS, QUAD_VS, SAND_FS, SAND_H, SAND_W } from './shaders.ts';

/** strength (0…1] scales how far grains are tossed: the plate's response relative to resonance. */
export interface PlateState { frequency: number; drive: Drive; strength: number }

export interface PlateSim {
  mode: 'webgl' | 'canvas';
  tune: (state: PlateState) => void;
  /** advances the sand `steps` times and draws */
  frame: (showField: boolean, steps: number) => void;
  /** draws without advancing (paused) */
  render: (showField: boolean) => void;
  scatter: () => void;
  dispose: () => void;
}

type GL = WebGL2RenderingContext;

function compile(gl: GL, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader');
    return sh;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs)); gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return { p, at: (n: string) => gl.getUniformLocation(p, n) };
}

function floatTexture(gl: GL, w: number, h: number, data: Float32Array | null, format: 'r' | 'rgba') {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (format === 'r') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, data);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, data);
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
  return tex;
}

function target(gl: GL, tex: WebGLTexture) {
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('float framebuffer');
  return fb;
}

function beamLut(): Float32Array {
  const data = new Float32Array(LUT_SIZE * BEAM_ROWS);
  for (let m = 0; m < BEAM_ROWS; m++) for (let i = 0; i < LUT_SIZE; i++) data[m * LUT_SIZE + i] = beam(m, i / (LUT_SIZE - 1));
  return data;
}

function sandSeed(): Float32Array {
  const data = new Float32Array(SAND_W * SAND_H * 4);
  for (let i = 0; i < SAND_W * SAND_H; i++) { data[4 * i] = Math.random(); data[4 * i + 1] = Math.random(); data[4 * i + 2] = Math.random() * 1000; }
  return data;
}

/** Packs modes (row 0) and their normalised complex coefficients (row 1). */
function modeTexture(state: PlateState): Float32Array {
  const coef = coefficients(state.frequency, state.drive);
  const peak = peakAmplitude(coef);
  const data = new Float32Array(MODES.length * 2 * 4);
  MODES.forEach((mode, k) => {
    data.set([mode.m, mode.n, mode.sign, 0], 4 * k);
    data.set([coef[k][0] / peak, coef[k][1] / peak, 0, 0], 4 * (MODES.length + k));
  });
  return data;
}

export function createGpuPlate(canvas: HTMLCanvasElement, initial: PlateState): PlateSim | null {
  const probe = document.createElement('canvas').getContext('webgl2');
  const ok = !!probe?.getExtension('EXT_color_buffer_float');
  probe?.getExtension('WEBGL_lose_context')?.loseContext();
  if (!ok) return null;
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;
  try { return build(gl, canvas, initial); } catch (error) { console.warn('[chladni]', error); return null; }
}

function build(gl: GL, canvas: HTMLCanvasElement, initial: PlateState): PlateSim {
  const field = compile(gl, QUAD_VS, FIELD_FS), sand = compile(gl, QUAD_VS, SAND_FS);
  const plate = compile(gl, QUAD_VS, PLATE_FS), grains = compile(gl, GRAIN_VS, GRAIN_FS);
  const quad = gl.createVertexArray(); gl.bindVertexArray(quad);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const empty = gl.createVertexArray();
  const lut = floatTexture(gl, LUT_SIZE, BEAM_ROWS, beamLut(), 'r');
  let modes = floatTexture(gl, MODES.length, 2, modeTexture(initial), 'rgba');
  const amp = floatTexture(gl, AMP_SIZE, AMP_SIZE, null, 'rgba'), ampFb = target(gl, amp);
  const seed = sandSeed();
  const states = [floatTexture(gl, SAND_W, SAND_H, seed, 'rgba'), floatTexture(gl, SAND_W, SAND_H, seed, 'rgba')];
  const fbs = states.map((t) => target(gl, t));
  let cur = 0, frameNo = 0, scatter = false, drive = initial.drive, kick = 0.03 * initial.strength;
  const bind = (unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) => {
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit);
  };
  const computeField = () => {
    gl.useProgram(field.p); gl.bindVertexArray(quad);
    bind(0, lut, field.at('uBeam')); bind(1, modes, field.at('uModes'));
    gl.uniform1i(field.at('uCount'), MODES.length);
    gl.bindFramebuffer(gl.FRAMEBUFFER, ampFb); gl.viewport(0, 0, AMP_SIZE, AMP_SIZE);
    gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  computeField();
  const stepSand = () => {
    gl.useProgram(sand.p); gl.bindVertexArray(quad);
    bind(0, states[cur], sand.at('uState')); bind(1, amp, sand.at('uAmp'));
    gl.uniform1f(sand.at('uFrame'), ++frameNo); gl.uniform1f(sand.at('uKick'), kick);
    gl.uniform1f(sand.at('uScatter'), scatter ? 1 : 0); scatter = false;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[1 - cur]); gl.viewport(0, 0, SAND_W, SAND_H);
    gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    cur = 1 - cur;
  };
  const draw = (showField: boolean) => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * ratio), h = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h);
    gl.useProgram(plate.p); gl.bindVertexArray(quad); bind(0, amp, plate.at('uAmp'));
    gl.uniform1f(plate.at('uShowField'), showField ? 1 : 0); gl.uniform2f(plate.at('uDrive'), drive.x, drive.y);
    gl.disable(gl.BLEND); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(grains.p); gl.bindVertexArray(empty); bind(0, states[cur], grains.at('uState'));
    gl.uniform1f(grains.at('uSize'), Math.max(1.5, (w / 420) * 1.6));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.POINTS, 0, SAND_W * SAND_H);
  };
  return {
    mode: 'webgl',
    tune: (state) => {
      drive = state.drive; kick = 0.03 * state.strength;
      gl.deleteTexture(modes); modes = floatTexture(gl, MODES.length, 2, modeTexture(state), 'rgba');
      computeField();
    },
    frame: (showField, steps) => { for (let i = 0; i < steps; i++) stepSand(); draw(showField); },
    render: draw,
    scatter: () => { scatter = true; stepSand(); },
    dispose: () => { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
