import { createQuad } from '../glQuad.ts';
import { CLAD, CORE, ENTRY_X, EXIT_X, LENGTH, type Segment } from './trace.ts';

export const MAX_SEGMENTS = 40;

export interface FiberScene { core: number; cladding: number; acceptanceDeg: number; color: readonly [number, number, number]; segments: Segment[] }

export interface FiberRenderer { mode: 'webgl' | 'canvas'; render: (scene: FiberScene) => void; dispose: () => void }

const f = (n: number) => n.toFixed(4);

/**
 * Glass, coating and the acceptance cone are drawn analytically; the light is a sum of
 * glowing segments whose brightness is the power the ray still carries (Fresnel losses).
 */
const FRAGMENT = `
uniform vec2 uRes; uniform vec3 uColor; uniform float uAccept; uniform float uCore; uniform float uClad; uniform float uCount;
uniform vec4 uSeg[${MAX_SEGMENTS}]; uniform float uPow[${MAX_SEGMENTS}];
const float L = ${f(LENGTH)}; const float A = ${f(CORE)}; const float B = ${f(CLAD)};
const float X0 = ${f(ENTRY_X)}; const float X1 = ${f(EXIT_X)};
float segDist(vec2 p, vec4 s) {
  vec2 a = s.xy, b = s.zw, ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - a - ab * t);
}
void main() {
  vec2 p = vec2(vUv.x * L, (vUv.y - 0.5) * L * uRes.y / uRes.x);
  float px = L / uRes.x;
  vec3 col = vec3(0.02, 0.028, 0.05);
  float inFiber = step(X0, p.x) * step(p.x, X1);
  float ay = abs(p.y);
  if (inFiber > 0.5) {
    float glass = clamp((uClad - 1.0) * 4.0, 0.0, 1.0);
    float coat = step(B, ay) * step(ay, B + 0.035) * glass;
    col = mix(col, vec3(0.06, 0.09, 0.14), step(ay, B) * glass);
    col = mix(col, vec3(0.08, 0.14, 0.21) + vec3(0.03, 0.05, 0.07) * clamp((uCore - uClad) * 10.0, 0.0, 1.0), step(ay, A));
    col = mix(col, vec3(0.16, 0.17, 0.19), coat);
    col += vec3(0.25, 0.4, 0.55) * (1.0 - smoothstep(0.0, 1.5 * px, abs(ay - A))) * 0.6;
  }
  if (p.x < X0) {
    float ang = atan(abs(p.y), X0 - p.x);
    float fade = smoothstep(X0 - 0.48, X0, p.x);
    col += uColor * 0.12 * (1.0 - smoothstep(uAccept - 0.004, uAccept + 0.004, ang)) * fade;
    col += uColor * 0.45 * (1.0 - smoothstep(0.0, 1.5 * px, abs(sin(ang - uAccept)) * length(vec2(X0 - p.x, p.y)))) * fade;
  }
  for (int i = 0; i < ${MAX_SEGMENTS}; i++) {
    if (float(i) >= uCount) break;
    float d = segDist(p, uSeg[i]) / px;
    float w = uPow[i];
    col += uColor * w * ((1.0 - smoothstep(0.6, 1.8, d)) * 1.1 + exp(-d * 0.22) * 0.35);
    col += vec3(1.0) * w * (1.0 - smoothstep(0.0, 0.9, d)) * 0.5;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

function canvasRenderer(canvas: HTMLCanvasElement): FiberRenderer {
  const ctx = canvas.getContext('2d');
  return {
    mode: 'canvas',
    render: ({ color, segments }) => {
      if (!ctx) return;
      const w = (canvas.width = canvas.clientWidth * 2), h = (canvas.height = canvas.clientHeight * 2);
      const sx = w / LENGTH, map = (x: number, y: number) => [x * sx, h / 2 - y * sx] as const;
      ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#10182a'; ctx.fillRect(ENTRY_X * sx, h / 2 - CLAD * sx, (EXIT_X - ENTRY_X) * sx, 2 * CLAD * sx);
      ctx.fillStyle = '#1a2a40'; ctx.fillRect(ENTRY_X * sx, h / 2 - CORE * sx, (EXIT_X - ENTRY_X) * sx, 2 * CORE * sx);
      ctx.lineWidth = 4;
      for (const s of segments) {
        ctx.strokeStyle = `rgba(${color.map((c) => Math.round(c * 255)).join(',')},${Math.min(1, s.power)})`;
        ctx.beginPath(); ctx.moveTo(...map(s.x0, s.y0)); ctx.lineTo(...map(s.x1, s.y1)); ctx.stroke();
      }
    },
    dispose: () => undefined,
  };
}

export function createFiberRenderer(canvas: HTMLCanvasElement): FiberRenderer {
  const quad = createQuad(canvas, FRAGMENT);
  if (!quad) return canvasRenderer(canvas);
  return {
    mode: 'webgl',
    render: ({ core, cladding, acceptanceDeg, color, segments }) => {
      quad.resize();
      quad.uniform('uRes', [canvas.width, canvas.height]);
      quad.uniform('uColor', color);
      quad.uniform('uAccept', (acceptanceDeg * Math.PI) / 180);
      quad.uniform('uCore', core); quad.uniform('uClad', cladding);
      const n = Math.min(MAX_SEGMENTS, segments.length);
      quad.uniform('uCount', n);
      segments.slice(0, n).forEach((s, i) => {
        quad.uniform(`uSeg[${i}]`, [s.x0, s.y0, s.x1, s.y1]);
        quad.uniform(`uPow[${i}]`, s.power);
      });
      quad.draw();
    },
    dispose: quad.dispose,
  };
}
