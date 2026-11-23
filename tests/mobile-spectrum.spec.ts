import { expect, test } from '@playwright/test';
import { inspectMobileLayout } from './helpers/mobile-layout';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user: null } }));
});

test('spectrum section fits the screen and the strip responds to touch', async ({ page }) => {
  await page.goto('/es/espectro');
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

  const tank = page.getByTestId('ripple-tank');
  await tank.scrollIntoViewIfNeeded();
  await expect(tank).not.toHaveAttribute('data-renderer', 'pending');
  await tank.getByRole('button', { name: 'Doble rendija' }).click();
  await expect(tank).toHaveAttribute('data-mode', 'double');
  const fiber = page.getByTestId('fiber-lab');
  await fiber.getByRole('slider').fill('70');
  await expect(fiber).toHaveAttribute('data-guided', 'false');

  await page.getByTestId('blackbody-lab').getByRole('button', { name: 'Brasa' }).click();
  await expect(page.getByTestId('blackbody-temperature')).toHaveText('1.000 K');
  expect(await page.evaluate(inspectMobileLayout)).toEqual([]);
});
