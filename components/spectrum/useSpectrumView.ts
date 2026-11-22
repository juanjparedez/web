'use client';

import { useCallback, useState } from 'react';
import { LOG_F_MAX, LOG_F_MIN } from '@/lib/spectrum/physics';

export type Range = readonly [number, number];

const FULL: Range = [LOG_F_MIN, LOG_F_MAX];
const MIN_SPAN = 0.2;

const clampRange = (center: number, span: number): Range => {
  const s = Math.min(LOG_F_MAX - LOG_F_MIN, Math.max(MIN_SPAN, span));
  const lo = Math.min(LOG_F_MAX - s, Math.max(LOG_F_MIN, center - s / 2));
  return [lo, lo + s];
};

/** Visible window (log10 Hz) and selected frequency of the explorer. */
export function useSpectrumView(initial: number) {
  const [range, setRange] = useState<Range>(FULL);
  const [selected, setSelectedRaw] = useState(initial);

  const setSelected = useCallback((logF: number) => {
    setSelectedRaw(Math.min(LOG_F_MAX, Math.max(LOG_F_MIN, logF)));
  }, []);

  const zoom = useCallback((factor: number) => {
    setRange((r) => clampRange(selected, (r[1] - r[0]) * factor));
  }, [selected]);

  /** Frames a span (e.g. a band) with some margin and selects its centre unless told not to. */
  const focus = useCallback((from: number, to: number, select = true) => {
    const span = Math.max(MIN_SPAN, (to - from) * 1.5);
    setRange(clampRange((from + to) / 2, span));
    if (select) setSelected((from + to) / 2);
  }, [setSelected]);

  const showAll = useCallback(() => setRange(FULL), []);

  const jump = useCallback((logF: number) => {
    setSelected(logF);
    setRange((r) => (logF < r[0] || logF > r[1] ? clampRange(logF, r[1] - r[0]) : r));
  }, [setSelected]);

  return { range, selected, setSelected, zoom, focus, showAll, jump, isFull: range[0] === FULL[0] && range[1] === FULL[1] };
}
