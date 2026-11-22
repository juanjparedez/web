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
import { MultimeterDevice } from './MultimeterDevice';
import styles from './multimeter.module.css';

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
        <div className={styles.deviceCol}>
          <MultimeterDevice mode={mode} redJack={redJack} onMode={setMode} onJack={setRedJack}
            digits={result.displayMain} unit={result.displayUnit} status={result.status}
            beep={result.beep} fuseBlown={result.fuseBlown} />
          <p className={`${styles.deviceHint} ${lcdTone}`} data-testid="multimeter-lcd" role="status" aria-live="polite">
            {result.displaySub}
          </p>
          <p className={styles.deviceHelp}>Girá la perilla tocando una posición y enchufá la punta roja tocando un borne. La negra queda siempre en COM.</p>
        </div>

        <div className={styles.controlsCol}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Cómo apoyás las puntas y estado de la fuente</span>
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
