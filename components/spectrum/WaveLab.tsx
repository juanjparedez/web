'use client';

import { useEffect, useState } from 'react';
import { BANDS, bandAt } from '@/lib/spectrum/bands';
import { LANDMARKS } from '@/lib/spectrum/landmarks';
import { si } from '@/lib/spectrum/format';
import { LOG_F_MAX, LOG_F_MIN } from '@/lib/spectrum/physics';
import { WaveSection } from './WaveSection';
import styles from './spectrum.module.css';

const SUN = LANDMARKS.find((l) => l.id === 'sun')!.logF;

/** The 3D wave on its own page; the frequency comes from ?f=log10(Hz) (the explorer links here) or the controls. */
export function WaveLab() {
  const [logF, setLogF] = useState(SUN);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('f');
    const f = raw === null || raw === '' ? NaN : Number(raw);
    if (Number.isFinite(f) && f >= LOG_F_MIN && f <= LOG_F_MAX) setLogF(f);
  }, []);
  const band = bandAt(logF);
  return (
    <div className={styles.waveLab}>
      <div className={styles.panel}>
        <label className={styles.slider}>
          <span>Frecuencia: <strong data-testid="wave-frequency">{si(10 ** logF, 'Hz')}</strong> · {band.name}</span>
          <input type="range" min={LOG_F_MIN} max={LOG_F_MAX} step={0.01} value={logF}
            onChange={(e) => setLogF(Number(e.target.value))} aria-valuetext={si(10 ** logF, 'Hz')} />
        </label>
        <div className={styles.chips} role="group" aria-label="Ir a una banda">
          {BANDS.map((b) => (
            <button key={b.id} type="button" className={styles.chip} data-band={b.id} aria-pressed={band.id === b.id}
              onClick={() => setLogF((b.from + b.to) / 2)}>{b.name}</button>
          ))}
        </div>
        <div className={styles.landmarks} role="group" aria-label="Fuentes reales">
          {LANDMARKS.map((l) => (
            <button key={l.id} type="button" onClick={() => setLogF(l.logF)} aria-pressed={Math.abs(logF - l.logF) < 1e-6}>{l.label}</button>
          ))}
        </div>
      </div>
      <WaveSection logF={logF} />
    </div>
  );
}
