import { COURANT, GRID_H, GRID_W, SPONGE } from './model.ts';

const f = (n: number) => n.toFixed(4);

export const VERTEX = `#version 300 es
in vec2 p; out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * One leapfrog step. State texel: r = u(t), g = u(t-Δt), b = time-averaged u², a unused.
 * Sources are hard (they impose u); the barrier imposes u = 0 (a rigid wall reflects).
 */
export const STEP = `#version 300 es
precision highp float;
uniform sampler2D uState; uniform sampler2D uMask;
uniform vec3 uSrc0; uniform vec3 uSrc1; uniform float uLine; uniform float uDrive; uniform float uAvg;
uniform vec4 uDrop;
out vec4 o;
const vec2 SIZE = vec2(${f(GRID_W)}, ${f(GRID_H)});
float damp(vec2 c) {
  float d = min(min(c.x, c.y), min(SIZE.x - 1.0 - c.x, SIZE.y - 1.0 - c.y));
  float t = clamp((${f(SPONGE)} - d) / ${f(SPONGE)}, 0.0, 1.0);
  return 1.0 - 0.12 * t * t;
}
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 s = texelFetch(uState, c, 0);
  float u = s.r;
  float lap = texelFetch(uState, c + ivec2(1, 0), 0).r + texelFetch(uState, c - ivec2(1, 0), 0).r
    + texelFetch(uState, c + ivec2(0, 1), 0).r + texelFetch(uState, c - ivec2(0, 1), 0).r - 4.0 * u;
  float k = damp(vec2(c));
  float next = (2.0 * u - s.g + ${f(COURANT * COURANT)} * lap) * k;
  vec2 pc = vec2(c);
  if (uDrop.z > 0.0) next += uDrop.z * exp(-dot(pc - uDrop.xy, pc - uDrop.xy) / 8.0);
  if (abs(pc.x - uLine) < 0.5) next = uDrive;
  if (uSrc0.z > 0.0 && distance(pc, uSrc0.xy) <= 2.0) next = uDrive;
  if (uSrc1.z > 0.0 && distance(pc, uSrc1.xy) <= 2.0) next = uDrive;
  if (texelFetch(uMask, c, 0).r > 0.5 || c.x == 0 || c.y == 0 || c.x == int(SIZE.x) - 1 || c.y == int(SIZE.y) - 1) next = 0.0;
  float avg = s.b + (next * next - s.b) * uAvg;
  o = vec4(next, u * k, avg, 0.0);
}`;

/**
 * Display. 'surface' lights the water from the height gradient (what a ripple tank projects);
 * 'intensity' shows the time-averaged energy, where the nodal lines appear as dark rays.
 * The theory overlay draws the hyperbolas |r₁ − r₂| = (m + ½)λ where destructive interference
 * is expected.
 */
export const RENDER = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uState; uniform sampler2D uMask;
uniform float uView; uniform float uTheory; uniform float uLambda; uniform float uBarrier;
uniform vec4 uEmit;
const vec2 SIZE = vec2(${f(GRID_W)}, ${f(GRID_H)});
vec4 fetch(vec2 g) {
  vec2 p = clamp(g - 0.5, vec2(0.0), SIZE - 2.0);
  ivec2 i = ivec2(floor(p)); vec2 t = fract(p);
  vec4 a = texelFetch(uState, i, 0), b = texelFetch(uState, i + ivec2(1, 0), 0);
  vec4 c = texelFetch(uState, i + ivec2(0, 1), 0), d = texelFetch(uState, i + ivec2(1, 1), 0);
  return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
}
vec3 heat(float x) {
  x = clamp(x, 0.0, 1.0);
  return vec3(smoothstep(0.0, 0.55, x), smoothstep(0.25, 0.85, x), smoothstep(0.6, 1.0, x) * 0.9 + 0.25 * smoothstep(0.0, 0.3, x) * (1.0 - x));
}
void main() {
  vec2 g = vUv * SIZE;
  vec4 s = fetch(g);
  vec3 col;
  if (uView < 0.5) {
    float hx = fetch(g + vec2(1.0, 0.0)).r - fetch(g - vec2(1.0, 0.0)).r;
    float hy = fetch(g + vec2(0.0, 1.0)).r - fetch(g - vec2(0.0, 1.0)).r;
    vec3 n = normalize(vec3(-hx * 2.2, -hy * 2.2, 1.0));
    vec3 l = normalize(vec3(-0.45, 0.55, 0.7));
    float diff = max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 40.0);
    col = mix(vec3(0.02, 0.1, 0.2), vec3(0.08, 0.45, 0.65), diff) + vec3(0.85, 0.95, 1.0) * spec * 0.9 + vec3(0.1, 0.25, 0.3) * s.r * 0.35;
  } else {
    col = heat(sqrt(s.b) * 1.35);
  }
  if (uTheory > 0.5 && uEmit.x > 0.0 && g.x > uBarrier) {
    float ds = (distance(g, uEmit.xy) - distance(g, uEmit.zw)) / uLambda;
    float line = 1.0 - smoothstep(0.0, 1.6 * fwidth(ds), abs(fract(ds) - 0.5));
    float dash = step(0.45, fract((g.x + g.y) / 6.0));
    col = mix(col, vec3(1.0, 0.82, 0.3), line * dash * 0.9);
  }
  if (texelFetch(uMask, ivec2(g), 0).r > 0.5) col = vec3(0.55, 0.58, 0.62);
  o = vec4(col, 1.0);
}`;
