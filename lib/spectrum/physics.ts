/**
 * Exact SI constants (2019 redefinition) and the relations used by the
 * electromagnetic spectrum section. Pure functions, no DOM: shared by the
 * WebGL scenes, their Canvas fallbacks and the self-test.
 */
export const C = 299_792_458; // m/s, exact
export const H = 6.626_070_15e-34; // J·s, exact
export const E_CHARGE = 1.602_176_634e-19; // C, exact (1 eV in J)
export const K_B = 1.380_649e-23; // J/K, exact
export const SIGMA = 5.670_374_419e-8; // W·m⁻²·K⁻⁴ (derived from the exact constants)
export const WIEN_B = 2.897_771_955e-3; // m·K, Wien displacement constant

/** Visible range of the explorer, in log10(Hz). 1 Hz … 10^26 Hz (≈ 400 GeV photons). */
export const LOG_F_MIN = 0;
export const LOG_F_MAX = 26;

export const wavelength = (hz: number) => C / hz;
export const frequency = (meters: number) => C / meters;
export const photonEnergyJ = (hz: number) => H * hz;
export const photonEnergyEv = (hz: number) => (H * hz) / E_CHARGE;
export const period = (hz: number) => 1 / hz;

/** Temperature (K) of the black body whose spectral radiance per wavelength peaks at λ. */
export const wienTemperature = (meters: number) => WIEN_B / meters;
export const wienPeak = (kelvin: number) => WIEN_B / kelvin;

/** Total power radiated per square metre by an ideal black body (Stefan–Boltzmann). */
export const radiantExitance = (kelvin: number) => SIGMA * kelvin ** 4;

/** Planck's law per unit wavelength, W·sr⁻¹·m⁻³. Uses expm1 so cold bodies at long λ stay exact. */
export function planck(meters: number, kelvin: number): number {
  const x = (H * C) / (meters * K_B * kelvin);
  if (x > 700) return 0;
  return (2 * H * C * C) / meters ** 5 / Math.expm1(x);
}

/**
 * Fraction of the total black-body emission that falls between two wavelengths,
 * integrated numerically on a log grid (accurate to < 0.1 % for 400 steps).
 */
export function planckFraction(kelvin: number, fromM: number, toM: number, steps = 400): number {
  const a = Math.log(fromM), b = Math.log(toM), d = (b - a) / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const l = Math.exp(a + (i + 0.5) * d);
    sum += planck(l, kelvin) * l * d; // dλ = λ·d(ln λ)
  }
  return (Math.PI * sum) / radiantExitance(kelvin);
}

export const ionizingThresholdEv = 10; // conventional radiobiology threshold (~124 nm)
export const hydrogenIonizationEv = 13.6;
export const pairProductionEv = 1.022e6; // 2·mₑc²
