import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { MeasurementShell } from '@/components/measurement/MeasurementShell';
import { MultimeterLab } from '@/components/radio/instruments/MultimeterLab';
import { OscilloscopeLab } from '@/components/radio/instruments/OscilloscopeLab';
import { SwrMeterLab } from '@/components/radio/instruments/SwrMeterLab';
import { NanoVnaLab } from '@/components/radio/instruments/NanoVnaLab';

export const dynamic = 'force-static';
export const dynamicParams = false;

/** One trainer page per bench instrument; `page` is its id in the Medición menu. */
const INSTRUMENTS: Record<string, { page: string; title: string; description: string; Lab: ComponentType }> = {
  multimetro: { page: 'dmm', title: 'Entrenador de multímetro', Lab: MultimeterLab,
    description: 'Girá el selector, enchufá la punta roja en el borne correcto y apoyá las puntas en serie o en paralelo.' },
  osciloscopio: { page: 'osciloscopio', title: 'Osciloscopio', Lab: OscilloscopeLab,
    description: 'Punta ×1 o ×10, base de tiempo y V/div: cómo leer tensión pico a pico y frecuencia en la pantalla.' },
  roe: { page: 'roe', title: 'Medidor de ROE y potencia', Lab: SwrMeterLab,
    description: 'Potencia directa y reflejada, carga fantasma de 50 Ω y qué ROE es aceptable antes de transmitir.' },
  nanovna: { page: 'nanovna', title: 'NanoVNA', Lab: NanoVnaLab,
    description: 'Barrido de una antena: dónde resuena, si quedó larga o corta y cuánto cortar.' },
};

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.flatMap((locale) => Object.keys(INSTRUMENTS).map((instrumento) => ({ locale, instrumento })));
}

interface PageProps { params: Promise<{ locale: string; instrumento: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { locale, instrumento } = await params;
  const info = INSTRUMENTS[instrumento];
  if (!info) return {};
  return createPageMetadata(locale, `/medicion/instrumentos/${instrumento}`, `${info.title} · Medición | HIOS`, info.description);
}

export default async function InstrumentTrainerPage({ params }: PageProps) {
  const { locale, instrumento } = await params;
  setRequestLocale(locale);
  const info = INSTRUMENTS[instrumento];
  if (!info) notFound();
  const { Lab } = info;
  return (
    <MeasurementShell page={info.page} eyebrow="Medición · Practicar" title={info.title} description={info.description}>
      <Lab />
    </MeasurementShell>
  );
}
