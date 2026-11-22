'use client';

import { useCallback, useEffect, useRef } from 'react';
import { playMorse } from '../widgets/morseAudio';

/** Plays one Morse code at a time and stops it on unmount. */
export function useMorsePlayer(wpm = 14) {
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);
  return useCallback((code: string, onEnd?: () => void) => {
    stop.current?.();
    if (!code) return;
    try {
      stop.current = playMorse(code, { wpm, farnsworth: wpm }, undefined, () => { stop.current = null; onEnd?.(); });
    } catch {
      stop.current = null;
    }
  }, [wpm]);
}
