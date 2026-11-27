/** Morse trainers, each with its own page under /[locale]/radio/morse/<slug>. */
export type MorseSkill = 'ver' | 'oir' | 'transmitir' | 'consultar';

export interface MorseTrainerInfo {
  slug: string;
  title: string;
  skill: MorseSkill;
  level: 'Inicial' | 'Intermedio' | 'Avanzado';
  glyph: string;
  summary: string;
  goal: string;
}

export const MORSE_SKILL_LABEL: Record<MorseSkill, string> = {
  ver: 'Ver', oir: 'Oír', transmitir: 'Transmitir', consultar: 'Consultar',
};

export const MORSE_TRAINERS: readonly MorseTrainerInfo[] = [
  {
    slug: 'arbol', title: 'Árbol de letras', skill: 'ver', level: 'Inicial', glyph: '·−  A',
    summary: 'Recorré el árbol: izquierda es punto, derecha es raya. Explorá libremente o resolvé desafíos letra por letra.',
    goal: 'Ubicar cada letra en el árbol y entender cómo se forma.',
  },
  {
    slug: 'reconocer', title: 'Reconocer de oído', skill: 'oir', level: 'Inicial', glyph: '♪ → ?',
    summary: 'Suena una letra y la tocás en el árbol. Elegís qué niveles del árbol entran en juego.',
    goal: 'Asociar cada sonido con su lugar en el árbol.',
  },
  {
    slug: 'transmitir', title: 'Transmitir con llave', skill: 'transmitir', level: 'Intermedio', glyph: '← · → −',
    summary: 'Escuchás el objetivo y lo repetís con paletas o llave manual. El árbol muestra tu recorrido en vivo.',
    goal: 'Manipular letras, palabras y grupos con buen ritmo.',
  },
  {
    slug: 'koch', title: 'Recepción Koch', skill: 'oir', level: 'Avanzado', glyph: 'K M U R',
    summary: 'Método Koch a velocidad real: empezás con 2 letras y se suma otra al llegar a 90 % de aciertos.',
    goal: 'Copiar de oído a velocidad de examen.',
  },
  {
    slug: 'alfabeto', title: 'Alfabeto sonoro', skill: 'consultar', level: 'Inicial', glyph: 'A–Z 0–9',
    summary: 'Tabla completa con palabra fonética OACI. Tocá letras para escucharlas y armar un mensaje.',
    goal: 'Consultar y escuchar cualquier signo.',
  },
  {
    slug: 'traductor', title: 'Traductor', skill: 'consultar', level: 'Inicial', glyph: 'CQ ↔ −·−·',
    summary: 'Texto a Morse y Morse a texto, con reproducción y control de velocidad Farnsworth.',
    goal: 'Escuchar y verificar mensajes completos.',
  },
];

export function getMorseTrainer(slug: string) {
  return MORSE_TRAINERS.find((t) => t.slug === slug);
}

/** Old #anchors of the single Morse page → trainer slugs. */
export const MORSE_LEGACY_ANCHORS: Record<string, string> = {
  transmision: 'transmitir', alfabeto: 'alfabeto', traductor: 'traductor', entrenador: 'koch',
};
