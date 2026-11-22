import type { InstrumentTabId } from '@/lib/radio/benchInstrumentsSim';

/**
 * Real photos of the bench instruments. All are freely licensed on Wikimedia Commons,
 * downloaded once, resized to WebP and served from /public (never hotlinked).
 */
export interface InstrumentPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

const CC_BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' };

export const INSTRUMENT_PHOTOS: Record<InstrumentTabId, InstrumentPhoto> = {
  multimeter: {
    src: '/images/radio/instruments/multimetro-ut61d.webp',
    width: 600,
    height: 800,
    alt: 'Multímetro digital UNI-T UT61D con selector rotativo y cuatro bornes de entrada',
    caption: 'Multímetro True-RMS (UNI-T UT61D). Abajo, los bornes: 10A, mA, COM y V/Ω.',
    author: 'Anselm Schüler',
    ...CC_BY_SA_4,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:UT61D_digital_multimeter_front.jpg',
  },
  oscilloscope: {
    src: '/images/radio/instruments/osciloscopio-rigol-ds1054z.webp',
    width: 720,
    height: 540,
    alt: 'Osciloscopio digital Rigol DS1054Z mostrando una senoidal, con una punta conectada al canal 1',
    caption: 'Osciloscopio digital (Rigol DS1054Z) con una senoidal en pantalla y la punta en el canal 1.',
    author: 'Draconichiaro',
    ...CC_BY_SA_4,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:RIGOL_DS1054Z_Digital_Storage_Oscilloscope.jpg',
  },
  'swr-meter': {
    src: '/images/radio/instruments/medidor-roe-potencia.webp',
    width: 720,
    height: 363,
    alt: 'Medidor de ROE y potencia de aguja con llaves FWD/REF, conectores TRANS y ANT y perilla SET',
    caption: 'Medidor de ROE y vatímetro de aguja: TRANS va al equipo, ANT a la antena o a la carga.',
    author: '魔私利戸',
    ...CC_BY_SA_4,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:SWR_%26_power_meter_front_view.jpg',
  },
  nanovna: {
    src: '/images/radio/instruments/nanovna.webp',
    width: 720,
    height: 540,
    alt: 'NanoVNA con cables en los puertos CH0 y CH1 y la carta de Smith en pantalla',
    caption: 'NanoVNA con los dos puertos cableados (CH0 = S11, CH1 = S21). La moneda da la escala.',
    author: 'Elgull',
    ...CC_BY_SA_4,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:NanoVNA.jpg',
  },
};
