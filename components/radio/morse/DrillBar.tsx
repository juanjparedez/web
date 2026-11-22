'use client';

import { TREE_LEVELS } from './treeLevels';
import s from './morse.module.css';

interface Props {
  depth: number;
  setDepth: (depth: number) => void;
  ok: number;
  tries: number;
  streak: number;
}

/** Level picker and score shared by the tree drills. */
export function DrillBar({ depth, setDepth, ok, tries, streak }: Props) {
  return (
    <div className={s.drillBar}>
      <div className={s.segmented} role="group" aria-label="Nivel del árbol">
        {TREE_LEVELS.map((level) => (
          <button key={level.depth} type="button" aria-pressed={depth === level.depth} onClick={() => setDepth(level.depth)}>
            {level.label}
          </button>
        ))}
      </div>
      <dl className={s.score} aria-live="polite">
        <div><dt>Aciertos</dt><dd>{ok}/{tries}</dd></div>
        <div><dt>Racha</dt><dd>{streak}</dd></div>
      </dl>
    </div>
  );
}
