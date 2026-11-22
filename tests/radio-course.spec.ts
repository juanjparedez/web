import { expect, test } from '@playwright/test';
import es from '../messages/es.json';

const COURSE = '/es/radio';
const LESSON_BASE = `${COURSE}/lecciones`;
const LESSONS = ['voltage', 'current', 'resistance', 'ohm', 'series', 'parallel', 'power', 'measurement', 'practice', 'waves', 'propagation', 'morse'] as const;
const RESOURCES = ['bands', 'laboratory', 'glossary', 'sources'] as const;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/me', route => route.fulfill({ json: { user: null } }));
});

test('course home is an index and lessons have their own content, URLs and navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(COURSE);
  await expect(page.locator('[data-app-ready="true"]')).toBeVisible();
  const home = page.getByTestId('radio-course-home');
  await expect(home).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Electricidad para radioaficionados');
  await expect(page.getByTestId('radio-lesson-list').getByRole('link')).toHaveCount(12);
  await expect(page.getByTestId('radio-resource-list').getByRole('link')).toHaveCount(4);
  await expect(home.locator('[data-concept]')).toHaveCount(0);
  await expect(page.getByTestId('dc-circuit-lab')).toHaveCount(0);
  await expect(page.getByTestId('radio-glossary')).toHaveCount(0);

  await page.getByRole('button', { name: es.RadioCourse.start, exact: true }).click();
  await expect(page).toHaveURL(`${LESSON_BASE}/voltage`);
  await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages.voltage.title);
  const content = page.locator('[data-radio-lesson]');
  await expect(content.locator('[data-concept]')).toHaveCount(1);
  await expect(content.locator('[data-concept="voltage"]')).toBeVisible();
  await expect(content).toContainText(es.RadioBasics.concepts.voltage.definition);
  await expect(content).not.toContainText(es.RadioBasics.concepts.current.definition);
  await expect(content).not.toContainText(es.RadioBasics.concepts.resistance.definition);
  const navigation = page.getByRole('navigation', { name: es.RadioCourse.navigation, exact: true }).first();
  for (const id of [...LESSONS, ...RESOURCES]) {
    await expect(navigation.locator(`a[href="${LESSON_BASE}/${id}"]`)).toHaveCount(1);
  }

  await page.getByRole('link', { name: /Siguiente.*Corriente/ }).click();
  await expect(page).toHaveURL(`${LESSON_BASE}/current`);
  await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages.current.title);
  await expect(content.locator('[data-concept="current"]')).toBeVisible();
  await expect(content.locator('[data-concept="voltage"]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-app-ready="true"]')).toBeVisible();
  await expect(page).toHaveURL(`${LESSON_BASE}/current`);
  await expect(page.locator('[data-radio-page="current"]')).toBeVisible();
  await expect(navigation).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(`${LESSON_BASE}/voltage`);
  await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages.voltage.title);
  await page.getByRole('link', { name: es.RadioCourse.backToCourse, exact: true }).first().click();
  await expect(page).toHaveURL(COURSE);
  await expect(home).toBeVisible();
  expect(errors).toEqual([]);
});

test('series and parallel are separate lessons with scoped worked examples', async ({ page }) => {
  await page.goto(`${LESSON_BASE}/series`);
  const content = page.locator('[data-radio-lesson]');
  await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages.series.title);
  await expect(content).toContainText(es.RadioBasics.connections.seriesBody);
  await expect(content).not.toContainText(es.RadioBasics.connections.parallelBody);
  await expect(content).toContainText('40 mA');
  await expect(content.locator('#parallel')).toHaveCount(0);
  await expect(page.getByTestId('dc-circuit-lab')).toHaveCount(0);
  await page.getByRole('link', { name: /Siguiente.*Circuitos en paralelo/ }).click();
  await expect(page).toHaveURL(`${LESSON_BASE}/parallel`);
  await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages.parallel.title);
  await expect(content).toContainText(es.RadioBasics.connections.parallelBody);
  await expect(content).not.toContainText(es.RadioBasics.connections.seriesBody);
  await expect(content).toContainText('180 mA');
  await expect(content.locator('#series')).toHaveCount(0);
});

