'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { BANDS } from '@/lib/spectrum/bands';
import { LANDMARKS } from '@/lib/spectrum/landmarks';
import { si } from '@/lib/spectrum/format';
import { createStrip } from '@/lib/spectrum/stripScene';
import { useActive, useFrameLoop, useRenderer } from './useRenderer';
import type { Range } from './useSpectrumView';
import styles from './spectrum.module.css';

interface Props {
  range: Range;
  selected: number;
  width: number;
  running: boolean;
  onSelect: (logF: number) => void;
  onMode: (mode: 'webgl' | 'canvas') => void;
}

const pct = (lf: number, r: Range) => ((lf - r[0]) / (r[1] - r[0])) * 100;

function BandLabels({ range, width }: { range: Range; width: number }) {
  return (
    <div className={styles.bandLabels} aria-hidden="true">
      {BANDS.map((b) => {
        const lo = Math.max(b.from, range[0]), hi = Math.min(b.to, range[1]);
        const px = ((hi - lo) / (range[1] - range[0])) * width;
        if (px < b.name.length * 7.2 + 12) return null;
        return <span key={b.id} style={{ left: `${pct((lo + hi) / 2, range)}%` }}>{b.name}</span>;
      })}
    </div>
  );
}

function Pins({ range, selected, onSelect }: { range: Range; selected: number; onSelect: (lf: number) => void }) {
  return (
    <div className={styles.pins}>
      {LANDMARKS.filter((l) => l.logF > range[0] && l.logF < range[1]).map((l) => (
        <button key={l.id} type="button" className={styles.pin} style={{ left: `${pct(l.logF, range)}%` }}
          data-active={Math.abs(l.logF - selected) < 1e-6} onClick={() => onSelect(l.logF)}
          aria-label={`${l.label}: ${si(10 ** l.logF, 'Hz')}`} title={l.label} />
      ))}
    </div>
  );
}

export function SpectrumStrip({ range, selected, width, running, onSelect, onMode }: Props) {
  const { canvasRef, rendererRef, mode } = useRenderer(createStrip);
  const boxRef = useRef<HTMLDivElement>(null);
  const active = useActive(boxRef);
  const state = useRef({ range, selected, time: 0 });
  state.current = { ...state.current, range, selected };
  const animate = mode === 'webgl' && active && running;

  useEffect(() => { if (mode !== 'pending') onMode(mode); }, [mode, onMode]);
  useEffect(() => { rendererRef.current?.render(state.current); }, [range, selected, width, mode, rendererRef]);
  useFrameLoop(animate, (t) => { state.current.time = t; rendererRef.current?.render(state.current); });

  const pick = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSelect(range[0] + x * (range[1] - range[0]));
  }, [range, onSelect]);

  const onKey = (e: KeyboardEvent) => {
    const step = (e.shiftKey ? 0.5 : 0.02) * (range[1] - range[0]);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onSelect(selected + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onSelect(selected - step);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={boxRef} className={styles.strip} data-testid="spectrum-strip" data-renderer={mode} data-running={animate}>
      <BandLabels range={range} width={width} />
      <canvas ref={canvasRef} className={styles.stripCanvas} role="slider" tabIndex={0}
        aria-label="Frecuencia seleccionada en el espectro" aria-valuemin={0} aria-valuemax={26}
        aria-valuenow={Number(selected.toFixed(3))} aria-valuetext={si(10 ** selected, 'Hz')}
        onKeyDown={onKey}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
        onPointerMove={(e) => { if (e.buttons & 1) pick(e); }} />
      <Pins range={range} selected={selected} onSelect={onSelect} />
      <span className={styles.atmLabel} aria-hidden="true">Llega al suelo desde el espacio ↓</span>
    </div>
  );
}
