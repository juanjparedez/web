import {
  DIAGRAM_W, HEADER_X, pinY,
  type DiagramCard, type DiagramLink, type DiagramPin, type ModuleDiagram, type Rail,
} from '@/lib/padWiring/diagram';

export type Pt = [number, number];
export interface PinGeo { pin: DiagramPin; card: DiagramCard; edge: Pt; tip: Pt; dir: Pt }

export const LEAD = 10;
const LANE_START = 24;
const LANE_STEP = 13;

/** Spec frame → screen. J1 modules are mirrored so the board ends up on the right. */
export const toScreen = (mirrored: boolean) => ([x, y]: Pt): Pt => [mirrored ? DIAGRAM_W - x : x, y];

/** Pin geometry in the spec frame (board on the left). */
export function pinGeometry(diagram: ModuleDiagram): Map<string, PinGeo> {
  const out = new Map<string, PinGeo>();
  for (const card of diagram.cards) {
    for (const pin of card.pins) {
      const dir: Pt = pin.side === 'in' ? [-1, 0] : pin.side === 'out' ? [1, 0] : [0, 1];
      const edge: Pt = pin.side === 'in' ? [card.x, card.y + pin.at]
        : pin.side === 'out' ? [card.x + card.w, card.y + pin.at] : [card.x + pin.at, card.y + card.h];
      out.set(pin.id, { pin, card, edge, dir, tip: [edge[0] + dir[0] * LEAD, edge[1] + dir[1] * LEAD] });
    }
  }
  return out;
}

/** Orthogonal polyline with rounded corners. */
export function roundedPath(points: Pt[], r = 7): string {
  const pts = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const a = Math.min(r, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2);
    const ax = x - Math.sign(x - px) * a;
    const ay = y - Math.sign(y - py) * a;
    const bx = x + Math.sign(nx - x) * a;
    const by = y + Math.sign(ny - y) * a;
    d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

type EspLink = Extract<DiagramLink, { kind: 'esp' }>;

/**
 * Lanes for ESP wires that have to change height. Wires going down take outer lanes
 * first (top-most start first), wires going up the opposite, which keeps parallel
 * wires from crossing each other.
 */
export function assignLanes(links: EspLink[], pins: Map<string, PinGeo>): Map<EspLink, number> {
  const bending = links.filter(link => link.to.some(id => pins.get(id)?.tip[1] !== pinY(link.pos)));
  const far = (link: EspLink) => Math.max(...link.to.map(id => Math.abs((pins.get(id)?.tip[1] ?? 0) - pinY(link.pos))));
  const down = bending.filter(link => (pins.get(link.to[0])?.tip[1] ?? 0) > pinY(link.pos)).sort((a, b) => a.pos - b.pos);
  const up = bending.filter(link => !down.includes(link)).sort((a, b) => b.pos - a.pos || far(a) - far(b));
  const ordered = [...down, ...up];
  const lanes = new Map<EspLink, number>();
  ordered.forEach((link, i) => lanes.set(link, HEADER_X + LANE_START + (ordered.length - 1 - i) * LANE_STEP));
  return lanes;
}

const SIGNAL = ['#3b82f6', '#14b8a6', '#a855f7', '#ec4899', '#84cc16', '#06b6d4', '#6366f1'];
export const railColor = (rail?: Rail) => rail === '5V' ? 'var(--pw-role-pwr5)' : rail === '3V3' ? 'var(--pw-role-pwr33)' : rail === 'GND' ? 'var(--pw-role-gnd)' : 'var(--dg-neutral)';

/** One colour per joint: signals get a distinct hue, power keeps its rail colour. */
export function keyColors(diagram: ModuleDiagram): Map<string, string> {
  const colors = new Map<string, string>();
  let n = 0;
  for (const link of diagram.links) {
    if (colors.has(link.key)) continue;
    if (link.kind === 'esp' && !link.end && !link.taps) colors.set(link.key, SIGNAL[n++ % SIGNAL.length]);
    else if (link.kind === 'esp') colors.set(link.key, railColor(link.end?.rail ?? link.taps?.[0]?.rail));
    else if ('rail' in link && link.rail) colors.set(link.key, railColor(link.rail));
  }
  for (const link of diagram.links) if (!colors.has(link.key)) colors.set(link.key, link.kind === 'tag' && link.nc ? 'var(--dg-neutral)' : SIGNAL[n++ % SIGNAL.length]);
  return colors;
}

/** Right-most point the drawing reaches in the spec frame, so the canvas can be cropped to it. */
export function extentX(diagram: ModuleDiagram, pins: Map<string, PinGeo>): number {
  let max = 0;
  for (const card of diagram.cards) max = Math.max(max, card.x + card.w + 12);
  for (const link of diagram.links) {
    if (link.kind !== 'tag') continue;
    const g = pins.get(link.from);
    if (g && g.dir[0] > 0) max = Math.max(max, g.tip[0] + (link.len ?? 62) + link.text.length * 6.6 + 24);
  }
  return Math.min(DIAGRAM_W, Math.ceil(max));
}
