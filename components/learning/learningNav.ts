import { radioLessons, radioPagePath } from '@/config/radio-course';

/**
 * Single navigation model for the study areas (Radioaficionado and Medición).
 * Every section uses the same four kinds of content, always in this order and
 * with the same colour and icon, both in the sidebar and in the section hub.
 */
export type LearnKind = 'learn' | 'practice' | 'exam' | 'reference';
export type LearnSectionId = 'radio' | 'medicion';

export interface LearnNavItem {
  id: string;
  path: string;
  /** Fixed label; when absent the course translation `RadioCourse.pages.<id>.title` is used. */
  label?: string;
  /** Short mono marker shown before the label (lesson number, block letter…). */
  marker?: string;
  /** One line for the hub card; lessons fall back to their translated description. */
  summary?: string;
  /** Lives in the other section: the link switches section. */
  crossSection?: boolean;
}

export interface LearnNavGroup {
  kind: LearnKind;
  hint: string;
  items: LearnNavItem[];
}

export interface LearnSection {
  id: LearnSectionId;
  title: string;
  icon: string;
  path: string;
  groups: LearnNavGroup[];
}

export const KIND_META: Record<LearnKind, { title: string; short: string; icon: string }> = {
  learn: { title: 'Aprender', short: 'Aprender', icon: '📖' },
  practice: { title: 'Practicar', short: 'Practicar', icon: '⚡' },
  exam: { title: 'Examen ENACOM', short: 'Examen', icon: '🎓' },
  reference: { title: 'Consultar', short: 'Consultar', icon: '📚' },
};

const lessonItems: LearnNavItem[] = radioLessons.map(({ id }, index) => ({
  id,
  path: radioPagePath(id),
  marker: String(index + 1).padStart(2, '0'),
}));

const RADIO: LearnSection = {
  id: 'radio',
  title: 'Radioaficionado',
  icon: '📻',
  path: '/radio',
  groups: [
    { kind: 'learn', hint: `${lessonItems.length} lecciones, en orden`, items: lessonItems },
    {
      kind: 'practice',
      hint: 'Simuladores y entrenadores interactivos',
      items: [
        { id: 'morse-console', path: '/radio/morse', label: 'Código Morse (CW)', marker: 'CW', summary: 'Seis entrenadores: árbol, oído, llave, Koch, alfabeto y traductor.' },
        { id: 'laboratory', path: radioPagePath('laboratory'), marker: 'DC', summary: 'Armá circuitos serie y paralelo y mirá tensiones y corrientes.' },
        { id: 'sim-wavelength', path: '/radio/a-electricidad#alterna', label: 'Longitud de onda', marker: 'λ', summary: 'Frecuencia, período y largo de onda en vivo.' },
        { id: 'sim-lc', path: '/radio/a-electricidad#resonancia', label: 'Resonancia LC', marker: 'LC', summary: 'Mové L y C y encontrá la frecuencia de resonancia.' },
        { id: 'sim-filter', path: '/radio/a-electricidad#filtros', label: 'Filtro y armónicas', marker: 'LPF', summary: 'Cómo un pasabajos limpia las armónicas del transmisor.' },
        { id: 'sim-modulation', path: '/radio/b-modulacion-equipos#modulacion', label: 'Osciloscopio de modulación', marker: 'MOD', summary: 'AM, FM y BLU vistas en el tiempo.' },
        { id: 'sim-sdr', path: '/radio/b-modulacion-equipos#digitales', label: 'SDR, SNR y Shannon', marker: 'SDR', summary: 'Ancho de banda, ruido y capacidad de un canal.' },
        { id: 'sim-swr', path: '/radio/c-antenas-propagacion#roe', label: 'ROE en el coaxil', marker: 'ROE', summary: 'Onda directa y reflejada según la carga.' },
        { id: 'sim-antenna', path: '/radio/c-antenas-propagacion#antenas', label: 'Calculadora de antenas', marker: 'ANT', summary: 'Largo de dipolo y vertical para tu frecuencia.' },
        { id: 'sim-coax', path: '/radio/c-antenas-propagacion#coaxil', label: 'Pérdida de coaxil', marker: 'COAX', summary: 'Cuánta potencia se pierde en el cable.' },
        { id: 'sim-link', path: '/radio/c-antenas-propagacion#alcance', label: '¿Llego a 5 km?', marker: 'LINK', summary: 'Presupuesto de enlace con potencia, antenas y distancia.' },
        { id: 'to-medicion', path: '/medicion', label: 'Instrumentos de medición', marker: 'DMM', summary: 'Multímetro, osciloscopio, ROE y NanoVNA, en la sección Medición.', crossSection: true },
      ],
    },
    {
      kind: 'exam',
      hint: 'Programa oficial Novicio',
      items: [
        { id: 'programa', path: '/radio/programa', label: 'Temario y categorías', marker: 'LU', summary: 'Las cuatro categorías, el temario y cómo rendir.' },
        { id: 'a-electricidad', path: '/radio/a-electricidad', label: 'Electricidad y RF', marker: 'A', summary: 'Ohm, alterna, reactancia, resonancia, filtros.' },
        { id: 'b-modulacion-equipos', path: '/radio/b-modulacion-equipos', label: 'Modulación y SDR', marker: 'B', summary: 'CW, AM, FM, BLU, modos digitales y equipos.' },
        { id: 'c-antenas-propagacion', path: '/radio/c-antenas-propagacion', label: 'Antenas y ROE', marker: 'C', summary: 'Líneas, antenas, propagación y seguridad.' },
        { id: 'd-reglamento', path: '/radio/d-reglamento', label: 'Reglamentación', marker: 'D', summary: 'Licencia, señales distintivas, bandas y ética.' },
        { id: 'practica', path: '/radio/practica', label: 'Simulacro de examen', marker: 'Q', summary: 'Preguntas oficiales con corrección.' },
      ],
    },
    {
      kind: 'reference',
      hint: 'Bandas, glosario, equipos y fuentes',
      items: [
        { id: 'bands', path: radioPagePath('bands'), marker: 'RF' },
        { id: 'glossary', path: radioPagePath('glossary'), marker: 'Aa' },
        { id: 'tutoriales', path: '/radio/tutoriales', label: 'Baofeng UV-5R (CHIRP)', marker: 'UV', summary: 'Programación RX-only, subtonos y frecuencias de escucha.' },
        { id: 'sources', path: radioPagePath('sources'), marker: 'PDF' },
      ],
    },
  ],
};

