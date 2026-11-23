import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getTranslatedMetadata } from '@/lib/seo-metadata';
import { LABS } from '@/lib/spectrum/labs';
import { PageIntro } from '@/components/ui/PageIntro';
import { SpectrumFacts } from '@/components/spectrum/SpectrumFacts';
import { SpectrumNav } from '@/components/spectrum/SpectrumNav';
import styles from '@/components/spectrum/spectrum.module.css';

export const dynamic = 'force-static';

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getTranslatedMetadata(locale, '/espectro', 'Spectrum');
}

/** Index of the spectrum section: no simulator runs here, each one lives on its own page. */
export default async function SpectrumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className={styles.page} lang="es" data-spectrum-page>
      <SpectrumNav locale={locale} />
      <PageIntro eyebrow="Física · Ondas" title="El espectro electromagnético" area="knowledge" compact
        description="Radio, microondas, infrarrojo, luz, ultravioleta, rayos X y gamma son lo mismo: campos eléctricos y magnéticos que se propagan. Sólo cambia la frecuencia, y con ella todo lo demás." />
      <section className={styles.section} aria-labelledby="spectrum-labs-title">
        <h2 id="spectrum-labs-title">Seis simuladores, uno por página</h2>
        <p className={styles.lead}>
          Cada uno corre en la GPU de tu equipo y sólo mientras lo tenés abierto. Empezá por el espectro completo
          o entrá directo al que te interese.
        </p>
        <div className={styles.labGrid}>
          {LABS.map((lab, i) => (
            <Link key={lab.slug} className={styles.labCard} href={`/${locale}/espectro/${lab.slug}`} prefetch={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/spectrum/${lab.preview}.webp`} alt="" loading="lazy" decoding="async" />
              <span className={styles.labCardText}>
                <em>{i + 1} · {lab.short}</em>
                <strong>{lab.title}</strong>
                <span>{lab.summary}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="spectrum-laws-title">
        <h2 id="spectrum-laws-title">Cuatro relaciones que explican todo</h2>
        <SpectrumFacts />
      </section>
      <p className={styles.related}>
        Para usar estas ondas: el <Link href={`/${locale}/radio`} prefetch={false}>curso de radioaficionado</Link>.
        Para medirlas: <Link href={`/${locale}/medicion`} prefetch={false}>medición e instrumentos</Link>.
      </p>
    </main>
  );
}
