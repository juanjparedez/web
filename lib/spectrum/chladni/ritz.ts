/**
 * Rayleigh–Ritz frequencies of a free square plate (Ritz, 1909): each mode is the trial function
 * ψ = (φₘ(x)φₙ(y) ± φₙ(x)φₘ(y))/√2 and its frequency comes from the plate's energy,
 *   λ² = ∬ [ψxx² + ψyy² + 2ν ψxx ψyy + 2(1−ν) ψxy²] / ∬ ψ²,   λ = ω a² √(ρh/D).
 * Unlike closed-form fits, this splits the ± pairs, which is why the two classic Chladni figures
 * of a square plate (the "X" and the "ring") ring at different pitches.
 */
import { BETA, beam } from './beams.ts';

const N = 2000; // Simpson intervals

/** φ, φ′ and φ″ of free–free beam m at x ∈ [0, 1]. */
export function beamDerivatives(m: number, x: number): [number, number, number] {
  if (m === 0) return [1, 0, 0];
  if (m === 1) return [Math.sqrt(3) * (1 - 2 * x), -2 * Math.sqrt(3), 0];
  const b = BETA[m];
  const sigma = (Math.cosh(b) - Math.cos(b)) / (Math.sinh(b) - Math.sin(b));
  const ep = 0.5 * (1 - sigma) * Math.exp(b * x), em = 0.5 * (1 + sigma) * Math.exp(-b * x);
  const c = Math.cos(b * x), s = Math.sin(b * x);
  return [beam(m, x), b * (ep - em - s - sigma * c), b * b * (ep + em - c + sigma * s)];
}

type Table = number[][]; // [index][a][b]

/** ∫ f_a g_b dx for all beam pairs, Simpson's rule. */
function integrals(count: number) {
  const A: Table = [], B: Table = [], C: Table = [], E: Table = [];
  for (const t of [A, B, C, E]) for (let a = 0; a < count; a++) t.push(new Array(count).fill(0));
  for (let i = 0; i <= N; i++) {
    const x = i / N, w = (i === 0 || i === N ? 1 : i % 2 ? 4 : 2) / (3 * N);
    const d = Array.from({ length: count }, (_, m) => beamDerivatives(m, x));
    for (let a = 0; a < count; a++) for (let b = 0; b < count; b++) {
      A[a][b] += w * d[a][0] * d[b][0]; B[a][b] += w * d[a][1] * d[b][1];
      C[a][b] += w * d[a][2] * d[b][2]; E[a][b] += w * d[a][2] * d[b][0];
    }
  }
  return { A, B, C, E };
}

let cache: ReturnType<typeof integrals> | null = null;

/** Non-dimensional frequency parameter λ = ω a² √(ρh/D) of mode (m, n, ±). */
export function ritzLambda(m: number, n: number, sign: 1 | -1, nu: number): number {
  cache ??= integrals(BETA.length);
  const { A, B, C, E } = cache;
  const terms: [number, number, number][] = m === n ? [[m, m, 1]] : [[m, n, Math.SQRT1_2], [n, m, sign * Math.SQRT1_2]];
  let k = 0, mass = 0;
  for (const [a1, b1, c1] of terms) for (const [a2, b2, c2] of terms) {
    const c = c1 * c2;
    mass += c * A[a1][a2] * A[b1][b2];
    k += c * (C[a1][a2] * A[b1][b2] + A[a1][a2] * C[b1][b2]
      + 2 * nu * E[a1][a2] * E[b2][b1] + 2 * (1 - nu) * B[a1][a2] * B[b1][b2]);
  }
  return Math.sqrt(k / mass);
}
