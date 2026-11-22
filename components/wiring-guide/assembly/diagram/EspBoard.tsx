import type { BoardPinout } from '@/config/pinouts/modules/breakout';
import { PIN_PITCH, pinY } from '@/lib/padWiring/diagram';

export const ESP_W = 172;

/**
 * The DevKitC-1 seen from above: antenna up, USB down, J1 on the left and J3 on the
 * right, every hole numbered from the antenna. `active` maps "J1-16" → wire colour.
 */
export function EspBoard({ board, x, active, antenna }: {
  board: BoardPinout; x: number; active: Map<string, string>; antenna: string;
}) {
  const last = Math.max(board.left.length, board.right.length);
  const bottom = pinY(last) + 26;
  const col = (side: 'left' | 'right') => board[side].map(pin => {
    const y = pinY(pin.pos);
    const id = `${board.headers[side]}-${pin.pos}`;
    const color = active.get(id);
    const padX = side === 'left' ? x + 9 : x + ESP_W - 9;
    const silk = pin.labels[0]?.text ?? '';
    const textX = side === 'left' ? x + 19 : x + ESP_W - 19;
    return <g key={id} className={color ? 'dgPinOn' : 'dgPinOff'}>
      {color ? <rect x={side === 'left' ? x + 2 : x + ESP_W - 66} y={y - 8} width={64} height={16} rx={8}
        style={{ fill: `color-mix(in srgb, ${color} 22%, transparent)` }} /> : null}
      <circle cx={padX} cy={y} r={4.6} className="dgPad" style={color ? { fill: color, stroke: color } : undefined} />
      <text x={textX} y={y + 3.5} textAnchor={side === 'left' ? 'start' : 'end'} className="dgSilk"
        style={color ? { fill: '#ffffff' } : undefined}>
        {side === 'left' ? <><tspan className="dgPos">{pin.pos}</tspan> {silk}</> : <>{silk} <tspan className="dgPos">{pin.pos}</tspan></>}
      </text>
    </g>;
  });
  return <g aria-hidden>
    <rect x={x} y={8} width={ESP_W} height={bottom - 8} rx={10} className="dgPcb" />
    <rect x={x + 62} y={14} width={48} height={22} rx={3} className="dgAntenna" />
    <path d={`M${x + 68},30 v-10 h6 v10 h6 v-10 h6 v10 h6 v-10 h6 v10`} className="dgAntennaTrace" />
    <text x={x + 86} y={46} textAnchor="middle" className="dgBoardText">{antenna}</text>
    <rect x={x + 66} y={56} width={40} height={PIN_PITCH * 9} rx={3} className="dgShield" />
    <text x={x + 86} y={56 + PIN_PITCH * 4.5} textAnchor="middle" className="dgBoardText"
      transform={`rotate(-90 ${x + 86} ${56 + PIN_PITCH * 4.5})`}>ESP32-S3</text>
    <text x={x + 24} y={30} className="dgHeader">{board.headers.left}</text>
    <text x={x + ESP_W - 24} y={30} textAnchor="end" className="dgHeader">{board.headers.right}</text>
    <rect x={x + 42} y={bottom - 8} width={30} height={14} rx={4} className="dgUsb" />
    <rect x={x + 100} y={bottom - 8} width={30} height={14} rx={4} className="dgUsb" />
    <text x={x + 86} y={bottom - 12} textAnchor="middle" className="dgBoardText">USB</text>
    {col('left')}
    {col('right')}
  </g>;
}
