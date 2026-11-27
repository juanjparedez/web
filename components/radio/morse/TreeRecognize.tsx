'use client';

import { useState } from 'react';
import { MORSE } from '@/lib/radio/codes';
import { MorseTree, type TreeMark } from '../MorseTree';
import { DrillBar } from './DrillBar';
import { lettersUpTo, pickOther, prettyCode } from './treeLevels';
import { useDrillScore } from './useDrillScore';
import { useMorsePlayer } from './useMorsePlayer';
import s from './morse.module.css';

/** Listening drill: a letter sounds and you answer by tapping it in the tree. */
export function TreeRecognize() {
  const [depth, setDepth] = useState(2);
  const [target, setTarget] = useState('');
  const [marks, setMarks] = useState<Record<string, TreeMark>>({});
  const [hide, setHide] = useState(false);
  const [wpm, setWpm] = useState(14);
  const play = useMorsePlayer(wpm);
  const score = useDrillScore();
  const answered = Object.keys(marks).length > 0;

  const next = (nextDepth = depth) => {
    const letter = pickOther(lettersUpTo(nextDepth), target);
    setTarget(letter); setMarks({}); play(MORSE[letter]);
  };
  const answer = (letter: string) => {
    if (!target || answered) return;
    const ok = letter === target;
    score.record(ok);
    setMarks(ok ? { [letter]: 'ok' } : { [letter]: 'bad', [target]: 'ok' });
  };
  const changeDepth = (value: number) => { setDepth(value); score.reset(); if (target) next(value); };

  const message = !target ? 'Tocá Empezar y escuchá.' : !answered ? '¿Qué letra sonó? Tocála en el árbol.'
    : marks[target] === 'ok' && Object.keys(marks).length === 1 ? `✓ Correcto: ${target} = ${prettyCode(MORSE[target])}`
      : `✗ Era ${target} = ${prettyCode(MORSE[target])}`;
  return (
    <div className={s.trainer}>
      <DrillBar depth={depth} setDepth={changeDepth} ok={score.ok} tries={score.tries} streak={score.streak} />
      <div className={s.stage}>
        <div className={s.prompt}>
          <span>Escuchá</span>
          <strong aria-hidden="true">{answered ? target : target ? '♪' : '—'}</strong>
          <output aria-live="polite">{message}</output>
        </div>
        <div className={s.actions}>
          <button type="button" className={s.primary} onClick={() => next()}>{!target ? 'Empezar' : answered ? 'Siguiente letra' : 'Otra letra'}</button>
          <button type="button" disabled={!target} onClick={() => play(MORSE[target])}>Repetir sonido</button>
        </div>
        <div className={s.options}>
          <label><input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} /> Ocultar letras (más difícil)</label>
          <label>Velocidad · {wpm} ppm<input type="range" min={8} max={25} value={wpm} onChange={(e) => setWpm(Number(e.target.value))} /></label>
        </div>
      </div>
      <MorseTree code={answered ? MORSE[target] : ''} choose={answer} marks={marks} depth={depth} hideLetters={hide && !answered} />
      <p className={s.tip}>Con las letras ocultas solo ves los signos de cada rama: tenés que reconocer el ritmo, no la etiqueta.</p>
    </div>
  );
}
