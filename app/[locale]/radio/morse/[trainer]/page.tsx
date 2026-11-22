import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { MORSE_TRAINERS, getMorseTrainer } from '@/lib/radio/morseTrainers';
import { MorseTrainerPage } from '@/components/radio/morse/MorseTrainerPage';

// Fully static: one HTML per locale and trainer.
export const dynamic = 'force-static';
export const dynamicParams = false;

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.flatMap((locale) => MORSE_TRAINERS.map((t) => ({ locale, trainer: t.slug })));
}

interface PageProps {
  params: Promise<{ locale: string; trainer: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, trainer } = await params;
  const info = getMorseTrainer(trainer);
  if (!info) return {};
  return createPageMetadata(locale, `/radio/morse/${info.slug}`, `${info.title} · Código Morse | HIOS`, info.summary);
}

export default async function MorseTrainerRoute({ params }: PageProps) {
  const { locale, trainer } = await params;
  setRequestLocale(locale);
  const info = getMorseTrainer(trainer);
  if (!info) notFound();
  return <MorseTrainerPage trainer={info} locale={locale} />;
}
