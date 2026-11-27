import type { PartArt } from '@/lib/padWiring/diagram';

/** The recognisable bit of each part, drawn inside its free area (x, y, w, h). */
export function Art({ art, x, y, w, h, flip }: { art: PartArt; x: number; y: number; w: number; h: number; flip: boolean }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  switch (art) {
    case 'tft': return <g>
      <rect x={x} y={y} width={w} height={h} rx={4} className="dgGlass" />
      <rect x={x + 10} y={y + 10} width={w * 0.42} height={8} rx={2} className="dgGlassUi" />
      <rect x={x + 10} y={y + 26} width={w * 0.28} height={6} rx={2} className="dgGlassUi" />
      {[0, 1, 2].map(i => <rect key={i} x={x + 10 + i * (w - 20) / 3} y={y + h - 40} width={(w - 20) / 3 - 8} height={28} rx={4} className="dgGlassUi" />)}
      <text x={cx} y={cy + 4} textAnchor="middle" className="dgArtText">ILI9488 · 4&quot; · 480×320</text>
    </g>;
    case 'button': return <g>
      <line x1={x - 2} y1={cy} x2={x + w + 2} y2={cy} className="dgLeg" />
      <rect x={cx - 22} y={cy - 22} width={44} height={44} rx={5} className="dgPartDark" />
      <circle cx={cx} cy={cy} r={14} className="dgCap" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={cx + dx * 16} cy={cy + dy * 16} r={2} className="dgScrew" />)}
    </g>;
    case 'ky040': return <g>
      <rect x={cx - Math.min(30, h / 2 - 2)} y={cy - Math.min(30, h / 2 - 2)} width={Math.min(60, h - 4)} height={Math.min(60, h - 4)} rx={6} className="dgPartMetal" />
      <circle cx={cx} cy={cy} r={20} className="dgKnob" />
      <path d={`M${cx - 9},${cy - 6} h18 v12 h-18 z`} className="dgShaft" />
      {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={cx + Math.cos(a) * 16} y1={cy + Math.sin(a) * 16} x2={cx + Math.cos(a) * 20} y2={cy + Math.sin(a) * 20} className="dgRidge" />; })}
    </g>;
    case 'hw504': {
      const r = Math.min(38, h / 2 - 2);
      return <g>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={8} className="dgPartDark" />
        <circle cx={cx} cy={cy} r={r * 0.79} className="dgPartMetal" />
        <circle cx={cx} cy={cy} r={r * 0.5} className="dgKnob" />
        <circle cx={cx} cy={cy} r={r * 0.29} className="dgCapTop" />
      </g>;
    }
    case 'max98357': {
      const tx = flip ? x : x + w - 26;
      return <g>
        <rect x={x + 6} y={cy - 18} width={36} height={36} rx={3} className="dgChip" />
        <text x={x + 24} y={cy + 3} textAnchor="middle" className="dgChipText">98357</text>
        <rect x={tx} y={y + 6} width={26} height={h - 12} rx={3} className="dgTerminal" />
        {[0.3, 0.7].map(f => <circle key={f} cx={tx + 13} cy={y + 6 + (h - 12) * f} r={6} className="dgScrew" />)}
      </g>;
    }
    case 'neopixel4': return <g>
      {[0, 1, 2, 3].map(i => {
        const lx = x + 6 + i * ((w - 12) / 4);
        return <g key={i}>
          <rect x={lx} y={cy - 12} width={(w - 12) / 4 - 6} height={24} rx={3} className="dgLed" />
          <circle cx={lx + ((w - 12) / 4 - 6) / 2} cy={cy} r={5} className={`dgLedDot dgLed${i}`} />
        </g>;
      })}
    </g>;
    case 'speaker': return <g>
      <circle cx={cx} cy={cy} r={Math.min(w, h) / 2 - 4} className="dgPartDark" />
      <circle cx={cx} cy={cy} r={Math.min(w, h) / 2 - 12} className="dgCone" />
      <circle cx={cx} cy={cy} r={8} className="dgPartDark" />
    </g>;
    case 'cells': return <g>
      {[0, 1].map(i => <g key={i}>
        <rect x={x + 6} y={y + 8 + i * (h / 2)} width={w - 18} height={h / 2 - 16} rx={8} className="dgCell" />
        <rect x={x + w - 14} y={y + 8 + i * (h / 2) + (h / 2 - 16) / 2 - 5} width={6} height={10} rx={2} className="dgPartMetal" />
        <text x={x + (w - 12) / 2} y={y + 8 + i * (h / 2) + (h / 2 - 16) / 2 + 4} textAnchor="middle" className="dgArtText">18650</text>
      </g>)}
    </g>;
    case 'charger': return <g>
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={4} className="dgPartDark" />
      <rect x={cx - 12} y={y + 2} width={24} height={10} rx={3} className="dgUsb" />
      <text x={cx} y={cy + 6} textAnchor="middle" className="dgArtText">2S</text>
    </g>;
    case 'buck': return <g>
      <rect x={cx - 22} y={cy - 22} width={44} height={44} rx={6} className="dgPartDark" />
      <circle cx={cx} cy={cy} r={14} className="dgCoil" />
      <circle cx={cx} cy={cy} r={6} className="dgPartDark" />
    </g>;
    case 'switch': return <g>
      <line x1={x - 2} y1={cy} x2={x + w + 2} y2={cy} className="dgLeg" />
      <rect x={cx - 14} y={cy - 8} width={28} height={16} rx={3} className="dgPartDark" />
      <rect x={cx - 3} y={cy - 16} width={6} height={12} rx={2} className="dgPartMetal" transform={`rotate(20 ${cx} ${cy - 4})`} />
    </g>;
    default: return null;
  }
}
