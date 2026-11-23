import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', route => route.fulfill({ json: { user: null } }));
});

test('measurement is its own section with a drawn multimeter driven by its selector and jacks', async ({ page }) => {
  await page.goto('/es/medicion');
  await expect(page.locator('[data-measurement-page="multimetro"]')).toBeVisible();
  await expect(page.getByTestId('radio-sidebar')).toHaveCount(0);
  const dmm = page.getByTestId('multimeter-lab');
  const digits = dmm.getByTestId('multimeter-digits');
  await expect(digits).toHaveText('13,80');
  await dmm.getByRole('button', { name: /Borne mA/ }).click();
  await expect(dmm.getByRole('button', { name: /Borne mA/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(digits).toHaveText('FUSE');
  await dmm.getByRole('button', { name: /Borne V \/ Ω/ }).focus();
  await page.keyboard.press('Enter');
  await expect(digits).toHaveText('13,80');
  await dmm.getByRole('button', { name: /Selector en 10A/ }).click();
  await expect(dmm.getByRole('button', { name: /Selector en 10A/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(digits).not.toHaveText('13,80');

  await dmm.getByRole('button', { name: /Selector en V⎓/ }).click();
  await dmm.getByRole('button', { name: /Divisor de Alta Impedancia/ }).click();
  await expect(digits).toHaveText('4,00');
  await expect(dmm).toContainText('Efecto de carga del voltímetro');
  await expect(dmm).not.toContainText('Burden');
  await dmm.getByRole('button', { name: /En Serie/ }).click();
  await expect(dmm.getByTestId('multimeter-circuit')).toContainText('rama de R2 abierta');
  await expect(dmm.getByTestId('multimeter-diagnosis')).not.toContainText(/transceptor|13,8/);
  await dmm.getByRole('button', { name: /Circuito Energizado/ }).click();
  await dmm.getByRole('button', { name: /Selector en Ω/ }).click();
  await expect(digits).toHaveText('10,00');

  await page.getByRole('navigation', { name: 'Secciones de medición' }).getByRole('link', { name: /Banco de instrumentos/ }).click();
  await expect(page).toHaveURL('/es/medicion/instrumentos');
  await expect(page.getByTestId('instrument-figure-multimeter')).toBeVisible();
});

test('old radio URLs for measurement redirect to the new section', async ({ page }) => {
  await page.goto('/es/radio/instrumentos');
  await expect(page).toHaveURL('/es/medicion/instrumentos');
  await page.goto('/es/radio/lecciones/measurement');
  await expect(page).toHaveURL('/es/medicion');
  await page.goto('/es/radio');
  await expect(page.getByTestId('radio-lesson-list').locator('a[href="/es/radio/lecciones/measurement"]')).toHaveCount(0);
});
