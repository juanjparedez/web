'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { radioLessons, radioResources, radioPagePath, type RadioPageId } from '@/config/radio-course';
import { useAllInventoryEntities } from '@/lib/inventory/store';
import styles from './radioCourse.module.css';

const oldSections: Record<string, RadioPageId> = {
  concepts: 'voltage', ohm: 'ohm', connections: 'series', laboratory: 'laboratory',
  power: 'power', practice: 'practice', glossary: 'glossary',
};

function useLegacyCourseLinks() {
  const locale = useLocale();
  const router = useRouter();
  useEffect(() => {
    const resolveHash = () => {
      const page = oldSections[window.location.hash.slice(1)];
      if (page) router.replace('/' + locale + radioPagePath(page));
    };
    resolveHash();
    window.addEventListener('hashchange', resolveHash);
    return () => window.removeEventListener('hashchange', resolveHash);
  }, [locale, router]);
}

/** Colour family shared with the sidebar groups (practice, exam, reference). */
function hubTone(id: string, kind: string) {
  if (id === 'radio-enacom-program') return 'exam';
  return kind === 'tool' ? 'practice' : 'reference';
}

export function RadioBasicsTool() {
  const t = useTranslations('RadioCourse');
  const locale = useLocale();
  const router = useRouter();
  const radioModules = useAllInventoryEntities('radio');
  useLegacyCourseLinks();
  return (
    <div className={styles.home} data-testid="radio-course-home">
      <section className={styles.startCard} aria-labelledby="radio-start-title">
        <span className={styles.startEyebrow}>Aprender · {radioLessons.length} lecciones</span>
        <h2 id="radio-start-title">{t('hubTitle')}</h2>
        <p>{t('hubIntro')}</p>
        <Button type="primary" size="large" onClick={() => router.push('/' + locale + radioPagePath('voltage'))}>{t('start')}</Button>
      </section>
      <section aria-labelledby="radio-lessons-title">
        <h2 id="radio-lessons-title">{t('lessonsLabel')}</h2>
        <ol className={styles.lessonList} data-testid="radio-lesson-list">
          {radioLessons.map(({ id }) => (
            <li key={id}><Link href={'/' + locale + radioPagePath(id)}>
              <h3>{t('pages.' + id + '.title')}</h3><p>{t('pages.' + id + '.description')}</p>
            </Link></li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="radio-stations-title">
        <div className={styles.stationsHeader}>
          <h2 id="radio-stations-title">Practicar, rendir y consultar</h2>
          <p>Consola Morse, programa oficial de ENACOM, bandas y equipos. Los instrumentos de medición tienen su propia sección.</p>
        </div>
        <div className={styles.hubGrid} data-testid="radio-hub-entities">
          {radioModules.map((entity) => (
            <Link key={entity.id} href={`/${locale}${entity.href}`} className={styles.hubCard} data-tone={hubTone(entity.id, entity.kind)}>
              <span className={styles.hubBadge}>{entity.badge}</span>
              <h3>{entity.id === 'radio-enacom-program' ? t('programLink') : entity.title}</h3>
              <p>{entity.summary}</p>
              <span className={styles.hubCta}>Abrir →</span>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="radio-resources-title">
        <h2 id="radio-resources-title">{t('resourcesLabel')}</h2>
        <div className={styles.resourceList} data-testid="radio-resource-list">
          {radioResources.map(({ id }) => <Link key={id} href={'/' + locale + radioPagePath(id)}>
            <h3>{t('pages.' + id + '.title')}</h3><p>{t('pages.' + id + '.description')}</p>
          </Link>)}
        </div>
      </section>
    </div>
  );
}
