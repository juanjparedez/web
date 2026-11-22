import { useLocale, useTranslations } from 'next-intl';

export const sectionLinks = [
  { key: 'maker', href: '/prints' },
  { key: 'devlog', href: '/blog' },
  { key: 'pinouts', href: '/pinouts' },
  { key: 'calculators', href: '/calculators' },
  { key: 'composer', href: '/composer' },
  { key: 'radio', href: '/radio' },
  { key: 'software', href: '/tools' },
  { key: 'stats', href: '/stats' },
  { key: 'guestbook', href: '/guestbook' },
  { key: 'about', href: '/colophon' },
] as const;

export interface NavEntry {
  href: string;
  label: string;
  badge: string;
  desktopDirect?: boolean;
}

export interface NavGroupConfig {
  id: string;
  kicker: string;
  label: string;
  items: NavEntry[];
}

export function isRouteActive(pathname: string | null, href: string, locale: string): boolean {
  if (!pathname) return false;
  if (href === `/${locale}/workbench` && pathname.startsWith(`${href}/spaces`)) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function useNavGroups(): NavGroupConfig[] {
  const locale = useLocale();
  const t = useTranslations('Header');
  const sec = useTranslations('Header.sections');
  const ws = useTranslations('Workspace');

  return [
    {
      id: 'hardware',
      kicker: '01 / HARDWARE & MAKER',
      label: t('projects'),
      items: [
        { href: `/${locale}/projects`, label: t('projects'), badge: 'PCB', desktopDirect: true },
        { href: `/${locale}/pinouts`, label: sec('pinouts'), badge: 'GPIO', desktopDirect: true },
        { href: `/${locale}/prints`, label: sec('maker'), badge: '3D' },
      ],
    },
    {
      id: 'radio',
      kicker: '02 / RADIO & RF',
      label: sec('radio'),
      items: [
        { href: `/${locale}/radio`, label: sec('radio'), badge: 'HAM', desktopDirect: true },
        { href: `/${locale}/espectro`, label: sec('spectrum'), badge: 'EM' },
      ],
    },
    {
      id: 'workbench',
      kicker: '03 / WORKBENCH & LAB',
      label: t('workbench'),
      items: [
        { href: `/${locale}/workbench`, label: t('workbench'), badge: 'LAB', desktopDirect: true },
        { href: `/${locale}/calculators`, label: sec('calculators'), badge: 'RCL', desktopDirect: true },
        { href: `/${locale}/medicion`, label: sec('measurement'), badge: 'DMM' },
        { href: `/${locale}/composer`, label: sec('composer'), badge: '8-BIT' },
        { href: `/${locale}/explore`, label: ws('explore'), badge: 'CAT' },
      ],
    },
    {
      id: 'more',
      kicker: '04 / BITÁCORA & ARCHIVO',
      label: sec('label'),
      items: [
        { href: `/${locale}/blog`, label: sec('devlog'), badge: 'DOCS', desktopDirect: true },
        { href: `/${locale}/workbench/spaces`, label: ws('mySpaces'), badge: 'SYNC' },
        { href: `/${locale}/tools`, label: sec('software'), badge: 'STACK' },
        { href: `/${locale}/stats`, label: sec('stats'), badge: 'DATA' },
        { href: `/${locale}/guestbook`, label: sec('guestbook'), badge: 'LOG' },
        { href: `/${locale}/colophon`, label: sec('about'), badge: 'INFO' },
      ],
    },
  ];
}
