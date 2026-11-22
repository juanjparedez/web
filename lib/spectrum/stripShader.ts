import { BANDS } from './bands.ts';
import { GLSL_SPECTRAL } from './color.ts';

const f = (n: number) => n.toFixed(5);

/** Band tints with a soft 0.06-decade blend at each conventional boundary. */
function bandTintGlsl(): string {
  const steps = BANDS.slice(1).map((b) =>
    `  c = mix(c, vec3(${b.tint.map(f).join(', ')}), smoothstep(${f(b.from - 0.06)}, ${f(b.from + 0.06)}, lf));`);
  return `vec3 bandTint(float lf) {\n  vec3 c = vec3(${BANDS[0].tint.map(f).join(', ')});\n${steps.join('\n')}\n  return c;\n}`;
}

const visible = BANDS.find((b) => b.id === 'visible')!;

/**
 * Explorer strip: true colour inside the visible band (CIE 1931 → sRGB), false colour outside,
 * a schematic wave whose wavelength shortens to the right, the selection cursor, and below it
 * the atmospheric transmittance (LUT over 0..26 decades).
 */
export const STRIP_FRAGMENT = `
uniform vec2 uRange; uniform vec2 uRes; uniform float uSel; uniform float uTime; uniform float uSplit;
uniform sampler2D uAtm;
${GLSL_SPECTRAL}
${bandTintGlsl()}
const float VIS_A = ${f(visible.from)}; const float VIS_B = ${f(visible.to)};

vec3 trueColor(float lf) {
  float nm = pow(10.0, 17.47682 - lf);
  return encodeSrgb(spectralLinear(nm) * 0.95);
}
float visMask(float lf) { return smoothstep(VIS_A - 0.012, VIS_A + 0.012, lf) * (1.0 - smoothstep(VIS_B - 0.012, VIS_B + 0.012, lf)); }

float wave(vec2 px, float top) {
  float w = uRes.x; float h = uRes.y * (1.0 - top);
  float p0 = max(70.0, w * 0.16); float pEnd = 3.2;
  float r = log(p0 / pEnd); float xn = px.x / w;
  float cycles = (w / p0) * (exp(r * xn) - 1.0) / r;
  float period = p0 * exp(-r * xn);
  float phase = 6.2831853 * cycles - uTime * 2.2;
  float amp = h * 0.3 * smoothstep(3.0, 9.0, period);
  float yc = uRes.y * top + h * 0.5;
  float slope = amp * cos(phase) * 6.2831853 / period;
  float d = abs(px.y - yc - amp * sin(phase)) / sqrt(1.0 + slope * slope);
  float fog = (1.0 - smoothstep(3.0, 9.0, period)) * exp(-pow((px.y - yc) / (h * 0.32), 2.0)) * 0.25;
  return clamp(1.2 - d, 0.0, 1.0) * 0.9 + exp(-d * 0.35) * 0.18 + fog;
}

float grid(float lf, float ppd) {
  float d = abs(fract(lf + 0.5) - 0.5) * ppd;
  return (1.0 - smoothstep(0.0, 1.0, d)) * smoothstep(5.0, 22.0, ppd);
}

void main() {
  vec2 px = vUv * uRes;
  float lf = mix(uRange.x, uRange.y, vUv.x);
  float ppd = uRes.x / (uRange.y - uRange.x);
  vec3 tint = bandTint(lf);
  float vis = visMask(lf);
  vec3 col;
  if (vUv.y > uSplit) {
    float yy = (vUv.y - uSplit) / (1.0 - uSplit);
    vec3 base = tint * (0.22 + 0.16 * yy) + vec3(0.015, 0.02, 0.04);
    col = mix(base, trueColor(lf), vis);
    col += vec3(0.85, 0.92, 1.0) * wave(px, uSplit) * mix(0.75, 0.45, vis);
    col += vec3(0.05) * grid(lf, ppd);
  } else {
    float yy = vUv.y / uSplit;
    float t = texture2D(uAtm, vec2(clamp(lf / 26.0, 0.0, 1.0), 0.5)).r;
    float top = t * 0.86 + 0.04;
    vec3 fill = mix(tint * 0.62, trueColor(lf) * 0.9, vis);
    float inside = 1.0 - smoothstep(top - 1.5 / uRes.y, top, yy);
    float edge = exp(-abs(yy - top) * uRes.y * uSplit * 0.6);
    col = vec3(0.03, 0.04, 0.07) + fill * inside * (0.35 + 0.65 * yy / max(top, 0.05)) + tint * edge * 0.8;
    col += vec3(0.04) * grid(lf, ppd);
  }
  float sx = (uSel - uRange.x) / (uRange.y - uRange.x) * uRes.x;
  float dx = abs(px.x - sx);
  col += vec3(1.0) * exp(-dx * dx / 1.6) * 0.9 + vec3(0.7, 0.85, 1.0) * exp(-dx / 10.0) * 0.18;
  float split = abs(vUv.y - uSplit) * uRes.y;
  col = mix(col, vec3(0.0), (1.0 - smoothstep(0.0, 1.0, split)) * 0.8);
  gl_FragColor = vec4(col, 1.0);
}
`;
