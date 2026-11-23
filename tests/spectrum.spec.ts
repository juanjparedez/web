import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: null } }));
});

const menu = (page: Page) => page.getByRole('navigation', { name: 'Secciones del espectro' });

/** Counts animation frames and every WebGL context the page creates, so tests can prove teardown. */
function probe() {
  const w = window as unknown as { __raf: number; __gl: WebGLRenderingContext[] };
  w.__raf = 0; w.__gl = [];
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((t) => { w.__raf++; cb(t); });
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    const ctx = (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest);
    if (ctx && type.startsWith('webgl') && !w.__gl.includes(ctx as WebGLRenderingContext)) w.__gl.push(ctx as WebGLRenderingContext);
    return ctx;
  } as typeof original;
}

async function activity(page: Page) {
  const before = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
  await page.waitForTimeout(1000);
  return page.evaluate((r0) => {
    const w = window as unknown as { __raf: number; __gl: WebGLRenderingContext[] };
    return { frames: w.__raf - r0, liveContexts: w.__gl.filter((g) => !g.isContextLost()).length };
  }, before);
}

test('the index runs nothing and links one page per simulator', async ({ page }) => {
  await page.addInitScript(probe);
  await page.goto('/es/espectro');
  await expect(page.getByRole('heading', { level: 1, name: 'El espectro electromagnético' })).toBeVisible();
  await expect(page.locator('main canvas')).toHaveCount(0);
  for (const slug of ['explorador', 'onda', 'cubeta', 'chladni', 'fibra', 'cuerpo-negro']) {
    await expect(page.locator(`main a[href="/es/espectro/${slug}"]`).first()).toBeVisible();
  }
  expect(await activity(page)).toEqual({ frames: 0, liveContexts: 0 });
});

test('leaving a simulator frees its GPU context and stops its animation loop', async ({ page }) => {
  await page.addInitScript(probe);
  await page.goto('/es/espectro/chladni');
  await expect(page.getByTestId('chladni-plate')).toHaveAttribute('data-running', 'true');
  const running = await activity(page);
  expect(running.frames).toBeGreaterThan(5);
  for (const [name, slug] of [['Cubeta de ondas', 'cubeta'], ['Onda en 3D', 'onda'], ['Espectro', 'explorador']] as const) {
    await menu(page).getByRole('link', { name }).click();
    await page.waitForURL(`**/es/espectro/${slug}`);
    await expect(page.locator('main canvas')).toHaveCount(1);
    await expect(page.locator('[data-renderer="pending"]')).toHaveCount(0);
  }
  await menu(page).getByRole('link', { name: 'Índice' }).click();
  await page.waitForURL('**/es/espectro');
  await expect(page.locator('main canvas')).toHaveCount(0);
  // Same document (client navigation): every context created on the way must be lost, and nothing animates.
  expect(await page.evaluate(() => (window as unknown as { __gl: unknown[] }).__gl.length)).toBeGreaterThan(3);
  expect(await activity(page)).toEqual({ frames: 0, liveContexts: 0 });
});

test('spectrum explorer converts the selected frequency into λ, photon energy and context', async ({ page }) => {
  await page.goto('/es/espectro/explorador');
  await expect(menu(page).getByRole('link', { name: 'Espectro' })).toHaveAttribute('aria-current', 'page');
  const strip = page.getByTestId('spectrum-strip');
  await expect(strip).not.toHaveAttribute('data-renderer', 'pending');
  const readout = page.getByTestId('spectrum-readout');
  await expect(readout).toHaveAttribute('data-band', 'visible');

  await page.getByRole('group', { name: 'Fuentes reales' }).getByRole('button', { name: 'Hidrógeno 21 cm' }).click();
  await expect(readout).toHaveAttribute('data-band', 'micro');
  await expect(readout).toContainText('1,42 GHz');
  await expect(readout).toContainText('21,1 cm');
  await expect(readout).toContainText('Transición hiperfina');

  await page.getByRole('group', { name: 'Ir a una banda' }).getByRole('button', { name: 'Rayos gamma' }).click();
  await expect(readout).toHaveAttribute('data-band', 'gamma');
  await expect(readout.getByText('Ionizante', { exact: true })).toBeVisible();

  const slider = page.getByRole('slider', { name: 'Frecuencia seleccionada en el espectro' });
  const before = Number(await slider.getAttribute('aria-valuenow'));
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  expect(Number(await slider.getAttribute('aria-valuenow'))).toBeLessThan(before);

  await page.getByRole('button', { name: 'Todo el espectro' }).click();
  await expect(page.getByRole('button', { name: 'Todo el espectro' })).toBeDisabled();

  await page.getByRole('group', { name: 'Fuentes reales' }).getByRole('button', { name: 'Radio FM' }).click();
  await page.getByRole('link', { name: 'Ver esta onda en 3D →' }).click();
  await page.waitForURL('**/es/espectro/onda?f=*');
  await expect(page.getByTestId('wave-frequency')).toHaveText('100 MHz');
});

