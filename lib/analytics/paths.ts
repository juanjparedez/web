import { LABS } from '../spectrum/labs.ts';
import { workbenchTools } from '../../config/workbench.ts';
import { ANALYTICS_LOCALES, type AnalyticsLocale } from './model.ts';

const toolsByPath = new Map<string, string>(workbenchTools.filter(tool => !tool.external && tool.id !== 'usage-analytics').map(tool => [tool.href, tool.id]));
for (const instrument of ['multimetro', 'osciloscopio', 'roe', 'nanovna']) {
  toolsByPath.set(`/medicion/instrumentos/${instrument}`, `medicion-${instrument}`);
}
for (const { slug } of LABS) {
  toolsByPath.set(`/espectro/${slug}`, `espectro-${slug}`);
}
// Older open tabs can still report inline lab opens against the index.
const SPECTRUM_LABS = ['onda', 'cubeta', 'chladni', 'fibra', 'cuerpo-negro'] as const;
export const SPECTRUM_TOOL_IDS = new Set(SPECTRUM_LABS.map(id => `espectro-${id}`));
export const ANALYTICS_TOOL_IDS = new Set([...toolsByPath.values(), ...SPECTRUM_TOOL_IDS]);
const pages = new Set(['/espectro', '/medicion', '/medicion/multimetro', '/medicion/instrumentos', '/', '/workbench', '/workbench/spaces', '/workbench/sections', '/projects', '/blog', '/tools',
  '/pinouts', '/pinouts/pad', '/pinouts/btdac', '/pinouts/speaker', '/stats', '/guestbook', '/explore', '/calculators', '/prints', '/colophon']);
const families = ['/projects/:project', '/blog/:article', '/print/:document'];

/** Only catalog paths or fixed families ever leave the browser. */
export function analyticsPath(path: string): { path: string; toolId: string } | null {
  if (toolsByPath.has(path)) return { path, toolId: toolsByPath.get(path)! };
  if (pages.has(path) || families.includes(path)) return { path, toolId: '' };
  return null;
}

export function browserPage(pathname: string): { path: string; toolId: string; locale: AnalyticsLocale } | null {
  const [, locale, ...parts] = pathname.split('/');
  if (!ANALYTICS_LOCALES.includes(locale as AnalyticsLocale)) return null;
  let path = `/${parts.join('/')}`.replace(/\/$/, '') || '/';
  if (/^\/projects\/[^/]+(?:\/.*)?$/.test(path)) path = '/projects/:project';
  else if (/^\/blog\/[^/]+$/.test(path)) path = '/blog/:article';
  else if (/^\/print\/[^/]+\/[^/]+$/.test(path)) path = '/print/:document';
  else if (path.startsWith('/workbench/spaces/')) path = '/workbench/spaces';
  else if (/^\/workbench\/sections\/[^/]+$/.test(path)) path = '/workbench/sections';
  const page = analyticsPath(path);
  return page ? { ...page, locale: locale as AnalyticsLocale } : null;
}
