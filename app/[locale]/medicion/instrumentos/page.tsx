import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { MeasurementShell } from '@/components/measurement/MeasurementShell';
import { MultimeterGuide } from '@/components/radio/instruments/MultimeterGuide';

export const dynamic = 'force-static';

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata(
    locale,
    '/medicion/instrumentos',
    'Banco de instrumentos: multímetro, osciloscopio, medidor de ROE y NanoVNA · HIOS',
    'Entrenadores interactivos y guía física de los 4 instrumentos del taller: multímetro True-RMS, osciloscopio con puntas ×1/×10, medidor de ROE con carga fantasma de 50 Ω y NanoVNA.',
  );
}

export default async function InstrumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MeasurementShell
      locale={locale}
      page="instrumentos"
      title="Banco de instrumentos"
      description="Multímetro, osciloscopio, medidor de ROE con carga fantasma de 50 Ω y NanoVNA: cómo se conectan, qué miden y qué pasa si te equivocás."
    >
      <MultimeterGuide />
    </MeasurementShell>
  );
}
