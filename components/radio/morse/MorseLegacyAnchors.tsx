'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MORSE_LEGACY_ANCHORS } from '@/lib/radio/morseTrainers';

/** Old links such as /radio/morse#transmision now open the matching trainer page. */
export function MorseLegacyAnchors({ base }: { base: string }) {
  const router = useRouter();
  useEffect(() => {
    const slug = MORSE_LEGACY_ANCHORS[window.location.hash.slice(1)];
    if (slug) router.replace(`${base}/${slug}`);
  }, [base, router]);
  return null;
}
