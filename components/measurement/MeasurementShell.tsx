import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageIntro } from '@/components/ui/PageIntro';
import styles from './measurementShell.module.css';

export type MeasurementPageId = 'multimetro' | 'instrumentos';

const TABS: readonly { id: MeasurementPageId; path: string; marker: string; label: string }[] = [
  { id: 'multimetro', path: '/medicion', marker: 'DMM', label: 'Medir con un multímetro' },
  { id: 'instrumentos', path: '/medicion/instrumentos', marker: '4 INST', label: 'Banco de instrumentos' },
];

interface Props {
  locale: string;
  page: MeasurementPageId;
  title: string;
  description: string;
  children: ReactNode;
}

/** Stand-alone section for measurement and bench instruments (outside the ham radio course). */
export function MeasurementShell({ locale, page, title, description, children }: Props) {
  return (
    <main className={styles.page} lang="es" data-measurement-page={page}>
      <PageIntro eyebrow="Medición e instrumentos" title={title} description={description} area="knowledge" compact />
      <nav className={styles.tabs} aria-label="Secciones de medición">
        {TABS.map((tab) => (
          <Link key={tab.id} href={`/${locale}${tab.path}`} aria-current={tab.id === page ? 'page' : undefined}
            className={styles.tab} prefetch={false}>
            <span className={styles.marker}>{tab.marker}</span>
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className={styles.body}>{children}</div>
      <p className={styles.related}>
        ¿Estudiás para la licencia? Volvé al{' '}
        <Link href={`/${locale}/radio`} prefetch={false}>curso de radioaficionado</Link>.
      </p>
    </main>
  );
}
