import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { LABS, labBySlug } from '@/lib/spectrum/labs';
import { PageIntro } from '@/components/ui/PageIntro';
import { SpectrumNav } from '@/components/spectrum/SpectrumNav';
import { LabView } from '@/components/spectrum/labs';
import styles from '@/components/spectrum/spectrum.module.css';

export const dynamic = 'force-static';
export const dynamicParams = false;

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.flatMap((locale) => LABS.map((lab) => ({ locale, lab: lab.slug })));
}

type Params = { params: Promise<{ locale: string; lab: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale, lab: slug } = await params;
  const lab = labBySlug(slug);
  if (!lab) return {};
  return createPageMetadata(locale, `/espectro/${lab.slug}`, `${lab.title} · Espectro electromagnético | HIOS`, lab.summary);
}

/** One simulator per page: leaving the page unmounts it and frees its GPU context. */
export default async function SpectrumLabPage({ params }: Params) {
  const { locale, lab: slug } = await params;
  setRequestLocale(locale);
  const lab = labBySlug(slug);
  if (!lab) notFound();
  const i = LABS.indexOf(lab), prev = LABS[i - 1], next = LABS[i + 1];
  const base = `/${locale}/espectro`;
  return (
    <main className={styles.page} lang="es" data-spectrum-page data-lab={lab.slug}>
      <SpectrumNav locale={locale} />
      <PageIntro eyebrow={`Espectro electromagnético · ${i + 1} de ${LABS.length}`} title={lab.title} area="knowledge" compact
        description={lab.summary} />
      <div className={styles.labBody}>
        <LabView slug={lab.slug} />
      </div>
      <section className={styles.section} aria-labelledby="lab-about">
        <h2 id="lab-about">Qué estás viendo</h2>
        <p className={styles.lead}>{lab.lead}</p>
        {lab.footnote && <p className={styles.footnote}>{lab.footnote}</p>}
      </section>
      <nav className={styles.pager} aria-label="Anterior y siguiente">
        <Link href={prev ? `${base}/${prev.slug}` : base} prefetch={false} data-dir="prev">
          <small>← {prev ? 'Anterior' : 'Volver'}</small>{prev ? prev.short : 'Índice del espectro'}
        </Link>
        {next && <Link href={`${base}/${next.slug}`} prefetch={false} data-dir="next"><small>Siguiente →</small>{next.short}</Link>}
      </nav>
    </main>
  );
}
