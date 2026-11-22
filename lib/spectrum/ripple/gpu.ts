import { GRID_H, GRID_W, driverFor, emitters, maskFor, BARRIER_X, type Driver, type RippleConfig } from './model.ts';
import { RENDER, STEP, VERTEX } from './shaders.ts';

export interface View { intensity: boolean; theory: boolean }

export interface GpuTank {
  steps: (count: number) => void;
  draw: (view: View) => void;
  drop: (x: number, y: number) => void;
  configure: (config: RippleConfig) => void;
  reset: () => void;
  dispose: () => void;
}

type GL = WebGL2RenderingContext;

function program(gl: GL, fragment: string) {
  const make = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader');
    return sh;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, VERTEX)); gl.attachShader(p, make(gl.FRAGMENT_SHADER, fragment));
  gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  const loc = new Map<string, WebGLUniformLocation | null>();
  const at = (n: string) => { if (!loc.has(n)) loc.set(n, gl.getUniformLocation(p, n)); return loc.get(n) ?? null; };
  return { p, at };
}

function stateTarget(gl: GL) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, GRID_W, GRID_H, 0, gl.RGBA, gl.FLOAT, null);
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('float framebuffer');
  return { tex, fb };
}

function uploadMask(gl: GL, tex: WebGLTexture, mask: Uint8Array) {
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, GRID_W, GRID_H, 0, gl.RED, gl.UNSIGNED_BYTE, mask.map((v) => v * 255));
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
}

/** WebGL 2 ripple tank with float render targets. Returns null when the GPU can't do it. */
export function createGpuTank(canvas: HTMLCanvasElement, initial: RippleConfig): GpuTank | null {
  // Probe on a throwaway canvas so a failure leaves the real one free for the 2D fallback.
  const probe = document.createElement('canvas').getContext('webgl2');
  const ok = !!probe?.getExtension('EXT_color_buffer_float');
  probe?.getExtension('WEBGL_lose_context')?.loseContext();
  if (!ok) return null;
  const gl = canvas.getContext('webgl2', { antialias: false });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;
  try { return buildTank(gl, canvas, initial); } catch (error) { console.warn('[ripple]', error); return null; }
}

function buildTank(gl: GL, canvas: HTMLCanvasElement, initial: RippleConfig): GpuTank {
  const step = program(gl, STEP), render = program(gl, RENDER);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  let targets = [stateTarget(gl), stateTarget(gl)];
  const maskTex = gl.createTexture()!;
  let config = initial, driver: Driver = driverFor(config), t = 0, drop: [number, number] | null = null;
  uploadMask(gl, maskTex, maskFor(config));
  const bindState = (prog: ReturnType<typeof program>, tex: WebGLTexture) => {
    gl.useProgram(prog.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(prog.at('uState'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, maskTex); gl.uniform1i(prog.at('uMask'), 1);
  };
  const once = () => {
    const [src, dst] = targets;
    bindState(step, src.tex);
    t++;
    const pts = driver.points;
    gl.uniform3f(step.at('uSrc0'), pts[0]?.[0] ?? 0, pts[0]?.[1] ?? 0, pts[0] ? 1 : 0);
    gl.uniform3f(step.at('uSrc1'), pts[1]?.[0] ?? 0, pts[1]?.[1] ?? 0, pts[1] ? 1 : 0);
    gl.uniform1f(step.at('uLine'), driver.line);
    gl.uniform1f(step.at('uDrive'), Math.sin(driver.omega * t));
    gl.uniform1f(step.at('uAvg'), driver.omega / (2 * Math.PI) / 3);
    gl.uniform4f(step.at('uDrop'), drop?.[0] ?? 0, drop?.[1] ?? 0, drop ? 1.6 : 0, 0);
    drop = null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
    gl.viewport(0, 0, GRID_W, GRID_H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    targets = [dst, src];
  };
  return {
    steps: (count) => { for (let i = 0; i < count; i++) once(); },
    draw: ({ intensity, theory }) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * ratio), h = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      bindState(render, targets[0].tex);
      const e = emitters(config);
      gl.uniform1f(render.at('uView'), intensity ? 1 : 0);
      gl.uniform1f(render.at('uTheory'), theory ? 1 : 0);
      gl.uniform1f(render.at('uLambda'), config.lambda);
      gl.uniform1f(render.at('uBarrier'), config.mode === 'double' ? BARRIER_X + 3 : 0);
      gl.uniform4f(render.at('uEmit'), e?.[0][0] ?? -1, e?.[0][1] ?? 0, e?.[1][0] ?? 0, e?.[1][1] ?? 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    drop: (x, y) => { drop = [x, y]; },
    configure: (next) => { config = next; driver = driverFor(next); uploadMask(gl, maskTex, maskFor(next)); },
    reset: () => {
      for (const { fb } of targets) { gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
      t = 0;
    },
    dispose: () => { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
