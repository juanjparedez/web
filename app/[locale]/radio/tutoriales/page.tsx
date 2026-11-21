import { setRequestLocale } from 'next-intl/server';
import { createPageMetadata } from '@/lib/seo';
import { RadioTutorials } from '@/components/radio/tutorials/RadioTutorials';

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
    '/radio/tutoriales',
    'Tutoriales de Radio y Baofeng UV-5R (RX-Only) · Radioaficionado | HIOS',
    'Guía técnica de programación RX-only con CHIRP para Baofeng UV-5R sin licencia, operación walkie-talkie, subtonos CTCSS/DCS y frecuencias de escucha en Argentina.',
  );
}

export default async function RadioTutorialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RadioTutorials />;
}
