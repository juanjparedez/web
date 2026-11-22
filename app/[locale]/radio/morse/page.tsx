import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { MorseHub } from '@/components/radio/morse/MorseHub';

// Fully static: one HTML per locale.
export const dynamic = 'force-static';

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createPageMetadata(locale, '/radio/morse', 'Código Morse · Radioaficionado | HIOS',
    'Seis entrenadores de Código Morse: árbol de letras, reconocimiento de oído, transmisión con llave, método Koch, alfabeto sonoro y traductor.');
}

export default async function MorsePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MorseHub locale={locale} />;
}
