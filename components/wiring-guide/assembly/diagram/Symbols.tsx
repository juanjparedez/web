import type { InlineSymbol } from '@/lib/padWiring/diagram';

/**
 * Schematic parts drawn on top of a wire: resistor, diode, switch, capacitor.
 * `dir` is the screen direction the wire runs (current flows from -dir to +dir).
 */
export function InlineSym({ sym, x, y, color, dir = 1, vertical = false, below = false }: {
  sym: InlineSymbol; x: number; y: number; color: string; dir?: 1 | -1; vertical?: boolean; below?: boolean;
}) {
  const rot = vertical ? `rotate(90 ${x} ${y})` : undefined;
  const label = !sym.label ? null : vertical
    ? <text x={x + 14} y={y + 4} className="dgSymLabel">{sym.label}</text>
    : <text x={x} y={below ? y + 20 : y - 11} textAnchor="middle" className="dgSymLabel">{sym.label}</text>;
  if (sym.sym === 'res') return <g>
    <rect x={x - 15} y={y - 5.5} width={30} height={11} rx={2} transform={rot} className="dgSymBody" stroke={color} />
    {label}
  </g>;
  if (sym.sym === 'diode') {
    const t = x + dir * 6;
    return <g><g transform={rot}>
      <rect x={x - 11} y={y - 8} width={22} height={16} className="dgSymMask" />
      <path d={`M${x - dir * 7},${y - 7} L${t},${y} L${x - dir * 7},${y + 7} Z`} fill={color} />
      <line x1={t} y1={y - 7} x2={t} y2={y + 7} stroke={color} strokeWidth={2.4} />
    </g>{label}</g>;
  }
  if (sym.sym === 'switch') return <g><g transform={rot}>
    <rect x={x - 14} y={y - 10} width={28} height={16} className="dgSymMask" />
    <circle cx={x - 10} cy={y} r={2.6} fill={color} />
    <circle cx={x + 10} cy={y} r={2.6} fill={color} />
    <line x1={x - 10} y1={y} x2={x + 9} y2={y - 8} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </g>{label}</g>;
  return <g transform={rot}>
    <rect x={x - 4} y={y - 11} width={8} height={22} className="dgSymMask" />
    <line x1={x - 3} y1={y - 10} x2={x - 3} y2={y + 10} stroke={color} strokeWidth={2.4} />
    <path d={`M${x + 4},${y - 10} Q${x + 1},${y} ${x + 4},${y + 10}`} fill="none" stroke={color} strokeWidth={2.4} />
    <text x={x - 9} y={y - 6} className="dgSymPlus" textAnchor="middle">+</text>
    {vertical ? <text x={x + 16} y={y + 4} className="dgSymLabel" transform={`rotate(-90 ${x} ${y})`}>{sym.label}</text> : label}
  </g>;
}

/** Capacitor from a wire to ground, hanging below the point (x, y). */
export function ShuntCap({ x, y, label, color, left = false }: { x: number; y: number; label: string; color: string; left?: boolean }) {
  return <g>
    <circle cx={x} cy={y} r={2.8} fill={color} />
    <line x1={x} y1={y} x2={x} y2={y + 9} stroke={color} strokeWidth={1.8} />
    <line x1={x - 8} y1={y + 9} x2={x + 8} y2={y + 9} stroke={color} strokeWidth={2.4} />
    <path d={`M${x - 8},${y + 16} Q${x},${y + 12} ${x + 8},${y + 16}`} fill="none" stroke="var(--pw-role-gnd)" strokeWidth={2.4} />
    <line x1={x} y1={y + 15} x2={x} y2={y + 21} stroke="var(--pw-role-gnd)" strokeWidth={1.8} />
    <line x1={x - 7} y1={y + 21} x2={x + 7} y2={y + 21} stroke="var(--pw-role-gnd)" strokeWidth={1.8} />
    <line x1={x - 4} y1={y + 24} x2={x + 4} y2={y + 24} stroke="var(--pw-role-gnd)" strokeWidth={1.6} />
    <text x={left ? x - 12 : x + 12} y={y + 17} textAnchor={left ? 'end' : 'start'} className="dgSymLabel">{label}</text>
  </g>;
}

/** Rounded net label at the end of a wire. `anchor` = which side of the pill touches the wire. */
export function NetTag({ x, y, text, color, anchor, warn = false }: {
  x: number; y: number; text: string; color: string; anchor: 'left' | 'right' | 'center'; warn?: boolean;
}) {
  const w = text.length * 6.4 + 14 + (warn ? 12 : 0);
  const left = anchor === 'left' ? x : anchor === 'right' ? x - w : x - w / 2;
  return <g>
    <rect x={left} y={y - 9} width={w} height={18} rx={9} className="dgTag" stroke={color} style={{ fill: `color-mix(in srgb, ${color} 16%, var(--dg-bg))` }} />
    <text x={left + 7 + (warn ? 12 : 0)} y={y + 4} className="dgTagText" style={{ fill: color }}>{text}</text>
    {warn ? <text x={left + 6} y={y + 4} className="dgTagText" style={{ fill: 'var(--hios-warning)' }}>⚠</text> : null}
  </g>;
}