const MEDICION: LearnSection = {
  id: 'medicion',
  title: 'Medición',
  icon: '🔧',
  path: '/medicion',
  groups: [
    {
      kind: 'learn',
      hint: 'Cómo se conecta cada instrumento',
      items: [
        { id: 'multimetro', path: '/medicion/multimetro', label: 'Medir con un multímetro', marker: 'DMM', summary: 'Tensión en paralelo, corriente en serie, resistencia sin tensión.' },
      ],
    },
    {
      kind: 'practice',
      hint: 'Un entrenador por instrumento',
      items: [
        { id: 'dmm', path: '/medicion/instrumentos/multimetro', label: 'Entrenador de multímetro', marker: 'V·A·Ω', summary: 'Selector, bornes y puntas en serie o paralelo.' },
        { id: 'osciloscopio', path: '/medicion/instrumentos/osciloscopio', label: 'Osciloscopio', marker: 'DSO', summary: 'Puntas ×1/×10, base de tiempo y V/div.' },
        { id: 'roe', path: '/medicion/instrumentos/roe', label: 'Medidor de ROE y potencia', marker: 'SWR', summary: 'Directa, reflejada y carga fantasma de 50 Ω.' },
        { id: 'nanovna', path: '/medicion/instrumentos/nanovna', label: 'NanoVNA', marker: 'S11', summary: 'Barrido de una antena y punto de resonancia.' },
        { id: 'to-laboratory', path: radioPagePath('laboratory'), label: 'Laboratorio de circuitos', marker: 'DC', summary: 'Circuitos serie y paralelo, en la sección Radioaficionado.', crossSection: true },
      ],
    },
    {
      kind: 'reference',
      hint: 'Tablas para tener a mano',
      items: [
        { id: 'instrumentos', path: '/medicion/instrumentos', label: 'Qué mide cada instrumento', marker: '4 INST', summary: 'Comparación de los cuatro y tabla de conexión segura.' },
        { id: 'to-glossary', path: radioPagePath('glossary'), label: 'Glosario', marker: 'Aa', summary: 'Términos de radio y medición.', crossSection: true },
      ],
    },
  ],
};

export const LEARN_SECTIONS: Record<LearnSectionId, LearnSection> = { radio: RADIO, medicion: MEDICION };

export function findItem(section: LearnSectionId, page: string): { group: LearnNavGroup; item: LearnNavItem; index: number } | null {
  for (const group of LEARN_SECTIONS[section].groups) {
    const index = group.items.findIndex((item) => item.id === page && !item.crossSection);
    if (index >= 0) return { group, item: group.items[index], index };
  }
  return null;
}
