'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { radioLessons, radioResources, radioPagePath, radioCoursePath, type RadioPageId } from '@/config/radio-course';
import styles from './radioCourse.module.css';

const oldSections: Record<string, RadioPageId> = {
  concepts: 'voltage', ohm: 'ohm', connections: 'series', laboratory: 'laboratory',
  power: 'power', practice: 'practice', glossary: 'glossary',
};

function useLegacyCourseLinks() {
  const locale = useLocale();
  const router = useRouter();
  useEffect(() => {
    const page = oldSections[window.location.hash.slice(1)];
    if (page) router.replace('/' + locale + radioPagePath(page));
  }, [locale, router]);
}

export function RadioBasicsTool() {
  const t = useTranslations('RadioCourse');
  const locale = useLocale();
  const router = useRouter();
  useLegacyCourseLinks();
  return (
    <div className={styles.home} data-testid="radio-course-home">
      <div className={styles.homeIntro}>
        <h2>{t('hubTitle')}</h2>
        <p>{t('hubIntro')}</p>
        <Button type="primary" size="large" onClick={() => router.push('/' + locale + radioPagePath('voltage'))}>{t('start')}</Button>
      </div>
      <section aria-label="Módulos de radioaficionado" className={styles.hubGrid}>
        <Link href={`/${locale}${radioCoursePath}/programa`} className={styles.hubCard}>
          <span className={styles.hubBadge}>ENACOM · LU/LW</span>
          <h3>{t('programLink')}</h3>
          <p>Programa oficial Novicio (Bloques A–D), 14 simuladores de RF, banco de preguntas y simulacro de examen.</p>
        </Link>
        <Link href={`/${locale}${radioCoursePath}/morse`} className={styles.hubCard}>
          <span className={styles.hubBadge}>CW · ITU-R M.1677</span>
          <h3>Consola de Código Morse</h3>
          <p>Control global de tono y ruido QRN, árbol de letras, entrenador de transmisión con llave/paletas, traductor y método Koch.</p>
        </Link>
        <Link href={`/${locale}${radioPagePath('bands')}`} className={styles.hubCard}>
          <span className={styles.hubBadge}>ESPECTRO · ITU / ENACOM</span>
          <h3>Bandas: Libre vs. Licenciado</h3>
          <p>Gráfico del espectro radioeléctrico, cuadro de bandas de radioaficionados, uso libre canalero y frecuencias críticas prohibidas.</p>
        </Link>
        <Link href={`/${locale}${radioCoursePath}/tutoriales`} className={styles.hubCard}>
          <span className={styles.hubBadge}>TALLER · BAOFENG UV-5R</span>
          <h3>Tutoriales y Programación RX-Only</h3>
          <p>Cómo programar un handy por CHIRP para bloquear transmisión accidental sin licencia, subtonos CTCSS/DCS y operación walkie-talkie.</p>
        </Link>
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
      <section aria-labelledby="radio-resources-title">
        <h2 id="radio-resources-title">{t('resourcesLabel')}</h2>
        <div className={styles.resourceList} data-testid="radio-resource-list">
          {radioResources.map(({ id }) => <Link key={id} href={'/' + locale + radioPagePath(id)}>
            <h3>{t('pages.' + id + '.title')}</h3><p>{t('pages.' + id + '.description')}</p>
          </Link>)}
        </div>
      </section>
      <aside className={styles.future}><h2>{t('futureLabel')}</h2><p>{t('futureIntro')}</p><Link href={`/${locale}${radioCoursePath}/programa`}>{t('programLink')}</Link></aside>
    </div>
  );
}
