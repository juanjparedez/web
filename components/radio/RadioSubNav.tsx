'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './radioSubNav.module.css';

const CACHE_NAME = 'hios-radio-offline-v1';

const OFFLINE_PATHS = [
  '/radio',
  '/radio/programa',
  '/radio/morse',
  '/radio/tutoriales',
  '/radio/a-electricidad',
  '/radio/b-modulacion-equipos',
  '/radio/c-antenas-propagacion',
  '/radio/d-reglamento',
  '/radio/practica',
  '/radio/imprimir',
  '/radio/lecciones/voltage',
  '/radio/lecciones/current',
  '/radio/lecciones/resistance',
  '/radio/lecciones/ohm',
  '/radio/lecciones/series',
  '/radio/lecciones/parallel',
  '/radio/lecciones/power',
  '/radio/lecciones/measurement',
  '/radio/lecciones/practice',
  '/radio/lecciones/waves',
  '/radio/lecciones/propagation',
  '/radio/lecciones/morse',
  '/radio/lecciones/bands',
  '/radio/lecciones/laboratory',
  '/radio/lecciones/glossary',
  '/radio/lecciones/sources',
];

export function RadioSubNav() {
  const locale = useLocale();
  const pathname = usePathname() ?? '';
  const base = `/${locale}/radio`;
  const [offlineState, setOfflineState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(CACHE_NAME) === '1') {
        setOfflineState('saved');
      }
    } catch {
      /* Storage optional */
    }
  }, []);

  const saveOffline = async () => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      setOfflineState('error');
      return;
    }
    setOfflineState('saving');
    try {
      const cache = await window.caches.open(CACHE_NAME);
      const urls = [
        ...OFFLINE_PATHS.map((p) => `/${locale}${p}`),
        '/downloads/radio/guia-radioaficionado-novicio.pdf',
      ];
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
      setSavedCount(okCount);
      setOfflineState('saved');
      try {
        localStorage.setItem(CACHE_NAME, '1');
      } catch {
        /* ignore */
      }
    } catch {
      setOfflineState('error');
    }
  };

  const clearOffline = async () => {
    try {
      if ('caches' in window) await window.caches.delete(CACHE_NAME);
      localStorage.removeItem(CACHE_NAME);
    } catch {
      /* ignore */
    }
    setSavedCount(0);
    setOfflineState('idle');
  };

  const items = [
    { href: base, label: 'Fundamentos', badge: '12', exact: true },
    { href: `${base}/programa`, label: 'Programa ENACOM', badge: 'LU' },
    { href: `${base}/morse`, label: 'Consola Morse', badge: 'CW' },
    { href: `${base}/lecciones/bands`, label: 'Espectro y Bandas', badge: 'RF' },
    { href: `${base}/tutoriales`, label: 'Tutoriales y Equipos', badge: 'UV-5R' },
    { href: `${base}/lecciones/laboratory`, label: 'Laboratorio', badge: 'DC' },
    { href: `${base}/lecciones/glossary`, label: 'Glosario y SDR', badge: 'DSP' },
  ];

  return (
    <div className={styles.bar} data-testid="radio-subnav">
      <nav className={styles.links} aria-label="Secciones de radioaficionado">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              className={`${styles.link} ${active ? styles.linkActive : ''}`}
            >
              <span className={styles.badge}>{item.badge}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.offlineBox}>
        <button
          type="button"
          className={styles.offlineBtn}
          onClick={() => void saveOffline()}
          disabled={offlineState === 'saving'}
        >
          {offlineState === 'saving'
            ? '⏳ Guardando manuales…'
            : offlineState === 'saved'
              ? '✓ Disponible offline'
              : '⬇ Guardar sección offline'}
        </button>
        {offlineState === 'saved' ? (
          <>
            {savedCount > 0 ? <span className={styles.statusText}>{savedCount} páginas en caché</span> : null}
            <button type="button" className={styles.clearBtn} onClick={() => void clearOffline()}>
              Borrar copia
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