for (const lesson of ['resistance', 'ohm', 'power', 'measurement'] as const) {
  test(`${lesson} is directly addressable as a standalone lesson`, async ({ page }) => {
    await page.goto(`${LESSON_BASE}/${lesson}`);
    await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages[lesson].title);
    await expect(page.locator(`[data-radio-page="${lesson}"] [data-radio-lesson]`)).toBeVisible();
    await expect(page.getByTestId('dc-circuit-lab')).toHaveCount(0);
    await expect(page.getByTestId('radio-glossary')).toHaveCount(0);
  });
}

test('lesson metadata points to its own route and invalid chapters return 404', async ({ page, request }) => {
  await page.goto(`${LESSON_BASE}/voltage`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es\/radio\/lecciones\/voltage$/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/radio\/lecciones\/voltage$/);
  await expect(page).toHaveTitle(new RegExp(es.RadioCourse.pages.voltage.title));
  expect((await request.get(`${LESSON_BASE}/not-a-chapter`)).status()).toBe(404);
  expect((await request.get('/es/workbench/ohms-law/voltage')).status()).toBe(404);
});

test('legacy chapter bookmarks resolve to the corresponding standalone page', async ({ page }) => {
  const bookmarks = { concepts: 'voltage', ohm: 'ohm', connections: 'series', laboratory: 'laboratory', power: 'power', practice: 'practice', glossary: 'glossary' };
  for (const [hash, chapter] of Object.entries(bookmarks)) {
    await page.goto(`${COURSE}#${hash}`);
    await expect(page).toHaveURL(`${LESSON_BASE}/${chapter}`);
    await expect(page.locator(`[data-radio-page="${chapter}"]`)).toBeVisible();
  }
});

test('reference resources do not display lesson previous or next controls', async ({ page }) => {
  for (const resource of RESOURCES) {
    await page.goto(`${LESSON_BASE}/${resource}`);
    await expect(page.locator('#radio-page-title')).toHaveText(es.RadioCourse.pages[resource].title);
    await expect(page.getByRole('link', { name: /^Anterior/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Siguiente/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: es.RadioCourse.backToCourse, exact: true }).first()).toBeVisible();
  }
});

