import { GLSL_SPECTRAL } from './color.ts';
import { createQuad } from './glQuad.ts';
import { planck } from './physics.ts';

/** Plot window: log10(λ / m) on x, log10(B_λ / W·sr⁻¹·m⁻²·nm⁻¹) on y. */
export const PLOT_X: readonly [number, number] = [-8, -1.5];
export const PLOT_Y: readonly [number, number] = [-14, 10];

export interface PlanckReference { kelvin: number; label: string }
export const REFERENCES: readonly PlanckReference[] = [
  { kelvin: 2.725, label: 'Fondo cósmico' },
  { kelvin: 310, label: 'Cuerpo humano' },
  { kelvin: 5772, label: 'Sol' },
];

const f = (n: number) => n.toFixed(5);

const FRAGMENT = `
uniform vec2 uRes; uniform float uT; uniform vec3 uRefs;
${GLSL_SPECTRAL}
const vec2 PX = vec2(${f(PLOT_X[0])}, ${f(PLOT_X[1])});
const vec2 PY = vec2(${f(PLOT_Y[0])}, ${f(PLOT_Y[1])});
float logPlanck(float ll, float T) {
  float x = 0.0143877688 * pow(10.0, -ll) / T;
  float le = x > 20.0 ? x / 2.302585 : (x < 1e-3 ? log(x) / 2.302585 : log(exp(x) - 1.0) / 2.302585);
  return -15.92407 - 5.0 * ll - le - 9.0;
}
float toY(float lb) { return (lb - PY.x) / (PY.y - PY.x); }
float curve(float ll, float T, vec2 px) {
  float dx = (PX.y - PX.x) / uRes.x;
  float y0 = toY(logPlanck(ll, T)) * uRes.y;
  float y1 = toY(logPlanck(ll + dx, T)) * uRes.y;
  float slope = y1 - y0;
  return abs(px.y - y0) / sqrt(1.0 + slope * slope);
}
void main() {
  vec2 px = vUv * uRes;
  float ll = mix(PX.x, PX.y, vUv.x);
  float lb = mix(PY.x, PY.y, vUv.y);
  float vis = smoothstep(${f(Math.log10(380e-9))}, ${f(Math.log10(385e-9))}, ll) * (1.0 - smoothstep(${f(Math.log10(745e-9))}, ${f(Math.log10(750e-9))}, ll));
  vec3 spec = encodeSrgb(spectralLinear(pow(10.0, ll + 9.0)) * 0.95);
  vec3 col = vec3(0.02, 0.028, 0.05) + spec * vis * 0.16;
  float gx = abs(fract(ll + 0.5) - 0.5) * uRes.x / (PX.y - PX.x);
  float gy = abs(fract(lb * 0.5 + 0.5) - 0.5) * 2.0 * uRes.y / (PY.y - PY.x);
  col += vec3(0.07, 0.09, 0.13) * ((1.0 - smoothstep(0.0, 1.0, gx)) + (1.0 - smoothstep(0.0, 1.0, gy)));
  float yc = toY(logPlanck(ll, uT));
  if (vUv.y < yc) {
    vec3 warm = mix(vec3(0.95, 0.42, 0.2), vec3(0.55, 0.4, 1.0), smoothstep(-6.5, -7.5, ll));
    col += mix(warm * 0.16, spec * 0.7, vis) * (0.45 + 0.55 * vUv.y / max(yc, 0.01));
  }
  for (int i = 0; i < 3; i++) {
    float T = i == 0 ? uRefs.x : (i == 1 ? uRefs.y : uRefs.z);
    float d = curve(ll, T, px);
    col += vec3(0.55, 0.62, 0.75) * (1.0 - smoothstep(0.4, 1.4, d)) * 0.55;
  }
  float d = curve(ll, uT, px);
  col += vec3(1.0, 0.93, 0.8) * (1.0 - smoothstep(0.6, 2.0, d)) + vec3(1.0, 0.7, 0.4) * exp(-d * 0.3) * 0.25;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface PlanckRenderer { mode: 'webgl' | 'canvas'; render: (kelvin: number) => void; dispose: () => void }

const yOf = (meters: number, kelvin: number) => {
  const b = planck(meters, kelvin) * 1e-9;
  return b > 0 ? (Math.log10(b) - PLOT_Y[0]) / (PLOT_Y[1] - PLOT_Y[0]) : -1;
};

function drawCurve(ctx: CanvasRenderingContext2D, kelvin: number, w: number, h: number) {
  ctx.beginPath();
  for (let x = 0; x <= w; x += 2) {
    const ll = PLOT_X[0] + ((PLOT_X[1] - PLOT_X[0]) * x) / w;
    ctx.lineTo(x, h - yOf(10 ** ll, kelvin) * h);
  }
  ctx.stroke();
}

function createCanvasPlanck(canvas: HTMLCanvasElement): PlanckRenderer {
  const ctx = canvas.getContext('2d');
  const render = (kelvin: number) => {
    if (!ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = Math.round(canvas.clientWidth * ratio));
    const h = (canvas.height = Math.round(canvas.clientHeight * ratio));
    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = ratio;
    ctx.strokeStyle = 'rgba(160,175,200,0.5)';
    REFERENCES.forEach((r) => drawCurve(ctx, r.kelvin, w, h));
    ctx.lineWidth = 2 * ratio;
    ctx.strokeStyle = '#fff1d6';
    drawCurve(ctx, kelvin, w, h);
  };
  return { mode: 'canvas', render, dispose: () => undefined };
}

export function createPlanck(canvas: HTMLCanvasElement): PlanckRenderer {
  const quad = createQuad(canvas, FRAGMENT);
  if (!quad) return createCanvasPlanck(canvas);
  quad.uniform('uRefs', REFERENCES.map((r) => r.kelvin));
  return {
    mode: 'webgl',
    render: (kelvin) => {
      quad.resize();
      quad.uniform('uRes', [canvas.width, canvas.height]);
      quad.uniform('uT', kelvin);
      quad.draw();
    },
    dispose: quad.dispose,
  };
}
