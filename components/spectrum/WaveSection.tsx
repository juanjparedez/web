'use client';

import { useEffect, useRef, useState } from 'react';
import { bandAt } from '@/lib/spectrum/bands';
import { spectralLinear, toSrgb } from '@/lib/spectrum/color';
import { duration, length, sci } from '@/lib/spectrum/format';
import { closestScale, orderOf } from '@/lib/spectrum/landmarks';
import { wavelength } from '@/lib/spectrum/physics';
import type { Polarization, WaveHandle, WaveView } from '@/lib/spectrum/waveScene';
import { prefersReducedMotion, useActive } from './useRenderer';
import { WaveFallback } from './WaveFallback';
import styles from './spectrum.module.css';

const POLS: readonly [Polarization, string][] = [['linear', 'Lineal'], ['circular', 'Circular']];
const VIEWS: readonly [WaveView, string][] = [['oblique', 'Perspectiva'], ['side', 'De costado'], ['front', 'De frente']];

function hasWebGL() {
  try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; }
}

function useWave(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const handle = useRef<WaveHandle | null>(null);
  const [mode, setMode] = useState<'pending' | 'webgl' | 'svg'>('pending');
  useEffect(() => {
    if (!hasWebGL()) { setMode('svg'); return; }
    let cancelled = false;
    import('@/lib/spectrum/waveScene').then(({ mountWave }) => {
      if (cancelled || !canvasRef.current) return;
      handle.current = mountWave(canvasRef.current, window.matchMedia('(pointer: fine)').matches);
      if (prefersReducedMotion()) handle.current.setRunning(false);
      setMode('webgl');
    }).catch(() => setMode('svg'));
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null; };
  }, [canvasRef]);
  return { handle, mode };
}

/** E and B of the selected frequency, in 3D, slowed down to something the eye can follow. */
export function WaveSection({ logF }: { logF: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useActive(boxRef);
  const { handle, mode } = useWave(canvasRef);
  const [pol, setPol] = useState<Polarization>('linear');
  const [running, setRunning] = useState(true);
  const f = 10 ** logF, lambda = wavelength(f), band = bandAt(logF);
  const tint = band.id === 'visible' ? toSrgb(spectralLinear(lambda * 1e9)) : band.tint;

  useEffect(() => { handle.current?.setVisible(onScreen); }, [onScreen, handle, mode]);
  useEffect(() => { handle.current?.setPolarization(pol); }, [pol, handle, mode]);
  useEffect(() => { handle.current?.setTint(tint); }, [tint, handle, mode]);
  useEffect(() => { if (mode === 'webgl') setRunning(!prefersReducedMotion()); }, [mode]);

  return (
    <div className={styles.wave} ref={boxRef} data-testid="spectrum-wave" data-renderer={mode}>
      <div className={styles.waveStage}>
        {mode === 'svg' ? <WaveFallback /> : <canvas ref={canvasRef} className={styles.waveCanvas}
          aria-label="Onda electromagnética plana en 3D: campo eléctrico y magnético perpendiculares" role="img" />}
        <ul className={styles.legend} aria-label="Referencias">
          <li data-k="e"><b>E</b> campo eléctrico</li>
          <li data-k="b"><b>B</b> campo magnético (×c)</li>
          <li data-k="k"><b>k</b> propagación</li>
        </ul>
      </div>
      <div className={styles.waveControls}>
        <div role="group" aria-label="Polarización">
          {POLS.map(([id, name]) => <button key={id} type="button" aria-pressed={pol === id} onClick={() => setPol(id)}>{name}</button>)}
        </div>
        <div role="group" aria-label="Vista">
          {VIEWS.map(([id, name]) => <button key={id} type="button" onClick={() => handle.current?.setView(id)} disabled={mode !== 'webgl'}>{name}</button>)}
        </div>
        <button type="button" aria-pressed={!running} disabled={mode !== 'webgl'}
          onClick={() => { handle.current?.setRunning(!running); setRunning(!running); }}>{running ? 'Pausar' : 'Reanudar'}</button>
      </div>
      <p className={styles.waveFacts}>
        <span>Se ven 3 longitudes de onda: <strong>{length(3 * lambda)}</strong>, {orderOf(closestScale(3 * lambda).name)}.</span>
        <span>Cámara lenta ×{sci(2 * f, 2)}: en la realidad cada ciclo dura <strong>{duration(1 / f)}</strong>.</span>
      </p>
    </div>
  );
}
