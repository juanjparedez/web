'use client';

import { useState } from 'react';
import {
  BENCH_SCENARIOS,
  simulateMultimeter,
  type BenchScenarioId,
  type DmmJack,
  type DmmMode,
  type ProbePlacement,
} from '@/lib/radio/multimeterSim';
import { InstrumentFigure } from './InstrumentFigure';
import styles from './multimeter.module.css';

const DIAL_OPTIONS: readonly { id: DmmMode; label: string; sub: string }[] = [
  { id: 'dcv', label: 'V⎓ (DCV)', sub: '10 MΩ' },
  { id: 'acv', label: 'V∼ (ACV)', sub: '45Hz–1kHz' },
  { id: 'ohm', label: 'Ω (Ohms)', sub: 'Sin tensión' },
  { id: 'continuity', label: '))) / →|−', sub: 'Buzzer <30Ω' },
  { id: 'ma', label: 'mA⎓', sub: 'Fusible 400mA' },
  { id: '10a', label: '10A⎓', sub: 'Shunt 0,01Ω' },
];

const JACK_OPTIONS: readonly { id: DmmJack; label: string; note: string }[] = [
  { id: '10a', label: '10A MAX', note: 'Shunt 10 mΩ' },
  { id: 'ma', label: 'mA / µA', note: 'Max 400 mA' },
  { id: 'v-ohm', label: 'V / Ω / )))', note: 'Alta Z 10 MΩ' },
];

