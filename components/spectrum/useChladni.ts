'use client';

import { useEffect, useRef, useState } from 'react';
import type { Drive } from '@/lib/spectrum/chladni/plate';
import type { PlateSim } from '@/lib/spectrum/chladni/sim';
import { prefersReducedMotion, useActive, useFrameLoop } from './useRenderer';

/** Owns the Chladni plate: lazy creation, retuning, and a frame loop that sleeps off screen or when paused. */
export function useChladni(frequency: number, drive: Drive, strength: number, showField: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<PlateSim | null>(null);
  const [mode, setMode] = useState<'pending' | 'webgl' | 'canvas'>('pending');
  const [running, setRunning] = useState(true);
  const active = useActive(boxRef);
  const fieldRef = useRef(showField);
  fieldRef.current = showField;

  useEffect(() => {
    let cancelled = false;
    import('@/lib/spectrum/chladni/sim').then(({ createPlate }) => {
      if (cancelled || !canvasRef.current) return;
      simRef.current = createPlate(canvasRef.current, { frequency, drive, strength });
      setMode(simRef.current.mode);
      if (prefersReducedMotion()) setRunning(false);
    });
    return () => { cancelled = true; simRef.current?.dispose(); simRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    simRef.current?.tune({ frequency, drive, strength });
    simRef.current?.render(fieldRef.current);
  }, [frequency, drive, strength, mode]);

  useEffect(() => { simRef.current?.render(showField); }, [showField]);

  const live = active && running && mode !== 'pending';
  useFrameLoop(live, () => simRef.current?.frame(fieldRef.current, mode === 'webgl' ? 4 : 3));

  const scatter = () => { simRef.current?.scatter(); simRef.current?.render(fieldRef.current); };
  return { canvasRef, boxRef, mode, running, live, setRunning, scatter };
}
