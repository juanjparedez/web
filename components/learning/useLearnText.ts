'use client';

import { useTranslations } from 'next-intl';
import type { LearnNavItem } from './learningNav';

/** Label and summary of a nav item; course pages take theirs from the RadioCourse translations. */
export function useLearnText() {
  const t = useTranslations('RadioCourse');
  return {
    label: (item: LearnNavItem) => item.label ?? t(`pages.${item.id}.title`),
    summary: (item: LearnNavItem) => item.summary ?? (item.label ? '' : t(`pages.${item.id}.description`)),
  };
}
