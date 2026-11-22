import { transmittance, transmittanceLabel } from '@/lib/spectrum/atmosphere';
import { bandAt, subBandAt } from '@/lib/spectrum/bands';
import { cssColor, spectralLinear, toSrgb, type Rgb } from '@/lib/spectrum/color';
import { duration, length, sci, si } from '@/lib/spectrum/format';
import { closestScale, LANDMARKS } from '@/lib/spectrum/landmarks';
import { ionizingThresholdEv, photonEnergyEv, photonEnergyJ, wavelength, wienTemperature } from '@/lib/spectrum/physics';
import styles from './spectrum.module.css';

function energyText(ev: number) {
  return ev >= 1e-3 && ev < 1e15 ? si(ev, 'eV') : `${sci(ev)} eV`;
}

function kelvin(k: number) {
  return k >= 10 && k < 1e7 ? `${Math.round(k).toLocaleString('es-AR')} K` : `${sci(k)} K`;
}

function swatch(logF: number): string {
  const band = bandAt(logF);
  if (band.id === 'visible') return cssColor(toSrgb(spectralLinear(1e9 * wavelength(10 ** logF)), 0.95));
  return cssColor(band.tint as Rgb);
}

function atmosphereText(logF: number, t: number) {
  if (logF < 7.2) return 'La ionosfera la refleja: desde el espacio no llega, pero en tierra rebota y da la vuelta al mundo.';
  return transmittanceLabel(t);
}

function Cell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={styles.cell}>
      <dt>{label}</dt>
      <dd>{value}{hint && <small>{hint}</small>}</dd>
    </div>
  );
}

/** Everything physics says about the selected frequency. */
export function SpectrumReadout({ logF }: { logF: number }) {
  const f = 10 ** logF;
  const lambda = wavelength(f);
  const ev = photonEnergyEv(f);
  const band = bandAt(logF);
  const sub = subBandAt(logF);
  const t = transmittance(logF);
  const ionizing = ev >= ionizingThresholdEv;
  const near = LANDMARKS.find((l) => Math.abs(l.logF - logF) < 0.04);
  const scale = closestScale(lambda);
  return (
    <section className={styles.readout} data-testid="spectrum-readout" data-band={band.id} aria-live="polite">
      <header className={styles.readoutHead}>
        <span className={styles.swatch} style={{ background: swatch(logF) }} />
        <div>
          <h3>{band.name}{sub && <small> · {sub}</small>}</h3>
          <span className={styles.badge} data-ionizing={ionizing}>{ionizing ? 'Ionizante' : 'No ionizante'}</span>
        </div>
      </header>
      <dl className={styles.cells}>
        <Cell label="Frecuencia" value={si(f, 'Hz')} />
        <Cell label="Longitud de onda" value={length(lambda)} hint={`del orden de ${scale.name}`} />
        <Cell label="Energía del fotón" value={energyText(ev)} hint={`${sci(photonEnergyJ(f))} J`} />
        <Cell label="Período" value={duration(1 / f)} />
        <Cell label="Fotones por segundo en 1 W" value={sci(1 / photonEnergyJ(f))} />
        <Cell label="Cuerpo negro con pico acá" value={kelvin(wienTemperature(lambda))} hint="ley de Wien" />
      </dl>
      {near && <p className={styles.landmarkNote}><strong>{near.label}.</strong> {near.note}</p>}
      <p><strong>Con la materia:</strong> {band.matter}</p>
      <p><strong>De dónde sale:</strong> {band.sources}</p>
      <p className={styles.atm}>
        <span className={styles.meter}><span style={{ width: `${Math.round(t * 100)}%` }} /></span>
        <span><strong>Atmósfera ({Math.round(t * 100)} % llega al suelo):</strong> {atmosphereText(logF, t)}</span>
      </p>
    </section>
  );
}
