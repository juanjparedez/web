'use client';

import { useState } from 'react';
import { MORSE, morseToText } from '@/lib/radio/codes';
import { MorseTree, type TreeMark } from '../MorseTree';
import { DrillBar } from './DrillBar';
import { lettersUpTo, pickOther, prettyCode } from './treeLevels';
import { useDrillScore } from './useDrillScore';
import { useMorsePlayer } from './useMorsePlayer';
import s from './morse.module.css';

type Mode = 'explore' | 'challenge';

/** Tree trainer: free exploration, or "find this letter" challenges built with dot and dash. */
export function TreeExplorer() {
  const [mode, setMode] = useState<Mode>('explore');
  const [depth, setDepth] = useState(2);
  const [code, setCode] = useState('');
  const [target, setTarget] = useState('');
  const [marks, setMarks] = useState<Record<string, TreeMark>>({});
  const play = useMorsePlayer(12);
  const score = useDrillScore();
  const pool = lettersUpTo(mode === 'explore' ? 4 : depth);
  const solved = Object.values(marks).includes('ok');

  const newTarget = (nextDepth = depth) => {
    const letter = pickOther(lettersUpTo(nextDepth), target);
    setTarget(letter); setCode(''); setMarks({});
  };
  const switchMode = (next: Mode) => {
    setMode(next); setCode(''); setMarks({}); score.reset();
    if (next === 'challenge') newTarget(); else setTarget('');
  };
  const changeDepth = (next: number) => { setDepth(next); score.reset(); newTarget(next); };
  const canGrow = (symbol: string) => !solved && pool.some((ch) => MORSE[ch].startsWith(code + symbol));
  const grow = (symbol: string) => { const next = code + symbol; setCode(next); play(next); };
  const choose = (letter: string) => { setCode(MORSE[letter]); play(MORSE[letter]); };

  const check = () => {
    const answer = morseToText(code);
    const ok = answer === target;
    score.record(ok);
    setMarks(ok ? { [target]: 'ok' } : { ...(answer ? { [answer]: 'bad' } : {}), [target]: 'target' });
    play(MORSE[target]);
  };

  const readout = code ? `${prettyCode(code)} = ${morseToText(code) || '?'}` : 'Empezá desde ◆';
  return (
    <div className={s.trainer}>
      <div className={s.segmented} role="group" aria-label="Modo">
        <button type="button" aria-pressed={mode === 'explore'} onClick={() => switchMode('explore')}>Explorar</button>
        <button type="button" aria-pressed={mode === 'challenge'} onClick={() => switchMode('challenge')}>Desafío</button>
      </div>
      {mode === 'challenge' ? <DrillBar depth={depth} setDepth={changeDepth} ok={score.ok} tries={score.tries} streak={score.streak} /> : null}
      <div className={s.stage}>
        <div className={s.prompt}>
          <span>{mode === 'explore' ? 'Tu recorrido' : 'Llegá a la letra'}</span>
          <strong>{mode === 'explore' ? morseToText(code) || '—' : target}</strong>
          <output aria-live="polite">{mode === 'explore' ? readout : solved ? `✓ ${target} = ${prettyCode(MORSE[target])}` : Object.keys(marks).length ? `✗ ${target} es ${prettyCode(MORSE[target])}` : prettyCode(code) || 'Empezá desde ◆'}</output>
        </div>
        <div className={s.keys}>
          <button type="button" disabled={!canGrow('.')} onClick={() => grow('.')}><b>·</b>Punto</button>
          <button type="button" disabled={!canGrow('-')} onClick={() => grow('-')}><b>−</b>Raya</button>
        </div>
        <div className={s.actions}>
          {mode === 'challenge' && !Object.keys(marks).length ? <button type="button" className={s.primary} disabled={!code} onClick={check}>Comprobar</button> : null}
          {mode === 'challenge' && Object.keys(marks).length ? <button type="button" className={s.primary} onClick={() => newTarget()}>Siguiente letra</button> : null}
          <button type="button" disabled={!code} onClick={() => play(code)}>Escuchar</button>
          <button type="button" disabled={!code} onClick={() => { setCode(''); if (!solved) setMarks({}); }}>Volver al inicio</button>
        </div>
      </div>
      <MorseTree code={code} choose={mode === 'explore' ? choose : (letter) => { if (!Object.keys(marks).length) { setCode(MORSE[letter]); } }}
        marks={marks} depth={mode === 'explore' ? 4 : depth} hideLetters={mode === 'challenge' && !Object.keys(marks).length} />
      <p className={s.tip}>{mode === 'explore'
        ? 'Izquierda es punto, derecha es raya. Tocá una letra del árbol o armá el camino con Punto y Raya: cada paso suena.'
        : 'Las letras del árbol están ocultas. Armá el camino de memoria (o tocá la rama) y comprobá; al responder se revela el árbol.'}</p>
    </div>
  );
}
