/**
 * Square plate with free edges (a Chladni plate), driven at one point.
 *
 * Mode shapes: products of free–free beam functions φₘ(x)·φₙ(y), combined as φₘφₙ ± φₙφₘ
 * for the symmetric pairs of a square plate, with frequencies from the Ritz energy method
 * (Ritz, 1909; see ritz.ts), within a few percent of exact values (Leissa, 1969).
 * Driven response: modal superposition with damping, uᵢ ∝ ψᵢ(drive)/(fᵢ² − f² + i·f·fᵢ/Q).
 */

import { beam, MAX_INDEX } from './beams.ts';
import { ritzLambda } from './ritz.ts';

export { beam, MAX_INDEX };
export const Q = 60;

/** Physical plate: 240 mm square, 1 mm aluminium. */
export const PLATE = { side: 0.24, thickness: 1e-3, E: 69e9, nu: 0.33, rho: 2700 };

/** Natural frequency (Hz) of mode (m, n, ±) of the plate above, by the Ritz method. */
export function modeFrequency(m: number, n: number, sign: 1 | -1 = 1): number {
  const { side, thickness, E, nu, rho } = PLATE;
  const D = (E * thickness ** 3) / (12 * (1 - nu * nu));
  return (ritzLambda(m, n, sign, nu) / side ** 2) * Math.sqrt(D / (rho * thickness)) / (2 * Math.PI);
}

export interface Mode { m: number; n: number; sign: 1 | -1; f: number }

/** Every elastic mode up to MAX_INDEX, sorted by frequency. */
export const MODES: readonly Mode[] = (() => {
  const out: Mode[] = [];
  for (let m = 0; m <= MAX_INDEX; m++) {
    for (let n = m; n <= MAX_INDEX; n++) {
      if (m + n < 2) continue; // (0,0) translation and (0,1) rotation are rigid-body motions
      out.push({ m, n, sign: 1, f: modeFrequency(m, n, 1) });
      if (m !== n) out.push({ m, n, sign: -1, f: modeFrequency(m, n, -1) });
    }
  }
  return out.sort((a, b) => a.f - b.f);
})();

export function modeShape({ m, n, sign }: Mode, x: number, y: number): number {
  if (m === n) return beam(m, x) * beam(m, y);
  return (beam(m, x) * beam(n, y) + sign * beam(n, x) * beam(m, y)) / Math.SQRT2;
}

export interface Drive { x: number; y: number }
export const DRIVES: Record<'center' | 'offset', Drive> = { center: { x: 0.5, y: 0.5 }, offset: { x: 0.3, y: 0.22 } };

/** Complex modal coefficients of the steady-state response at frequency f. */
export function coefficients(f: number, drive: Drive): [number, number][] {
  return MODES.map((mode) => {
    const p = modeShape(mode, drive.x, drive.y);
    const re = mode.f * mode.f - f * f, im = (f * mode.f) / Q;
    const den = re * re + im * im;
    return [(p * re) / den, (-p * im) / den];
  });
}

/** |u(x, y)| for given coefficients (double precision, CPU). */
export function amplitude(coef: [number, number][], x: number, y: number): number {
  let re = 0, im = 0;
  for (let i = 0; i < MODES.length; i++) {
    const s = modeShape(MODES[i], x, y);
    re += coef[i][0] * s; im += coef[i][1] * s;
  }
  return Math.hypot(re, im);
}

/** Largest |u| on a coarse grid, used to normalise how hard the grains are kicked. */
export function peakAmplitude(coef: [number, number][], grid = 33): number {
  let max = 0;
  for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) max = Math.max(max, amplitude(coef, i / (grid - 1), j / (grid - 1)));
  return max || 1;
}

/** The mode that dominates the response at f (the closest resonance the drive can excite). */
export function dominantMode(f: number, drive: Drive): Mode {
  const coef = coefficients(f, drive);
  let best = 0, weight = -1;
  coef.forEach(([re, im], i) => { const w = Math.hypot(re, im); if (w > weight) { weight = w; best = i; } });
  return MODES[best];
}

/** Resonances this drive point can actually excite (non-zero coupling), sorted. */
export function excitable(drive: Drive): Mode[] {
  return MODES.filter((mode) => Math.abs(modeShape(mode, drive.x, drive.y)) > 1e-3);
}

/**
 * How hard the plate shakes at f compared with sitting exactly on the dominant resonance (0…1].
 * Off resonance the plate barely moves, so the sand barely moves either.
 */
export function strength(f: number, drive: Drive): number {
  const mode = dominantMode(f, drive);
  const here = peakAmplitude(coefficients(f, drive), 17);
  const there = peakAmplitude(coefficients(mode.f, drive), 17);
  return Math.min(1, here / there);
}

/** Label for a mode as physicists write it: (m,n) and, for a degenerate pair, the ± combination. */
export const modeLabel = ({ m, n, sign }: Mode) => `(${m},${n})${m === n ? '' : sign > 0 ? '+' : '−'}`;
