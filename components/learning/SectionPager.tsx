'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import courseStyles from '@/components/radio-basics/radioCourse.module.css';
import { KIND_META, LEARN_SECTIONS, findItem, type LearnSectionId } from './learningNav';
import { useLearnText } from './useLearnText';

/** Previous / next inside the same kind of content (e.g. from one instrument trainer to the next). */
export function SectionPager({ section, page }: { section: LearnSectionId; page: string }) {
  const locale = useLocale();
  const text = useLearnText();
  const found = findItem(section, page);
  if (!found) return null;
  const items = found.group.items.filter((item) => !item.crossSection);
  const index = items.findIndex((item) => item.id === page);
  const kind = KIND_META[found.group.kind].short;
  const prev = items[index - 1];
  const next = items[index + 1];
  return (
    <nav className={courseStyles.pager} aria-label={`Más en ${kind}`}>
      {prev ? <Link data-direction="previous" href={`/${locale}${prev.path}`}><span>← Anterior en {kind}</span><strong>{text.label(prev)}</strong></Link>
        : <Link data-direction="previous" href={`/${locale}${LEARN_SECTIONS[section].path}`}><span>← Volver</span><strong>Inicio de {LEARN_SECTIONS[section].title}</strong></Link>}
      {next ? <Link data-direction="next" href={`/${locale}${next.path}`}><span>Siguiente en {kind} →</span><strong>{text.label(next)}</strong></Link> : null}
    </nav>
  );
}
