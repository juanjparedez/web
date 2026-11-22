'use client';

import { useLocale } from 'next-intl';
import { useRadioOffline } from './useRadioOffline';
import styles from '@/components/radio-basics/radioCourse.module.css';

const LABELS = {
  idle: '⬇ Guardar sección offline',
  saving: '⏳ Guardando…',
  saved: '✓ Disponible offline',
  error: '⚠ No se pudo guardar',
} as const;

/** Explicit opt-in to keep the radio pages and PDF available without connection. */
export function RadioOfflineButton() {
  const locale = useLocale();
  const { state, savedCount, save, clear } = useRadioOffline(locale);
  return (
    <div className={styles.offline} data-testid="radio-offline">
      <button type="button" onClick={() => void save()} disabled={state === 'saving'} data-state={state}>
        {LABELS[state]}
      </button>
      {state === 'saved' ? (
        <p>
          {savedCount > 0 ? `${savedCount} páginas en caché · ` : null}
          <button type="button" className={styles.offlineClear} onClick={() => void clear()}>
            Borrar copia
          </button>
        </p>
      ) : null}
    </div>
  );
}
