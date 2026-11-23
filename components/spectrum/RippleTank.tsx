'use client';

import { useMemo, useState } from 'react';
import { sig } from '@/lib/spectrum/format';
import { maximaDeg, singleSlitMinDeg, type RippleMode } from '@/lib/spectrum/ripple/model';
import { useTank } from './useTank';
import styles from './spectrum.module.css';

const MODES: readonly [RippleMode, string][] = [
  ['two', 'Dos fuentes'], ['double', 'Doble rendija'], ['single', 'Una rendija'], ['free', 'Gotas libres'],
];
const SPACING: Record<RippleMode, { label: string; min: number; max: number; initial: number }> = {
  two: { label: 'Separación entre fuentes', min: 16, max: 100, initial: 48 },
  double: { label: 'Separación entre rendijas', min: 16, max: 100, initial: 48 },
  single: { label: 'Ancho de la rendija', min: 6, max: 80, initial: 24 },
  free: { label: 'Separación', min: 16, max: 100, initial: 48 },
};

function theoryText(mode: RippleMode, lambda: number, spacing: number) {
  if (mode === 'free') return 'Tocá el agua. Cada gota abre un frente circular; donde dos frentes se cruzan, las alturas se suman y después cada uno sigue su camino intacto: eso es la superposición.';
  if (mode === 'single') {
    const min = singleSlitMinDeg(lambda, spacing);
    return min === null
      ? `La rendija (${spacing} mm) es más angosta que λ (${lambda} mm): la onda sale como un semicírculo. Eso es la difracción.`
      : `Primer mínimo donde a·sen θ = λ: θ = ${sig(min)}°. Cuanto más angosta la rendija, más se abre el haz.`;
  }
  const max = maximaDeg(lambda, spacing);
  const fringes = 2 * (Math.ceil(spacing / lambda) - 1) + 1;
  return `Máximos donde d·sen θ = m·λ: ${max.map((a, i) => `θ${'₁₂₃'[i]} = ${sig(a)}°`).join(', ') || 'sólo el central'}. Hay ${fringes} franjas brillantes. Las líneas punteadas marcan dónde la teoría predice calma total.`;
}

/** GPU ripple tank: the 2D wave equation solved live, with the theory drawn on top. */
export function RippleTank() {
  const [mode, setMode] = useState<RippleMode>('two');
  const [lambda, setLambda] = useState(16);
  const [spacing, setSpacing] = useState(48);
  const [intensity, setIntensity] = useState(false);
  const [theory, setTheory] = useState(true);
  const config = useMemo(() => ({ mode, lambda, spacing }), [mode, lambda, spacing]);
  const view = useMemo(() => ({ intensity, theory: theory && (mode === 'two' || mode === 'double') }), [intensity, theory, mode]);
  const tank = useTank(config, view);
  const range = SPACING[mode];
  const pick = (m: RippleMode) => { setMode(m); setSpacing(SPACING[m].initial); };
  return (
    <div className={styles.wave} data-testid="ripple-tank" data-renderer={tank.mode} data-mode={mode}>
      <div className={styles.rippleTop}>
        <div role="group" aria-label="Experimento" className={styles.btnRow}>
          {MODES.map(([id, name]) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => pick(id)}>{name}</button>)}
        </div>
      </div>
      <div ref={tank.boxRef} className={styles.rippleStage}>
        <canvas ref={tank.canvasRef} className={styles.rippleCanvas} role="img"
          aria-label="Cubeta de ondas: superficie del agua simulada. Tocá para tirar una gota."
          onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); tank.drop(e.clientX, e.clientY, r.width, r.height, r.left, r.top); }} />
        <span className={styles.scaleBar} aria-hidden="true"><i />5 cm</span>
      </div>
      <div className={styles.rippleControls}>
        <label className={styles.slider}>
          <span>Longitud de onda: <strong>{lambda} mm</strong></span>
          <input type="range" min={8} max={32} step={1} value={lambda} onChange={(e) => setLambda(Number(e.target.value))} />
        </label>
        {mode !== 'free' && (
          <label className={styles.slider}>
            <span>{range.label}: <strong>{spacing} mm</strong></span>
            <input type="range" min={range.min} max={range.max} step={1} value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} />
          </label>
        )}
        <div role="group" aria-label="Vista de la cubeta" className={styles.btnRow}>
          <button type="button" aria-pressed={!intensity} onClick={() => setIntensity(false)}>Superficie</button>
          <button type="button" aria-pressed={intensity} onClick={() => setIntensity(true)}>Intensidad media</button>
          {(mode === 'two' || mode === 'double') && (
            <button type="button" aria-pressed={theory} onClick={() => setTheory(!theory)}>Teoría</button>
          )}
          <button type="button" aria-pressed={!tank.running} onClick={() => tank.setRunning(!tank.running)}>{tank.running ? 'Pausar' : 'Reanudar'}</button>
          <button type="button" onClick={tank.reset}>Calmar el agua</button>
        </div>
      </div>
      <p className={styles.waveFacts} data-testid="ripple-theory">{theoryText(mode, lambda, spacing)}</p>
      {tank.mode === 'canvas' && <p className={styles.hint}>Tu navegador no ofrece WebGL 2: la simulación corre en el procesador, más lenta.</p>}
    </div>
  );
}
