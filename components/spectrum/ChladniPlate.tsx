'use client';

import { useMemo, useState } from 'react';
import { DRIVES, MODES, dominantMode, excitable, modeLabel, strength, type Drive } from '@/lib/spectrum/chladni/plate';
import { useChladni } from './useChladni';
import styles from './spectrum.module.css';

/** Slider in log₁₀(f): 40 Hz … 5 kHz. */
const L_MIN = 1.6, L_MAX = 3.7;
const F_MIN = 10 ** L_MIN, F_MAX = 10 ** L_MAX;
const hz = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(2).replace('.', ',')} kHz` : `${Math.round(f)} Hz`);
/** Start on the (2,2) resonance: a clear grid of four nodal lines. */
const START = Math.log10(MODES.find((m) => m.m === 2 && m.n === 2)!.f);
const DRIVE_NAMES: readonly ['center' | 'offset', string][] = [['center', 'Centro'], ['offset', 'Fuera de centro']];

/** Distinct resonance frequencies this drive point can excite, inside the slider range. */
function resonances(drive: Drive) {
  const out: number[] = [];
  for (const m of excitable(drive)) if (m.f >= F_MIN && m.f <= F_MAX && !out.some((f) => Math.abs(f - m.f) < 0.5)) out.push(m.f);
  return out;
}

function describe(resonant: boolean, label: string, fMode: number) {
  if (resonant) return `Resonancia del modo ${label} (${hz(fMode)}): la placa vibra fuerte, la arena salta de las zonas que se mueven y se junta en las líneas nodales, donde la placa no se mueve.`;
  return `Entre resonancias la placa apenas responde: la arena se mueve poco y el dibujo es una mezcla. El modo más cercano es ${label}, a ${hz(fMode)}. Usá «Siguiente resonancia».`;
}

/** A free square aluminium plate driven by a shaker, with 40 960 grains of sand on the GPU. */
export function ChladniPlate() {
  const [logF, setLogF] = useState(START);
  const [driveId, setDriveId] = useState<'center' | 'offset'>('center');
  const [showField, setShowField] = useState(false);
  const drive = DRIVES[driveId], f = 10 ** logF;
  const res = useMemo(() => resonances(drive), [drive]);
  const s = useMemo(() => strength(f, drive), [f, drive]);
  const mode = useMemo(() => dominantMode(f, drive), [f, drive]);
  const sim = useChladni(f, drive, s, showField);
  const resonant = Math.abs(f - mode.f) / mode.f < 0.02;
  const jump = (dir: 1 | -1) => {
    const next = dir > 0 ? res.find((r) => r > f * 1.001) : [...res].reverse().find((r) => r < f * 0.999);
    if (next) setLogF(Math.log10(next));
  };
  return (
    <div className={`${styles.wave} ${styles.chladni}`} data-testid="chladni-plate" data-renderer={sim.mode}
      data-mode={modeLabel(mode)} data-resonant={resonant} data-running={sim.live}>
      <div ref={sim.boxRef} className={styles.chladniStage}>
        <canvas ref={sim.canvasRef} className={styles.chladniCanvas} role="img"
          aria-label={`Placa de Chladni vibrando a ${hz(f)}: la arena dibuja las líneas nodales del modo ${modeLabel(mode)}`} />
        <span className={styles.modeTag} data-resonant={resonant}>{hz(f)} · modo {modeLabel(mode)}</span>
      </div>
      <div className={styles.chladniSide}>
        <label className={styles.slider}>
          <span>Frecuencia del excitador: <strong data-testid="chladni-frequency">{hz(f)}</strong></span>
          <input type="range" min={L_MIN} max={L_MAX} step={0.0005} value={logF} onChange={(e) => setLogF(Number(e.target.value))}
            aria-valuetext={hz(f)} />
        </label>
        <div role="group" aria-label="Resonancias" className={styles.btnRow}>
          <button type="button" onClick={() => jump(-1)} disabled={!res.some((r) => r < f * 0.999)}>← Resonancia anterior</button>
          <button type="button" onClick={() => jump(1)} disabled={!res.some((r) => r > f * 1.001)}>Siguiente resonancia →</button>
        </div>
        <div role="group" aria-label="Punto de excitación" className={styles.btnRow}>
          {DRIVE_NAMES.map(([id, name]) => <button key={id} type="button" aria-pressed={driveId === id} onClick={() => setDriveId(id)}>{name}</button>)}
        </div>
        <div role="group" aria-label="Controles de la placa" className={styles.btnRow}>
          <button type="button" aria-pressed={!sim.running} onClick={() => sim.setRunning(!sim.running)}>{sim.running ? 'Pausar' : 'Reanudar'}</button>
          <button type="button" onClick={sim.scatter}>Esparcir arena</button>
          <button type="button" aria-pressed={showField} onClick={() => setShowField(!showField)}>Ver vibración</button>
        </div>
        <div className={styles.slider}>
          <span>Respuesta de la placa: <strong>{Math.round(s * 100)} %</strong> de la resonancia</span>
          <span className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.max(2, s * 100)}%` }} /></span>
        </div>
        <p className={styles.chladniNote} data-testid="chladni-note">{describe(resonant, modeLabel(mode), mode.f)}</p>
        {sim.mode === 'canvas' && <p className={styles.hint}>Tu navegador no ofrece WebGL 2: corre en el procesador con menos granos.</p>}
      </div>
    </div>
  );
}
