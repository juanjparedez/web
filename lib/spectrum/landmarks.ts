import { C, E_CHARGE, H } from './physics.ts';

export interface Landmark {
  id: string;
  label: string;
  /** log10(Hz) */
  logF: number;
  note: string;
}

const hz = (f: number) => Math.log10(f);
const nm = (n: number) => Math.log10(C / (n * 1e-9));
const ev = (e: number) => Math.log10((e * E_CHARGE) / H);

/** Real, measured sources. Each one becomes a marker on the explorer and a jump target. */
export const LANDMARKS: readonly Landmark[] = [
  { id: 'schumann', label: 'Resonancia Schumann', logF: hz(7.83), note: 'La cavidad Tierra-ionosfera resuena a 7,83 Hz, excitada por los rayos de todo el planeta.' },
  { id: 'grid', label: 'Red eléctrica', logF: hz(50), note: '50 Hz en Argentina y Europa. Su longitud de onda (6000 km) es la mitad del diámetro de la Tierra.' },
  { id: 'am', label: 'Radio AM', logF: hz(1e6), note: 'La banda de AM va de 530 a 1710 kHz. De noche rebota en la ionosfera y llega a miles de km.' },
  { id: 'fm', label: 'Radio FM', logF: hz(100e6), note: '88–108 MHz. Con λ ≈ 3 m, una antena de un cuarto de onda mide unos 75 cm.' },
  { id: 'h21', label: 'Hidrógeno 21 cm', logF: hz(1420.405_751e6), note: 'Transición hiperfina del hidrógeno neutro. Con ella se cartografió la estructura espiral de la Vía Láctea.' },
  { id: 'wifi', label: 'Wi-Fi / horno', logF: hz(2.45e9), note: '2,45 GHz: banda ISM compartida por hornos de microondas, Wi-Fi y Bluetooth.' },
  { id: 'cmb', label: 'Fondo cósmico', logF: hz(160.2e9), note: 'El eco del universo a 380 000 años del Big Bang: un cuerpo negro de 2,725 K con pico en 160 GHz.' },
  { id: 'body', label: 'Tu cuerpo', logF: Math.log10(C / 9.35e-6), note: 'A 310 K tu piel emite como un cuerpo negro con pico en 9,35 µm: así te ven las cámaras térmicas.' },
  { id: 'remote', label: 'Control remoto', logF: nm(940), note: 'LED infrarrojo de 940 nm. Tu ojo no lo ve; la cámara del celular, a veces sí.' },
  { id: 'sodium', label: 'Sodio D', logF: nm(589), note: 'Doblete del sodio a 589,0 y 589,6 nm: el naranja de las lámparas de calle viejas.' },
  { id: 'sun', label: 'Pico del Sol', logF: nm(502), note: 'Una superficie a 5772 K tiene su pico en 502 nm, en el verde-azulado.' },
  { id: 'uvc', label: 'Lámpara germicida', logF: nm(253.7), note: 'Línea del mercurio a 253,7 nm, cerca del máximo de absorción del ADN.' },
  { id: 'lyman', label: 'Lyman-α', logF: nm(121.567), note: 'La transición n=2→1 del hidrógeno. Ya es ionizante para muchas moléculas.' },
  { id: 'cuka', label: 'Rayos X Cu Kα', logF: ev(8048), note: '8,05 keV, la línea más usada en difracción de rayos X: con ella se resolvió la doble hélice del ADN.' },
  { id: 'xray-med', label: 'Radiografía', logF: ev(60e3), note: 'Un tubo de diagnóstico trabaja con fotones de 20 a 150 keV.' },
  { id: 'pet', label: 'Aniquilación e⁺e⁻', logF: ev(511e3), note: 'Electrón y positrón se aniquilan en dos fotones de 511 keV: es la base de la tomografía PET.' },
  { id: 'co60', label: 'Cobalto-60', logF: ev(1.33e6), note: 'Emite fotones de 1,17 y 1,33 MeV. Se usó durante décadas en radioterapia.' },
  { id: 'vhe', label: 'Gamma de 100 GeV', logF: ev(1e11), note: 'Fotones de muy alta energía de blázares. Al chocar con la atmósfera generan una cascada de partículas que emite luz Cherenkov.' },
];

export interface ScaleObject {
  meters: number;
  name: string;
}

/** Everyday and microscopic sizes to make the wavelength tangible. */
export const SCALE_OBJECTS: readonly ScaleObject[] = [
  { meters: 1.2742e7, name: 'el diámetro de la Tierra' },
  { meters: 1e6, name: 'la distancia Buenos Aires–Córdoba (≈700 km)' },
  { meters: 1e5, name: 'una ciudad grande' },
  { meters: 8e3, name: 'el monte Everest de alto' },
  { meters: 1e3, name: 'diez cuadras' },
  { meters: 100, name: 'una cancha de fútbol' },
  { meters: 10, name: 'una casa' },
  { meters: 1.7, name: 'una persona' },
  { meters: 0.22, name: 'una pelota de fútbol' },
  { meters: 0.025, name: 'una moneda' },
  { meters: 3e-3, name: 'una hormiga' },
  { meters: 8e-5, name: 'el grosor de un cabello' },
  { meters: 7e-6, name: 'un glóbulo rojo' },
  { meters: 1e-6, name: 'una bacteria' },
  { meters: 1e-7, name: 'un virus' },
  { meters: 2e-9, name: 'el ancho de la doble hélice del ADN' },
  { meters: 1e-10, name: 'un átomo' },
  { meters: 1e-12, name: 'la centésima parte de un átomo' },
  { meters: 1e-14, name: 'un núcleo atómico' },
  { meters: 1e-15, name: 'un protón' },
  { meters: 1e-18, name: 'la milésima parte de un protón' },
];

export function closestScale(meters: number): ScaleObject {
  const lm = Math.log10(meters);
  return SCALE_OBJECTS.reduce((best, o) =>
    Math.abs(Math.log10(o.meters) - lm) < Math.abs(Math.log10(best.meters) - lm) ? o : best);
}

/** 'del orden de' + name, contracting 'de el' into 'del' as Spanish requires. */
export const orderOf = (name: string) => `del orden de ${name}`.replace(/\bde el\b/g, 'del');
