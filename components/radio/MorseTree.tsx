'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MORSE } from '@/lib/radio/codes';
import s from './morsePractice.module.css';

type Node = { letter: string; code: string; slot: number };
const nodes: Node[] = [{ letter: '◆', code: '', slot: 0.5 }];
for (const [letter, code] of Object.entries(MORSE).filter(([ch]) => /^[A-Z]$/.test(ch))) {
  const column = parseInt(code.replaceAll('.', '0').replaceAll('-', '1'), 2);
  nodes.push({ letter, code, slot: (column + 0.5) / 2 ** code.length });
}

export type TreeMark = 'ok' | 'bad' | 'target';
const pretty = (c: string) => c.replaceAll('.', '·').replaceAll('-', '−');

/** Narrow columns draw the tree sideways: root on the left, dots up, dashes down. */
const VERTICAL_BELOW = 600;
const WIDE = { w: 800, h: 300 };
const TALL_ROW = 46;

function place(n: Node, vertical: boolean, width: number) {
  if (!vertical) return { x: n.slot * WIDE.w, y: 24 + 64 * n.code.length };
  const step = (width - 44) / 4;
  return { x: 18 + step * n.code.length, y: 6 + n.slot * TALL_ROW * 16 };
}

function useVertical(ref: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState({ vertical: false, width: WIDE.w });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setState({ vertical: el.clientWidth < VERTICAL_BELOW, width: el.clientWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return state;
}

interface Props {
  code: string;
  choose: (letter: string) => void;
  /** Extra state per letter (correct answer, wrong answer, target). */
  marks?: Record<string, TreeMark>;
  /** Hide letters (only show the dots and dashes), used in recognition drills. */
  hideLetters?: boolean;
  /** Max depth shown; deeper letters are dimmed and disabled. */
  depth?: number;
}

export function MorseTree({ code, choose, marks, hideLetters, depth = 4 }: Props) {
  const t = useTranslations('RadioCourse.pages.morse');
  const box = useRef<HTMLDivElement>(null);
  const { vertical, width } = useVertical(box);
  const view = vertical ? { w: width, h: TALL_ROW * 16 + 12 } : WIDE;
  const at = (n: Node) => place(n, vertical, width);
  return (
    <div className={s.treeScroll} ref={box} role="group" aria-label={t('tree')} data-vertical={vertical}>
      <div className={s.tree} style={{ height: view.h }}>
        <svg viewBox={`0 0 ${view.w} ${view.h}`} preserveAspectRatio="none" aria-hidden="true">
          {nodes.slice(1).map(n => {
            const parent = at(nodes.find(p => p.code === n.code.slice(0, -1))!);
            const me = at(n);
            return <line key={n.code} x1={parent.x} y1={parent.y} x2={me.x} y2={me.y}
              data-lit={code.startsWith(n.code)} strokeDasharray={n.code.endsWith('.') ? '3 4' : undefined} />;
          })}
        </svg>
        {nodes.map(n => {
          const { x, y } = at(n);
          const left = vertical ? `${x}px` : `${(x / WIDE.w) * 100}%`;
          if (!n.code) return <span className={s.root} key="root" aria-hidden="true" style={{ left, top: y }}>◆</span>;
          return (
            <button type="button" key={n.code} style={{ left, top: y }}
              aria-label={hideLetters ? 'Rama ' + pretty(n.code) : n.letter + ' ' + n.code} aria-pressed={code === n.code}
              data-lit={code.startsWith(n.code)} data-mark={marks?.[n.letter]} disabled={n.code.length > depth}
              onClick={() => choose(n.letter)}>
              <span>{hideLetters && !marks?.[n.letter] ? '?' : n.letter}</span><small>{pretty(n.code)}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
