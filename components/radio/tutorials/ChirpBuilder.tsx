'use client';

import { useMemo, useState } from 'react';
import {
  buildChirpCsv,
  CHIRP_PACKS,
  CTCSS_SUBCHANNELS,
  PRESET_CHIRP_CHANNELS,
  sanitizeUv5rName,
  type ChirpBandMode,
  type ChirpChannel,
  type ChirpPackId,
} from '@/lib/radio/chirpBuilder';
import { ChirpCustomForm, ChirpPreviewTable } from './ChirpPreviewTable';
import styles from './radioTutorials.module.css';

export function ChirpBuilder() {
  const [selectedPacks, setSelectedPacks] = useState<ChirpPackId[]>(['ham-ar', 'frs-uhf', 'emergency-rx']);
  const [forceRxOnly, setForceRxOnly] = useState(true);
  const [walkieToneHz, setWalkieToneHz] = useState(0);
  const [includeToneOnRx, setIncludeToneOnRx] = useState(false);
  const [customChannels, setCustomChannels] = useState<ChirpChannel[]>([]);
  const [txEnabledIds, setTxEnabledIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const togglePack = (id: ChirpPackId) => {
    setSelectedPacks((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleChannelTx = (id: string) => {
    setTxEnabledIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const activeChannels = useMemo(() => {
    const base = PRESET_CHIRP_CHANNELS.filter((ch) => selectedPacks.includes(ch.pack));
    return [...base, ...customChannels].map((ch) => ({
      ...ch,
      rxOnlyDefault: ch.lockedRxOnly ? true : !txEnabledIds.includes(ch.id),
    }));
  }, [selectedPacks, customChannels, txEnabledIds]);

  const csvText = useMemo(
    () => buildChirpCsv(activeChannels, { forceRxOnly, walkieToneHz, includeToneOnRx }),
    [activeChannels, forceRxOnly, walkieToneHz, includeToneOnRx],
  );

  const handleAddCustom = (name: string, freqMhz: number, mode: ChirpBandMode) => {
    setCustomChannels((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        pack: 'ham-ar',
        name: sanitizeUv5rName(name || `CH ${prev.length + 1}`),
        frequencyMhz: freqMhz,
        mode,
        stepKhz: mode === 'NFM' ? 12.5 : 25,
        rxOnlyDefault: true,
        comment: 'Memoria personalizada usuario',
      },
    ]);
  };

  const downloadCsv = () => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = forceRxOnly ? 'baofeng-uv5r-rx-only.csv' : 'baofeng-uv5r-custom.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCsv = () => {
    void navigator.clipboard?.writeText(csvText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="generador-chirp" className={styles.section} data-testid="chirp-csv-builder">
      <span className={styles.kicker}>00 / HERRAMIENTA DE TALLER · GENERADOR CHIRP (.CSV)</span>
      <h2>Armador de Memorias CHIRP para Baofeng UV-5R (Bloqueo RX-Only y Walkie-Talkies)</h2>
      <p>
        Seleccioná qué paquetes de frecuencias querés grabar en tu handy, convertí el «subcanal» (1 a 38) de otros walkie-talkies a su frecuencia CTCSS exacta en Hz y descargá el archivo <code>.csv</code> listo para importar en CHIRP (<code>File → Import</code>).
      </p>

      <div className={styles.builderBox}>
        <div className={styles.packGrid} role="group" aria-label="Paquetes de canales">
          {CHIRP_PACKS.map((pack) => {
            const active = selectedPacks.includes(pack.id);
            return (
              <button key={pack.id} type="button" className={styles.packCard}
                data-active={active ? 'true' : 'false'} aria-pressed={active} onClick={() => togglePack(pack.id)}>
                <div className={styles.packHeader}>
                  <span>{pack.badge}</span>
                  <span>{active ? '✓ Incluido' : '+ Agregar'}</span>
                </div>
                <strong>{pack.label}</strong>
                <p className={styles.packDesc}>{pack.description}</p>
              </button>
            );
          })}
        </div>

        <div className={styles.controlsRow}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={forceRxOnly} onChange={(e) => setForceRxOnly(e.target.checked)} />
            <span>Modo Sin Licencia: Forzar bloqueo de TX (Duplex = off) en todas las memorias</span>
          </label>
          <label className={styles.fieldLabel}>
            Subcanal de Walkie-Talkie (Códigos 1–38 → CTCSS Hz)
            <select value={walkieToneHz} onChange={(e) => setWalkieToneHz(Number(e.target.value))}>
              <option value={0}>0 · Sin subtono (Escucha abierta · recomendado)</option>
              {CTCSS_SUBCHANNELS.map((sub) => (
                <option key={sub.code} value={sub.hz}>
                  Subcanal {sub.code} → {sub.hz.toFixed(1)} Hz (CTCSS)
                </option>
              ))}
            </select>
          </label>
          {walkieToneHz > 0 ? (
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={includeToneOnRx} onChange={(e) => setIncludeToneOnRx(e.target.checked)} />
              <span>Silenciar recepción si no envían subtono (TSQL / R-CTCS = {walkieToneHz.toFixed(1)} Hz)</span>
            </label>
          ) : null}
        </div>

        <ChirpCustomForm onAdd={handleAddCustom} />

        <div className={styles.actionsBar}>
          <button type="button" className={styles.primaryBtn} onClick={downloadCsv} disabled={!activeChannels.length}>
            ⬇ Descargar CSV para CHIRP ({activeChannels.length} canales)
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={copyCsv} disabled={!activeChannels.length}>
            {copied ? '✓ CSV copiado al portapapeles' : 'Copiar CSV'}
          </button>
        </div>

        <ChirpPreviewTable
          channels={activeChannels}
          forceRxOnly={forceRxOnly}
          walkieToneHz={walkieToneHz}
          onToggleTx={toggleChannelTx}
        />
      </div>
    </section>
  );
}
