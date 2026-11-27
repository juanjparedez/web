import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', route => route.fulfill({ json: { user: null } }));
});

test('measurement hub uses the shared menu and links every kind of content', async ({ page }) => {
  await page.goto('/es/medicion');
  await expect(page.locator('[data-measurement-page="home"]')).toBeVisible();
  const nav = page.getByTestId('section-nav');
  await expect(nav).toHaveAttribute('data-section', 'medicion');
  await expect(nav.getByRole('link', { name: /Medición/ }).first()).toHaveAttribute('aria-current', 'page');
  await expect(page.getByTestId('hub-group-practice').getByRole('link')).toHaveCount(5);
  await page.getByTestId('hub-group-learn').getByRole('link', { name: /Medir con un multímetro/ }).click();
  await expect(page).toHaveURL('/es/medicion/multimetro');
  await expect(page.getByTestId('multimeter-lab')).toHaveCount(0);
  await page.getByTestId('multimeter-practice-link').click();
  await expect(page).toHaveURL('/es/medicion/instrumentos/multimetro');
  await page.getByTestId('section-nav').locator('summary').filter({ hasText: 'Consultar' }).click();
  await page.getByTestId('section-nav').getByRole('link', { name: /Qué mide cada instrumento/ }).click();
  await expect(page).toHaveURL('/es/medicion/instrumentos');
  await expect(page.getByTestId('instrument-reference')).toBeVisible();
  await page.getByTestId('section-nav').getByRole('link', { name: /Radioaficionado/ }).click();
  await expect(page).toHaveURL('/es/radio');
});

test('the multimeter trainer is driven by its drawn selector and jacks', async ({ page }) => {
  await page.goto('/es/medicion/instrumentos/multimetro');
  await expect(page.getByTestId('section-nav').locator('a[aria-current="page"]')).toContainText('Entrenador de multímetro');
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
  await expect(page.getByTestId('instrument-figure-multimeter')).toBeVisible();
});

test('old radio URLs for measurement redirect to the new section', async ({ page }) => {
  await page.goto('/es/radio/instrumentos');
  await expect(page).toHaveURL('/es/medicion/instrumentos');
  await page.goto('/es/radio/lecciones/measurement');
  await expect(page).toHaveURL('/es/medicion/multimetro');
  await page.goto('/es/radio');
  await expect(page.getByTestId('radio-lesson-list').locator('a[href="/es/radio/lecciones/measurement"]')).toHaveCount(0);
});
