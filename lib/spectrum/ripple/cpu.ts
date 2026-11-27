import { COURANT, GRID_H, GRID_W, driverFor, maskFor, sponge, type Driver, type RippleConfig } from './model.ts';

const C2 = COURANT * COURANT;

export interface CpuTank {
  u: Float32Array;
  intensity: Float32Array;
  step: () => void;
  drop: (x: number, y: number) => void;
  configure: (config: RippleConfig) => void;
  reset: () => void;
  time: () => number;
}

function precomputeSponge() {
  const s = new Float32Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) s[y * GRID_W + x] = 1 - sponge(x, y);
  return s;
}

function drive(u: Float32Array, driver: Driver, t: number) {
  const value = Math.sin(driver.omega * t);
  if (driver.line >= 0) for (let y = 0; y < GRID_H; y++) u[y * GRID_W + driver.line] = value;
  for (const [sx, sy] of driver.points) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy <= 4) u[Math.round(sy + dy) * GRID_W + Math.round(sx + dx)] = value;
    }
  }
}

/** Reference implementation of the ripple tank, also used when WebGL 2 is unavailable. */
export function createCpuTank(initial: RippleConfig): CpuTank {
  const n = GRID_W * GRID_H;
  let u = new Float32Array(n), prev = new Float32Array(n), next = new Float32Array(n);
  const intensity = new Float32Array(n);
  const damp = precomputeSponge();
  let mask = maskFor(initial), driver = driverFor(initial), t = 0;
  const tank: CpuTank = {
    u, intensity,
    step: () => {
      const avg = driver.omega / (2 * Math.PI) / 3;
      for (let y = 1; y < GRID_H - 1; y++) {
        for (let x = 1, i = y * GRID_W + 1; x < GRID_W - 1; x++, i++) {
          if (mask[i]) { next[i] = 0; continue; }
          const lap = u[i - 1] + u[i + 1] + u[i - GRID_W] + u[i + GRID_W] - 4 * u[i];
          next[i] = (2 * u[i] - prev[i] + C2 * lap) * damp[i];
          intensity[i] += (next[i] * next[i] - intensity[i]) * avg;
        }
      }
      [prev, u, next] = [u, next, prev];
      for (let i = 0; i < n; i++) prev[i] *= damp[i];
      t++;
      drive(u, driver, t);
      tank.u = u;
    },
    drop: (x, y) => {
      for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
        const i = Math.round(y + dy) * GRID_W + Math.round(x + dx);
        if (i >= 0 && i < n) u[i] += 1.6 * Math.exp(-(dx * dx + dy * dy) / 8);
      }
    },
    configure: (config) => { mask = maskFor(config); driver = driverFor(config); },
    reset: () => { u.fill(0); prev.fill(0); next.fill(0); intensity.fill(0); t = 0; },
    time: () => t,
  };
  return tank;
}
