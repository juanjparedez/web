import { C } from './physics.ts';

/**
 * Zenith transmittance of a clear standard atmosphere, from space down to sea level.
 * Approximate digitization of the usual absorption atlas (ionospheric cut-off, O₂ lines at
 * 60 and 118 GHz, H₂O at 22 and 183 GHz, the submillimetre wall, CO₂ at 4.3 and 15 µm, O₃ at
 * 9.6 µm and below 300 nm). Good to show the windows, not to design a link budget.
 * Pairs are [wavelength in metres, fraction that reaches the ground].
 */
const POINTS: readonly [number, number][] = [
  [1e9, 0], [100, 0], [30, 0.2], [15, 0.9], [10, 0.98], [0.05, 0.98], [0.0135, 0.85],
  [0.01, 0.95], [0.0065, 0.6], [0.005, 0], [0.0042, 0.55], [0.0033, 0.85], [0.0027, 0.45],
  [0.00254, 0.2], [0.002, 0.7], [0.00164, 0], [0.0013, 0.55], [0.0011, 0.2], [8.7e-4, 0.3],
  [7e-4, 0.05], [4.5e-4, 0.08], [3.5e-4, 0.05], [2e-4, 0], [3e-5, 0], [2.4e-5, 0.05],
  [2e-5, 0.15], [1.7e-5, 0.08], [1.4e-5, 0.4], [1.2e-5, 0.85], [1e-5, 0.8], [9.6e-6, 0.5],
  [8.5e-6, 0.8], [7.5e-6, 0.1], [6.3e-6, 0], [5.5e-6, 0.05], [4.8e-6, 0.6], [4.3e-6, 0],
  [4e-6, 0.85], [3.5e-6, 0.85], [3.2e-6, 0.5], [2.7e-6, 0], [2.2e-6, 0.85], [1.9e-6, 0.05],
  [1.65e-6, 0.9], [1.4e-6, 0.1], [1.25e-6, 0.85], [1.13e-6, 0.5], [1e-6, 0.88], [9.4e-7, 0.6],
  [8e-7, 0.85], [6e-7, 0.82], [4.5e-7, 0.72], [3.8e-7, 0.6], [3.3e-7, 0.4], [3.1e-7, 0.1],
  [2.95e-7, 0], [1e-30, 0],
];

const TABLE = POINTS.map(([m, t]) => [Math.log10(C / m), t] as const);

/** Fraction of the radiation arriving from space that reaches sea level, at log10(f). */
export function transmittance(logF: number): number {
  for (let i = 1; i < TABLE.length; i++) {
    const [x1, y1] = TABLE[i];
    if (logF <= x1) {
      const [x0, y0] = TABLE[i - 1];
      return y0 + ((logF - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return 0;
}

export function transmittanceLabel(t: number): string {
  if (t > 0.75) return 'Atraviesa la atmósfera: se observa desde el suelo.';
  if (t > 0.3) return 'Ventana parcial: llega atenuada, mejor desde sitios altos y secos.';
  if (t > 0.02) return 'Casi opaca: sólo pasa una fracción pequeña.';
  return 'La atmósfera la bloquea: para observarla desde el espacio hace falta un satélite.';
}
