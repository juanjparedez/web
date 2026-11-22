import assert from 'node:assert/strict';
import { photonEnergyEv, planck, planckFraction, radiantExitance, wavelength, wienPeak, SIGMA, C, H, K_B } from '../lib/spectrum/physics.ts';
import { BANDS, bandAt, subBandAt } from '../lib/spectrum/bands.ts';
import { transmittance } from '../lib/spectrum/atmosphere.ts';
import { blackbodyColor, cie1931, spectralLinear } from '../lib/spectrum/color.ts';
import { si, length, sci } from '../lib/spectrum/format.ts';
import { LANDMARKS, closestScale } from '../lib/spectrum/landmarks.ts';
import { axisTicks } from '../lib/spectrum/ticks.ts';

const near = (a: number, b: number, rel: number, msg: string) => assert.ok(Math.abs(a - b) <= Math.abs(b) * rel, `${msg}: ${a} vs ${b}`);

// σ derived from h, c, k must match the CODATA value used for M = σT⁴.
near((2 * Math.PI ** 5 * K_B ** 4) / (15 * H ** 3 * C ** 2), SIGMA, 1e-8, 'Stefan–Boltzmann from h, c, k');
near(wavelength(100e6), 2.99792458, 1e-12, 'FM wavelength');
near(photonEnergyEv(C / 500e-9), 2.4797, 1e-4, '500 nm photon');
near(wienPeak(5772), 502.05e-9, 1e-3, 'Sun peak');
// Numerical integral of Planck over all λ equals σT⁴ (and the visible share of the Sun is ~ 37–45 %).
near(planckFraction(5772, 1e-8, 1e-2, 4000), 1, 2e-3, 'Planck integrates to σT⁴');
const sunVisible = planckFraction(5772, 380e-9, 750e-9);
assert.ok(sunVisible > 0.36 && sunVisible < 0.46, `visible share of the Sun ${sunVisible}`);
assert.ok(planckFraction(310, 380e-9, 750e-9) < 1e-15, 'a human body does not glow');
// Peak of B_λ really is at b/T.
const T = 3000, pk = wienPeak(T);
assert.ok(planck(pk, T) > planck(pk * 1.01, T) && planck(pk, T) > planck(pk * 0.99, T), 'Wien peak is a maximum');
near(radiantExitance(1), SIGMA, 1e-12, 'σT⁴ at 1 K');

// Bands tile the axis without gaps.
for (let i = 1; i < BANDS.length; i++) near(BANDS[i].from, BANDS[i - 1].to, 1e-12, `band ${BANDS[i].id} edge`);
assert.equal(bandAt(Math.log10(C / 550e-9)).id, 'visible');
assert.equal(bandAt(Math.log10(2.45e9)).id, 'micro');
assert.equal(bandAt(Math.log10(1e6)).id, 'radio');
assert.equal(bandAt(Math.log10((511e3 * 1.602176634e-19) / H)).id, 'gamma');
assert.equal(subBandAt(Math.log10(7e6)), 'HF · onda corta');
assert.equal(subBandAt(Math.log10(C / 300e-9)), 'UV-B');

// Atmosphere: windows open, walls closed.
assert.ok(transmittance(Math.log10(C / 550e-9)) > 0.7, 'optical window');
assert.ok(transmittance(Math.log10(1e9)) > 0.9, 'radio window');
assert.ok(transmittance(Math.log10(C / 10e-6)) > 0.6, 'thermal IR window');
assert.ok(transmittance(Math.log10(60e9)) < 0.1, 'O₂ 60 GHz');
assert.ok(transmittance(Math.log10(C / 200e-9)) === 0, 'ozone');
assert.ok(transmittance(Math.log10(1e18)) === 0, 'X-rays');
assert.ok(transmittance(Math.log10(1e6)) === 0, 'ionosphere');

// Colour: CMF peaks and hues.
near(cie1931(555)[1], 1, 0.02, 'ȳ peaks near 1 at 555 nm');
const red = spectralLinear(650), blue = spectralLinear(450), green = spectralLinear(530);
assert.ok(red[0] > red[1] && red[0] > red[2], '650 nm is red');
assert.ok(blue[2] > blue[0] && blue[2] > blue[1], '450 nm is blue');
assert.ok(green[1] > green[0] && green[1] > green[2], '530 nm is green');
const candle = blackbodyColor(1900), sun = blackbodyColor(5772), rigel = blackbodyColor(12000);
assert.ok(candle[0] > candle[2] * 2, 'cold black body is orange');
assert.ok(sun[0] > 0.9 && sun[1] > 0.85 && sun[2] > 0.75, `Sun is near white ${sun}`);
assert.ok(rigel[2] >= rigel[0], 'hot black body is bluish');

// Formatting.
assert.equal(si(1.4204e9, 'Hz'), '1,42 GHz');
assert.equal(length(0.123), '12,3 cm');
assert.equal(length(500e-9), '500 nm');
assert.equal(sci(6.626e-34), '6,63 × 10⁻³⁴');

// Landmarks are inside the axis; scale objects pick something sensible.
for (const l of LANDMARKS) assert.ok(l.logF >= 0 && l.logF <= 26, l.id);
assert.equal(closestScale(1.7).name, 'una persona');
assert.equal(closestScale(5e-7).name.includes('bacteria'), true);

// Axis ticks stay inside the window and in order, at narrow and wide widths.
for (const kind of ['frequency', 'wavelength', 'energy'] as const) {
  for (const w of [300, 1200]) {
    const ticks = axisTicks(kind, [0, 26], w);
    assert.ok(ticks.length >= 3, `${kind} ticks at ${w}px`);
    assert.ok(ticks.every((t, i) => t.logF >= 0 && t.logF <= 26 && (!i || t.logF > ticks[i - 1].logF)));
  }
  assert.ok(axisTicks(kind, [14.5, 14.95], 900).length >= 2, `${kind} ticks zoomed`);
}
console.log('spectrum selftest ok');
