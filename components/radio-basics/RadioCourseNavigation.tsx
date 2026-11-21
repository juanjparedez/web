'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { radioLessons, radioResources, radioPagePath, radioCoursePath, type RadioPageId } from '@/config/radio-course';
import styles from './radioCourse.module.css';

export type RadioNavPageId = RadioPageId | 'home' | 'instrumentos' | 'tutoriales' | 'morse' | 'programa';

const WORKBENCH_LINKS = [
  { id: 'instrumentos', path: '/radio/instrumentos', label: 'Instrumentos: Multímetro' },
  { id: 'tutoriales', path: '/radio/tutoriales', label: 'Tutoriales: Baofeng UV-5R' },
  { id: 'morse', path: '/radio/morse', label: 'Consola Código Morse (CW)' },
  { id: 'programa', path: '/radio/programa', label: 'Programa Oficial ENACOM' },
] as const;

export function RadioCourseNavigation({ page = 'home' }: { page?: RadioNavPageId }) {
  const t = useTranslations('RadioCourse');
  const locale = useLocale();
  const router = useRouter();
  const groups = [
    { label: 'lessonsLabel', pages: radioLessons },
    { label: 'resourcesLabel', pages: radioResources },
  ] as const;

  const handleMobileChange = (id: string) => {
    if (!id) {
      router.push(`/${locale}${radioCoursePath}`);
      return;
    }
    const wb = WORKBENCH_LINKS.find((item) => item.id === id);
    if (wb) {
      router.push(`/${locale}${wb.path}`);
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
            <p className={styles.navGroup}>Instrumentos y taller</p>
            {WORKBENCH_LINKS.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}${item.path}`}
                aria-current={page === item.id ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {groups.map((group) => (
            <div key={group.label}>
              <p className={styles.navGroup}>{t(group.label)}</p>
              {group.pages.map(({ id }) => (
                <Link
                  key={id}
                  href={`/${locale}${radioPagePath(id)}`}
                  aria-current={page === id ? 'page' : undefined}
                >
                  {t(`pages.${id}.title`)}
                </Link>
              ))}
            </div>
          ))}
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
            ...groups.map((group) => ({
              label: t(group.label),
              options: group.pages.map(({ id }) => ({ value: id, label: t(`pages.${id}.title`) })),
            })),
            {
              label: 'Instrumentos y taller',
              options: WORKBENCH_LINKS.map((item) => ({ value: item.id, label: item.label })),
            },
          ]}
        />
      </div>
    </aside>
  );
}
