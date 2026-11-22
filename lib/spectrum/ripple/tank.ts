import { createCpuTank } from './cpu.ts';
import { createGpuTank, type View } from './gpu.ts';
import { BARRIER_X, GRID_H, GRID_W, emitters, type RippleConfig } from './model.ts';

export interface Tank {
  mode: 'webgl' | 'canvas';
  /** advances the simulation; the GPU does more steps per frame than the CPU fallback */
  stepsPerFrame: number;
  steps: (count: number) => void;
  draw: (view: View) => void;
  drop: (x: number, y: number) => void;
  configure: (config: RippleConfig) => void;
  reset: () => void;
  dispose: () => void;
}

function shade(u: number, l: number, r: number, d: number, t: number): [number, number, number] {
  const hx = r - l, hy = t - d;
  const diff = Math.max(0, Math.min(1, 0.62 + 1.1 * (0.45 * hx - 0.55 * hy)));
  return [8 + 12 * diff + 20 * u, 26 + 90 * diff + 30 * u, 50 + 120 * diff + 30 * u];
}

/** Canvas 2D drawing of the CPU tank, same palette as the shader (without specular). */
function cpuDraw(canvas: HTMLCanvasElement, img: ImageData, buffer: HTMLCanvasElement, tank: ReturnType<typeof createCpuTank>,
  config: RippleConfig, view: View) {
  const { u, intensity } = tank;
  const e = view.theory ? emitters(config) : null;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const i = y * GRID_W + x, o = ((GRID_H - 1 - y) * GRID_W + x) * 4;
      let c: [number, number, number];
      if (view.intensity) { const v = Math.min(1, Math.sqrt(intensity[i]) * 1.35); c = [255 * v, 230 * v * v, 120 * v * v * v + 40 * v]; }
      else c = shade(u[i], u[i - 1] ?? 0, u[i + 1] ?? 0, u[i - GRID_W] ?? 0, u[i + GRID_W] ?? 0);
      if (e && x > (config.mode === 'double' ? BARRIER_X + 3 : 0)) {
        const dr = Math.abs(Math.hypot(x - e[0][0], y - e[0][1]) - Math.hypot(x - e[1][0], y - e[1][1])) / config.lambda;
        if (Math.abs((dr % 1) - 0.5) < 0.04 && (x + y) % 6 < 3) c = [255, 210, 80];
      }
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
    }
  }
  buffer.getContext('2d')!.putImageData(img, 0, 0);
  const ctx = canvas.getContext('2d')!;
  canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
}

function cpuTank(canvas: HTMLCanvasElement, initial: RippleConfig): Tank {
  const tank = createCpuTank(initial);
  const buffer = document.createElement('canvas');
  buffer.width = GRID_W; buffer.height = GRID_H;
  const img = new ImageData(GRID_W, GRID_H);
  let config = initial;
  return {
    mode: 'canvas', stepsPerFrame: 2,
    steps: (n) => { for (let i = 0; i < n; i++) tank.step(); },
    draw: (view) => cpuDraw(canvas, img, buffer, tank, config, view),
    drop: tank.drop,
    configure: (next) => { config = next; tank.configure(next); },
    reset: tank.reset,
    dispose: () => undefined,
  };
}

export function createTank(canvas: HTMLCanvasElement, initial: RippleConfig): Tank {
  const gpu = createGpuTank(canvas, initial);
  if (!gpu) return cpuTank(canvas, initial);
  return { mode: 'webgl', stepsPerFrame: 4, ...gpu };
}