export function MultimeterLab() {
  const [scenarioId, setScenarioId] = useState<BenchScenarioId>('psu-transceiver');
  const [mode, setMode] = useState<DmmMode>('dcv');
  const [redJack, setRedJack] = useState<DmmJack>('v-ohm');
  const [placement, setPlacement] = useState<ProbePlacement>('parallel');
  const [circuitPowered, setCircuitPowered] = useState<boolean>(true);

  const scenario = BENCH_SCENARIOS.find((s) => s.id === scenarioId) ?? BENCH_SCENARIOS[0];
  const result = simulateMultimeter({ scenarioId, mode, redJack, placement, circuitPowered });

  const selectScenario = (id: BenchScenarioId) => {
    const next = BENCH_SCENARIOS.find((s) => s.id === id) ?? BENCH_SCENARIOS[0];
    setScenarioId(id);
    setMode(next.recommendedMode);
    setRedJack(next.recommendedJack);
    setPlacement(next.recommendedPlacement);
    setCircuitPowered(next.poweredDefault);
  };

  const applyRecommended = () => {
    setMode(scenario.recommendedMode);
    setRedJack(scenario.recommendedJack);
    setPlacement(scenario.recommendedPlacement);
    setCircuitPowered(scenario.poweredDefault);
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
    <section className={styles.labBox} data-testid="multimeter-lab" aria-label="Simulador de Multímetro Digital">
      <div className={styles.labHeader}>
        <div>
          <span className={styles.kicker}>BANCO DE INSTRUMENTACIÓN · MULTÍMETRO DIGITAL TRUE-RMS</span>
          <h2>Entrenador Interactivo de Multímetro (Selector, Bornes y Conexión)</h2>
          <p>
            Elegí qué circuito querés medir, posicioná el selector giratorio, enchufá la punta roja en el borne
            correcto y apoyá las puntas en serie o en paralelo para ver qué pasa físicamente.
          </p>
        </div>
        <button type="button" className={styles.presetBtn} onClick={applyRecommended}>
          ✓ Aplicar conexión segura recomendada
        </button>
      </div>

      <InstrumentFigure id="multimeter" />

      <div className={styles.scenarioGrid} role="group" aria-label="Escenarios de medición en taller">
        {BENCH_SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectScenario(item.id)}
            aria-pressed={scenarioId === item.id}
            className={`${styles.scenarioCard} ${scenarioId === item.id ? styles.scenarioCardActive : ''}`}
          >
            <span className={styles.scenarioBadge}>{item.badge}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>

      <div className={styles.workbenchGrid}>
        <div className={styles.controlsCol}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>1. Selector giratorio del multímetro</span>
            <div className={styles.dialGrid}>
              {DIAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  aria-pressed={mode === opt.id}
                  className={`${styles.dialBtn} ${mode === opt.id ? styles.dialBtnActive : ''}`}
                >
                  <div>{opt.label}</div>
                  <small>{opt.sub}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>2. Borne donde enchufás la punta ROJA (Negra fija en COM)</span>
            <div className={styles.jackRow}>
              <div className={`${styles.jackBtn} ${styles.jackCom}`} aria-label="Borne COM negro fijo">
                <span className={styles.jackDot} />
                <strong>COM</strong>
                <small>Punta Negra</small>
              </div>
              {JACK_OPTIONS.map((jack) => (
                <button
                  key={jack.id}
                  type="button"
                  onClick={() => setRedJack(jack.id)}
                  aria-pressed={redJack === jack.id}
                  className={`${styles.jackBtn} ${redJack === jack.id ? styles.jackRedActive : ''}`}
                >
                  <span className={styles.jackDot} />
                  <strong>{jack.label}</strong>
                  <small>{jack.note}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>3. Cómo apoyás las puntas y estado de la fuente</span>
            <div className={styles.placementRow}>
              <button
                type="button"
                onClick={() => setPlacement('parallel')}
                aria-pressed={placement === 'parallel'}
                className={`${styles.placementBtn} ${placement === 'parallel' ? styles.placementBtnActive : ''}`}
              >
                En Paralelo (entre bornes)
              </button>
              <button
                type="button"
                onClick={() => setPlacement('series')}
                aria-pressed={placement === 'series'}
                className={`${styles.placementBtn} ${placement === 'series' ? styles.placementBtnActive : ''}`}
              >
                En Serie (abriendo rama)
              </button>
              <button
                type="button"
                onClick={() => setCircuitPowered((prev) => !prev)}
                aria-pressed={circuitPowered}
                className={`${styles.placementBtn} ${circuitPowered ? styles.placementBtnActive : ''}`}
              >
                {circuitPowered ? '⚡ Circuito Energizado (ON)' : '○ Circuito Apagado (OFF)'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.meterCol}>
          <div className={`${styles.lcd} ${lcdTone}`} data-testid="multimeter-lcd" role="status" aria-live="polite">
            <div className={styles.lcdTopBar}>
              <span>MODO: {mode.toUpperCase()}</span>
              <span>BORNE ROJO: {redJack.toUpperCase()}</span>
              <span>{result.beep ? '🔊 BEEP )))' : result.fuseBlown ? '💥 FUSIBLE QUEMADO' : 'FUSIBLE OK'}</span>
            </div>
            <div className={styles.lcdReading}>
              <span className={styles.lcdDigits} data-testid="multimeter-digits">{result.displayMain}</span>
              <span className={styles.lcdUnit}>{result.displayUnit}</span>
            </div>
            <div className={styles.lcdSub}>{result.displaySub}</div>
          </div>

          <dl className={styles.metricsList}>
            <div className={styles.metricItem}>
              <dt>Impedancia interna presentada por el multímetro</dt>
              <dd>{result.meterImpedanceText}</dd>
            </div>
            <div className={styles.metricItem}>
              <dt>Corriente real en el circuito durante la medición</dt>
              <dd>{result.circuitCurrentText}</dd>
            </div>
            <div className={styles.metricItem}>
              <dt>Efecto de carga / Caída de inserción (Burden Voltage)</dt>
              <dd>{result.burdenOrLoadingText}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={`${styles.diagnosisBox} ${diagTone}`} data-testid="multimeter-diagnosis">
        <h4>{result.title}</h4>
        <p><strong>Qué ocurre físicamente:</strong> {result.physicalExplanation}</p>
        <p><strong>Criterio de taller:</strong> {result.technicianTip}</p>
      </div>
    </section>
  );
}
