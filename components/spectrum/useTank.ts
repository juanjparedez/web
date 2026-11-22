'use client';

import { useEffect, useRef, useState } from 'react';
import { GRID_H, GRID_W, type RippleConfig } from '@/lib/spectrum/ripple/model';
import type { Tank } from '@/lib/spectrum/ripple/tank';
import { prefersReducedMotion, useFrameLoop, useOnScreen } from './useRenderer';

export interface TankView { intensity: boolean; theory: boolean }

/** Owns the ripple tank: lazy creation, reconfiguration, and a frame loop that sleeps off screen. */
export function useTank(config: RippleConfig, view: TankView) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tankRef = useRef<Tank | null>(null);
  const [mode, setMode] = useState<'pending' | 'webgl' | 'canvas'>('pending');
  const [running, setRunning] = useState(true);
  const onScreen = useOnScreen(boxRef);
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    let cancelled = false;
    import('@/lib/spectrum/ripple/tank').then(({ createTank }) => {
      if (cancelled || !canvasRef.current) return;
      tankRef.current = createTank(canvasRef.current, config);
      setMode(tankRef.current.mode);
      if (prefersReducedMotion()) setRunning(false);
    });
    return () => { cancelled = true; tankRef.current?.dispose(); tankRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tank = tankRef.current;
    if (!tank) return;
    tank.configure(config);
    tank.reset();
    if (config.mode !== 'free') tank.steps(tank.stepsPerFrame * 160);
    tank.draw(viewRef.current);
  }, [config, mode]);

  useEffect(() => { tankRef.current?.draw(view); }, [view]);

  useFrameLoop(onScreen && running && mode !== 'pending', () => {
    const tank = tankRef.current;
    if (!tank) return;
    tank.steps(tank.stepsPerFrame);
    tank.draw(viewRef.current);
  });

  const drop = (clientX: number, clientY: number, width: number, height: number, left: number, top: number) => {
    const tank = tankRef.current;
    if (!tank) return;
    tank.drop(((clientX - left) / width) * GRID_W, (1 - (clientY - top) / height) * GRID_H);
    if (!running) { tank.steps(tank.stepsPerFrame * 20); tank.draw(viewRef.current); }
  };

  return { canvasRef, boxRef, mode, running, setRunning, drop, reset: () => { tankRef.current?.reset(); tankRef.current?.draw(viewRef.current); } };
}
