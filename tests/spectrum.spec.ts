import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: null } }));
});

test('spectrum explorer converts the selected frequency into λ, photon energy and context', async ({ page }) => {
  await page.goto('/es/espectro');
  await expect(page.getByRole('heading', { level: 1, name: 'El espectro electromagnético' })).toBeVisible();
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
});

test('black-body lab follows Wien and the wave scene mounts', async ({ page }) => {
  await page.goto('/es/espectro');
  const lab = page.getByTestId('blackbody-lab');
  await lab.getByRole('button', { name: 'Cuerpo humano' }).click();
  await expect(lab.getByTestId('blackbody-temperature')).toHaveText('310 K');
  await expect(lab).toContainText('9,35 µm');
  await expect(lab).toContainText('no emite luz visible apreciable');
  await lab.getByRole('button', { name: 'Sol', exact: true }).click();
  await expect(lab).toContainText('502 nm');
  await expect(page.getByTestId('spectrum-wave')).not.toHaveAttribute('data-renderer', 'pending');
  await page.getByRole('group', { name: 'Polarización' }).getByRole('button', { name: 'Circular' }).click();
  await expect(page.getByRole('group', { name: 'Polarización' }).getByRole('button', { name: 'Circular' }))
    .toHaveAttribute('aria-pressed', 'true');
});

test('without WebGL every instrument falls back and keeps working', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest);
    } as typeof original;
  });
  await page.goto('/es/espectro');
  await expect(page.getByTestId('spectrum-strip')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.getByTestId('blackbody-lab')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.getByTestId('spectrum-wave')).toHaveAttribute('data-renderer', 'svg');
  await expect(page.getByText('Tu navegador no ofrece WebGL:', { exact: false }).first()).toBeVisible();
  await expect(page.getByTestId('ripple-tank')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.getByTestId('fiber-lab')).toHaveAttribute('data-renderer', 'canvas');
  await page.getByRole('group', { name: 'Fuentes reales' }).getByRole('button', { name: 'Radio FM' }).click();
  await expect(page.getByTestId('spectrum-readout')).toContainText('100 MHz');
});

test('ripple tank and fibre follow the theory they display', async ({ page }) => {
  await page.goto('/es/espectro');
  const tank = page.getByTestId('ripple-tank');
  await tank.scrollIntoViewIfNeeded();
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
