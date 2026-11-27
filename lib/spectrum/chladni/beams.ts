export const MAX_INDEX = 8; // beam functions φ₀ … φ₈

/** Roots of cos β·cosh β = 1 for free–free beams (β₀ and β₁ are the rigid-body modes). */
export const BETA = [0, 0, 4.730040745, 7.853204624, 10.99560784, 14.13716549, 17.27875966, 20.42035225, 23.56194490];

/** φₘ on x ∈ [0, 1], normalised so that ∫φ² dx = 1. Numerically stable for large β. */
export function beam(m: number, x: number): number {
  if (m === 0) return 1;
  if (m === 1) return Math.sqrt(3) * (1 - 2 * x);
  const b = BETA[m];
  const sigma = (Math.cosh(b) - Math.cos(b)) / (Math.sinh(b) - Math.sin(b));
  const oneMinus = 1 - sigma; // tiny for large β: computed in double precision
  const hyper = 0.5 * (oneMinus * Math.exp(b * x) + (1 + sigma) * Math.exp(-b * x));
  return hyper + Math.cos(b * x) - sigma * Math.sin(b * x);
}
