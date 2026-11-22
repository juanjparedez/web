import type { ReactNode } from 'react';
import type { PartArt } from '@/lib/padWiring/diagram';
import { Art } from './Art';

/** A part in the overview: its drawing, the module step it belongs to and the GPIOs it uses. */
export function OverviewCard({ x, y, w, h, title, art, step, gpios, ghost, onOpen, children }: {
  x: number; y: number; w: number; h: number; title: string; art?: PartArt; step?: number;
  gpios?: string; ghost?: boolean; onOpen?: () => void; children?: ReactNode;
}) {
  const artH = h - (gpios ? 40 : 26);
  return <g className={`ovCard${onOpen ? ' ovLink' : ''}${ghost ? ' dgGhost' : ''}`} onClick={onOpen}
    role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined}
    onKeyDown={onOpen ? event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(); } } : undefined}>
    <rect x={x} y={y} width={w} height={h} rx={9} className="dgBoard" />
    {step ? <g>
      <circle cx={x + 13} cy={y + 13} r={9} className="ovStep" />
      <text x={x + 13} y={y + 16.5} textAnchor="middle" className="ovStepText">{step}</text>
    </g> : null}
    <text x={x + (step ? 28 : 10)} y={y + 17} className="dgCardTitle">{title}</text>
    {art ? <Art art={art} x={x + 8} y={y + 24} w={w - 16} h={artH} flip={false} /> : null}
    {children}
    {gpios ? <text x={x + w / 2} y={y + h - 9} textAnchor="middle" className="ovGpio">{gpios}</text> : null}
  </g>;
}

/** Ground symbol: every ⏚ is the same single common ground. */
export function Ground({ x, y }: { x: number; y: number }) {
  return <g className="ovGnd">
    <line x1={x} y1={y} x2={x} y2={y + 6} />
    <line x1={x - 8} y1={y + 6} x2={x + 8} y2={y + 6} />
    <line x1={x - 5} y1={y + 10} x2={x + 5} y2={y + 10} />
    <line x1={x - 2} y1={y + 14} x2={x + 2} y2={y + 14} />
  </g>;
}

/** A power wire with a dot where it joins a rail. */
export function Feed({ d, color, dot }: { d: string; color: string; dot?: [number, number] }) {
  return <g>
    <path d={d} className="dgHalo" />
    <path d={d} stroke={color} className="dgTrace" />
    {dot ? <circle cx={dot[0]} cy={dot[1]} r={3.6} fill={color} /> : null}
  </g>;
}
