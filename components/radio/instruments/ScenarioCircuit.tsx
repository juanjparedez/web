import type { BenchScenarioId, DmmMode, ProbePlacement } from '@/lib/radio/multimeterSim';
import s from './instrumentFigure.module.css';

/* Schematic of the circuit under test, showing where the probes go for the chosen placement. */

const METER_LETTER: Record<DmmMode, string> = { dcv: 'V', acv: 'V', ohm: 'Ω', continuity: ')))', ma: 'A', '10a': 'A' };

function Meter({ x, y, mode }: { x: number; y: number; mode: DmmMode }) {
  return (
    <g>
      <circle cx={x} cy={y} r={15} className={s.meter} />
      <text x={x} y={y + 5} textAnchor="middle" className={s.meterText} style={{ fontSize: mode === 'continuity' ? 10 : 15 }}>
        {METER_LETTER[mode]}
      </text>
    </g>
  );
}

function Battery({ label, off }: { label: string; off: boolean }) {
  return (
    <g>
      <path className={s.wire} d="M40 30 V82 M40 98 V150" />
      <path className={s.wire} d="M28 82 H52" strokeWidth={3} />
      <path className={s.wire} d="M34 98 H46" strokeWidth={3} />
      <text x={58} y={86} className={s.label}>{label}</text>
      <text x={58} y={120} className={s.note}>{off ? 'apagada' : 'encendida'}</text>
    </g>
  );
}

function Box({ y, h, label, value }: { y: number; h: number; label: string; value: string }) {
  return (
    <g>
      <rect x={212} y={y} width={16} height={h} rx={2} className={s.box} />
      <text x={204} y={y + h / 2 - 2} textAnchor="end" className={s.label}>{label}</text>
      <text x={204} y={y + h / 2 + 12} textAnchor="end" className={s.note}>{value}</text>
    </g>
  );
}

function Divider({ mode, placement, powered }: Props) {
  const series = placement === 'series';
  return (
    <>
      <Battery label="12 V" off={!powered} />
      <path className={s.wire} d="M40 30 H220 V42 M220 78 V102 M220 138 V150" />
      <Box y={42} h={36} label="R1" value="10 MΩ" />
      <Box y={102} h={36} label="R2" value="10 MΩ" />
      <circle cx={220} cy={90} r={3.5} className={s.node} />
      <text x={206} y={92} textAnchor="end" className={s.note}>nodo:</text>
      <text x={206} y={104} textAnchor="end" className={s.note}>6 V sin tester</text>
      {series ? (
        <>
          <path className={s.wire} d="M220 150 H172 M128 150 H40" />
          <path className={s.probe} d="M172 150 H165 M135 150 H128" />
          <Meter x={150} y={150} mode={mode} />
          <text x={150} y={176} textAnchor="middle" className={s.note}>rama de R2 abierta</text>
        </>
      ) : (
        <>
          <path className={s.wire} d="M220 150 H40" />
          <path className={s.probe} d="M220 90 H290 V105 M290 135 V150 H220" />
          <Meter x={290} y={120} mode={mode} />
        </>
      )}
    </>
  );
}

function Supply({ mode, placement, powered, scenario }: Props) {
  const rf = scenario === 'rf-dummy-load';
  const series = placement === 'series';
  return (
    <>
      <Battery label={rf ? 'Handy' : '13,8 V'} off={!powered} />
      {series ? (
        <>
          <path className={s.wire} d="M40 30 H112 M148 30 H220 V60" />
          <path className={s.probe} d="M112 30 H120 M140 30 H148" />
          <Meter x={130} y={30} mode={mode} />
        </>
      ) : <path className={s.wire} d="M40 30 H220 V60" />}
      <Box y={60} h={60} label={rf ? 'Carga' : 'Equipo'} value={rf ? '50 Ω' : '9,2 Ω'} />
      <path className={s.wire} d="M220 120 V150 H40" />
      {series ? null : (
        <>
          <path className={s.probe} d="M220 45 H290 V75 M290 105 V135 H220" />
          <Meter x={290} y={90} mode={mode} />
          {rf ? <text x={290} y={38} textAnchor="middle" className={s.note}>punta RF</text> : null}
        </>
      )}
    </>
  );
}

function Coax({ mode, placement }: Props) {
  const series = placement === 'series';
  return (
    <>
      <path className={s.wire} d="M60 80 H250" />
      <path className={s.box} d="M60 100 H250" strokeDasharray="6 3" />
      <rect x={40} y={70} width={20} height={40} rx={3} className={s.box} />
      <rect x={250} y={70} width={20} height={40} rx={3} className={s.box} />
      <text x={155} y={74} textAnchor="middle" className={s.note}>vivo (centro)</text>
      <text x={155} y={118} textAnchor="middle" className={s.note}>malla</text>
      {series ? (
        <>
          <path className={s.probe} d="M50 80 V30 H140 M170 30 H260 V80" />
          <Meter x={155} y={30} mode={mode} />
          <text x={155} y={150} textAnchor="middle" className={s.note}>punta a punta del vivo</text>
        </>
      ) : (
        <>
          <path className={s.probe} d="M260 80 H295 V125 M260 100 H280 V155 H295" />
          <Meter x={295} y={140} mode={mode} />
          <text x={155} y={150} textAnchor="middle" className={s.note}>entre vivo y malla</text>
        </>
      )}
    </>
  );
}

interface Props {
  scenario: BenchScenarioId;
  mode: DmmMode;
  placement: ProbePlacement;
  powered: boolean;
}

export function ScenarioCircuit(props: Props) {
  const body = props.scenario === 'high-z-divider' ? <Divider {...props} />
    : props.scenario === 'coax-antenna' ? <Coax {...props} /> : <Supply {...props} />;
  return (
    <figure className={s.circuit} data-testid="multimeter-circuit">
      <svg viewBox="0 0 320 185" role="img" aria-label="Circuito bajo prueba y dónde van las puntas">{body}</svg>
      <figcaption>Dónde están apoyadas las puntas</figcaption>
    </figure>
  );
}
