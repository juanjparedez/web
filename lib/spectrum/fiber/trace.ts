/**
 * Meridional ray in a step-index fibre (2D longitudinal section), with Snell's law at every
 * interface and unpolarized Fresnel reflectance. Pure geometry, shared by the WebGL view,
 * the Canvas fallback and the self-test. Not to scale: a real core is 9–62.5 µm wide.
 */
import { C } from '../physics.ts';

export interface FiberPreset { id: string; name: string; core: number; cladding: number; coreUm: number; note: string }

export const FIBERS: readonly FiberPreset[] = [
  { id: 'mm', name: 'Vidrio multimodo', core: 1.48, cladding: 1.46, coreUm: 50, note: 'Sílice dopada, núcleo de 50 µm: redes locales y centros de datos.' },
  { id: 'pof', name: 'Plástico (POF)', core: 1.49, cladding: 1.41, coreUm: 980, note: 'PMMA con revestimiento fluorado, núcleo de casi 1 mm: audio óptico TOSLINK y autos.' },
  { id: 'water', name: 'Chorro de agua', core: 1.333, cladding: 1.0, coreUm: 5000, note: 'El experimento de Colladon (1841): la luz queda atrapada en un chorro de agua que cae.' },
  { id: 'sm', name: 'Monomodo (SMF-28)', core: 1.4682, cladding: 1.4629, coreUm: 8.2, note: 'Δn de apenas 0,36 %: el ángulo de aceptación es de 7°. Con un núcleo de 8 µm sólo viaja un modo, por eso la óptica de rayos ya no alcanza.' },
];

/** Plot coordinates: x along the fibre in [0, LENGTH], y across with the axis at 0. */
export const LENGTH = 2.6;
export const CORE = 0.14;
export const CLAD = 0.24;
export const ENTRY_X = 0.5;
export const EXIT_X = 2.42;

export interface Segment { x0: number; y0: number; x1: number; y1: number; power: number }

export interface FiberResult {
  segments: Segment[];
  /** angle to the axis inside the core, degrees */
  insideDeg: number;
  /** angle of incidence on the core–cladding interface, degrees */
  incidenceDeg: number;
  criticalDeg: number;
  na: number;
  acceptanceDeg: number;
  guided: boolean;
  bounces: number;
  /** fraction of the launched power that leaves the far end */
  delivered: number;
}

/** Unpolarized Fresnel reflectance for incidence angle i (rad) from n1 into n2. */
export function fresnel(n1: number, n2: number, i: number): number {
  const s = (n1 / n2) * Math.sin(i);
  if (s >= 1) return 1;
  const ci = Math.cos(i), ct = Math.sqrt(1 - s * s);
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
  const rp = (n2 * ci - n1 * ct) / (n2 * ci + n1 * ct);
  return (rs * rs + rp * rp) / 2;
}

export const numericalAperture = (core: number, cladding: number) => Math.sqrt(Math.max(0, core * core - cladding * cladding));
export const acceptanceDeg = (core: number, cladding: number) => (Math.asin(Math.min(1, numericalAperture(core, cladding))) * 180) / Math.PI;

/** Spread in arrival time per km between the axial ray and the steepest guided ray. */
export const modalDispersionNsPerKm = (core: number, cladding: number) => (1000 * core / C) * (core / cladding - 1) * 1e9;

/** Bounces per metre of a ray at `insideDeg` in a core `coreUm` wide. */
export const bouncesPerMetre = (insideDeg: number, coreUm: number) => Math.tan((insideDeg * Math.PI) / 180) / (coreUm * 1e-6);

const deg = (r: number) => (r * 180) / Math.PI;

/** Leaky branch: refracts into the cladding and is absorbed by the coating at |y| = CLAD. */
function leak(x: number, y: number, dir: number, slope: number, core: number, cladding: number, power: number): Segment {
  const i = Math.atan(1 / Math.abs(slope)); // incidence from the interface normal
  const t = Math.asin(Math.min(1, (core / cladding) * Math.sin(i)));
  const dx = (CLAD - CORE) * Math.tan(t);
  return { x0: x, y0: y, x1: Math.min(EXIT_X, x + dx), y1: dir * CLAD, power };
}

export function traceFiber(core: number, cladding: number, launchDeg: number): FiberResult {
  const a0 = (launchDeg * Math.PI) / 180;
  const a1 = Math.asin(Math.sin(a0) / core);
  const segments: Segment[] = [];
  const run = Math.min(0.45, 0.45 / Math.max(1e-6, Math.tan(a0)));
  const startX = ENTRY_X - run, startY = -run * Math.tan(a0);
  let power = 1 - fresnel(1, core, a0);
  segments.push({ x0: startX, y0: startY, x1: ENTRY_X, y1: 0, power: 1 });
  let x = ENTRY_X, y = 0, dir = 1, bounces = 0;
  const slope = Math.tan(a1);
  const incidence = Math.PI / 2 - a1;
  const r = fresnel(core, cladding, incidence);
  while (power > 0.003 && segments.length < 38) {
    const xHit = slope === 0 ? Infinity : x + (dir * CORE - y) / (dir * slope);
    if (xHit >= EXIT_X) {
      const yEnd = y + dir * slope * (EXIT_X - x);
      segments.push({ x0: x, y0: y, x1: EXIT_X, y1: yEnd, power });
      const out = Math.asin(Math.min(1, core * Math.sin(a1)));
      const tail = 0.15;
      segments.push({ x0: EXIT_X, y0: yEnd, x1: EXIT_X + tail, y1: yEnd + dir * Math.tan(out) * tail, power: power * (1 - fresnel(core, 1, a1)) });
      return { segments, ...stats(core, cladding, a1, incidence, bounces, power * (1 - fresnel(core, 1, a1))) };
    }
    segments.push({ x0: x, y0: y, x1: xHit, y1: dir * CORE, power });
    if (r < 1) segments.push(leak(xHit, dir * CORE, dir, slope, core, cladding, power * (1 - r)));
    power *= r; x = xHit; y = dir * CORE; dir = -dir; bounces++;
  }
  return { segments, ...stats(core, cladding, a1, incidence, bounces, 0) };
}

function stats(core: number, cladding: number, a1: number, incidence: number, bounces: number, delivered: number) {
  const critical = Math.asin(cladding / core);
  return {
    insideDeg: deg(a1), incidenceDeg: deg(incidence), criticalDeg: deg(critical),
    na: numericalAperture(core, cladding), acceptanceDeg: acceptanceDeg(core, cladding),
    guided: incidence > critical, bounces, delivered,
  };
}
