import { projects } from './projects';
import { radioCoursePath, radioPagePath } from './radio-course';

export type InventoryDomainId = 'hardware' | 'radio' | 'workbench' | 'archive';
export type InventoryEntityKind = 'section' | 'project' | 'tutorial' | 'interest' | 'tool';

export interface InventoryEntity {
  id: string;
  domain: InventoryDomainId;
  kind: InventoryEntityKind;
  badge: string;
  title: string;
  summary: string;
  href: string;
  tags?: readonly string[];
  status: 'published' | 'draft';
  builtIn?: boolean;
}

export interface TutorialTableRow {
  cells: readonly string[];
  monoCols?: readonly number[];
  badgeCol?: number;
  badgeTone?: 'safe' | 'warn' | 'danger';
}

export interface TutorialSectionEntity {
  id: string;
  navLabel: string;
  kicker: string;
  title: string;
  lead?: string;
  approaches?: readonly { title: string; body: string }[];
  steps?: readonly { title: string; body: string }[];
  formula?: string;
  table?: {
    headers: readonly string[];
    rows: readonly TutorialTableRow[];
  };
}

export const INVENTORY_DOMAINS: readonly { id: InventoryDomainId; kicker: string; label: string }[] = [
  { id: 'hardware', kicker: '01 / HARDWARE & MAKER', label: 'Hardware y Proyectos' },
  { id: 'radio', kicker: '02 / RADIO & RF', label: 'Radiofrecuencia y Comunicaciones' },
  { id: 'workbench', kicker: '03 / WORKBENCH & LAB', label: 'Instrumentos y Calculadoras' },
  { id: 'archive', kicker: '04 / BITÁCORA & ARCHIVO', label: 'Bitácora, Intereses y Stack' },
];

export const RADIO_HUB_MODULES: readonly InventoryEntity[] = [
  {
    id: 'radio-morse-console',
    domain: 'radio',
    kind: 'tool',
    badge: '★ CW · CONSOLA INTERACTIVA',
    title: 'Consola de Código Morse (CW)',
    summary: 'Control global de tono y ruido QRN, árbol de letras, entrenador de transmisión con llave/paletas, traductor y método Koch.',
    href: `${radioCoursePath}/morse`,
    tags: ['CW', 'Morse', 'Koch', 'Audio'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'radio-field-tutorials',
    domain: 'radio',
    kind: 'tutorial',
    badge: 'TALLER · BAOFENG UV-5R',
    title: 'Tutoriales y Programación RX-Only',
    summary: 'Cómo programar un handy por CHIRP para bloquear transmisión accidental sin licencia, subtonos CTCSS/DCS y operación walkie-talkie.',
    href: `${radioCoursePath}/tutoriales`,
    tags: ['Baofeng', 'UV-5R', 'CHIRP', 'Walkie-Talkie'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'radio-spectrum-bands',
    domain: 'radio',
    kind: 'section',
    badge: 'ESPECTRO · ITU / ENACOM',
    title: 'Bandas: Libre vs. Licenciado',
    summary: 'Gráfico del espectro radioeléctrico, cuadro de bandas de radioaficionados, uso libre canalero y frecuencias críticas prohibidas.',
    href: radioPagePath('bands'),
    tags: ['Espectro', 'Bandas', 'SDR', 'Reglamentación'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'radio-enacom-program',
    domain: 'radio',
    kind: 'section',
    badge: 'ENACOM · LU/LW',
    title: 'Guía para la licencia argentina (Programa Novicio)',
    summary: 'Programa oficial Novicio (Bloques A–D), 14 simuladores de RF, banco de preguntas y simulacro de examen.',
    href: `${radioCoursePath}/programa`,
    tags: ['ENACOM', 'Novicio', 'Simuladores', 'Examen'],
    status: 'published',
    builtIn: true,
  },
];

export const CORE_INVENTORY_ENTITIES: readonly InventoryEntity[] = [
  ...projects.map((p): InventoryEntity => ({
    id: `project:${p.slug}`,
    domain: 'hardware',
    kind: 'project',
    badge: p.status.toUpperCase(),
    title: p.name,
    summary: p.tagline ?? p.description,
    href: `/projects/${p.slug}`,
    tags: p.learnings ?? [],
    status: 'published',
    builtIn: true,
  })),
  ...RADIO_HUB_MODULES,
  {
    id: 'workbench:calculators',
    domain: 'workbench',
    kind: 'tool',
    badge: 'RCL · EMBEDDED',
    title: 'Calculadoras Electrónicas y RCL',
    summary: 'Reactancia, filtros RC/RL/RCL, ADC ESP32, buses I2S, disipación térmica y autonomía de baterías.',
    href: '/calculators',
    tags: ['RCL', 'ESP32', 'Electrónica'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'radio-multimeter-instrument',
    domain: 'workbench',
    kind: 'tool',
    badge: 'INSTRUMENTOS · DMM · DSO · ROE · VNA',
    title: 'Medición e Instrumentos (Multímetro, Osciloscopio, ROE y NanoVNA)',
    summary: 'Simuladores interactivos de Multímetro Digital (bornes/fusibles), Osciloscopio (puntas ×10/masa PE), Medidor de ROE + Carga 50 Ω y NanoVNA.',
    href: '/medicion/instrumentos',
    tags: ['Multímetro', 'Osciloscopio', 'ROE', 'NanoVNA'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'knowledge:spectrum',
    domain: 'radio',
    kind: 'tool',
    badge: 'EM · WEBGL',
    title: 'El espectro electromagnético',
    summary: 'De 1 Hz a 10²⁶ Hz en la GPU: longitud de onda, energía del fotón, ventanas de la atmósfera, la onda E/B en 3D y la ley de Planck.',
    href: '/espectro',
    tags: ['Física', 'Ondas', 'Espectro', 'WebGL'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'workbench:composer',
    domain: 'workbench',
    kind: 'tool',
    badge: '8-BIT · DAW',
    title: 'Compositor Chiptune',
    summary: 'Secuenciador multipista procedural en el navegador con exportación WAV, MP3 y MIDI.',
    href: '/composer',
    tags: ['Audio', 'Síntesis', '8-Bit'],
    status: 'published',
    builtIn: true,
  },
  {
    id: 'archive:devlog',
    domain: 'archive',
    kind: 'interest',
    badge: 'DOCS · NOTAS',
    title: 'Devlog y Referencias Técnicas',
    summary: 'Artículos de ingeniería, pruebas de firmware, modulación QPSK e integración de IA local.',
    href: '/blog',
    tags: ['Blog', 'Notas', 'Ingeniería'],
    status: 'published',
    builtIn: true,
  },
];
