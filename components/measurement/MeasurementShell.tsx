import type { ReactNode } from 'react';
import { PageIntro } from '@/components/ui/PageIntro';
import { SectionNav } from '@/components/learning/SectionNav';
import { SectionPager } from '@/components/learning/SectionPager';
import courseStyles from '@/components/radio-basics/radioCourse.module.css';
import styles from './measurementShell.module.css';

interface Props {
  /** Page id from components/learning/learningNav ('home', 'multimetro', 'dmm', …). */
  page: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

/** Medición uses the same layout and menu as Radioaficionado. */
export function MeasurementShell({ page, eyebrow, title, description, children }: Props) {
  return (
    <main className={courseStyles.page} lang="es" data-measurement-page={page}>
      <div className={courseStyles.shell} data-wide="true">
        <SectionNav section="medicion" page={page} />
        <div className={courseStyles.reading}>
          <PageIntro eyebrow={eyebrow} title={title} description={description} area="knowledge" compact />
          <div className={styles.body}>{children}</div>
          {page === 'home' ? null : <SectionPager section="medicion" page={page} />}
        </div>
      </div>
    </main>
  );
}
