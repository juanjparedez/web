'use client';

import { useState } from 'react';
import { MathLine } from '@/components/common/MathLine';
import {
  simulateOscilloscope,
  type ScopeCompensation,
  type ScopeCoupling,
  type ScopeGroundClip,
  type ScopeProbeRatio,
  type ScopeSignalId,
} from '@/lib/radio/benchInstrumentsSim';
import { InstrumentFigure } from './InstrumentFigure';
import styles from './multimeter.module.css';

const SIGNALS: readonly { id: ScopeSignalId; badge: string; title: string }[] = [
  { id: 'psu-ripple', badge: '13,8 V DC + 600 mVpp', title: 'Fuente 13,8 V con Ripple 100 Hz (DC vs. AC)' },
  { id: 'cal-square-1khz', badge: '1 kHz · 3 Vpp', title: 'Onda Cuadrada de Calibración (Compensación ×10)' },
  { id: 'rf-oscillator-14mhz', badge: '14 MHz HF · 500 Ω', title: 'Oscilador RF 14 MHz (Carga Punta ×1 vs. ×10)' },
];

export function OscilloscopeLab() {
  const [signalId, setSignalId] = useState<ScopeSignalId>('psu-ripple');
  const [coupling, setCoupling] = useState<ScopeCoupling>('ac');
  const [probeRatio, setProbeRatio] = useState<ScopeProbeRatio>('10x');
  const [compensation, setCompensation] = useState<ScopeCompensation>('calibrated');
  const [groundClip, setGroundClip] = useState<ScopeGroundClip>('circuit-gnd');
  const [triggerLocked, setTriggerLocked] = useState<boolean>(true);

  const result = simulateOscilloscope({
    signalId,
    coupling,
    probeRatio,
    compensation,
    groundClip,
    triggerLocked,
  });

  const applyRecommended = () => {
    setGroundClip('circuit-gnd');
    setTriggerLocked(true);
    setProbeRatio('10x');
    setCompensation('calibrated');
    setCoupling(signalId === 'psu-ripple' ? 'ac' : 'dc');
  };

  const lcdTone =
    result.status === 'danger' ? styles.lcdDanger : result.status === 'warning' ? styles.lcdWarning : '';
  const diagTone =
    result.status === 'danger'
      ? styles.diagnosisDanger
      : result.status === 'warning'
        ? styles.diagnosisWarning
        : '';

  return (
    <section className={styles.labBox} data-testid="oscilloscope-lab" aria-label="Simulador de Osciloscopio Digital">
      <div className={styles.labHeader}>
        <div>
          <span className={styles.kicker}>INSTRUMENTO 02 · OSCILOSCOPIO DIGITAL (DSO) Y PUNTAS ×1 / ×10</span>
          <h2>Entrenador de Osciloscopio: Acoplamiento, Trigger, Compensación y Masa PE</h2>
          <p>
            El multímetro te da un número eficaz promedio; el osciloscopio grafica v(t) en tiempo real para ver forma
            de onda, rizado (ripple), sobrepicos y fase.
          </p>
        </div>
        <button type="button" className={styles.presetBtn} onClick={applyRecommended}>
          ✓ Aplicar ajuste óptimo de canal
        </button>
      </div>

      <InstrumentFigure id="oscilloscope" />

      <div className={styles.scenarioGrid} role="group" aria-label="Señales de prueba del osciloscopio">
        {SIGNALS.map((sig) => (
          <button
            key={sig.id}
            type="button"
            onClick={() => setSignalId(sig.id)}
            aria-pressed={signalId === sig.id}
            className={`${styles.scenarioCard} ${signalId === sig.id ? styles.scenarioCardActive : ''}`}
          >
            <span className={styles.scenarioBadge}>{sig.badge}</span>
            <strong>{sig.title}</strong>
          </button>
        ))}
      </div>

      <div className={styles.workbenchGrid}>
        <div className={styles.controlsCol}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>1. Acoplamiento Vertical (CH1 Coupling)</span>
            <div className={styles.dialGrid}>
              {(['dc', 'ac', 'gnd'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoupling(c)}
                  aria-pressed={coupling === c}
                  className={`${styles.dialBtn} ${coupling === c ? styles.dialBtnActive : ''}`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>2. Atenuación de Punta y Compensación Trimmer</span>
            <div className={styles.placementRow}>
              <button
                type="button"
                onClick={() => setProbeRatio('10x')}
                aria-pressed={probeRatio === '10x'}
                className={`${styles.placementBtn} ${probeRatio === '10x' ? styles.placementBtnActive : ''}`}
              >
                Punta ×10 (10 MΩ ∥ 12 pF)
              </button>
              <button
                type="button"
                onClick={() => setProbeRatio('1x')}
                aria-pressed={probeRatio === '1x'}
                className={`${styles.placementBtn} ${probeRatio === '1x' ? styles.placementBtnActive : ''}`}
              >
                Punta ×1 (1 MΩ ∥ 100 pF)
              </button>
            </div>
            <div className={styles.dialGrid} style={{ marginTop: 8 }}>
              {[
                { id: 'calibrated', label: 'Trimmer Calibrado' },
                { id: 'under', label: 'Subcompensada' },
                { id: 'over', label: 'Sobrecompensada' },
              ].map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setCompensation(comp.id as ScopeCompensation)}
                  aria-pressed={compensation === comp.id}
                  className={`${styles.dialBtn} ${compensation === comp.id ? styles.dialBtnActive : ''}`}
                >
                  {comp.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>3. Disparo (Trigger) y Cocodrilo de Masa del BNC</span>
            <div className={styles.placementRow}>
              <button
                type="button"
                onClick={() => setTriggerLocked((v) => !v)}
                aria-pressed={triggerLocked}
                className={`${styles.placementBtn} ${triggerLocked ? styles.placementBtnActive : ''}`}
              >
                {triggerLocked ? '⚡ Trigger Enganchado (50 %)' : '⚠ Trigger Fuera de Nivel'}
              </button>
              <button
                type="button"
                onClick={() => setGroundClip((g) => (g === 'circuit-gnd' ? 'hot-node' : 'circuit-gnd'))}
                aria-pressed={groundClip === 'hot-node'}
                className={`${styles.placementBtn} ${groundClip === 'hot-node' ? styles.jackRedActive : ''}`}
              >
                {groundClip === 'circuit-gnd' ? 'Masa BNC en 0 V Chasis' : '💥 Cocodrilo BNC en Nodo Vivo'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.meterCol}>
          <div className={`${styles.lcd} ${lcdTone}`} data-testid="oscilloscope-screen">
            <div className={styles.lcdTopBar}>
              <span>CH1: {coupling.toUpperCase()} · {probeRatio.toUpperCase()}</span>
              <span>TRIG: {triggerLocked ? 'EDGE ↑ LOCKED' : 'FREE RUN'}</span>
            </div>
            <svg viewBox="0 0 320 120" width="100%" height="125" role="img" aria-label="Retícula de osciloscopio">
              <line x1="0" y1="60" x2="320" y2="60" stroke="var(--hios-border)" strokeDasharray="4 4" />
              <line x1="160" y1="0" x2="160" y2="120" stroke="var(--hios-border)" strokeDasharray="4 4" />
              <polyline
                fill="none"
                stroke="var(--accent-2-text)"
                strokeWidth="2.5"
                points={result.tracePoints}
              />
            </svg>
            <div className={styles.lcdSub} data-testid="oscilloscope-vpp">
              Excursión en pantalla: <strong>{result.vppText}</strong> · {result.vrmsDmmText}
            </div>
          </div>

          <dl className={styles.metricsList}>
            <div className={styles.metricItem}>
              <dt>Impedancia de carga de la punta sobre el circuito</dt>
              <dd>{result.probeLoadText}</dd>
            </div>
            <div className={styles.metricItem}>
              <dt>Componente continua / Base de tiempo</dt>
              <dd>{result.dcOffsetText}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={`${styles.diagnosisBox} ${diagTone}`}>
        <h4>{result.headline}</h4>
        <p><strong>Qué ocurre físicamente:</strong> {result.physicalExplanation}</p>
        <p><strong>Criterio de taller:</strong> {result.technicianTip}</p>
      </div>
      <MathLine>V_pp = 2 · V_p = 2 · √2 · V_RMS (senoidal)   |   R₁ · C₁ = R_in · C_in (compensación punta ×10)   |   X_C = 1 / (2π · f · C_punta)</MathLine>
    </section>
  );
}
