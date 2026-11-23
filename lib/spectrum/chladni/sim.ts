import { createCpuPlate } from './cpu.ts';
import { createGpuPlate, type PlateSim, type PlateState } from './gpu.ts';

export type { PlateSim, PlateState };

/** GPU plate when WebGL 2 float targets exist, Canvas 2D otherwise. */
export function createPlate(canvas: HTMLCanvasElement, initial: PlateState): PlateSim {
  return createGpuPlate(canvas, initial) ?? createCpuPlate(canvas, initial);
}
