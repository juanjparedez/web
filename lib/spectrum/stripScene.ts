import { transmittance } from './atmosphere.ts';
import { bandAt } from './bands.ts';
import { cssColor, spectralLinear, toSrgb, type Rgb } from './color.ts';
import { createQuad } from './glQuad.ts';
import { STRIP_FRAGMENT } from './stripShader.ts';

export const STRIP_SPLIT = 0.36;

export interface StripState {
  range: readonly [number, number];
  selected: number;
  time: number;
}

export interface StripRenderer {
  mode: 'webgl' | 'canvas';
  render: (state: StripState) => void;
  dispose: () => void;
}

function atmosphereLut(size = 1024): Uint8Array {
  const lut = new Uint8Array(size);
  for (let i = 0; i < size; i++) lut[i] = Math.round(transmittance((i / (size - 1)) * 26) * 255);
  return lut;
}

function columnColor(lf: number): Rgb {
  const band = bandAt(lf);
  if (band.id === 'visible') return toSrgb(spectralLinear(10 ** (17.47682 - lf)), 0.95);
  return band.tint.map((c) => c * 0.42) as Rgb;
}

/** Same picture, drawn on the CPU: used when WebGL is not available. Static (no animation). */
function createCanvasStrip(canvas: HTMLCanvasElement): StripRenderer {
  const ctx = canvas.getContext('2d');
  const render = ({ range, selected }: StripState) => {
    if (!ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = Math.round(canvas.clientWidth * ratio));
    const h = (canvas.height = Math.round(canvas.clientHeight * ratio));
    const split = h * (1 - STRIP_SPLIT);
    ctx.fillStyle = '#080b12';
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x++) {
      const lf = range[0] + ((range[1] - range[0]) * x) / w;
      ctx.fillStyle = cssColor(columnColor(lf));
      ctx.fillRect(x, 0, 1, split - 1);
      const t = transmittance(lf) * 0.86 + 0.04;
      ctx.fillRect(x, h - t * (h - split), 1, t * (h - split));
    }
    const sx = ((selected - range[0]) / (range[1] - range[0])) * w;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - ratio, 0, 2 * ratio, h);
  };
  return { mode: 'canvas', render, dispose: () => undefined };
}

export function createStrip(canvas: HTMLCanvasElement): StripRenderer {
  const quad = createQuad(canvas, STRIP_FRAGMENT);
  if (!quad) return createCanvasStrip(canvas);
  quad.lut('uAtm', 0, atmosphereLut());
  quad.uniform('uSplit', STRIP_SPLIT);
  return {
    mode: 'webgl',
    render: ({ range, selected, time }) => {
      quad.resize();
      quad.uniform('uRes', [canvas.width, canvas.height]);
      quad.uniform('uRange', range);
      quad.uniform('uSel', selected);
      quad.uniform('uTime', time);
      quad.draw();
    },
    dispose: quad.dispose,
  };
}
