'use client';

import { useState } from 'react';
import { MathLine } from '@/components/common/MathLine';
import { simulateNanoVna } from '@/lib/radio/benchInstrumentsSim';
import { InstrumentFigure } from './InstrumentFigure';
import styles from './multimeter.module.css';

export function NanoVnaLab() {
  const [calibratedSolt, setCalibratedSolt] = useState<boolean>(true);
  const [elementLengthCm, setElementLengthCm] = useState<number>(51.5);

  const result = simulateNanoVna({ calibratedSolt, elementLengthCm });

  const polyPoints = result.sweep
    .map((pt, idx) => {
      const x = (idx / (result.sweep.length - 1)) * 300 + 10;
      const clampedSwr = Math.min(4.0, Math.max(1.0, pt.swr));
      const y = 105 - ((clampedSwr - 1.0) / 3.0) * 85;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const targetX = ((145 - 138) / (152 - 138)) * 300 + 10;
  const lcdTone = result.status === 'warning' ? styles.lcdWarning : '';
  const diagTone = result.status === 'warning' ? styles.diagnosisWarning : '';

  return (
    <section className={styles.labBox} data-testid="nanovna-lab" aria-label="Simulador de NanoVNA">
      <div className={styles.labHeader}>
        <div>
          <span className={styles.kicker}>INSTRUMENTO 04 · ANALIZADOR VECTORIAL DE REDES (NANOVNA · S11 Y CARTA DE SMITH)</span>
          <h2>Entrenador de NanoVNA: Calibración SOLT, Curva de ROE(f) y Ajuste Físico de Antena</h2>
          <p>
            A diferencia de un medidor de ROE clásico que solo mide en una frecuencia fija, el NanoVNA barre toda la
            banda con pocos miliwatts y te muestra dónde cae el pozo de resonancia y si la antena está larga (+jX_L) o
            corta (−jX_C).
          </p>
        </div>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => {
            setCalibratedSolt(true);
            setElementLengthCm(49.0);
          }}
        >
          ✓ Cortar varilla a resonancia exacta (49,0 cm → 145,0 MHz)
        </button>
      </div>

      <InstrumentFigure id="nanovna" />

      <div className={styles.workbenchGrid}>
        <div className={styles.controlsCol}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>1. Calibración en el plano del conector (Patrones SOLT)</span>
            <div className={styles.placementRow}>
              <button
                type="button"
                onClick={() => setCalibratedSolt(true)}
                aria-pressed={calibratedSolt}
                className={`${styles.placementBtn} ${calibratedSolt ? styles.placementBtnActive : ''}`}
              >
                ✓ Calibrado: Short · Open · Load 50 Ω
              </button>
              <button
                type="button"
                onClick={() => setCalibratedSolt(false)}
                aria-pressed={!calibratedSolt}
                className={`${styles.placementBtn} ${!calibratedSolt ? styles.placementBtnActive : ''}`}
              >
                ⚠ Sin calibrar en punta de cable
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="nanovna-length-slider" className={styles.controlLabel}>
              2. Longitud física de la varilla λ/4 de 2 m: <strong>{elementLengthCm.toFixed(1).replace('.', ',')} cm</strong> (Ideal: 49,0 cm)
            </label>
            <input
              id="nanovna-length-slider"
              type="range"
              min={45.0}
              max={53.0}
              step={0.5}
              value={elementLengthCm}
              onChange={(e) => setElementLengthCm(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className={styles.dialGrid} style={{ marginTop: 8 }}>
              <button type="button" className={styles.dialBtn} onClick={() => setElementLengthCm(52.0)}>
                Varilla Larga (52,0 cm)
              </button>
              <button type="button" className={styles.dialBtn} onClick={() => setElementLengthCm(49.0)}>
                En Resonancia (49,0 cm)
              </button>
              <button type="button" className={styles.dialBtn} onClick={() => setElementLengthCm(46.0)}>
                Varilla Corta (46,0 cm)
              </button>
            </div>
          </div>
        </div>

        <div className={styles.meterCol}>
          <div className={`${styles.lcd} ${lcdTone}`} data-testid="nanovna-screen">
            <div className={styles.lcdTopBar}>
              <span>CH0 S11 · SPAN 138–152 MHz</span>
              <span>MKR 145,0 MHz: ROE {result.swrAt145.toFixed(2).replace('.', ',')}</span>
            </div>
            <svg viewBox="0 0 320 120" width="100%" height="125" role="img" aria-label="Barrido de ROE del NanoVNA">
              <line x1={targetX} y1="10" x2={targetX} y2="108" stroke="var(--hios-border)" strokeDasharray="3 3" />
              <text x={targetX + 4} y="20" fill="var(--hios-text-secondary)" fontSize="9">
                145,0 MHz (Centro 2m)
              </text>
              <polyline fill="none" stroke="var(--accent-2-text)" strokeWidth="2.5" points={polyPoints} />
            </svg>
            <div className={styles.lcdSub} data-testid="nanovna-resonance">
              Valle de resonancia (X = 0): <strong>{result.resonantFreqMHz.toFixed(2).replace('.', ',')} MHz</strong> · S₁₁(145 MHz) ={' '}
              <strong>{result.s11DbAt145.toFixed(1).replace('.', ',')} dB</strong>
            </div>
          </div>

          <dl className={styles.metricsList}>
            <div className={styles.metricItem}>
              <dt>Impedancia compleja Z = R ± jX medida en 145,0 MHz</dt>
              <dd>{result.impedanceAt145Text}</dd>
            </div>
            <div className={styles.metricItem}>
              <dt>Ubicación en Carta de Smith y Acción Física</dt>
              <dd>{result.smithRegionText} — {result.adjustmentActionText}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={`${styles.diagnosisBox} ${diagTone}`}>
        <h4>{result.headline}</h4>
        <p><strong>Qué ocurre físicamente:</strong> {result.physicalExplanation}</p>
        <p><strong>Criterio de taller:</strong> {result.technicianTip}</p>
      </div>
      <MathLine>f_res = c · VF / (4 · L)   |   S₁₁ [dB] = 20 · log₁₀(|Γ|)   |   Z(f) = R_rad + j · (X_L − X_C)</MathLine>
    </section>
  );
}
