import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { MeasurementShell } from '@/components/measurement/MeasurementShell';
import { InstrumentReference } from '@/components/radio/instruments/InstrumentReference';

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
    'Qué mide cada instrumento: multímetro, osciloscopio, ROE y NanoVNA · HIOS',
    'Comparación de los 4 instrumentos del taller y tabla de conexión segura: impedancia, configuración y precauciones.',
  );
}

export default async function InstrumentsReferencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MeasurementShell page="instrumentos" eyebrow="Medición · Consultar" title="Qué mide cada instrumento"
      description="Multímetro, osciloscopio, medidor de ROE con carga fantasma de 50 Ω y NanoVNA: para qué sirve cada uno y cómo se conecta sin riesgo.">
      <InstrumentReference />
    </MeasurementShell>
  );
}
