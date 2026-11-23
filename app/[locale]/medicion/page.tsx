import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { MeasurementShell } from '@/components/measurement/MeasurementShell';
import { SectionHub } from '@/components/learning/SectionHub';

export const dynamic = 'force-static';

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata(
    locale,
    '/medicion',
    'Medición: multímetro, osciloscopio, ROE y NanoVNA · HIOS',
    'Aprendé a medir y practicá con un entrenador por instrumento: multímetro, osciloscopio, medidor de ROE y NanoVNA.',
  );
}

export default async function MeasurementHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MeasurementShell page="home" eyebrow="Radio y medición" title="Medición"
      description="Aprendé dónde se conecta cada instrumento y practicá con un entrenador por instrumento: qué marca y qué pasa si te equivocás.">
      <SectionHub section="medicion" />
    </MeasurementShell>
  );
}
