import { MORSE } from '@/lib/radio/codes';

export const TREE_LETTERS = Object.entries(MORSE).filter(([ch]) => /^[A-Z]$/.test(ch));

export const TREE_LEVELS = [
  { depth: 2, label: 'E T I A N M' },
  { depth: 3, label: 'Hasta 3 signos' },
  { depth: 4, label: 'Las 26 letras' },
] as const;

export function lettersUpTo(depth: number) {
  return TREE_LETTERS.filter(([, code]) => code.length <= depth).map(([ch]) => ch);
}

export function pickOther(pool: string[], current?: string) {
  const others = pool.filter((ch) => ch !== current);
  const from = others.length ? others : pool;
  return from[Math.floor(Math.random() * from.length)];
}

export const prettyCode = (code: string) => code.replaceAll('.', '·').replaceAll('-', '−');