test('black-body lab follows Wien and the wave scene mounts', async ({ page }) => {
  await page.goto('/es/espectro/cuerpo-negro');
  const lab = page.getByTestId('blackbody-lab');
  await lab.getByRole('button', { name: 'Cuerpo humano' }).click();
  await expect(lab.getByTestId('blackbody-temperature')).toHaveText('310 K');
  await expect(lab).toContainText('9,35 µm');
  await expect(lab).toContainText('no emite luz visible apreciable');
  await lab.getByRole('button', { name: 'Sol', exact: true }).click();
  await expect(lab).toContainText('502 nm');
  await page.getByRole('navigation', { name: 'Anterior y siguiente' }).getByRole('link', { name: /Fibra óptica/ }).click();
  await page.waitForURL('**/es/espectro/fibra');

  await page.goto('/es/espectro/onda');
  await expect(page.getByTestId('spectrum-wave')).not.toHaveAttribute('data-renderer', 'pending');
  await expect(page.getByTestId('wave-frequency')).toContainText('THz'); // starts on sunlight, not at 1 Hz
  await page.getByRole('group', { name: 'Polarización' }).getByRole('button', { name: 'Circular' }).click();
  await expect(page.getByRole('group', { name: 'Polarización' }).getByRole('button', { name: 'Circular' }))
    .toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Ir a una banda' }).getByRole('button', { name: 'Rayos X' }).click();
  await expect(page.getByRole('group', { name: 'Ir a una banda' }).getByRole('button', { name: 'Rayos X' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('wave-frequency')).toContainText('PHz');
});

test('without WebGL every instrument falls back and keeps working', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest);
    } as typeof original;
  });
  await page.goto('/es/espectro/explorador');
  await expect(page.getByTestId('spectrum-strip')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.getByText('Tu navegador no ofrece WebGL:', { exact: false }).first()).toBeVisible();
  await page.getByRole('group', { name: 'Fuentes reales' }).getByRole('button', { name: 'Radio FM' }).click();
  await expect(page.getByTestId('spectrum-readout')).toContainText('100 MHz');
  for (const [name, id, mode] of [['Onda en 3D', 'spectrum-wave', 'svg'], ['Cubeta de ondas', 'ripple-tank', 'canvas'],
    ['Placa de Chladni', 'chladni-plate', 'canvas'], ['Fibra óptica', 'fiber-lab', 'canvas'], ['Cuerpo negro', 'blackbody-lab', 'canvas']] as const) {
    await menu(page).getByRole('link', { name }).click();
    await expect(page.getByTestId(id)).toHaveAttribute('data-renderer', mode);
  }
});

test('ripple tank and fibre follow the theory they display', async ({ page }) => {
  await page.goto('/es/espectro/cubeta');
  const tank = page.getByTestId('ripple-tank');
  await expect(tank).toHaveAttribute('data-renderer', /webgl|canvas/);
  await expect(page.getByTestId('ripple-theory')).toContainText('θ₁ = 19,5°');
  await tank.getByRole('button', { name: 'Doble rendija' }).click();
  await expect(tank).toHaveAttribute('data-mode', 'double');
  await tank.getByRole('button', { name: 'Una rendija' }).click();
  await expect(page.getByTestId('ripple-theory')).toContainText('Primer mínimo');
  await tank.getByRole('button', { name: 'Intensidad media' }).click();
  await expect(tank.getByRole('button', { name: 'Intensidad media' })).toHaveAttribute('aria-pressed', 'true');
  const box = (await tank.locator('canvas').boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.5);

  await page.goto('/es/espectro/fibra');
  const fiber = page.getByTestId('fiber-lab');
  await fiber.getByRole('button', { name: 'Vidrio multimodo' }).click();
  const angle = fiber.getByRole('slider');
  await angle.fill('10');
  await expect(fiber).toHaveAttribute('data-guided', 'true');
  await expect(fiber).toContainText('0,242');
  await angle.fill('25');
  await expect(fiber).toHaveAttribute('data-guided', 'false');
  await expect(fiber).toContainText('la luz se fuga');
});

test('Chladni plate walks the resonances and pauses off screen, on hidden tabs and on request', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/es/espectro/chladni');
  const plate = page.getByTestId('chladni-plate');
  await expect(plate).toHaveAttribute('data-renderer', /webgl|canvas/);
  await expect(plate).toHaveAttribute('data-mode', '(2,2)');
  await expect(plate).toHaveAttribute('data-resonant', 'true');
  await expect(plate).toHaveAttribute('data-running', 'true');
  await plate.getByRole('button', { name: 'Siguiente resonancia →' }).click();
  await expect(plate).toHaveAttribute('data-mode', '(0,4)+');
  await expect(page.getByTestId('chladni-frequency')).toHaveText('528 Hz');
  await plate.getByRole('button', { name: '← Resonancia anterior' }).click();
  await plate.getByRole('button', { name: '← Resonancia anterior' }).click();
  await expect(plate).toHaveAttribute('data-mode', '(0,2)+');
  await expect(plate.getByRole('button', { name: '← Resonancia anterior' })).toBeDisabled();
  await plate.getByRole('button', { name: 'Fuera de centro' }).click();
  await expect(plate.getByRole('button', { name: '← Resonancia anterior' })).toBeEnabled();
  await plate.getByRole('slider').fill('2.3');
  await expect(plate).toHaveAttribute('data-resonant', 'false');
  await expect(page.getByTestId('chladni-note')).toContainText('Entre resonancias');

  await plate.getByRole('button', { name: 'Pausar' }).click();
  await expect(plate).toHaveAttribute('data-running', 'false');
  await plate.getByRole('button', { name: 'Reanudar' }).click();
  await expect(plate).toHaveAttribute('data-running', 'true');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(plate).toHaveAttribute('data-running', 'false');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(plate).toHaveAttribute('data-running', 'true');
  // Scroll the plate out of view (a spacer guarantees there is room to scroll on any viewport).
  await page.evaluate(() => { const s = document.createElement('div'); s.style.height = '3000px'; document.body.append(s); window.scrollTo(0, document.body.scrollHeight); });
  await expect(plate).toHaveAttribute('data-running', 'false');
});
