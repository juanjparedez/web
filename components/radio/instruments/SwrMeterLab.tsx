'use client';

import { useState } from 'react';
import { MathLine } from '@/components/common/MathLine';
import {
  simulateSwrMeter,
  type SwrTerminationId,
  type SwrTxMode,
} from '@/lib/radio/benchInstrumentsSim';
import styles from './multimeter.module.css';

const TERMINATIONS: readonly { id: SwrTerminationId; badge: string; title: string }[] = [
  { id: 'dummy-50-tx', badge: 'PATRÓN 50 Ω · TX', title: '1. Carga Fantasma 50 Ω directo a la salida del Transceptor' },
  { id: 'dummy-50-end', badge: 'PATRÓN 50 Ω · TECHO', title: '2. Carga Fantasma 50 Ω en la punta del Coaxil (Prueba de cable)' },
  { id: 'tuned-dipole', badge: 'ANTENA · Z ≈ 42 Ω', title: '3. Antena Dipolo / Vertical ajustada en banda' },
  { id: 'detuned-antenna', badge: 'DESAJUSTE · Z = 150 Ω', title: '4. Antena fuera de banda (ROE 3,0 : 1)' },
  { id: 'shorted-coax', badge: 'FALLA · CORTO / ABIERTO', title: '5. Coaxil en Corto o Antena desconectada' },
];

export function SwrMeterLab() {
  const [termination, setTermination] = useState<SwrTerminationId>('tuned-dipole');
  const [txMode, setTxMode] = useState<SwrTxMode>('fm-cw');
  const [txPowerW, setTxPowerW] = useState<1 | 5 | 50>(5);

  const result = simulateSwrMeter({ termination, txMode, txPowerW });

  const lcdTone =
    result.status === 'danger' ? styles.lcdDanger : result.status === 'warning' ? styles.lcdWarning : '';
  const diagTone =
    result.status === 'danger'
      ? styles.diagnosisDanger
      : result.status === 'warning'
        ? styles.diagnosisWarning
        : '';

  return (
    <section className={styles.labBox} data-testid="swr-meter-lab" aria-label="Simulador de Medidor de ROE y Carga Fantasma">
      <div className={styles.labHeader}>
        <div>
          <span className={styles.kicker}>INSTRUMENTO 03 · WATÍMETRO DIRECCIONAL, MEDIDOR DE ROE Y CARGA FANTASMA 50 Ω</span>
          <h2>Entrenador de Medidor de ROE (Directa / Reflejada) y Diagnóstico de Coaxil vs. Antena</h2>
          <p>
            Un watímetro direccional separa la onda progresiva que viaja hacia la antena (P_FWD) de la onda que
            rebota por desadaptación de impedancia (P_REF). Con una Carga Fantasma de 50 Ω podés aislar en segundos si
            una falla está en el equipo, en el coaxil o en la antena.
          </p>
        </div>
      </div>

      <div className={styles.scenarioGrid} role="group" aria-label="Cargas conectadas a la línea de 50 ohms">
        {TERMINATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTermination(item.id)}
            aria-pressed={termination === item.id}
            className={`${styles.scenarioCard} ${termination === item.id ? styles.scenarioCardActive : ''}`}
          >
            <span className={styles.scenarioBadge}>{item.badge}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>

      <div className={styles.workbenchGrid}>
        <div className={styles.controlsCol}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>1. Modo de Emisión durante la Prueba</span>
            <div className={styles.placementRow}>
              <button
                type="button"
                onClick={() => setTxMode('fm-cw')}
                aria-pressed={txMode === 'fm-cw'}
                className={`${styles.placementBtn} ${txMode === 'fm-cw' ? styles.placementBtnActive : ''}`}
              >
                Portadora Continua (CW / FM)
              </button>
              <button
                type="button"
                onClick={() => setTxMode('ssb-idle')}
                aria-pressed={txMode === 'ssb-idle'}
                className={`${styles.placementBtn} ${txMode === 'ssb-idle' ? styles.placementBtnActive : ''}`}
              >
                BLU / SSB (Micrófono en silencio)
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>2. Potencia de Transmisión Seleccionada</span>
            <div className={styles.dialGrid}>
              {([1, 5, 50] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTxPowerW(p)}
                  aria-pressed={txPowerW === p}
                  className={`${styles.dialBtn} ${txPowerW === p ? styles.dialBtnActive : ''}`}
                >
                  <div>{p} W</div>
                  <small>{p === 1 ? 'LOW (Seguro)' : p === 5 ? 'Handy High' : 'Base 50 W'}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.meterCol}>
          <div className={`${styles.lcd} ${lcdTone}`} data-testid="swr-meter-screen">
            <div className={styles.lcdTopBar}>
              <span>ACOPLADOR DIRECCIONAL 50 Ω</span>
              <span>MODO: {txMode === 'fm-cw' ? 'PORTADORA CW/FM' : 'SSB SIN AUDIO'}</span>
            </div>
            <div className={styles.lcdReading}>
              <span className={styles.lcdDigits} data-testid="swr-reading">{result.swrText}</span>
              <span className={styles.lcdUnit}>ROE (SWR)</span>
            </div>
            <div className={styles.lcdSub}>
              Directa (FWD): <strong>{result.pFwdW.toFixed(2).replace('.', ',')} W</strong> · Reflejada (REF):{' '}
              <strong>{result.pRefW.toFixed(2).replace('.', ',')} W</strong>
            </div>
          </div>

          <dl className={styles.metricsList}>
            <div className={styles.metricItem}>
              <dt>Potencia Neta entregada a la carga (P_FWD − P_REF)</dt>
              <dd>{result.pNetW.toFixed(2).replace('.', ',')} W</dd>
            </div>
            <div className={styles.metricItem}>
              <dt>Coeficiente de Reflexión |Γ| y Return Loss (RL)</dt>
              <dd>|Γ| = {result.gamma.toFixed(3).replace('.', ',')} · RL = {result.returnLossDbText}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={`${styles.diagnosisBox} ${diagTone}`}>
        <h4>{result.headline}</h4>
        <p><strong>Qué ocurre físicamente:</strong> {result.physicalExplanation}</p>
        <p><strong>Criterio de taller:</strong> {result.technicianTip}</p>
      </div>
      <MathLine>|Γ| = √(P_REF / P_FWD) = |(Z_L − Z₀) / (Z_L + Z₀)|   |   ROE = (1 + |Γ|) / (1 − |Γ|)   |   RL [dB] = −20 · log₁₀(|Γ|)</MathLine>
    </section>
  );
}
