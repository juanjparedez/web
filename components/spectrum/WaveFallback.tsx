/** Static oblique drawing of the same wave, for browsers without WebGL. */
const N = 120;
const project = (x: number, y: number, z: number) => [200 + z * 52 - x * 28, 120 - y * 52 + x * 14] as const;

function path(axis: 'e' | 'b') {
  return Array.from({ length: N + 1 }, (_, i) => {
    const z = -3 + (6 * i) / N;
    const s = 0.95 * Math.sin(Math.PI * z);
    const [px, py] = axis === 'e' ? project(0, s, z) : project(-s, 0, z);
    return `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join(' ');
}

export function WaveFallback() {
  const [x0, y0] = project(0, 0, -3.3);
  const [x1, y1] = project(0, 0, 3.5);
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label="Onda electromagnética: E vertical, B horizontal, en fase"
      style={{ width: '100%', height: '100%', display: 'block', background: '#05070d' }}>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#cfd8e6" strokeOpacity="0.6" />
      <path d={path('b')} fill="none" stroke="#4cc3ff" strokeWidth="2.4" />
      <path d={path('e')} fill="none" stroke="#ff7a45" strokeWidth="2.4" />
    </svg>
  );
}
