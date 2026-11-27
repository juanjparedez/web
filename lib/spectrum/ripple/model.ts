/**
 * Ripple tank: the linear 2D wave equation  ∂²u/∂t² = v²∇²u  on a grid, leapfrog in time
 * (second-order FDTD). The same model runs on the GPU (WebGL 2) and on the CPU fallback.
 *
 * Units: 1 cell = 1 mm. Courant number v·Δt/Δx = 0.5, so a crest moves half a cell per step
 * and a source of period P steps makes waves of λ = P/2 cells.
 */
export const GRID_W = 320;
export const GRID_H = 200;
export const COURANT = 0.5;
export const SPONGE = 22; // absorbing margin, in cells: the tank behaves as if it were open
export const BARRIER_X = 104;
export const SOURCE_X = 64;

export type RippleMode = 'two' | 'double' | 'single' | 'free';

export interface RippleConfig {
  mode: RippleMode;
  /** wavelength in cells (mm) */
  lambda: number;
  /** separation between sources or slits, or slit width in 'single', in cells */
  spacing: number;
}

export interface Driver {
  /** point sources, in cells */
  points: [number, number][];
  /** x of a vertical line source (plane wave), or -1 */
  line: number;
  /** angular frequency per step */
  omega: number;
}

export const SLIT_WIDTH = 8;

export function driverFor({ mode, lambda, spacing }: RippleConfig): Driver {
  const omega = (2 * Math.PI * COURANT) / lambda;
  const cy = GRID_H / 2;
  if (mode === 'two') return { points: [[SOURCE_X, cy - spacing / 2], [SOURCE_X, cy + spacing / 2]], line: -1, omega };
  if (mode === 'free') return { points: [], line: -1, omega };
  return { points: [], line: SPONGE + 4, omega };
}

/** Openings in the barrier as [from, to] rows. */
function openings({ mode, spacing }: RippleConfig): [number, number][] {
  const cy = GRID_H / 2;
  if (mode === 'single') return [[cy - spacing / 2, cy + spacing / 2]];
  return [cy - spacing / 2, cy + spacing / 2].map((c): [number, number] => [c - SLIT_WIDTH / 2, c + SLIT_WIDTH / 2]);
}

/** 1 where the water is blocked by the barrier, 0 elsewhere. */
export function maskFor(config: RippleConfig): Uint8Array {
  const mask = new Uint8Array(GRID_W * GRID_H);
  if (config.mode === 'two' || config.mode === 'free') return mask;
  const holes = openings(config);
  for (let y = 0; y < GRID_H; y++) {
    if (holes.some(([a, b]) => y >= a && y < b)) continue;
    for (let x = BARRIER_X; x < BARRIER_X + 3; x++) mask[y * GRID_W + x] = 1;
  }
  return mask;
}

/** Centres of the two coherent emitters (sources or slits) for the theory overlay. */
export function emitters(config: RippleConfig): [number, number][] | null {
  const cy = GRID_H / 2, h = config.spacing / 2;
  if (config.mode === 'two') return [[SOURCE_X, cy - h], [SOURCE_X, cy + h]];
  if (config.mode === 'double') return [[BARRIER_X + 1, cy - h], [BARRIER_X + 1, cy + h]];
  return null;
}

/** Per-step damping of the absorbing margin (0 inside the tank, up to 0.12 at the edge). */
export function sponge(x: number, y: number): number {
  const d = Math.min(x, y, GRID_W - 1 - x, GRID_H - 1 - y);
  if (d >= SPONGE) return 0;
  const t = (SPONGE - d) / SPONGE;
  return 0.12 * t * t;
}

/** Angles of the interference maxima predicted by d·sin θ = m·λ (two sources or two slits). */
export function maximaDeg(lambda: number, spacing: number, count = 3): number[] {
  const out: number[] = [];
  for (let m = 1; m <= count && (m * lambda) / spacing < 1; m++) out.push((Math.asin((m * lambda) / spacing) * 180) / Math.PI);
  return out;
}

/** First minimum of a single slit: a·sin θ = λ. Null when the slit is narrower than λ (no zero). */
export function singleSlitMinDeg(lambda: number, width: number): number | null {
  return lambda / width <= 1 ? (Math.asin(lambda / width) * 180) / Math.PI : null;
}
