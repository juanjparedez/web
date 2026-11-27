'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { radioLessons, radioPagePath, type RadioPageId } from '@/config/radio-course';
import { useAllInventoryEntities } from '@/lib/inventory/store';
import { SectionHub } from '@/components/learning/SectionHub';
import { LEARN_SECTIONS } from '@/components/learning/learningNav';
import styles from './radioCourse.module.css';

export const LAST_LESSON_KEY = 'hios.radio.lastLesson';

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

function useLastLesson(): number {
  const [index, setIndex] = useState(-1);
  useEffect(() => {
    try {
      const id = window.localStorage.getItem(LAST_LESSON_KEY);
      setIndex(radioLessons.findIndex((lesson) => lesson.id === id));
    } catch { /* storage blocked: show the start card */ }
  }, []);
  return index;
}

function StartBanner() {
  const t = useTranslations('RadioCourse');
  const locale = useLocale();
  const router = useRouter();
  const last = useLastLesson();
  if (last >= 0) {
    const lesson = radioLessons[last];
    return (
      <section className={styles.startCard} aria-labelledby="radio-start-title" data-testid="radio-continue">
        <span className={styles.startEyebrow}>Seguís acá · lección {last + 1} de {radioLessons.length}</span>
        <h2 id="radio-start-title">{t(`pages.${lesson.id}.title`)}</h2>
        <p>{t(`pages.${lesson.id}.description`)}</p>
        <Link className={styles.continueLink} href={`/${locale}${radioPagePath(lesson.id)}`}>Continuar →</Link>
      </section>
    );
  }
  return (
    <section className={styles.startCard} aria-labelledby="radio-start-title">
      <span className={styles.startEyebrow}>Aprender · {radioLessons.length} lecciones</span>
      <h2 id="radio-start-title">{t('hubTitle')}</h2>
      <p>{t('hubIntro')}</p>
      <Button type="primary" size="large" onClick={() => router.push('/' + locale + radioPagePath('voltage'))}>{t('start')}</Button>
    </section>
  );
}

/** Paths already in the section menu, so the inventory block only shows extra (e.g. custom) entries. */
const NAV_PATHS = new Set(LEARN_SECTIONS.radio.groups.flatMap((group) => group.items.map((item) => item.path)));

export function RadioBasicsTool() {
  const locale = useLocale();
  const extras = useAllInventoryEntities('radio').filter((entity) => !(entity.builtIn && NAV_PATHS.has(entity.href)));
  useLegacyCourseLinks();
  return (
    <div className={styles.home} data-testid="radio-course-home">
      <SectionHub section="radio" banner={<StartBanner />} testIds={{ learn: 'radio-lesson-list', reference: 'radio-resource-list' }}>
        <section aria-labelledby="radio-extra-title" hidden={extras.length === 0}>
          <h2 id="radio-extra-title">También en el taller</h2>
          <div className={styles.hubGrid} data-testid="radio-hub-entities">
            {extras.map((entity) => (
              <Link key={entity.id} href={`/${locale}${entity.href}`} className={styles.hubCard} data-tone="reference">
                <span className={styles.hubBadge}>{entity.badge}</span>
                <h3>{entity.title}</h3>
                <p>{entity.summary}</p>
                <span className={styles.hubCta}>Abrir →</span>
              </Link>
            ))}
          </div>
        </section>
      </SectionHub>
    </div>
  );
}
