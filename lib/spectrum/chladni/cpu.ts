import { beam, coefficients, MAX_INDEX, MODES, peakAmplitude } from './plate.ts';
import type { PlateSim, PlateState } from './gpu.ts';
import { DRIFT } from './shaders.ts';

export const CPU_GRID = 96;
export const CPU_GRAINS = 6000;

/** |u| on a CPU_GRID² lattice, normalised to the plate's peak; beam values come from a table. */
export function cpuField(state: PlateState, grid = CPU_GRID): Float32Array {
  const table: number[][] = [];
  for (let m = 0; m <= MAX_INDEX; m++) table.push(Array.from({ length: grid }, (_, i) => beam(m, (i + 0.5) / grid)));
  const coef = coefficients(state.frequency, state.drive);
  const peak = peakAmplitude(coef);
  const out = new Float32Array(grid * grid);
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      let re = 0, im = 0;
      MODES.forEach((mode, k) => {
        const { m, n, sign } = mode;
        const s = m === n ? table[m][i] * table[m][j] : (table[m][i] * table[n][j] + sign * table[n][i] * table[m][j]) * Math.SQRT1_2;
        re += coef[k][0] * s; im += coef[k][1] * s;
      });
      out[j * grid + i] = Math.hypot(re, im) / peak;
    }
  }
  return out;
}

/** One random-walk step per grain: step length ∝ local |u|; reflecting edges. */
export function stepGrains(pos: Float32Array, field: Float32Array, kick: number, grid = CPU_GRID) {
  for (let g = 0; g < pos.length; g += 2) {
    const i = Math.min(grid - 1, Math.floor(pos[g] * grid)), j = Math.min(grid - 1, Math.floor(pos[g + 1] * grid));
    const at = (x: number, y: number) => field[Math.min(grid - 1, Math.max(0, y)) * grid + Math.min(grid - 1, Math.max(0, x))];
    const a = at(i, j);
    const grad = [(at(i + 1, j) - at(i - 1, j)) * grid / 2, (at(i, j + 1) - at(i, j - 1)) * grid / 2];
    for (let d = 0; d < 2; d++) {
      let p = pos[g + d] + (Math.random() - 0.5) * kick * a - kick * DRIFT * a * grad[d];
      p = Math.abs(p); p = 1 - Math.abs(1 - p);
      pos[g + d] = Math.min(0.9995, Math.max(0.0005, p));
    }
  }
}

const scatterGrains = (pos: Float32Array) => { for (let i = 0; i < pos.length; i++) pos[i] = Math.random(); };

function paint(canvas: HTMLCanvasElement, heat: HTMLCanvasElement, pos: Float32Array, showField: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * ratio), h = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
  if (showField) { ctx.globalAlpha = 0.55; ctx.imageSmoothingEnabled = true; ctx.drawImage(heat, 0, 0, w, h); ctx.globalAlpha = 1; }
  ctx.fillStyle = 'rgba(237, 219, 178, 0.8)';
  const size = Math.max(1.5, (w / 420) * 1.6);
  for (let g = 0; g < pos.length; g += 2) ctx.fillRect(pos[g] * w - size / 2, (1 - pos[g + 1]) * h - size / 2, size, size);
}

function heatImage(heat: HTMLCanvasElement, field: Float32Array) {
  const img = new ImageData(CPU_GRID, CPU_GRID);
  for (let j = 0; j < CPU_GRID; j++) for (let i = 0; i < CPU_GRID; i++) {
    const s = Math.sqrt(field[j * CPU_GRID + i]), o = ((CPU_GRID - 1 - j) * CPU_GRID + i) * 4;
    img.data[o] = 255 * (0.9 * s + 0.1 * (1 - s)); img.data[o + 1] = 255 * 0.35 * s; img.data[o + 2] = 255 * (0.15 * s + 0.25 * (1 - s)); img.data[o + 3] = 255;
  }
  heat.getContext('2d')?.putImageData(img, 0, 0);
}

/** Canvas 2D fallback: same physics, coarser field, fewer grains. */
export function createCpuPlate(canvas: HTMLCanvasElement, initial: PlateState): PlateSim {
  const heat = document.createElement('canvas');
  heat.width = CPU_GRID; heat.height = CPU_GRID;
  const pos = new Float32Array(CPU_GRAINS * 2);
  scatterGrains(pos);
  let field = cpuField(initial), kick = 0.03 * initial.strength;
  heatImage(heat, field);
  return {
    mode: 'canvas',
    tune: (state) => { field = cpuField(state); kick = 0.03 * state.strength; heatImage(heat, field); },
    frame: (showField, steps) => { for (let i = 0; i < steps; i++) stepGrains(pos, field, kick); paint(canvas, heat, pos, showField); },
    render: (showField) => paint(canvas, heat, pos, showField),
    scatter: () => scatterGrains(pos),
    dispose: () => undefined,
  };
}
