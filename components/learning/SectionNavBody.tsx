'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { KIND_META, LEARN_SECTIONS, findItem, type LearnSectionId } from './learningNav';
import { useLearnText } from './useLearnText';
import s from './sectionNav.module.css';

/** Section switch + the four colour-coded groups. Same markup in the desktop sidebar and the mobile sheet. */
export function SectionNavBody({ section, page, idPrefix }: { section: LearnSectionId; page: string; idPrefix: string }) {
  const locale = useLocale();
  const text = useLearnText();
  const current = LEARN_SECTIONS[section];
  const activeKind = findItem(section, page)?.group.kind;
  return (
    <>
      <nav className={s.switch} aria-label="Cambiar de sección">
        {Object.values(LEARN_SECTIONS).map((entry) => (
          <Link key={entry.id} href={`/${locale}${entry.path}`} prefetch={false}
            aria-current={entry.id === section ? (page === 'home' ? 'page' : 'true') : undefined}>
            <span aria-hidden="true">{entry.icon}</span> {entry.title}
          </Link>
        ))}
      </nav>
      <nav className={s.groups} aria-label={`Contenido de ${current.title}`}>
        {current.groups.map((group) => {
          const meta = KIND_META[group.kind];
          return (
            <details key={group.kind} className={s.group} data-kind={group.kind} open={group.kind === activeKind}>
              <summary id={`${idPrefix}-${group.kind}`}>
                <span className={s.icon} aria-hidden="true">{meta.icon}</span>
                <span className={s.groupTitle}>{meta.title}</span>
                <span className={s.count}>{group.items.length}</span>
              </summary>
              <div className={s.items}>
                {group.items.map((item) => (
                  <Link key={item.id} href={`/${locale}${item.path}`} prefetch={false}
                    aria-current={!item.crossSection && item.id === page ? 'page' : undefined}>
                    {item.marker ? <span className={s.marker}>{item.marker}</span> : null}
                    <span>{text.label(item)}{item.crossSection ? ' ↗' : ''}</span>
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </nav>
    </>
  );
}
