'use client';

import { useSyncExternalStore } from 'react';
import {
  defaultPlayback,
  defaultSound,
  getPlayback,
  getSound,
  setSound,
  stopAllMorse,
  subscribePlayback,
  subscribeSound,
} from './morseSound';
import styles from '../morsePractice.module.css';

export function MorseSoundControls({ globalBar = false }: { globalBar?: boolean }) {
  const { tone, noise } = useSyncExternalStore(subscribeSound, getSound, defaultSound);
  const playback = useSyncExternalStore(subscribePlayback, getPlayback, defaultPlayback);
  return (
    <fieldset className={globalBar ? styles.soundGlobal : `${styles.sound} sr-only`}>
      <legend>{globalBar ? 'Sonido · todas las estaciones' : 'Sonido Morse (sincronizado)'}</legend>
      <div className={styles.soundRow}>
      <div className={styles.settings}>
        <label>Tono · {tone} Hz<input type="range" min={400} max={1000} step={10} value={tone}
          aria-valuetext={tone + ' Hz'} onChange={e => setSound({ tone: Number(e.target.value) })} /></label>
        <label>Fondo de recepción<select value={noise} onChange={e => setSound({ noise: Number(e.target.value) })}>
          <option value={0}>Limpio</option><option value={1}>Ruido suave</option>
          <option value={2}>Ruido medio</option><option value={3}>Ruido intenso</option>
        </select></label>
      </div>
      <div className={styles.soundFooter}>
        <span className={styles.playbackBadge} data-active={playback.active ? 'true' : 'false'}>
          {playback.active ? `◉ Sonando: ${playback.label}` : '● En espera'}
        </span>
        <div className={styles.soundActions}>
          {playback.active ? (
            <button type="button" className={styles.stopAllBtn} onClick={stopAllMorse}>
              ■ Silenciar audio activo
            </button>
          ) : null}
          <button type="button" disabled={tone === 650 && !noise}
            onClick={() => setSound(defaultSound())}>Restablecer</button>
        </div>
      </div>
      </div>
    </fieldset>
  );
}
