'use client';

import { useEffect, useState } from 'react';

const CACHE_NAME = 'hios-radio-offline-v1';

const INSTRUMENT_IMAGES = ['multimetro-ut61d', 'osciloscopio-rigol-ds1054z', 'medidor-roe-potencia', 'nanovna']
  .map((name) => `/images/radio/instruments/${name}.webp`);

const OFFLINE_PATHS = [
  '/radio',
  '/medicion',
  '/medicion/multimetro',
  '/medicion/instrumentos',
  ...['multimetro', 'osciloscopio', 'roe', 'nanovna'].map((slug) => `/medicion/instrumentos/${slug}`),
  '/radio/programa',
  '/radio/morse',
  ...['arbol', 'reconocer', 'transmitir', 'koch', 'alfabeto', 'traductor'].map((slug) => `/radio/morse/${slug}`),
  '/radio/tutoriales',
  '/radio/a-electricidad',
  '/radio/b-modulacion-equipos',
  '/radio/c-antenas-propagacion',
  '/radio/d-reglamento',
  '/radio/practica',
  '/radio/imprimir',
  ...['voltage', 'current', 'resistance', 'ohm', 'series', 'parallel', 'power', 'practice',
    'waves', 'propagation', 'morse', 'bands', 'laboratory', 'glossary', 'sources'].map((id) => `/radio/lecciones/${id}`),
];

export type OfflineState = 'idle' | 'saving' | 'saved' | 'error';

async function cacheAll(locale: string): Promise<number> {
  const cache = await window.caches.open(CACHE_NAME);
  const urls = [...OFFLINE_PATHS.map((p) => `/${locale}${p}`), '/downloads/radio/guia-radioaficionado-novicio.pdf',
    ...INSTRUMENT_IMAGES];
  let okCount = 0;
  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (response.ok) {
        await cache.put(url, response.clone());
        okCount++;
      }
    } catch {
      /* Best-effort per route */
    }
  }
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw-radio-offline.js');
    } catch {
      /* Optional SW registration */
    }
  }
  return okCount;
}

/** Explicit, user-triggered offline copy of the radio section (same-origin only). */
export function useRadioOffline(locale: string) {
  const [state, setState] = useState<OfflineState>('idle');
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(CACHE_NAME) === '1') setState('saved');
    } catch {
      /* Storage optional */
    }
  }, []);

  const save = async () => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      setState('error');
      return;
    }
    setState('saving');
    try {
      setSavedCount(await cacheAll(locale));
      setState('saved');
      try {
        localStorage.setItem(CACHE_NAME, '1');
      } catch {
        /* ignore */
      }
    } catch {
      setState('error');
    }
  };

  const clear = async () => {
    try {
      if ('caches' in window) await window.caches.delete(CACHE_NAME);
      localStorage.removeItem(CACHE_NAME);
    } catch {
      /* ignore */
    }
    setSavedCount(0);
    setState('idle');
  };

  return { state, savedCount, save, clear };
}
