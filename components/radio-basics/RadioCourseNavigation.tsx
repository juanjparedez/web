'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { radioLessons, radioResources, radioPagePath, radioCoursePath, type RadioPageId } from '@/config/radio-course';
import styles from './radioCourse.module.css';

export type RadioNavPageId =
  | RadioPageId
  | 'home'
  | 'instrumentos'
  | 'tutoriales'
  | 'morse-console'
  | 'programa'
  | 'a-electricidad'
  | 'b-modulacion-equipos'
  | 'c-antenas-propagacion'
  | 'd-reglamento'
  | 'practica';

const WORKBENCH_LINKS = [
  { id: 'morse-console', path: '/radio/morse', label: '★ Consola Código Morse (CW)' },
  { id: 'tutoriales', path: '/radio/tutoriales', label: '★ Tutorial Baofeng UV-5R (CHIRP)' },
  { id: 'instrumentos', path: '/radio/instrumentos', label: '★ Instrumentos: Multímetro' },
] as const;

const ENACOM_LINKS = [
  { id: 'programa', path: '/radio/programa', label: 'Temario y 15 Simuladores RF' },
  { id: 'a-electricidad', path: '/radio/a-electricidad', label: 'Bloque A · Electricidad y RF' },
  { id: 'b-modulacion-equipos', path: '/radio/b-modulacion-equipos', label: 'Bloque B · Modulación y SDR' },
  { id: 'c-antenas-propagacion', path: '/radio/c-antenas-propagacion', label: 'Bloque C · Antenas y ROE' },
  { id: 'd-reglamento', path: '/radio/d-reglamento', label: 'Bloque D · Reglamentación' },
  { id: 'practica', path: '/radio/practica', label: 'Simulacro de Examen Oficial' },
] as const;

export function RadioCourseNavigation({ page = 'home' }: { page?: RadioNavPageId }) {
  const t = useTranslations('RadioCourse');
  const locale = useLocale();
  const router = useRouter();
  const mobileGroups = [
    { label: 'lessonsLabel', pages: radioLessons },
    { label: 'resourcesLabel', pages: radioResources },
  ] as const;

  const extraLinks = [...WORKBENCH_LINKS, ...ENACOM_LINKS];

  const handleMobileChange = (id: string) => {
    if (!id) {
      router.push(`/${locale}${radioCoursePath}`);
      return;
    }
    const extra = extraLinks.find((item) => item.id === id);
    if (extra) {
      router.push(`/${locale}${extra.path}`);
      return;
    }
    router.push(`/${locale}${radioPagePath(id as RadioPageId)}`);
  };

  return (
    <aside className={styles.sidebar} data-testid="radio-sidebar">
      <div className={styles.desktopNavigation}>
        <Link href={`/${locale}${radioCoursePath}`} aria-current={page === 'home' ? 'page' : undefined}>
          {t('backToCourse')}
        </Link>
        <nav aria-label={t('navigation')}>
          <div>
            <p className={styles.navGroup}>Estaciones y taller</p>
            {WORKBENCH_LINKS.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}${item.path}`}
                className={styles.navFeaturedLink}
                aria-current={page === item.id ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <p className={styles.navGroup}>{t('resourcesLabel')}</p>
            {radioResources.map(({ id }) => (
              <Link
                key={id}
                href={`/${locale}${radioPagePath(id)}`}
                aria-current={page === id ? 'page' : undefined}
              >
                {t(`pages.${id}.title`)}
              </Link>
            ))}
          </div>
          <div>
            <p className={styles.navGroup}>Programa Oficial ENACOM</p>
            {ENACOM_LINKS.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}${item.path}`}
                aria-current={page === item.id ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <p className={styles.navGroup}>{t('lessonsLabel')}</p>
            {radioLessons.map(({ id }) => (
              <Link
                key={id}
                href={`/${locale}${radioPagePath(id)}`}
                aria-current={page === id ? 'page' : undefined}
              >
                {t(`pages.${id}.title`)}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className={styles.mobileNavigation}>
        <label htmlFor="radio-course-topic">{t('jump')}</label>
        <Select
          id="radio-course-topic"
          value={page === 'home' ? '' : page}
          aria-label={t('jump')}
          onChange={handleMobileChange}
          options={[
            { value: '', label: t('backToCourse') },
            ...mobileGroups.map((group) => ({
              label: t(group.label),
              options: group.pages.map(({ id }) => ({ value: id, label: t(`pages.${id}.title`) })),
            })),
            {
              label: 'Estaciones y Programa ENACOM',
              options: extraLinks.map((item) => ({ value: item.id, label: item.label })),
            },
          ]}
        />
      </div>
    </aside>
  );
}
