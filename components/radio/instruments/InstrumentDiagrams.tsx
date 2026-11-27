import s from './instrumentFigure.module.css';

/* Hand-drawn connection diagrams for the bench instruments (own work, no third-party assets). */

const ZIGZAG = 'M120 52 l0 6 l-8 4 l16 6 l-16 6 l16 6 l-16 6 l8 4 l0 8';

function Battery() {
  return (
    <g>
      <path className={s.wire} d="M30 30 L30 68 M30 82 L30 120" />
      <path className={s.wire} d="M18 68 L42 68" strokeWidth={3} />
      <path className={s.wire} d="M24 82 L36 82" strokeWidth={3} />
      <text x={46} y={70} className={s.label}>+</text>
    </g>
  );
}

function Meter({ x, y, letter }: { x: number; y: number; letter: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={15} className={s.meter} />
      <text x={x} y={y + 5} textAnchor="middle" className={s.meterText}>{letter}</text>
    </g>
  );
}

export function DmmVoltageDiagram() {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label="Medir tensión: el multímetro va en paralelo con la resistencia">
      <Battery />
      <path className={s.wire} d="M30 30 L120 30 L120 52 M120 98 L120 120 L30 120" />
      <path className={s.wire} d={ZIGZAG} />
      <text x={98} y={80} className={s.label}>R</text>
      <path className={s.probe} d="M120 40 L170 40 L170 60 M120 110 L170 110 L170 90" />
      <Meter x={170} y={75} letter="V" />
      <text x={100} y={143} textAnchor="middle" className={s.caption}>Tensión: en paralelo</text>
    </svg>
  );
}

export function DmmCurrentDiagram() {
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label="Medir corriente: se abre el circuito y el multímetro queda en serie">
      <Battery />
      <path className={s.wire} d="M30 30 L60 30 M100 30 L120 30 L120 52 M120 98 L120 120 L30 120" />
      <path className={s.probe} d="M60 30 L65 30 M95 30 L100 30" />
      <Meter x={80} y={30} letter="A" />
      <path className={s.wire} d={ZIGZAG} />
      <text x={98} y={80} className={s.label}>R</text>
      <text x={100} y={143} textAnchor="middle" className={s.caption}>Corriente: en serie</text>
    </svg>
  );
}

function sine(): string {
  const pts: string[] = [];
  for (let x = 0; x <= 180; x += 3) pts.push(`${x === 0 ? 'M' : 'L'}${15 + x} ${(70 - 38 * Math.sin((x / 90) * 2 * Math.PI)).toFixed(1)}`);
  return pts.join(' ');
}

export function ScopeDiagram() {
  const grid = [];
  for (let i = 1; i < 6; i++) grid.push(<path key={`v${i}`} className={s.grid} d={`M${15 + i * 30} 15 V125`} />);
  for (let i = 1; i < 4; i++) grid.push(<path key={`h${i}`} className={s.grid} d={`M15 ${15 + i * 27.5} H195`} />);
  return (
    <svg viewBox="0 0 320 160" role="img" aria-label="Pantalla del osciloscopio: el período T y la tensión pico a pico">
      <rect x={15} y={15} width={180} height={110} rx={4} className={s.screen} />
      {grid}
      <path className={s.trace} d={sine()} />
      <path className={s.dim} d="M200 32 V108 M196 32 H204 M196 108 H204" />
      <text x={207} y={74} className={s.label}>V_pp</text>
      <path className={s.dim} d="M37.5 136 H127.5 M37.5 132 V140 M127.5 132 V140" />
      <text x={82} y={153} textAnchor="middle" className={s.label}>T (un ciclo)</text>
      <text x={250} y={30} className={s.note}>f = 1 / T</text>
      <text x={250} y={50} className={s.note}>V_RMS =</text>
      <text x={250} y={64} className={s.note}>V_pp / 2√2</text>
      <text x={250} y={92} className={s.note}>punta ×10</text>
      <text x={250} y={106} className={s.note}>cocodrilo</text>
      <text x={250} y={120} className={s.note}>a masa</text>
    </svg>
  );
}

export function SwrDiagram() {
  return (
    <svg viewBox="0 0 320 140" role="img" aria-label="Medidor de ROE entre el equipo y la antena: la potencia directa va hacia la antena y la reflejada vuelve">
      <rect x={4} y={44} width={64} height={44} rx={6} className={s.box} />
      <text x={36} y={71} textAnchor="middle" className={s.label}>Equipo</text>
      <rect x={112} y={40} width={96} height={52} rx={6} className={s.box} />
      <text x={160} y={63} textAnchor="middle" className={s.label}>ROE</text>
      <text x={160} y={80} textAnchor="middle" className={s.note}>TRANS · ANT</text>
      <rect x={240} y={40} width={76} height={52} rx={6} className={s.box} />
      <text x={278} y={58} textAnchor="middle" className={s.label}>Antena</text>
      <text x={278} y={72} textAnchor="middle" className={s.note}>o carga</text>
      <text x={278} y={85} textAnchor="middle" className={s.note}>50 Ω</text>
      <path className={s.wire} d="M68 66 H112 M208 66 H240" />
      <path className={s.fwd} d="M20 28 H300 M292 23 L300 28 L292 33" />
      <text x={20} y={20} className={s.fwdText}>P directa →</text>
      <path className={s.ref} d="M300 106 H20 M28 101 L20 106 L28 111" />
      <text x={300} y={126} textAnchor="end" className={s.refText}>← P reflejada (rebote)</text>
    </svg>
  );
}

function swrCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 56; i++) {
    const x = 40 + i * 5;
    const d = (x - 175) / 135;
    const roe = 1.08 + 2.2 * d * d;
    pts.push(`${i ? 'L' : 'M'}${x} ${(130 - (roe - 1) * 45).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function VnaDiagram() {
  return (
    <svg viewBox="0 0 320 178" role="img" aria-label="Barrido de ROE del NanoVNA: el mínimo de la curva marca la frecuencia de resonancia">
      <path className={s.axis} d="M40 15 V130 H312" />
      <text x={34} y={134} textAnchor="end" className={s.note}>1:1</text>
      <text x={34} y={89} textAnchor="end" className={s.note}>2:1</text>
      <text x={34} y={44} textAnchor="end" className={s.note}>3:1</text>
      <path className={s.grid} d="M40 85 H312" strokeDasharray="4 4" />
      <path className={s.trace} d={swrCurve()} />
      <path className={s.dim} d="M175 126 V138" />
      <text x={175} y={151} textAnchor="middle" className={s.label}>f₀ resonancia</text>
      <text x={40} y={172} className={s.note}>← más largo: baja</text>
      <text x={312} y={172} textAnchor="end" className={s.note}>más corto: sube →</text>
      <text x={175} y={80} textAnchor="middle" className={s.note}>usable bajo 2:1</text>
    </svg>
  );
}
