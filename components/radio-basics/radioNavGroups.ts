import { radioLessons, radioPagePath, type RadioPageId } from '@/config/radio-course';

/** Pages outside the 12-lesson course that also live in the radio sidebar. */
export type RadioExtraPageId =
  | 'home'
  | 'instrumentos'
  | 'tutoriales'
  | 'morse-console'
  | 'programa'
  | 'a-electricidad'
  | 'b-modulacion-equipos'
  | 'c-antenas-propagacion'
  | 'd-reglamento'
  | 'practica';

export type RadioNavPageId = RadioPageId | RadioExtraPageId;

export type RadioNavTone = 'learn' | 'practice' | 'exam' | 'reference';

export interface RadioNavItem {
  id: RadioNavPageId;
  path: string;
  /** Fixed label; when absent the course translation `pages.<id>.title` is used. */
  label?: string;
  /** Short mono marker shown before the label (lesson number, block letter…). */
  marker?: string;
}

export interface RadioNavGroup {
  id: RadioNavTone;
  title: string;
  hint: string;
  items: RadioNavItem[];
}

const lessonItems: RadioNavItem[] = radioLessons.map(({ id }, index) => ({
  id,
  path: radioPagePath(id),
  marker: String(index + 1).padStart(2, '0'),
}));

/**
 * Single source for the radio navigation, ordered as a study path:
 * learn the basics → practise → prepare the exam → look things up.
 */
export const RADIO_NAV_GROUPS: RadioNavGroup[] = [
  { id: 'learn', title: 'Aprender', hint: 'Curso de electricidad y radio', items: lessonItems },
  {
    id: 'practice',
    title: 'Practicar',
    hint: 'Estaciones interactivas',
    items: [
      { id: 'morse-console', path: '/radio/morse', label: 'Código Morse (CW)', marker: 'CW' },
      { id: 'instrumentos', path: '/radio/instrumentos', label: 'Banco de instrumentos', marker: 'DMM' },
      { id: 'laboratory', path: radioPagePath('laboratory'), marker: 'DC' },
    ],
  },
  {
    id: 'exam',
    title: 'Examen ENACOM',
    hint: 'Programa oficial Novicio',
    items: [
      { id: 'programa', path: '/radio/programa', label: 'Temario y simuladores', marker: 'LU' },
      { id: 'a-electricidad', path: '/radio/a-electricidad', label: 'Electricidad y RF', marker: 'A' },
      { id: 'b-modulacion-equipos', path: '/radio/b-modulacion-equipos', label: 'Modulación y SDR', marker: 'B' },
      { id: 'c-antenas-propagacion', path: '/radio/c-antenas-propagacion', label: 'Antenas y ROE', marker: 'C' },
      { id: 'd-reglamento', path: '/radio/d-reglamento', label: 'Reglamentación', marker: 'D' },
      { id: 'practica', path: '/radio/practica', label: 'Simulacro de examen', marker: 'Q' },
    ],
  },
  {
    id: 'reference',
    title: 'Consultar',
    hint: 'Bandas, glosario y equipos',
    items: [
      { id: 'bands', path: radioPagePath('bands'), marker: 'RF' },
      { id: 'glossary', path: radioPagePath('glossary'), marker: 'Aa' },
      { id: 'tutoriales', path: '/radio/tutoriales', label: 'Baofeng UV-5R (CHIRP)', marker: 'UV' },
      { id: 'sources', path: radioPagePath('sources'), marker: 'PDF' },
    ],
  },
];

export function radioNavGroupOf(page: RadioNavPageId): RadioNavTone | undefined {
  return RADIO_NAV_GROUPS.find((group) => group.items.some((item) => item.id === page))?.id;
}
