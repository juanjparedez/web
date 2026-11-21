'use client';

import { useState } from 'react';
import {
  bandwidthAdvantageVsSsbDb,
  modeSnrDb,
  RADIO_MODES_SNR,
  sdrEffectiveDynamicRangeDb,
  shannonCapacityBps,
  thermalNoiseFloorDbm,
  type RadioModeSnrId,
} from '@/lib/radio/sdrSnr';
import { Chips, Controls, Instrument, Readouts, Screen } from '../ui/Instrument';
import { RangeField } from '../ui/RangeField';
import { fmt, si } from '../ui/format';
import styles from '../radio.module.css';

const SAMPLE_RATE_HZ = 2.4e6; // 2,4 MS/s típico de un dongle SDR I/Q

export function SdrSnrLab() {
  const [modeId, setModeId] = useState<RadioModeSnrId>('CW');
  const [signalDbm, setSignalDbm] = useState(-126);
  const [nfDb, setNfDb] = useState(5);
  const [adcBits, setAdcBits] = useState('12');

  const mode = RADIO_MODES_SNR.find((m) => m.id === modeId) ?? RADIO_MODES_SNR[1];
  const noiseFloor = thermalNoiseFloorDbm(mode.bandwidthHz, nfDb);
  const snr = modeSnrDb(signalDbm, mode.bandwidthHz, nfDb);
  const margin = snr - mode.minSnrInBandDb;
  const advantage = bandwidthAdvantageVsSsbDb(mode.bandwidthHz);
  const capacity = shannonCapacityBps(mode.bandwidthHz, snr);
  const sdrDr = sdrEffectiveDynamicRangeDb(Number(adcBits), SAMPLE_RATE_HZ, mode.bandwidthHz);

  const filterWidthPx = Math.max(12, Math.min(220, (Math.log10(mode.bandwidthHz) / Math.log10(20000)) * 220));
  const noiseY = Math.max(25, Math.min(130, 130 - ((noiseFloor + 165) / 80) * 100));
  const sigY = Math.max(16, Math.min(130, 130 - ((signalDbm + 165) / 80) * 100));

  return (
    <Instrument
      badge="SDR · SNR"
      title="Comparador DSP de Ancho de Banda, Piso de Ruido Térmico y Límite de Shannon"
      hint="Bajá la señal recibida a −130 dBm y cambiá de FM Wide a SSB, CW y FT8: al achicar el filtro pasabanda DSP entra menos potencia de ruido térmico (Pn = kB·T·B) y la señal emerge sin subir la potencia del transmisor."
    >
      <Chips
        label="Modo y filtro DSP"
        value={modeId}
        onChange={setModeId}
        options={RADIO_MODES_SNR.map((m) => ({ value: m.id, label: m.id.replace('_', ' ') }))}
      />

      <Screen>
        <svg viewBox="0 0 620 156" role="img" aria-label="Ventana de filtro DSP y margen SNR por modo">
          <rect x={14} y={14} width={250} height={126} rx={6} fill="#090d14" stroke="#1e293b" />
          <rect
            x={139 - filterWidthPx / 2}
            y={18}
            width={filterWidthPx}
            height={118}
            fill="rgba(34, 211, 238, 0.14)"
            stroke="#22d3ee"
            strokeDasharray="3 2"
          />
          <line x1={18} x2={260} y1={noiseY} y2={noiseY} stroke="#f97316" strokeWidth={2} />
          <text x={24} y={Math.max(28, noiseY - 5)} className={styles.svgLabel} fill="#fb923c">
            Piso Pn {fmt(noiseFloor, 1)} dBm
          </text>
          <line x1={139} x2={139} y1={134} y2={sigY} stroke={margin >= 0 ? '#4ade80' : '#f87171'} strokeWidth={4} />
          <circle cx={139} cy={sigY} r={4} fill={margin >= 0 ? '#4ade80' : '#f87171'} />
          <text x={139} y={148} textAnchor="middle" className={styles.svgLabel}>
            Filtro DSP: {si(mode.bandwidthHz, 'Hz')}
          </text>

          {RADIO_MODES_SNR.map((item, idx) => {
            const itemSnr = modeSnrDb(signalDbm, item.bandwidthHz, nfDb);
            const itemMargin = itemSnr - item.minSnrInBandDb;
            const barW = Math.max(6, Math.min(180, (itemMargin + 25) * 3.6));
            const y = 20 + idx * 21;
            const ok = itemMargin >= 0;
            return (
              <g key={item.id} onClick={() => setModeId(item.id)} style={{ cursor: 'pointer' }}>
                <text x={282} y={y + 11} className={item.id === modeId ? styles.svgStrong : styles.svgLabel}>
                  {item.id.replace('_', ' ')}
                </text>
                <rect x={365} y={y} width={185} height={14} rx={3} fill="#0f172a" stroke="#1e293b" />
                <rect x={365} y={y} width={barW} height={14} rx={3} fill={ok ? '#10b981' : '#ef4444'} opacity={item.id === modeId ? 1 : 0.65} />
                <text x={558} y={y + 11} className={styles.svgLabel} fill={ok ? '#4ade80' : '#f87171'}>
                  {itemMargin >= 0 ? `+${fmt(itemMargin, 1)}` : fmt(itemMargin, 1)} dB
                </text>
              </g>
            );
          })}
        </svg>
      </Screen>

      <p className={styles.instrumentHint}>
        <strong>{mode.label}:</strong> {mode.summary}
      </p>

      <Controls>
        <RangeField
          label="Señal en antena (S9 HF = −73 dBm)"
          value={signalDbm}
          min={-145}
          max={-85}
          step={1}
          display={`${signalDbm} dBm`}
          onChange={setSignalDbm}
        />
        <RangeField
          label="Figura de ruido del receptor (NF)"
          value={nfDb}
          min={1}
          max={15}
          step={0.5}
          display={`${nfDb} dB`}
          onChange={setNfDb}
        />
        <Chips
          label="ADC del SDR (Muestreo I/Q a 2,4 MS/s)"
          value={adcBits}
          onChange={setAdcBits}
          options={[
            { value: '8', label: '8 bits (RTL-SDR)' },
            { value: '12', label: '12 bits' },
            { value: '14', label: '14 bits' },
            { value: '16', label: '16 bits (HF Direct)' },
          ]}
        />
      </Controls>

      <Readouts
        items={[
          { label: 'Ancho del filtro DSP (B)', value: si(mode.bandwidthHz, 'Hz') },
          { label: 'Piso de ruido térmico (Pn)', value: `${fmt(noiseFloor, 1)} dBm` },
          {
            label: 'SNR en el filtro / Estado',
            value: `${snr >= 0 ? '+' : ''}${fmt(snr, 1)} dB (${margin >= 0 ? 'Copiable ✓' : 'Bajo umbral ✗'})`,
            tone: margin >= 3 ? 'good' : margin >= 0 ? 'warn' : 'bad',
          },
          {
            label: 'Ventaja de piso frente a SSB',
            value: `${advantage >= 0 ? '+' : ''}${fmt(advantage, 1)} dB`,
            tone: advantage > 0 ? 'good' : advantage < 0 ? 'warn' : undefined,
          },
          { label: 'Capacidad de Shannon (C)', value: `${si(capacity, 'b/s', 3)}` },
          { label: `Rango dinámico SDR (${adcBits}b + diezmado)`, value: `${fmt(sdrDr, 1)} dB`, tone: sdrDr >= 85 ? 'good' : 'warn' },
        ]}
      />
    </Instrument>
  );
}
