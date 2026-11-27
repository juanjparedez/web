import { MAX_INDEX } from './plate.ts';

export const LUT_SIZE = 512;
export const AMP_SIZE = 256;
export const SAND_W = 256;
export const SAND_H = 160; // 40 960 grains
/** drift toward lower amplitude, relative to the random hop (both scale with the kick) */
export const DRIFT = 0.03;

export const QUAD_VS = `#version 300 es
in vec2 p; out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

/** |u(x,y)| from the modal sum; beam functions come from a double-precision LUT. */
export const FIELD_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uBeam; uniform sampler2D uModes; uniform int uCount;
float beam(int m, float x) {
  float fx = clamp(x, 0.0, 1.0) * ${(512 - 1).toFixed(1)};
  int i = int(floor(fx)); float t = fx - float(i);
  float a = texelFetch(uBeam, ivec2(i, m), 0).r, b = texelFetch(uBeam, ivec2(min(i + 1, ${512 - 1}), m), 0).r;
  return mix(a, b, t);
}
void main() {
  vec2 acc = vec2(0.0);
  for (int k = 0; k < 128; k++) {
    if (k >= uCount) break;
    vec4 mode = texelFetch(uModes, ivec2(k, 0), 0);
    vec2 coef = texelFetch(uModes, ivec2(k, 1), 0).xy;
    int m = int(mode.x), n = int(mode.y);
    float s = m == n ? beam(m, vUv.x) * beam(m, vUv.y)
      : (beam(m, vUv.x) * beam(n, vUv.y) + mode.z * beam(n, vUv.x) * beam(m, vUv.y)) * 0.70710678;
    acc += coef * s;
  }
  o = vec4(length(acc), 0.0, 0.0, 1.0);
}`;

/**
 * Sand: every grain is tossed in a random direction by a distance proportional to how hard
 * the plate shakes under it. Grains on a nodal line barely move, so they pile up there.
 */
export const SAND_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uState; uniform sampler2D uAmp; uniform float uFrame; uniform float uKick; uniform float uScatter;
float hash(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float amp(ivec2 t) { return texelFetch(uAmp, clamp(t, ivec2(0), ivec2(${AMP_SIZE - 1})), 0).r; }
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 s = texelFetch(uState, c, 0);
  vec2 seed = vec2(s.z, uFrame * 0.013);
  if (uScatter > 0.5) { o = vec4(hash(seed + 1.7), hash(seed + 9.3), s.z, 0.0); return; }
  ivec2 t = ivec2(clamp(s.xy, 0.0, 0.9999) * ${AMP_SIZE.toFixed(1)});
  float a = amp(t);
  // bouncing grains drift down the gradient of the shaking energy a², plus a random hop ∝ a
  vec2 grad = vec2(amp(t + ivec2(1, 0)) - amp(t - ivec2(1, 0)), amp(t + ivec2(0, 1)) - amp(t - ivec2(0, 1))) * ${(AMP_SIZE / 2).toFixed(1)};
  vec2 r = vec2(hash(seed + s.xy * 17.0), hash(seed.yx + s.yx * 31.0)) - 0.5;
  vec2 p = s.xy + r * uKick * a - uKick * ${DRIFT.toFixed(3)} * a * grad;
  p = abs(p); p = 1.0 - abs(1.0 - p);
  o = vec4(clamp(p, 0.0005, 0.9995), s.z, 0.0);
}`;

/** Black anodised plate, optional vibration heat map, central drive pin. */
export const PLATE_FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uAmp; uniform float uShowField; uniform vec2 uDrive;
void main() {
  float a = texelFetch(uAmp, ivec2(clamp(vUv, 0.0, 0.9999) * ${AMP_SIZE.toFixed(1)}), 0).r;
  float brushed = 0.012 * sin(vUv.y * 900.0 + sin(vUv.x * 40.0) * 3.0);
  vec2 d = vUv - 0.5;
  vec3 col = vec3(0.045, 0.05, 0.058) + brushed - dot(d, d) * 0.06;
  if (uShowField > 0.5) col = mix(col, vec3(0.9, 0.35, 0.15) * sqrt(a) + vec3(0.1, 0.0, 0.25) * (1.0 - sqrt(a)), 0.55);
  float pin = length(vUv - uDrive);
  col = mix(col, vec3(0.55, 0.57, 0.6), 1.0 - smoothstep(0.012, 0.016, pin));
  o = vec4(col, 1.0);
}`;

export const GRAIN_VS = `#version 300 es
uniform sampler2D uState; uniform float uSize;
void main() {
  ivec2 c = ivec2(gl_VertexID % ${SAND_W}, gl_VertexID / ${SAND_W});
  vec2 p = texelFetch(uState, c, 0).xy;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = uSize;
}`;

export const GRAIN_FS = `#version 300 es
precision highp float;
out vec4 o;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float a = 1.0 - smoothstep(0.3, 0.5, length(q));
  o = vec4(vec3(0.93, 0.86, 0.7) * a, a * 0.75);
}`;

export const BEAM_ROWS = MAX_INDEX + 1;
