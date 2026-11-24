'use client';

import { SectionNav } from '@/components/learning/SectionNav';

/** Any radio page id from components/learning/learningNav ('home', a lesson id, 'programa', …). */
export type RadioNavPageId = string;

/** Radio pages use the shared section navigation (same menu as Medición). */
export function RadioCourseNavigation({ page = 'home' }: { page?: RadioNavPageId }) {
  return <SectionNav section="radio" page={page} />;
}
