import type { DiagramCard } from '@/lib/padWiring/diagram';
import { Art } from './Art';
import { MatrixArt } from './MatrixArt';
import type { PinGeo, Pt } from './geometry';

/** One real part: its board, its silk-labelled pins and a drawing of what it is. */
export function PartCard({ card, title, pins, map, colors, mirrored, keys, active, onPick }: {
  card: DiagramCard; title: string; pins: Map<string, PinGeo>; map: (p: Pt) => Pt;
  colors: Map<string, string>; mirrored: boolean; keys: string[][]; active: string;
  onPick: (key: string) => void;
}) {
  const [a, b] = [map([card.x, card.y]), map([card.x + card.w, card.y + card.h])];
  const left = Math.min(a[0], b[0]);
  const right = Math.max(a[0], b[0]);
  const zone = (side: 'in' | 'out') => {
    const labels = card.pins.filter(pin => pin.side === side).map(pin => pin.label.length);
    return labels.length ? Math.max(...labels, 1) * 6.2 + 20 : 8;
  };
  const inZone = card.art === 'matrix' ? 8 : zone('in');
  const outZone = zone('out');
  const [zl, zr] = mirrored ? [outZone, inZone] : [inZone, outZone];
  const bottomZone = card.pins.some(pin => pin.side === 'bottom') ? 22 : 8;
  const screenPins: Record<string, Pt> = {};
  const pinColors: Record<string, string> = {};
  card.pins.forEach(pin => { const g = pins.get(pin.id); if (g) { screenPins[pin.id] = map(g.edge); pinColors[pin.id] = colors.get(pin.key) ?? 'var(--dg-neutral)'; } });

  return <g className={`dgCard${card.ghost ? ' dgGhost' : ''}`} data-card={card.id}>
    <text x={left + 2} y={card.y - 8} className="dgCardTitle">{title}</text>
    <rect x={left} y={card.y} width={right - left} height={card.h} rx={8} className={`dgBoard dgBoard-${card.art}`} />
    {card.art === 'matrix'
      ? <MatrixArt pins={screenPins} colors={pinColors} inward={mirrored ? -1 : 1} keys={keys} />
      : <Art art={card.art} x={left + zl} y={card.y + 8} w={right - left - zl - zr} h={card.h - 8 - bottomZone} flip={mirrored} />}
    {card.pins.map(pin => {
      const g = pins.get(pin.id);
      if (!g) return null;
      const [ex, ey] = map(g.edge);
      const [tx, ty] = map(g.tip);
      const color = pinColors[pin.id];
      const inwardX = tx < ex ? 1 : tx > ex ? -1 : 0;
      const on = active === pin.key;
      return <g key={pin.id} className={`dgPin${on ? ' dgOn' : ''}`} onClick={pin.key ? () => onPick(pin.key) : undefined}>
        <line x1={ex} y1={ey} x2={tx} y2={ty} stroke={color} strokeWidth={2.4} />
        <rect x={ex - 3.5} y={ey - 3.5} width={7} height={7} rx={1.5} className="dgPinPad" stroke={color} />
        {pin.label ? <text x={inwardX ? ex + inwardX * 9 : ex} y={inwardX ? (card.art === 'matrix' ? ey - 5 : ey + 3.5) : ey - 8}
          textAnchor={inwardX > 0 ? 'start' : inwardX < 0 ? 'end' : 'middle'} className="dgPinLabel">{pin.label}</text> : null}
      </g>;
    })}
  </g>;
}
