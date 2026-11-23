'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BANDS } from '@/lib/spectrum/bands';
import { LANDMARKS } from '@/lib/spectrum/landmarks';
import { SpectrumAxes } from './SpectrumAxes';
import { SpectrumReadout } from './SpectrumReadout';
import { SpectrumStrip } from './SpectrumStrip';
import { prefersReducedMotion } from './useRenderer';
import { useSpectrumView } from './useSpectrumView';
import styles from './spectrum.module.css';

const SUN = LANDMARKS.find((l) => l.id === 'sun')!.logF;

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** The whole spectrum on a log axis: drag to choose a frequency, zoom into any band. */
export function SpectrumExplorer() {
  const view = useSpectrumView(SUN);
  const { ref, width } = useWidth();
  const [mode, setMode] = useState<'webgl' | 'canvas' | null>(null);
  const [running, setRunning] = useState(true);
  useEffect(() => { if (prefersReducedMotion()) setRunning(false); }, []);
  const { locale } = useParams<{ locale: string }>();
  const zoomed = (view.range[1] - view.range[0]).toFixed(1);
  return (
    <div className={styles.explorer} data-testid="spectrum-explorer">
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.zoom} role="group" aria-label="Zoom del espectro">
            <button type="button" onClick={() => view.zoom(0.4)}>Acercar</button>
            <button type="button" onClick={() => view.zoom(2.5)} disabled={view.isFull}>Alejar</button>
            <button type="button" onClick={view.showAll} disabled={view.isFull}>Todo el espectro</button>
            {mode === 'webgl' && (
              <button type="button" aria-pressed={!running} onClick={() => setRunning(!running)}>{running ? 'Pausar' : 'Animar'}</button>
            )}
          </div>
          <span className={styles.span}>{zoomed} décadas en pantalla · escala logarítmica</span>
        </div>
        <div className={styles.chips} role="group" aria-label="Ir a una banda">
          {BANDS.map((b) => (
            <button key={b.id} type="button" className={styles.chip} data-band={b.id}
              aria-pressed={view.selected >= b.from && view.selected < b.to}
              onClick={() => view.focus(b.from, b.to)}>{b.name}</button>
          ))}
        </div>
        <div ref={ref} className={styles.stage}>
          <SpectrumStrip range={view.range} selected={view.selected} width={width} running={running}
            onSelect={view.setSelected} onMode={setMode} />
          <SpectrumAxes range={view.range} width={width} />
        </div>
        <p className={styles.hint}>
          Arrastrá sobre el espectro o usá las flechas del teclado. Los puntos son fuentes reales: tocalos.
          {mode === 'canvas' && ' Tu navegador no ofrece WebGL: se muestra una versión estática.'}
        </p>
        <div className={styles.landmarks} role="group" aria-label="Fuentes reales">
          {LANDMARKS.map((l) => (
            <button key={l.id} type="button" onClick={() => view.jump(l.logF)}
              aria-pressed={Math.abs(view.selected - l.logF) < 1e-6}>{l.label}</button>
          ))}
        </div>
      </div>
      <div className={styles.readoutCol}>
        <SpectrumReadout logF={view.selected} />
        <Link className={styles.nextLink} href={`/${locale}/espectro/onda?f=${view.selected.toFixed(3)}`} prefetch={false}>
          Ver esta onda en 3D →
        </Link>
      </div>
    </div>
  );
}
