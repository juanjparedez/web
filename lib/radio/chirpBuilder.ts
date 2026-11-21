export type ChirpPackId = 'ham-ar' | 'frs-uhf' | 'pmr446' | 'emergency-rx';
export type ChirpBandMode = 'FM' | 'NFM';

export interface ChirpChannel {
  id: string;
  pack: ChirpPackId;
  name: string;
  frequencyMhz: number;
  mode: ChirpBandMode;
  stepKhz: number;
  rxOnlyDefault: boolean;
  lockedRxOnly?: boolean;
  toneHz?: number;
  comment: string;
}

/**
 * Equivalencia oficial entre el número de «Subcanal / Código de privacidad» (1 a 38)
 * de los walkie-talkies comerciales (Motorola, Midland, Cobra, Uniden) y la
 * frecuencia física real del subtono CTCSS (Hz) que se programa en los menús 11 y 13 del Baofeng UV-5R.
 */
export const CTCSS_SUBCHANNELS: readonly { code: number; hz: number }[] = [
  { code: 1, hz: 67.0 }, { code: 2, hz: 71.9 }, { code: 3, hz: 74.4 }, { code: 4, hz: 77.0 },
  { code: 5, hz: 79.7 }, { code: 6, hz: 82.5 }, { code: 7, hz: 85.4 }, { code: 8, hz: 88.5 },
  { code: 9, hz: 91.5 }, { code: 10, hz: 94.8 }, { code: 11, hz: 97.4 }, { code: 12, hz: 100.0 },
  { code: 13, hz: 103.5 }, { code: 14, hz: 107.2 }, { code: 15, hz: 110.9 }, { code: 16, hz: 114.8 },
  { code: 17, hz: 118.8 }, { code: 18, hz: 123.0 }, { code: 19, hz: 127.3 }, { code: 20, hz: 131.8 },
  { code: 21, hz: 136.5 }, { code: 22, hz: 141.3 }, { code: 23, hz: 146.2 }, { code: 24, hz: 151.4 },
  { code: 25, hz: 156.7 }, { code: 26, hz: 162.2 }, { code: 27, hz: 167.9 }, { code: 28, hz: 173.8 },
  { code: 29, hz: 179.9 }, { code: 30, hz: 186.2 }, { code: 31, hz: 192.8 }, { code: 32, hz: 203.5 },
  { code: 33, hz: 210.7 }, { code: 34, hz: 218.1 }, { code: 35, hz: 225.7 }, { code: 36, hz: 233.6 },
  { code: 37, hz: 241.8 }, { code: 38, hz: 250.3 },
];

export const CHIRP_PACKS: readonly { id: ChirpPackId; label: string; badge: string; description: string }[] = [
  {
    id: 'ham-ar',
    label: 'Radioaficionados Argentina + ISS',
    badge: '2M / 70CM',
    description: 'Frecuencias de encuentro FM 2 m y 70 cm, APRS nacional (144,930 MHz) y bajada de la Estación Espacial Internacional (FM WIDE 25 kHz).',
  },
  {
    id: 'frs-uhf',
    label: 'Walkie-Talkies UHF / FRS (Canales 1–7)',
    badge: '462 MHz · NFM',
    description: 'Canales estándar de handies familiares UHF configurados en FM Angosta (NFM 12,5 kHz) para evitar distorsión por sobredesviación.',
  },
  {
    id: 'pmr446',
    label: 'Walkie-Talkies PMR446 (Canales 1–8)',
    badge: '446 MHz · 6.25K',
    description: 'Los 8 canales del estándar PMR446 con paso de sintetizador PLL de 6,25 kHz y modo NFM (12,5 kHz).',
  },
  {
    id: 'emergency-rx',
    label: 'Escucha Marítima y Servicios (Estricto RX)',
    badge: 'SOLO RX',
    description: 'Canal 16 de Socorro Marítimo (156,800 MHz) y canal meteorológico VHF con transmisión bloqueada permanentemente.',
  },
];

