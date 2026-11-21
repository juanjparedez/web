export type RadioModeSnrId = 'FT8' | 'CW' | 'SSB' | 'DMR' | 'FM_NARROW' | 'FM_WIDE';

export interface RadioModeSnrSpec {
  id: RadioModeSnrId;
  label: string;
  bandwidthHz: number;
  minSnrInBandDb: number;
  encoding: 'open-digital-fec' | 'open-cw' | 'analog-voice' | 'open-vocoder-fec';
  summary: string;
}

/**
 * Constante de ruido térmico k_B · T₀ a T₀ = 290 K en dBm/Hz:
 * 10 · log10(1.380649e-23 J/K × 290 K / 1e-3 W) ≈ -173.977 dBm/Hz.
 */
export const THERMAL_NOISE_DBM_PER_HZ = -173.977;

export const RADIO_MODES_SNR: readonly RadioModeSnrSpec[] = [
  {
    id: 'FT8',
    label: 'FT8 (8-GFSK + FEC LDPC)',
    bandwidthHz: 50,
    minSnrInBandDb: -4.2, // Equivalente a -21 dB medidos en un canal de referencia SSB de 2500 Hz
    encoding: 'open-digital-fec',
    summary: '8 tonos separados 6,25 Hz con corrección de errores LDPC (174,91). Decodifica señales inaudibles al oído humano.',
  },
  {
    id: 'CW',
    label: 'CW / Código Morse',
    bandwidthHz: 150,
    minSnrInBandDb: 3, // Equivalente a -9 dB en 2400 Hz
    encoding: 'open-cw',
    summary: 'Portadora todo/nada filtrada a 150 Hz. Concentra toda la potencia en un canal 16 veces más angosto que SSB (+12 dB SNR).',
  },
  {
    id: 'SSB',
    label: 'SSB / Banda Lateral Única',
    bandwidthHz: 2400,
    minSnrInBandDb: 6,
    encoding: 'analog-voice',
    summary: 'Voz analógica sin portadora y con una sola banda lateral. Referencia estándar en HF.',
  },
  {
    id: 'DMR',
    label: 'DMR (4FSK TDMA + Vocoder)',
    bandwidthHz: 12500,
    minSnrInBandDb: 7,
    encoding: 'open-vocoder-fec',
    summary: 'Voz comprimida a 3,6 kbps (AMBE+2 + FEC) en 2 ranuras TDMA dentro de 12,5 kHz. Protocolo abierto (sin encriptación en radioafición).',
  },
  {
    id: 'FM_NARROW',
    label: 'FM Narrow (Walkie-Talkie 12,5 kHz)',
    bandwidthHz: 11000,
    minSnrInBandDb: 10,
    encoding: 'analog-voice',
    summary: 'Desviación Δf = ±2,5 kHz (Regla de Carson ≈ 11 kHz). Estándar de handies canaleros UHF / PMR446 / FRS.',
  },
  {
    id: 'FM_WIDE',
    label: 'FM Wide (VHF/UHF Afición 25 kHz)',
    bandwidthHz: 16000,
    minSnrInBandDb: 12,
    encoding: 'analog-voice',
    summary: 'Desviación Δf = ±5 kHz (Regla de Carson ≈ 16 kHz). Audio claro sobre el umbral de captura FM, pero cae abruptamente con señal débil.',
  },
];

/** Piso de ruido térmico de Johnson-Nyquist P_n [dBm] = -173,98 + 10·log10(B) + NF. */
export function thermalNoiseFloorDbm(bandwidthHz: number, noiseFigureDb = 4): number {
  return THERMAL_NOISE_DBM_PER_HZ + 10 * Math.log10(Math.max(1, bandwidthHz)) + noiseFigureDb;
}

/** Relación Señal a Ruido SNR [dB] dentro del filtro propio del modo. */
export function modeSnrDb(signalDbm: number, bandwidthHz: number, noiseFigureDb = 4): number {
  return signalDbm - thermalNoiseFloorDbm(bandwidthHz, noiseFigureDb);
}

/** Ganancia de piso de ruido [dB] respecto de un canal SSB de 2400 Hz: 10·log10(2400 / B). */
export function bandwidthAdvantageVsSsbDb(bandwidthHz: number): number {
  return 10 * Math.log10(2400 / Math.max(1, bandwidthHz));
}

/** Capacidad máxima teórica del canal según el límite de Shannon-Hartley C = B · log2(1 + S/N) [bits/s]. */
export function shannonCapacityBps(bandwidthHz: number, snrDb: number): number {
  const linearSnr = Math.pow(10, snrDb / 10);
  return Math.max(0, bandwidthHz) * Math.log2(1 + linearSnr);
}

/**
 * Rango dinámico de un receptor SDR en dB:
 * DR_ADC = 6.02 · N_bits + 1.76 dB
 * Ganancia de procesado por diezmado (decimation gain) = 10 · log10(f_s / B_filtro) para muestreo complejo I/Q.
 */
export function sdrAdcDynamicRangeDb(adcBits: number): number {
  return 6.02 * adcBits + 1.76;
}

export function sdrDecimationGainDb(sampleRateHz: number, filterBandwidthHz: number): number {
  if (sampleRateHz <= filterBandwidthHz) return 0;
  return 10 * Math.log10(sampleRateHz / Math.max(1, filterBandwidthHz));
}

export function sdrEffectiveDynamicRangeDb(adcBits: number, sampleRateHz: number, filterBandwidthHz: number): number {
  return sdrAdcDynamicRangeDb(adcBits) + sdrDecimationGainDb(sampleRateHz, filterBandwidthHz);
}
