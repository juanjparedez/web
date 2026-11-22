const PREFIXES: readonly [number, string][] = [
  [1e24, 'Y'], [1e21, 'Z'], [1e18, 'E'], [1e15, 'P'], [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'],
  [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f'], [1e-18, 'a'], [1e-21, 'z'],
];

/** Three significant figures, decimal comma, as Spanish typography expects. */
export function sig(value: number, digits = 3): string {
  const text = Number(value.toPrecision(digits)).toString();
  return text.replace('.', ',');
}

/** 1.42e9, 'Hz' → '1,42 GHz'. */
export function si(value: number, unit: string, digits = 3): string {
  if (!Number.isFinite(value) || value === 0) return `0 ${unit}`;
  const abs = Math.abs(value);
  const [factor, prefix] = PREFIXES.find(([f]) => abs >= f * 0.9995) ?? PREFIXES[PREFIXES.length - 1];
  return `${sig(value / factor, digits)} ${prefix}${unit}`;
}

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
};

export const pow10 = (exp: number) =>
  `10${String(exp).split('').map((ch) => SUPERSCRIPT[ch]).join('')}`;

/** 6.2e-34 → '6,2 × 10⁻³⁴'. */
export function sci(value: number, digits = 3): string {
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  if (exp >= -2 && exp <= 4) return sig(value, digits);
  const mant = value / 10 ** exp;
  if (Math.abs(Number(sig(mant, digits).replace(',', '.'))) === 1) return `${mant < 0 ? '−' : ''}${pow10(exp)}`;
  const sup = String(exp).split('').map((ch) => SUPERSCRIPT[ch]).join('');
  return `${sig(mant, digits)} × 10${sup}`;
}


/** Wavelength in the unit people actually use for it (km, m, cm, mm, µm, nm, pm, fm). */
export function length(meters: number): string {
  if (meters >= 1e7) return `${sci(meters / 1e3, 2)} km`;
  if (meters >= 1e3) return `${sig(meters / 1e3)} km`;
  if (meters >= 1) return `${sig(meters)} m`;
  if (meters >= 1e-2) return `${sig(meters * 100)} cm`;
  return si(meters, 'm');
}

/** Long or short durations with readable units. */
export function duration(seconds: number): string {
  if (seconds >= 3.156e7) return `${sci(seconds / 3.156e7)} años`;
  if (seconds >= 86400) return `${sig(seconds / 86400)} días`;
  if (seconds >= 3600) return `${sig(seconds / 3600)} h`;
  if (seconds >= 60) return `${sig(seconds / 60)} min`;
  return si(seconds, 's');
}
