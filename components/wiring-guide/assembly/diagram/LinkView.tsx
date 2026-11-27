import { HEADER_X, pinY, type DiagramLink } from '@/lib/padWiring/diagram';
import { roundedPath, railColor, type PinGeo, type Pt } from './geometry';
import { InlineSym, NetTag, ShuntCap } from './Symbols';

const Trace = ({ points, color }: { points: Pt[]; color: string }) => {
  const d = roundedPath(points);
  return <><path d={d} className="dgHalo" /><path d={d} stroke={color} className="dgTrace" /></>;
};

/** Every connection type in the drawing. Points are built in the spec frame, then mapped to screen. */
export function LinkView({ link, pins, lane, map, color, label }: {
  link: DiagramLink; pins: Map<string, PinGeo>; lane?: number; map: (p: Pt) => Pt; color: string;
  label: (text: string) => string;
}) {
  const sx = (x: number) => map([x, 0])[0];
  const dirOf = (a: number, b: number): 1 | -1 => (sx(b) >= sx(a) ? 1 : -1);

  if (link.kind === 'esp') {
    const y0 = pinY(link.pos);
    const start: Pt = [HEADER_X, y0];
    if (link.end) {
      const end: Pt = [link.end.x, y0];
      const [ex, ey] = map(end);
      return <g>
        <Trace points={[start, end].map(map)} color={color} />
        <NetTag x={ex} y={ey} text={label(link.end.text)} color={railColor(link.end.rail)} anchor={dirOf(HEADER_X, link.end.x) > 0 ? 'left' : 'right'} />
      </g>;
    }
    const targets = link.to.map(id => pins.get(id)).filter((g): g is PinGeo => Boolean(g));
    if (!targets.length) return null;
    const x = lane ?? HEADER_X;
    const farthest = targets.reduce((best, g) => Math.abs(g.tip[1] - y0) > Math.abs(best.tip[1] - y0) ? g : best, targets[0]);
    const main: Pt[] = lane ? [start, [x, y0], [x, farthest.tip[1]], farthest.tip] : [start, farthest.tip];
    const branches = targets.filter(g => g !== farthest);
    const tipX = farthest.tip[0];
    const midX = ((lane ?? HEADER_X) + tipX) / 2;
    return <g>
      <Trace points={main.map(map)} color={color} />
      {branches.map(g => <g key={g.pin.id}>
        <Trace points={[[x, g.tip[1]] as Pt, g.tip].map(map)} color={color} />
        <circle cx={sx(x)} cy={g.tip[1]} r={3.2} fill={color} />
      </g>)}
      {link.inline ? <InlineSym sym={link.inline} x={sx(midX)} y={farthest.tip[1]} color={color} dir={dirOf(HEADER_X, tipX)} /> : null}
      {link.taps?.map(tap => {
        const tx = sx(HEADER_X + tap.dx);
        const ty = farthest.tip[1];
        return <g key={tap.text}>
          <line x1={tx} y1={ty} x2={tx} y2={ty + tap.dy} stroke={railColor(tap.rail)} className="dgTraceThin" />
          <circle cx={tx} cy={ty} r={3.2} fill={railColor(tap.rail)} />
          <NetTag x={tx} y={ty + tap.dy + (tap.dy < 0 ? -2 : 2)} text={label(tap.text)} color={railColor(tap.rail)} anchor="center" />
        </g>;
      })}
    </g>;
  }

  if (link.kind === 'tag') {
    const g = pins.get(link.from);
    if (!g) return null;
    const len = link.len ?? (link.nc ? 24 : 62);
    const end: Pt = [g.tip[0] + g.dir[0] * len, g.tip[1] + g.dir[1] * len];
    const [tx, ty] = map(g.tip);
    const [ex, ey] = map(end);
    const tagColor = link.nc ? 'var(--dg-neutral)' : railColor(link.rail);
    const anchor = ex < tx ? 'right' : 'left';
    return <g>
      <Trace points={[map(g.tip), [ex, ey]]} color={tagColor} />
      {link.inline ? <InlineSym sym={link.inline} x={(tx + ex) / 2} y={ty} color={tagColor} dir={ex < tx ? 1 : -1} /> : null}
      {link.shunt ? <ShuntCap x={(tx + ex) / 2} y={ty} label={link.shunt.label} color={tagColor} left /> : null}
      {link.nc
        ? <g className="dgNc"><path d={`M${ex - 4},${ey - 4} l8,8 M${ex + 4},${ey - 4} l-8,8`} /><text x={anchor === 'right' ? ex - 9 : ex + 9} y={ey + 3.5} textAnchor={anchor === 'right' ? 'end' : 'start'}>NC</text></g>
        : <NetTag x={ex} y={ey} text={label(link.text)} color={tagColor} anchor={anchor} warn={link.warn} />}
    </g>;
  }

  if (link.kind === 'wire') {
    const a = pins.get(link.from);
    const b = pins.get(link.to);
    if (!a || !b) return null;
    const mid = (a.tip[0] + b.tip[0]) / 2;
    const pts: Pt[] = link.via ? [a.tip, ...link.via, b.tip]
      : a.tip[1] === b.tip[1] ? [a.tip, b.tip] : [a.tip, [mid, a.tip[1]], [mid, b.tip[1]], b.tip];
    const v = link.via;
    return <g>
      <Trace points={pts.map(map)} color={color} />
      {link.inline && v ? <InlineSym sym={link.inline} x={sx(v[0][0])} y={(v[0][1] + v[1][1]) / 2} color={color} vertical /> : null}
    </g>;
  }

  const drops = link.pins.map(id => pins.get(id)).filter((g): g is PinGeo => Boolean(g));
  if (!drops.length) return null;
  const far = drops.reduce((m, g) => (Math.abs(g.tip[0] - link.endX) > Math.abs(m.tip[0] - link.endX) ? g : m), drops[0]);
  const c = railColor(link.rail);
  const [ex, ey] = map([link.endX, link.y]);
  return <g>
    <Trace points={[far.tip, [far.tip[0], link.y] as Pt, [link.endX, link.y] as Pt].map(map)} color={c} />
    {drops.filter(g => g !== far).map(g => <g key={g.pin.id}>
      <Trace points={[g.tip, [g.tip[0], link.y] as Pt].map(map)} color={c} />
      <circle cx={sx(g.tip[0])} cy={link.y} r={3.2} fill={c} />
    </g>)}
    {link.inline ? <InlineSym sym={link.inline} x={sx(link.endX + (far.tip[0] > link.endX ? 50 : -50))} y={link.y} color={c} dir={dirOf(link.endX, far.tip[0])} /> : null}
    <NetTag x={ex} y={ey} text={label(link.text)} color={c} anchor={sx(far.tip[0]) > ex ? 'right' : 'left'} />
  </g>;
}
