'use client';

import { useEffect, useState } from 'react';
import { bandAt } from '@/lib/spectrum/bands';
import { blackbodyColor, cssColor } from '@/lib/spectrum/color';
import { length, sci, sig } from '@/lib/spectrum/format';
import { planck, planckFraction, radiantExitance, wienPeak } from '@/lib/spectrum/physics';
import { createPlanck, PLOT_X, PLOT_Y, REFERENCES } from '@/lib/spectrum/planckScene';
import { BlackbodyAxes } from './BlackbodyAxes';
import { useRenderer } from './useRenderer';
import styles from './spectrum.module.css';

const PRESETS: readonly [number, string][] = [
  [2.725, 'Fondo cósmico'], [77, 'Nitrógeno líquido'], [310, 'Cuerpo humano'], [1000, 'Brasa'],
  [2700, 'Lámpara incandescente'], [5772, 'Sol'], [12100, 'Rigel'], [40000, 'Estrella tipo O'],
];
const LOG_T: readonly [number, number] = [0, Math.log10(50000)];

function kelvinText(k: number) {
  return `${k < 10 ? sig(k, 4) : Math.round(k).toLocaleString('es-AR')} K`;
}

/** Planck's law on log–log axes: drag the temperature and watch Wien and Stefan–Boltzmann happen. */
export function BlackbodyLab() {
  const [logT, setLogT] = useState(Math.log10(5772));
  const kelvin = 10 ** logT;
  const { canvasRef, rendererRef, mode } = useRenderer(createPlanck);
  useEffect(() => { rendererRef.current?.render(kelvin); }, [kelvin, mode, rendererRef]);
  useEffect(() => {
    const redraw = () => rendererRef.current?.render(10 ** logT);
    window.addEventListener('resize', redraw);
    return () => window.removeEventListener('resize', redraw);
  }, [logT, rendererRef]);

  const peak = wienPeak(kelvin);
  const visibleShare = planckFraction(kelvin, 380e-9, 750e-9);
  const glows = visibleShare > 1e-7;
  const peakY = (Math.log10(planck(peak, kelvin) * 1e-9) - PLOT_Y[0]) / (PLOT_Y[1] - PLOT_Y[0]);
  const peakX = (Math.log10(peak) - PLOT_X[0]) / (PLOT_X[1] - PLOT_X[0]);
  return (
    <div className={styles.blackbody} data-testid="blackbody-lab" data-renderer={mode}>
      <div className={styles.plot}>
        <canvas ref={canvasRef} className={styles.plotCanvas} role="img"
          aria-label={`Radiancia espectral de un cuerpo negro a ${kelvinText(kelvin)}`} />
        <BlackbodyAxes />
        {peakX > 0 && peakX < 1 && peakY > 0 && peakY < 1 && (
          <span className={styles.peak} style={{ left: `${peakX * 100}%`, bottom: `${peakY * 100}%` }}>
            λ<sub>máx</sub> {length(peak)}
          </span>
        )}
      </div>
      <div className={styles.bbControls}>
        <label className={styles.slider}>
          <span>Temperatura: <strong data-testid="blackbody-temperature">{kelvinText(kelvin)}</strong></span>
          <input type="range" min={LOG_T[0]} max={LOG_T[1]} step={0.001} value={logT}
            onChange={(e) => setLogT(Number(e.target.value))} aria-valuetext={kelvinText(kelvin)} />
        </label>
        <div className={styles.presets} role="group" aria-label="Temperaturas de referencia">
          {PRESETS.map(([k, name]) => (
            <button key={name} type="button" aria-pressed={Math.abs(kelvin - k) < 1e-6 * k}
              onClick={() => setLogT(Math.log10(k))}>{name}</button>
          ))}
        </div>
        <dl className={styles.cells}>
          <div className={styles.cell}><dt>Pico (Wien)</dt><dd>{length(peak)}<small>{bandAt(Math.log10(299_792_458 / peak)).name}</small></dd></div>
          <div className={styles.cell}><dt>Potencia por m² (σT⁴)</dt><dd>{sci(radiantExitance(kelvin))} W/m²</dd></div>
          <div className={styles.cell}><dt>Fracción visible</dt><dd>{visibleShare >= 1e-3 ? `${sig(visibleShare * 100)} %` : sci(visibleShare * 100) + ' %'}</dd></div>
          <div className={styles.cell}><dt>Color que verías</dt><dd>
            <span className={styles.bbSwatch} data-dark={!glows} style={{ background: glows ? cssColor(blackbodyColor(kelvin)) : '#000' }} />
            <small>{glows ? 'cromaticidad CIE 1931, brillo normalizado' : 'no emite luz visible apreciable'}</small>
          </dd></div>
        </dl>
        <p className={styles.legendNote}>Curvas grises: {REFERENCES.map((r) => `${r.label} (${kelvinText(r.kelvin)})`).join(', ')}.</p>
      </div>
    </div>
  );
}
