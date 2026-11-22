import type { Pt } from './geometry';

/**
 * The 2×5 key matrix seen from the back (the side you solder): each column line runs
 * to its key, the key goes through its diode (stripe toward the row) into the row line.
 * `pins` holds the screen position of F0, F1, C0…C4 on the card edge.
 */
export function MatrixArt({ pins, colors, inward, keys }: {
  pins: Record<string, Pt>; colors: Record<string, string>; inward: 1 | -1; keys: string[][];
}) {
  const edge = pins.f0[0];
  const rows = [pins.f0[1], pins.f1[1]];
  const cols = [0, 1, 2, 3, 4].map(i => ({ id: `c${i}`, x: edge + inward * (92 + i * 74), y: pins[`c${i}`][1] }));
  const top = rows[0] - 50;
  const end = cols[4].x + inward * 58;
  return <g>
    {rows.map((ry, r) => <line key={r} x1={edge} y1={ry} x2={end} y2={ry} stroke={colors[`f${r}`]} strokeWidth={2.4} className="dgTrace" />)}
    {cols.map(col => <path key={col.id} d={`M${col.x},${top} V${col.y - 6} Q${col.x},${col.y} ${col.x - inward * 6},${col.y} H${edge}`}
      fill="none" stroke={colors[col.id]} strokeWidth={2.4} className="dgTrace" />)}
    {cols.map((col, c) => rows.map((ry, r) => {
      const kx = col.x + inward * 30;
      const ky = ry - 31;
      return <g key={`${c}${r}`}>
        <line x1={col.x} y1={ky} x2={kx - inward * 15} y2={ky} stroke={colors[col.id]} strokeWidth={1.8} />
        <circle cx={col.x} cy={ky} r={2.6} fill={colors[col.id]} />
        <rect x={kx - 15} y={ky - 15} width={30} height={30} rx={5} className="dgKey" />
        <text x={kx} y={ky + 3} textAnchor="middle" className="dgKeyText">{keys[r]?.[c]}</text>
        <line x1={kx} y1={ky + 15} x2={kx} y2={ry} stroke={colors[`f${r}`]} strokeWidth={1.6} />
        <path d={`M${kx - 4.5},${ry - 11} L${kx + 4.5},${ry - 11} L${kx},${ry - 4} Z`} className="dgDiode" />
        <line x1={kx - 4.5} y1={ry - 4} x2={kx + 4.5} y2={ry - 4} className="dgDiodeBar" />
        <circle cx={kx} cy={ry} r={2.6} fill={colors[`f${r}`]} />
      </g>;
    }))}
  </g>;
}
