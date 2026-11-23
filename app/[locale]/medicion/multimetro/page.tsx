import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getTranslatedMetadata } from '@/lib/seo-metadata';
import { MeasurementShell } from '@/components/measurement/MeasurementShell';
import { MeasurementSection } from '@/components/radio-basics/PowerSection';

export const dynamic = 'force-static';

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getTranslatedMetadata(locale, '/medicion/multimetro', 'RadioCourse.pages.measurement');
}

export default async function MultimeterLessonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'RadioCourse.pages.measurement' });
  return (
    <MeasurementShell page="multimetro" eyebrow="Medición · Aprender" title={t('title')} description={t('description')}>
      <MeasurementSection />
    </MeasurementShell>
  );
}
