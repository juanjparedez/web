import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/ui/PageIntro';
import { RadioCourseNavigation } from '@/components/radio-basics/RadioCourseNavigation';
import { MultimeterGuide } from '@/components/radio/instruments/MultimeterGuide';
import styles from '@/components/radio-basics/radioCourse.module.css';

export const dynamic = 'force-static';

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata(
    locale,
    '/radio/instrumentos',
    'Uso de Instrumentos: El Multímetro Digital (DMM) en Electrónica y RF · HIOS',
    'Entrenador interactivo y guía física del multímetro digital: selector, bornes COM/V/mA/10A, medición en serie y paralelo, impedancia de 10 MΩ, fusibles HRC y punta detectora de RF.',
  );
}

export default async function RadioInstrumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const base = `/${locale}/radio`;

  return (
    <main className={styles.page} lang="es">
      <div className={styles.shell} data-wide="true">
        <RadioCourseNavigation page="instrumentos" />
        <div className={styles.reading}>
          <PageIntro
            eyebrow={<Link href={base}>← Radioaficionado · Banco de Instrumentación</Link>}
            title="Uso de Instrumentos: Multímetro, Osciloscopio, Medidor de ROE y NanoVNA"
            description="Entrenadores interactivos y protocolo físico de los 4 instrumentos esenciales del taller: Multímetro Digital True-RMS, Osciloscopio con puntas ×1/×10, Watímetro Direccional con Carga Fantasma de 50 Ω y Analizador Vectorial NanoVNA."
            area="knowledge"
            compact
          />
          <MultimeterGuide />
        </div>
      </div>
    </main>
  );
}
