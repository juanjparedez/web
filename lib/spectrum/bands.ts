import { C } from './physics.ts';

export type BandId = 'radio' | 'micro' | 'ir' | 'visible' | 'uv' | 'xray' | 'gamma';

export interface Band {
  id: BandId;
  name: string;
  /** lower edge in log10(Hz) */
  from: number;
  /** upper edge in log10(Hz) */
  to: number;
  /** false colour for non-visible bands (linear sRGB 0..1) */
  tint: readonly [number, number, number];
  /** what this radiation does to matter, at the scale of the quantum it carries */
  matter: string;
  /** how we produce or detect it */
  sources: string;
}

const lf = (m: number) => Math.log10(C / m);

/**
 * Boundaries follow ISO 21348 / CIE conventions. They are conventions, not physics:
 * the spectrum is continuous and X/gamma overlap (the name depends on the origin).
 */
export const BANDS: readonly Band[] = [
  { id: 'radio', name: 'Radio', from: 0, to: lf(1), tint: [0.93, 0.45, 0.2],
    matter: 'Empuja electrones libres de un conductor: en una antena se convierte en corriente alterna. Atraviesa paredes, nubes y cuerpos casi sin interactuar.',
    sources: 'Antenas, rayos, púlsares, el núcleo de la galaxia, la línea de 21 cm del hidrógeno.' },
  { id: 'micro', name: 'Microondas', from: lf(1), to: lf(1e-3), tint: [0.98, 0.72, 0.26],
    matter: 'Hace rotar moléculas polares como el agua: así calienta un horno. Las bandas de absorción del O₂ y el H₂O vuelven opaca la atmósfera en ciertas frecuencias.',
    sources: 'Magnetrones, radares, Wi-Fi, telefonía, el fondo cósmico de microondas (2,725 K).' },
  { id: 'ir', name: 'Infrarrojo', from: lf(1e-3), to: lf(750e-9), tint: [0.86, 0.2, 0.16],
    matter: 'Excita vibraciones de los enlaces moleculares. Es la radiación térmica de todo lo que está a temperatura ambiente: vos emitís con pico cerca de 9,4 µm.',
    sources: 'Cuerpos tibios, la Tierra, controles remotos (940 nm), fibra óptica (1550 nm), láseres de CO₂.' },
  { id: 'visible', name: 'Visible', from: lf(750e-9), to: lf(380e-9), tint: [1, 1, 1],
    matter: 'Mueve electrones de valencia entre niveles: alcanza para disparar la isomerización del retinal en tus conos y bastones, y para la fotosíntesis.',
    sources: 'El Sol (pico cerca de 500 nm), llamas, LEDs, láseres, líneas atómicas como el doblete del sodio.' },
  { id: 'uv', name: 'Ultravioleta', from: lf(380e-9), to: lf(10e-9), tint: [0.6, 0.38, 1],
    matter: 'Rompe enlaces químicos y daña el ADN (dímeros de timina). Por encima de ~10 eV (≈124 nm) ya arranca electrones: es radiación ionizante.',
    sources: 'El Sol (el ozono frena casi todo lo que está por debajo de 300 nm), lámparas germicidas de mercurio (254 nm), estrellas calientes.' },
  { id: 'xray', name: 'Rayos X', from: lf(10e-9), to: lf(10e-12), tint: [0.32, 0.66, 1],
    matter: 'Arranca electrones de las capas internas de los átomos (efecto fotoeléctrico) y rebota en electrones libres (Compton). Los huesos, con calcio, absorben más que el tejido blando.',
    sources: 'Tubos de rayos X (ánodo de cobre: 8,05 keV), sincrotrones, la corona solar, gas a millones de grados en cúmulos de galaxias.' },
  { id: 'gamma', name: 'Rayos gamma', from: lf(10e-12), to: 26, tint: [0.38, 0.96, 0.84],
    matter: 'Atraviesa centímetros de plomo. Por encima de 1,022 MeV puede convertirse en un par electrón-positrón al pasar junto a un núcleo.',
    sources: 'Desintegraciones nucleares (⁶⁰Co: 1,17 y 1,33 MeV), aniquilación electrón-positrón (511 keV), explosiones de rayos gamma, núcleos activos de galaxias.' },
];

export function bandAt(logF: number): Band {
  return BANDS.find((b) => logF >= b.from && logF < b.to) ?? (logF < 0 ? BANDS[0] : BANDS[BANDS.length - 1]);
}

/** ITU-R V.431 radio bands and the CIE/ISO sub-bands, for the detail line. */
const SUB_BANDS: readonly [number, number, string][] = [
  [Math.log10(3), Math.log10(30), 'ELF · frecuencia extremadamente baja'],
  [Math.log10(30), Math.log10(300), 'SLF · súper baja frecuencia'],
  [Math.log10(300), Math.log10(3e3), 'ULF · ultra baja frecuencia'],
  [Math.log10(3e3), Math.log10(3e4), 'VLF · muy baja frecuencia'],
  [Math.log10(3e4), Math.log10(3e5), 'LF · onda larga'],
  [Math.log10(3e5), Math.log10(3e6), 'MF · onda media (AM)'],
  [Math.log10(3e6), Math.log10(3e7), 'HF · onda corta'],
  [Math.log10(3e7), Math.log10(3e8), 'VHF · muy alta frecuencia'],
  [Math.log10(3e8), Math.log10(3e9), 'UHF · ultra alta frecuencia'],
  [Math.log10(3e9), Math.log10(3e10), 'SHF · súper alta frecuencia'],
  [Math.log10(3e10), Math.log10(3e11), 'EHF · onda milimétrica'],
  [Math.log10(3e11), lf(3e-6), 'IR-C · infrarrojo lejano y térmico'],
  [lf(3e-6), lf(1.4e-6), 'IR-B · infrarrojo medio'],
  [lf(1.4e-6), lf(750e-9), 'IR-A · infrarrojo cercano'],
  [lf(380e-9), lf(315e-9), 'UV-A'],
  [lf(315e-9), lf(280e-9), 'UV-B'],
  [lf(280e-9), lf(100e-9), 'UV-C'],
  [lf(100e-9), lf(10e-9), 'UV extremo'],
  [lf(10e-9), lf(0.1e-9), 'Rayos X blandos'],
  [lf(0.1e-9), lf(10e-12), 'Rayos X duros'],
];

export function subBandAt(logF: number): string | null {
  return SUB_BANDS.find(([a, b]) => logF >= a && logF < b)?.[2] ?? null;
}