export const PRESET_CHIRP_CHANNELS: readonly ChirpChannel[] = [
  { id: 'ham-2m-call', pack: 'ham-ar', name: '2M CALL', frequencyMhz: 145.5, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'Llamada nacional FM 2m Argentina' },
  { id: 'ham-iss-voice', pack: 'ham-ar', name: 'ISS VZ', frequencyMhz: 145.8, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'Bajada fonia y SSTV Estacion Espacial ISS' },
  { id: 'ham-iss-aprs', pack: 'ham-ar', name: 'ISS PKT', frequencyMhz: 145.825, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'Digipeater APRS Estacion Espacial ISS' },
  { id: 'ham-aprs-ar', pack: 'ham-ar', name: 'APRS AR', frequencyMhz: 144.93, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'APRS Argentina 1200 bps AFSK' },
  { id: 'ham-repe-1', pack: 'ham-ar', name: 'REPE 01', frequencyMhz: 146.94, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'Salida repetidora VHF (-600 kHz)' },
  { id: 'ham-repe-2', pack: 'ham-ar', name: 'REPE 02', frequencyMhz: 147.0, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'Salida repetidora VHF (-600 kHz)' },
  { id: 'ham-70cm-call', pack: 'ham-ar', name: '70CM CL', frequencyMhz: 433.5, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, comment: 'Encuentro FM 70cm Argentina' },

  { id: 'frs-1', pack: 'frs-uhf', name: 'FRS C01', frequencyMhz: 462.5625, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 1' },
  { id: 'frs-2', pack: 'frs-uhf', name: 'FRS C02', frequencyMhz: 462.5875, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 2' },
  { id: 'frs-3', pack: 'frs-uhf', name: 'FRS C03', frequencyMhz: 462.6125, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 3' },
  { id: 'frs-4', pack: 'frs-uhf', name: 'FRS C04', frequencyMhz: 462.6375, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 4' },
  { id: 'frs-5', pack: 'frs-uhf', name: 'FRS C05', frequencyMhz: 462.6625, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 5' },
  { id: 'frs-6', pack: 'frs-uhf', name: 'FRS C06', frequencyMhz: 462.6875, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 6' },
  { id: 'frs-7', pack: 'frs-uhf', name: 'FRS C07', frequencyMhz: 462.7125, mode: 'NFM', stepKhz: 12.5, rxOnlyDefault: true, comment: 'Walkie-Talkie UHF/FRS Canal 7' },

  { id: 'pmr-1', pack: 'pmr446', name: 'PMR C01', frequencyMhz: 446.00625, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 1' },
  { id: 'pmr-2', pack: 'pmr446', name: 'PMR C02', frequencyMhz: 446.01875, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 2' },
  { id: 'pmr-3', pack: 'pmr446', name: 'PMR C03', frequencyMhz: 446.03125, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 3' },
  { id: 'pmr-4', pack: 'pmr446', name: 'PMR C04', frequencyMhz: 446.04375, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 4' },
  { id: 'pmr-5', pack: 'pmr446', name: 'PMR C05', frequencyMhz: 446.05625, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 5' },
  { id: 'pmr-6', pack: 'pmr446', name: 'PMR C06', frequencyMhz: 446.06875, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 6' },
  { id: 'pmr-7', pack: 'pmr446', name: 'PMR C07', frequencyMhz: 446.08125, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 7' },
  { id: 'pmr-8', pack: 'pmr446', name: 'PMR C08', frequencyMhz: 446.09375, mode: 'NFM', stepKhz: 6.25, rxOnlyDefault: true, comment: 'Walkie-Talkie PMR446 Canal 8' },

  { id: 'emg-c16', pack: 'emergency-rx', name: 'MAR C16', frequencyMhz: 156.8, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, lockedRxOnly: true, comment: 'Socorro Maritimo Canal 16 (PROHIBIDO TX)' },
  { id: 'emg-wx1', pack: 'emergency-rx', name: 'MET VHF', frequencyMhz: 162.55, mode: 'FM', stepKhz: 25, rxOnlyDefault: true, lockedRxOnly: true, comment: 'Boletin meteorologico VHF (SOLO RX)' },
];

/** Normaliza el nombre a los 7 caracteres ASCII que soporta la matriz LCD del Baofeng UV-5R. */
export function sanitizeUv5rName(raw: string): string {
  return raw
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 -]/g, '')
    .trim()
    .slice(0, 7) || 'CH';
}

export interface ChirpExportOptions {
  forceRxOnly: boolean;
  walkieToneHz: number;
  includeToneOnRx: boolean;
}

export const CHIRP_CSV_HEADER =
  'Location,Name,Frequency,Duplex,Offset,Tone,rToneFreq,cToneFreq,DtcsCode,DtcsPolarity,Mode,TStep,Skip,Comment,URCALL,RPT1CALL,RPT2CALL,DVCODE';

export function buildChirpCsv(
  channels: readonly ChirpChannel[],
  options: ChirpExportOptions,
): string {
  const rows = channels.map((ch, idx) => {
    const location = idx + 1;
    const name = sanitizeUv5rName(ch.name);
    const freq = ch.frequencyMhz.toFixed(6);
    const isRxOnly = options.forceRxOnly || ch.lockedRxOnly || ch.rxOnlyDefault;
    const duplex = isRxOnly ? 'off' : '';
    const offset = '0.000000';
    const isWalkie = ch.pack === 'frs-uhf' || ch.pack === 'pmr446';
    const activeTone = ch.toneHz ?? (isWalkie && options.walkieToneHz > 0 ? options.walkieToneHz : 0);
    const toneMode = activeTone > 0 ? (options.includeToneOnRx ? 'TSQL' : 'Tone') : '';
    const toneVal = activeTone > 0 ? activeTone.toFixed(1) : '88.5';
    const cleanComment = ch.comment.replace(/,/g, ';');

    return [
      location,
      name,
      freq,
      duplex,
      offset,
      toneMode,
      toneVal,
      toneVal,
      '023',
      'NN',
      ch.mode,
      ch.stepKhz.toFixed(2),
      '',
      cleanComment,
      '',
      '',
      '',
      '',
    ].join(',');
  });

  return [CHIRP_CSV_HEADER, ...rows].join('\n');
}
