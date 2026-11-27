import { C, E_CHARGE, H } from './physics.ts';
import { length, si } from './format.ts';

export type AxisKind = 'frequency' | 'wavelength' | 'energy';

export type TickEdge = 'start' | 'mid' | 'end';
export interface Tick { logF: number; label: string; edge?: TickEdge }

const LOG_C = Math.log10(C);
const LOG_EV = Math.log10(E_CHARGE / H);

/** Converts a value on each axis to log10(Hz) and back. */
const toLogF: Record<AxisKind, (logV: number) => number> = {
  frequency: (v) => v,
  wavelength: (v) => LOG_C - v,
  energy: (v) => v + LOG_EV,
};

const label: Record<AxisKind, (value: number) => string> = {
  frequency: (v) => si(v, 'Hz', 2),
  wavelength: (v) => length(v),
  energy: (v) => si(v, 'eV', 2),
};

const LEVELS: readonly (readonly number[])[] = [
  [1],
  [1, 2, 5],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  Array.from({ length: 90 }, (_, i) => 1 + i / 10),
];
/** Smallest spacing (in decades) between neighbouring ticks of each level. */
const LEVEL_GAP = [1, Math.log10(2), Math.log10(10 / 9), Math.log10(10 / 9.9)];

const fromLogF = (kind: AxisKind, lf: number) =>
  kind === 'frequency' ? lf : kind === 'wavelength' ? LOG_C - lf : lf - LOG_EV;

/**
 * Nice ticks (1·10ⁿ, then 2 and 5, then every digit when zoomed in) for one axis over a logF
 * window, thinned left to right so labels never collide at the given pixel width.
 */
export function axisTicks(kind: AxisKind, range: readonly [number, number], widthPx: number, minGap = 64): Tick[] {
  const ppd = widthPx / (range[1] - range[0]);
  let level = 0;
  while (level < LEVELS.length - 1 && LEVEL_GAP[level + 1] * ppd >= minGap * 0.5) level++;
  const [a, b] = [fromLogF(kind, range[0]), fromLogF(kind, range[1])].sort((x, y) => x - y);
  const candidates: Tick[] = [];
  for (let n = Math.floor(a); n <= Math.ceil(b); n++) {
    for (const m of LEVELS[level]) {
      const logV = n + Math.log10(m);
      const logF = toLogF[kind](logV);
      if (logF >= range[0] && logF <= range[1]) candidates.push({ logF, label: label[kind](10 ** logV) });
    }
  }
  candidates.sort((x, y) => x.logF - y.logF);
  if (level > 0) return thin(candidates, range, widthPx, minGap);
  // Whole decades: use one regular stride (every 1, 2, 3… decades) whose labels all fit.
  for (let stride = 1; stride < 12; stride++) {
    const pick = candidates.filter((t) => Math.round(fromLogF(kind, t.logF)) % stride === 0);
    const fitted = thin(pick, range, widthPx, minGap);
    if (fitted.length === pick.length) return fitted;
  }
  return thin(candidates, range, widthPx, minGap);
}

/**
 * Keeps ticks left to right only when their label box (estimated from the monospace glyph
 * width) clears the previous one by `pad` px and stays inside the track.
 */
function thin(candidates: Tick[], range: readonly [number, number], widthPx: number, minGap: number, charPx = 7.3, pad = 14): Tick[] {
  const kept: Tick[] = [];
  let lastRight = -Infinity, lastX = -Infinity;
  for (const t of candidates) {
    const x = ((t.logF - range[0]) / (range[1] - range[0])) * widthPx;
    const w = t.label.length * charPx;
    const edge: TickEdge = x < w / 2 ? 'start' : x > widthPx - w / 2 ? 'end' : 'mid';
    const left = edge === 'start' ? x : edge === 'end' ? x - w : x - w / 2;
    if (left < lastRight + pad || x - lastX < minGap * 0.6) continue;
    kept.push({ ...t, edge });
    lastRight = left + w;
    lastX = x;
  }
  return kept;
}
