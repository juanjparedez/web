import { expect, test } from '@playwright/test';
import { inspectMobileLayout } from './helpers/mobile-layout';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: null } }));
});

test('spectrum pages fit the screen and the strip responds to touch', async ({ page }) => {
  await page.goto('/es/espectro');
  await expect(page.getByRole('heading', { level: 1, name: 'El espectro electromagnético' })).toBeVisible();
  expect(await page.evaluate(inspectMobileLayout)).toEqual([]);

  await page.goto('/es/espectro/explorador');
  const strip = page.getByTestId('spectrum-strip');
  await expect(strip).not.toHaveAttribute('data-renderer', 'pending');
  await page.waitForTimeout(500);
  expect(await page.evaluate(inspectMobileLayout)).toEqual([]);
  const width = page.viewportSize()!.width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);

  const canvas = page.getByRole('slider', { name: 'Frecuencia seleccionada en el espectro' });
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await expect(page.getByTestId('spectrum-readout')).toHaveAttribute('data-band', 'radio');
  await page.touchscreen.tap(box.x + box.width * 0.9, box.y + box.height * 0.3);
  await expect(page.getByTestId('spectrum-readout')).toHaveAttribute('data-band', 'gamma');
});

test('each simulator page fits the screen', async ({ page }) => {
  const width = page.viewportSize()!.width;
  const check = async () => {
    await page.waitForTimeout(300);
    expect(await page.evaluate(inspectMobileLayout)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  };
  await page.goto('/es/espectro/cubeta');
  const tank = page.getByTestId('ripple-tank');
  await expect(tank).not.toHaveAttribute('data-renderer', 'pending');
  await tank.getByRole('button', { name: 'Doble rendija' }).click();
  await expect(tank).toHaveAttribute('data-mode', 'double');
  await check();

  await page.goto('/es/espectro/chladni');
  const plate = page.getByTestId('chladni-plate');
  await expect(plate).not.toHaveAttribute('data-renderer', 'pending');
  await plate.getByRole('button', { name: 'Siguiente resonancia →' }).click();
  await expect(plate).toHaveAttribute('data-mode', '(0,4)+');
  await check();

  await page.goto('/es/espectro/fibra');
  const fiber = page.getByTestId('fiber-lab');
  await fiber.getByRole('slider').fill('70');
  await expect(fiber).toHaveAttribute('data-guided', 'false');
  await check();

  await page.goto('/es/espectro/cuerpo-negro');
  await page.getByTestId('blackbody-lab').getByRole('button', { name: 'Brasa' }).click();
  await expect(page.getByTestId('blackbody-temperature')).toHaveText('1.000 K');
  await check();

  await page.goto('/es/espectro/onda');
  await expect(page.getByTestId('spectrum-wave')).not.toHaveAttribute('data-renderer', 'pending');
  await check();
});