test('the course keeps the official program and its chapter references accessible', async ({ page }) => {
  await page.goto(COURSE);
  await page.locator(`a[href="${COURSE}/programa"]`).first().click();
  await expect(page).toHaveURL(`${COURSE}/programa`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Radioaficionado, de cero a la licencia');
  await expect(page.locator(`a[href="${COURSE}/a-electricidad"]`).first()).toBeVisible();
  await page.locator(`a[href="${COURSE}/morse"]`).first().click();
  await expect(page).toHaveURL(`${COURSE}/morse`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Código Morse');
});

test('old course URLs redirect to the recovered index and standalone lessons', async ({ page, request }) => {
  const oldBase = '/es/workbench/radio-basics';
  for (const [oldPath, destination] of [
    [oldBase, COURSE],
    [`${oldBase}/voltage`, `${LESSON_BASE}/voltage`],
    [`${oldBase}/bands`, `${LESSON_BASE}/bands`],
  ]) {
    const response = await request.get(oldPath, { maxRedirects: 0 });
    expect([307, 308]).toContain(response.status());
    expect(new URL(response.headers().location, response.url()).pathname).toBe(destination);
    await page.goto(oldPath);
    await expect(page).toHaveURL(destination);
  }
  await expect(page.getByTestId('radio-band-spectrum')).toBeVisible();
});

test('the signal lessons lead from wave size to range and Morse timing', async ({ page }) => {
  await page.goto(COURSE);
  await page.getByTestId('radio-lesson-list').getByRole('link', { name: /Ondas y frecuencia/ }).click();
  const lesson = page.locator('[data-radio-lesson]');
  for (const topic of ['waves', 'propagation', 'morse'] as const) {
    await expect(page).toHaveURL(`${LESSON_BASE}/${topic}`);
    await expect(lesson.getByRole('img')).toHaveAccessibleName(es.RadioCourse.pages[topic].caption);
    await expect(lesson).toContainText(es.RadioCourse.pages[topic].calculation);
    if (topic !== 'morse') await page.locator('[data-direction="next"]').click();
  }
  await lesson.getByRole('button', { name: 'Punto', exact: true }).click();
  await lesson.getByRole('button', { name: 'Raya', exact: true }).click();
  await expect(lesson.locator('[aria-live]')).toHaveText('·− = A');
  await lesson.getByRole('button', { name: 'Escuchar' }).click();
  await lesson.getByRole('button', { name: 'Punto', exact: true }).click();
  await expect(lesson.locator('[aria-live]')).toHaveText('·−· = R');
  await lesson.getByRole('button', { name: 'Volver al inicio' }).click();
  await expect(lesson.getByRole('button', { name: 'Escuchar' })).toBeDisabled();
});

test('radio sub-navigation connects tutorials, global Morse console and free vs licensed spectrum', async ({ page }) => {
  await page.goto(COURSE);
  const subnav = page.getByTestId('radio-subnav');
  await expect(subnav).toBeVisible();
  await subnav.getByRole('link', { name: /Tutoriales y Equipos/ }).click();
  await expect(page).toHaveURL(`${COURSE}/tutoriales`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Baofeng UV-5R');
  await expect(page.getByText(/Duplex = off/).first()).toBeVisible();
  const builder = page.getByTestId('chirp-csv-builder');
  await expect(builder).toBeVisible();
  await builder.getByLabel(/Subcanal de Walkie-Talkie/).selectOption('100');
  await expect(builder.locator('td').filter({ hasText: '100.0 Hz' }).first()).toBeVisible();
  await builder.getByLabel(/Nombre en display/).fill('LU TEST');
  await builder.getByLabel(/Frecuencia \(MHz\)/).fill('145.650');
  await builder.getByRole('button', { name: /\+ Sumar canal/ }).click();
  await expect(builder.getByText('LU TEST')).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.getByTestId('radio-subnav').getByRole('link', { name: /Consola Morse/ }).click();
  await expect(page).toHaveURL(`${COURSE}/morse`);
  const morseConsole = page.getByTestId('morse-global-console');
  await expect(morseConsole).toBeVisible();
  await morseConsole.getByRole('button', { name: /3 · Traductor CW/ }).click();
  await expect(page.locator('#traductor')).toBeVisible();
  await expect(page.locator('#transmision')).toBeHidden();
  await morseConsole.getByRole('button', { name: /Vista completa/ }).click();
  await expect(page.locator('#transmision')).toBeVisible();

  await page.getByTestId('radio-subnav').getByRole('link', { name: /Instrumentos \(Multímetro\)/ }).click();
  await expect(page).toHaveURL(`${COURSE}/instrumentos`);
  await expect(page.getByTestId('radio-sidebar')).toBeVisible();
  const dmm = page.getByTestId('multimeter-lab');
  await expect(dmm).toBeVisible();
  await expect(dmm.getByTestId('multimeter-digits')).toHaveText('13,80');
  await dmm.getByRole('button', { name: /mA \/ µA/ }).click();
  await expect(dmm.getByTestId('multimeter-digits')).toHaveText('FUSE');
  await dmm.getByRole('button', { name: /Divisor de Alta Impedancia/ }).click();
  await expect(dmm.getByTestId('multimeter-digits')).toHaveText('4,00');

  await page.getByRole('button', { name: /2 · Osciloscopio/ }).click();
  const scope = page.getByTestId('oscilloscope-lab');
  await expect(scope).toBeVisible();
  await expect(scope.getByTestId('oscilloscope-vpp')).toContainText('0,60 Vpp');

  await page.getByRole('button', { name: /3 · Medidor de ROE/ }).click();
  const swr = page.getByTestId('swr-meter-lab');
  await expect(swr).toBeVisible();
  await expect(swr.getByTestId('swr-reading')).toHaveText('1,19 : 1');

  await page.getByRole('button', { name: /4 · NanoVNA/ }).click();
  const vna = page.getByTestId('nanovna-lab');
  await expect(vna).toBeVisible();
  await vna.getByRole('button', { name: /Cortar varilla a resonancia exacta/ }).click();
  await expect(vna.getByTestId('nanovna-resonance')).toContainText('145,00 MHz');
});

test('skins and custom inventory entities render cleanly across desktop and mobile', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('hios-skin', 'blueprint');
    localStorage.setItem('hios.inventory.custom.v1', JSON.stringify([{
      id: 'custom:radio:antena-yagi-2m',
      domain: 'radio',
      kind: 'tutorial',
      badge: 'ANTENA · 2M',
      title: 'Construcción de Yagi portátil 145 MHz',
      summary: 'Cálculo de reflector, dipolo excitado y directores para operación satelital.',
      href: '/radio/tutoriales',
      status: 'published',
    }]));
  });
  await page.goto(COURSE);
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'blueprint');
  await expect(page.getByTestId('radio-hub-entities')).toContainText('Construcción de Yagi portátil 145 MHz');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
