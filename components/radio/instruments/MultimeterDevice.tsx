'use client';

import type { KeyboardEvent } from 'react';
import type { DmmJack, DmmMode } from '@/lib/radio/multimeterSim';
import s from './multimeterDevice.module.css';

/** Positions on the rotary selector, in degrees from 12 o'clock (clockwise). */
const DIAL: readonly { id: DmmMode; label: string; name: string; angle: number }[] = [
  { id: 'dcv', label: 'V⎓', name: 'Selector en V⎓ (tensión continua)', angle: -78 },
  { id: 'acv', label: 'V∼', name: 'Selector en V∼ (tensión alterna)', angle: -47 },
  { id: 'ohm', label: 'Ω', name: 'Selector en Ω (resistencia)', angle: -16 },
  { id: 'continuity', label: ')))', name: 'Selector en continuidad y diodo', angle: 16 },
  { id: 'ma', label: 'mA', name: 'Selector en mA (corriente chica)', angle: 47 },
  { id: '10a', label: '10A', name: 'Selector en 10A (corriente alta)', angle: 78 },
];

/** Input jacks along the bottom edge; COM is where the black lead always goes. */
const JACKS: readonly { id: DmmJack | 'com'; label: string; name: string; x: number }[] = [
  { id: '10a', label: '10A', name: 'Borne 10A MAX (shunt 10 mΩ)', x: 58 },
  { id: 'ma', label: 'mA µA', name: 'Borne mA / µA (fusible 400 mA)', x: 104 },
  { id: 'com', label: 'COM', name: 'Borne COM (punta negra)', x: 156 },
  { id: 'v-ohm', label: 'VΩ)))', name: 'Borne V / Ω / ))) (alta Z 10 MΩ)', x: 202 },
];

const CX = 130;
const CY = 252;
const JACK_Y = 362;

const polar = (angle: number, r: number) => ({
  x: CX + r * Math.sin((angle * Math.PI) / 180),
  y: CY - r * Math.cos((angle * Math.PI) / 180),
});

function activate(event: KeyboardEvent, run: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    run();
  }
}

interface Props {
  mode: DmmMode;
  redJack: DmmJack;
  onMode: (mode: DmmMode) => void;
  onJack: (jack: DmmJack) => void;
  digits: string;
  unit: string;
  status: 'ok' | 'warning' | 'danger' | string;
  beep: boolean;
  fuseBlown: boolean;
}

/** A drawn handheld multimeter: the selector and the red jack are the real controls of the trainer. */
export function MultimeterDevice({ mode, redJack, onMode, onJack, digits, unit, status, beep, fuseBlown }: Props) {
  const selected = DIAL.find((d) => d.id === mode) ?? DIAL[0];
  const tip = polar(selected.angle, 38);
  const redX = JACKS.find((j) => j.id === redJack)?.x ?? 202;
  return (
    <svg viewBox="0 0 260 440" className={s.device} data-status={status} aria-label="Multímetro digital de mano">
      <rect x={6} y={6} width={248} height={410} rx={30} className={s.holster} />
      <rect x={22} y={22} width={216} height={378} rx={18} className={s.face} />
      <text x={130} y={40} textAnchor="middle" className={s.brand}>DMM · TRUE RMS · CAT III 600 V</text>

      <rect x={38} y={48} width={184} height={88} rx={6} className={s.lcd} />
      <text x={46} y={64} className={s.annunciator}>{mode === 'acv' ? 'AC' : mode === 'dcv' || mode === 'ma' || mode === '10a' ? 'DC' : 'AUTO'}</text>
      {beep ? <text x={84} y={64} className={s.annunciator}>🔊</text> : null}
      {fuseBlown ? <text x={214} y={64} textAnchor="end" className={s.annunciatorAlert}>FUSE ✕</text> : null}
      <text x={214} y={110} textAnchor="end" className={s.digits} data-testid="multimeter-digits">{digits}</text>
      <text x={214} y={128} textAnchor="end" className={s.unit}>{unit}</text>

      <g aria-hidden="true">
        {['HOLD', 'RANGE', 'SEL', 'REL'].map((label, i) => (
          <g key={label}>
            <rect x={38 + i * 47} y={146} width={40} height={18} rx={9} className={s.key} />
            <text x={58 + i * 47} y={159} textAnchor="middle" className={s.keyText}>{label}</text>
          </g>
        ))}
        <circle cx={CX} cy={CY} r={80} className={s.dialRing} />
        <text {...polar(-110, 66)} textAnchor="middle" className={s.dialOff}>OFF</text>
      </g>

      {DIAL.map((d) => {
        const p = polar(d.angle, 64);
        const on = d.id === mode;
        return (
          <g key={d.id} role="button" tabIndex={0} aria-label={d.name} aria-pressed={on} className={s.hit}
            onClick={() => onMode(d.id)} onKeyDown={(e) => activate(e, () => onMode(d.id))}>
            <circle cx={p.x} cy={p.y} r={16} className={s.hitArea} />
            <text x={p.x} y={p.y + 5} textAnchor="middle" className={on ? s.dialLabelOn : s.dialLabel}>{d.label}</text>
          </g>
        );
      })}
      <circle cx={CX} cy={CY} r={44} className={s.knob} />
      <rect x={CX - 9} y={CY - 44} width={18} height={88} rx={8} className={s.knobGrip}
        style={{ transform: `rotate(${selected.angle}deg)`, transformOrigin: `${CX}px ${CY}px` }} />
      <circle cx={tip.x} cy={tip.y} r={4} className={s.pointer} />

      <path className={s.leadEdge} d={`M156 ${JACK_Y} C156 400 150 420 146 440`} />
      <path className={s.leadBlack} d={`M156 ${JACK_Y} C156 400 150 420 146 440`} />
      <path className={s.leadRed} d={`M${redX} ${JACK_Y} C${redX} 402 178 420 176 440`} />
      {JACKS.map((j) => {
        const isCom = j.id === 'com';
        const on = j.id === redJack;
        const body = (
          <>
            <text x={j.x} y={JACK_Y - 20} textAnchor="middle" className={s.jackLabel}>{j.label}</text>
            <circle cx={j.x} cy={JACK_Y} r={13} className={isCom ? s.jackCom : s.jack} />
            <circle cx={j.x} cy={JACK_Y} r={7} className={isCom ? s.plugBlack : on ? s.plugRed : s.jackHole} />
          </>
        );
        if (isCom) return <g key={j.id} aria-label={j.name} role="img">{body}</g>;
        const jack = j.id as DmmJack;
        return (
          <g key={j.id} role="button" tabIndex={0} aria-label={j.name} aria-pressed={on} className={s.hit}
            onClick={() => onJack(jack)} onKeyDown={(e) => activate(e, () => onJack(jack))}>
            <circle cx={j.x} cy={JACK_Y - 6} r={22} className={s.hitArea} />
            {body}
          </g>
        );
      })}
    </svg>
  );
}
