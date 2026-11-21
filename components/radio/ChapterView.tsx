import Link from 'next/link';
import { PageIntro } from '@/components/ui/PageIntro';
import { RadioCourseNavigation, type RadioNavPageId } from '@/components/radio-basics/RadioCourseNavigation';
import courseStyles from '@/components/radio-basics/radioCourse.module.css';
import { chapterNeighbors, type Chapter } from '@/lib/radio/chapters';
import { CHAPTER_BODIES } from './chapterBodies';
import { SpanishOnlyNotice } from './SpanishOnlyNotice';
import { RadioSubNav } from './RadioSubNav';
import styles from './radio.module.css';

export function ChapterView({ chapter, locale }: { chapter: Chapter; locale: string }) {
  const { prev, next } = chapterNeighbors(chapter.slug);
  const base = `/${locale}/radio`;
  const index = `${base}/programa`;
  const parts = CHAPTER_BODIES[chapter.slug] ?? [];
  const navPage: RadioNavPageId =
    chapter.slug === 'morse' ? 'morse-console' : (chapter.slug as RadioNavPageId);

  return (
    <main className={courseStyles.page} lang="es">
      <RadioSubNav />
      <PageIntro
        eyebrow={<Link href={index} style={{ color: 'inherit' }}>Radioaficionado · Novicio</Link>}
        title={`${chapter.code.length === 1 ? `Bloque ${chapter.code}: ` : ''}${chapter.title}`}
        description={chapter.summary}
        area="knowledge"
        compact
      />
      {locale !== 'es' ? <SpanishOnlyNotice /> : null}
      <div className={courseStyles.shell} data-wide="true">
        <RadioCourseNavigation page={navPage} />
        <div className={`${courseStyles.reading} ${styles.content}`}>
          <nav className={courseStyles.chapterTopicsBar} aria-label="En este capítulo">
            <span className={courseStyles.chapterTopicsLabel}>En este capítulo:</span>
            {chapter.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={courseStyles.chapterTopicPill}>
                {s.title}
              </a>
            ))}
          </nav>
          {parts.map((Part, i) => <Part key={i} />)}
          <nav className={styles.pager} aria-label="Capítulos">
            {prev ? <Link href={`${base}/${prev.slug}`}>← {prev.title}</Link> : <Link href={index}>← Índice</Link>}
            {next ? <Link href={`${base}/${next.slug}`}>{next.title} →</Link> : <Link href={index}>Índice →</Link>}
          </nav>
        </div>
      </div>
    </main>
  );
}
