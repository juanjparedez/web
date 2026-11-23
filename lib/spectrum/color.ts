import { planck } from './physics.ts';

export type Rgb = [number, number, number];

const lobe = (x: number, mu: number, s1: number, s2: number) => {
  const t = (x - mu) / (x < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};

/**
 * CIE 1931 2° colour-matching functions, multi-lobe fit by Wyman, Sloan & Shirley (2013,
 * JCGT 2(2)). Error under 1 % of the tabulated functions; λ in nanometres.
 */
export function cie1931(nmLambda: number): Rgb {
  const x = 1.056 * lobe(nmLambda, 599.8, 37.9, 31.0) + 0.362 * lobe(nmLambda, 442.0, 16.0, 26.7)
    - 0.065 * lobe(nmLambda, 501.1, 20.4, 26.2);
  const y = 0.821 * lobe(nmLambda, 568.8, 46.9, 40.5) + 0.286 * lobe(nmLambda, 530.9, 16.3, 31.1);
  const z = 1.217 * lobe(nmLambda, 437.0, 11.8, 36.0) + 0.681 * lobe(nmLambda, 459.0, 26.0, 13.8);
  return [x, y, z];
}

/** XYZ (D65) → linear sRGB, IEC 61966-2-1 matrix. */
export function xyzToLinear([x, y, z]: Rgb): Rgb {
  return [
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.204 * y + 1.057 * z,
  ];
}

const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/**
 * Monochromatic light lies outside every display gamut. We add the least amount of white
 * that brings it inside (keeps hue, loses saturation) and keep its relative luminance.
 */
export function spectralLinear(nmLambda: number): Rgb {
  const rgb = xyzToLinear(cie1931(nmLambda));
  const lift = Math.max(0, -Math.min(...rgb));
  return rgb.map((c) => c + lift) as Rgb;
}

/** Saturated display colour of a laser line: clip out-of-gamut channels instead of adding white. */
export function laserColor(nmLambda: number): Rgb {
  const rgb = xyzToLinear(cie1931(nmLambda)).map((c) => Math.max(0, c));
  const max = Math.max(...rgb) || 1;
  return toSrgb(rgb.map((c) => c / max) as Rgb);
}

export function toSrgb(linear: Rgb, scale = 1): Rgb {
  return linear.map((c) => Math.min(1, Math.max(0, encode(c * scale)))) as Rgb;
}

export const cssColor = ([r, g, b]: Rgb) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

/** Chromaticity of a black body as the eye sees it, normalized so the brightest channel is 1. */
export function blackbodyColor(kelvin: number): Rgb {
  const xyz: Rgb = [0, 0, 0];
  for (let l = 380; l <= 780; l += 5) {
    const p = planck(l * 1e-9, kelvin);
    const [x, y, z] = cie1931(l);
    xyz[0] += p * x; xyz[1] += p * y; xyz[2] += p * z;
  }
  const lin = xyzToLinear(xyz).map((c) => Math.max(0, c));
  const max = Math.max(...lin) || 1;
  return toSrgb(lin.map((c) => c / max) as Rgb);
}

/** Same CIE fit and gamut mapping, in GLSL, so the GPU and the fallback draw identical colours. */
export const GLSL_SPECTRAL = /* glsl */ `
float lobe(float x, float mu, float s1, float s2) {
  float t = (x - mu) / (x < mu ? s1 : s2);
  return exp(-0.5 * t * t);
}
vec3 cie1931(float l) {
  float x = 1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2);
  float y = 0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1);
  float z = 1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8);
  return vec3(x, y, z);
}
vec3 xyzToLinear(vec3 c) {
  return vec3(3.2406 * c.x - 1.5372 * c.y - 0.4986 * c.z,
             -0.9689 * c.x + 1.8758 * c.y + 0.0415 * c.z,
              0.0557 * c.x - 0.2040 * c.y + 1.0570 * c.z);
}
vec3 spectralLinear(float l) {
  vec3 rgb = xyzToLinear(cie1931(l));
  float lift = max(0.0, -min(rgb.r, min(rgb.g, rgb.b)));
  return rgb + lift;
}
vec3 encodeSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(12.92 * c, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
`;
