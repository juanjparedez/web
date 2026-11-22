'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface Renderer { mode: 'webgl' | 'canvas'; dispose: () => void }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Creates a renderer for a canvas once, exposes whether WebGL was available, disposes on unmount. */
export function useRenderer<R extends Renderer>(create: (canvas: HTMLCanvasElement) => R) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<R | null>(null);
  const [mode, setMode] = useState<'pending' | 'webgl' | 'canvas'>('pending');
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = create(canvas);
    rendererRef.current = renderer;
    setMode(renderer.mode);
    return () => { renderer.dispose(); rendererRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { canvasRef, rendererRef, mode };
}

/** True while the element is on screen; lets animation loops sleep off screen. */
export function useOnScreen(ref: RefObject<Element | null>) {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOnScreen(true); return; }
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return onScreen;
}

/** requestAnimationFrame loop that runs only while `active`; passes seconds since mount. */
export function useFrameLoop(active: boolean, draw: (seconds: number) => void) {
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { drawRef.current((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
