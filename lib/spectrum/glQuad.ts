/**
 * Minimal full-screen fragment-shader renderer on WebGL 1 (GLSL ES 1.00 runs everywhere,
 * including old phones). Returns null when the browser has no WebGL so the caller can draw
 * its Canvas 2D fallback.
 */
type UniformValue = number | readonly number[];

export interface Quad {
  canvas: HTMLCanvasElement;
  uniform: (name: string, value: UniformValue) => void;
  lut: (name: string, unit: number, values: Uint8Array) => void;
  draw: () => void;
  /** Syncs the drawing buffer to the CSS size; returns the pixel ratio used. */
  resize: () => number;
  dispose: () => void;
}

const VERTEX = `attribute vec2 p; varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
  }
  return shader;
}

function link(gl: WebGLRenderingContext, fragment: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, `precision highp float;\nvarying vec2 vUv;\n${fragment}`));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return program;
}

function setUniform(gl: WebGLRenderingContext, location: WebGLUniformLocation | null, value: UniformValue) {
  if (!location) return;
  if (typeof value === 'number') gl.uniform1f(location, value);
  else if (value.length === 2) gl.uniform2f(location, value[0], value[1]);
  else if (value.length === 3) gl.uniform3f(location, value[0], value[1], value[2]);
  else gl.uniform4f(location, value[0], value[1], value[2], value[3]);
}

function uploadLut(gl: WebGLRenderingContext, unit: number, values: Uint8Array) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, values.length, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, values);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

export function createQuad(canvas: HTMLCanvasElement, fragment: string): Quad | null {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  let program: WebGLProgram;
  try { program = link(gl, fragment); } catch (error) { console.warn('[spectrum] shader', error); return null; }
  const locations = new Map<string, WebGLUniformLocation | null>();
  const at = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name) ?? null;
  };
  return {
    canvas,
    uniform: (name, value) => setUniform(gl, at(name), value),
    lut: (name, unit, values) => { uploadLut(gl, unit, values); gl.uniform1i(at(name), unit); },
    draw: () => { gl.viewport(0, 0, canvas.width, canvas.height); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); },
    resize: () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const h = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      return ratio;
    },
    dispose: () => { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
