'use client';

import { useState } from 'react';
import {
  sanitizeUv5rName,
  type ChirpBandMode,
  type ChirpChannel,
} from '@/lib/radio/chirpBuilder';
import styles from './radioTutorials.module.css';

interface CustomFormProps {
  onAdd: (name: string, freqMhz: number, mode: ChirpBandMode) => void;
}

export function ChirpCustomForm({ onAdd }: CustomFormProps) {
  const [name, setName] = useState('');
  const [freq, setFreq] = useState('145.550');
  const [mode, setMode] = useState<ChirpBandMode>('FM');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(freq.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 100 || parsed > 550) return;
    onAdd(name, parsed, mode);
    setName('');
  };

  return (
    <form className={styles.controlsRow} onSubmit={submit}>
      <label className={styles.fieldLabel}>Nombre en display (máx. 7 letras)
        <input value={name} maxLength={7} onChange={(e) => setName(e.target.value)} placeholder="REPE LU" />
      </label>
      <label className={styles.fieldLabel}>Frecuencia (MHz)
        <input value={freq} onChange={(e) => setFreq(e.target.value)} placeholder="145.550" />
      </label>
      <label className={styles.fieldLabel}>Ancho de banda FM
        <select value={mode} onChange={(e) => setMode(e.target.value as ChirpBandMode)}>
          <option value="FM">FM Wide (25 kHz · Radioafición)</option>
          <option value="NFM">NFM Narrow (12,5 kHz · Walkie-Talkie)</option>
        </select>
      </label>
      <div className={styles.actionsBar}>
        <button type="submit" className={styles.secondaryBtn}>+ Sumar canal a la lista</button>
      </div>
    </form>
  );
}

interface PreviewTableProps {
  channels: readonly ChirpChannel[];
  forceRxOnly: boolean;
  walkieToneHz: number;
  onToggleTx: (id: string) => void;
}

export function ChirpPreviewTable({ channels, forceRxOnly, walkieToneHz, onToggleTx }: PreviewTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} data-stack>
        <thead>
          <tr><th>Mem #</th><th>Display (7 car.)</th><th>Frecuencia</th><th>Modo / Paso</th><th>Subtono CTCSS</th><th>Estado TX (Duplex)</th></tr>
        </thead>
        <tbody>
          {channels.map((ch, idx) => {
            const isRxOnly = forceRxOnly || ch.lockedRxOnly || ch.rxOnlyDefault;
            const isWalkie = ch.pack === 'frs-uhf' || ch.pack === 'pmr446';
            const tone = ch.toneHz ?? (isWalkie && walkieToneHz > 0 ? walkieToneHz : 0);
            return (
              <tr key={ch.id}>
                <td className={styles.mono} data-label="Mem #">{idx + 1}</td>
                <td className={styles.mono} data-label="Display">{sanitizeUv5rName(ch.name)}</td>
                <td className={styles.mono} data-label="Frecuencia">{ch.frequencyMhz.toFixed(5)} MHz</td>
                <td data-label="Modo / paso">{ch.mode} · {ch.stepKhz} kHz</td>
                <td className={styles.mono} data-label="Subtono">{tone > 0 ? `${tone.toFixed(1)} Hz` : 'OFF'}</td>
                <td data-label="Estado TX">
                  {forceRxOnly || ch.lockedRxOnly ? (
                    <span className={styles.tagSafe}>off (TX Bloqueado)</span>
                  ) : (
                    <button type="button" className={styles.secondaryBtn} onClick={() => onToggleTx(ch.id)}>
                      {isRxOnly ? 'off (Solo RX) · Cambiar' : 'Simplex (TX Habilitado)'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
