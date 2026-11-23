'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { KIND_META, LEARN_SECTIONS, type LearnKind, type LearnSectionId } from './learningNav';
import { useLearnText } from './useLearnText';
import s from './sectionHub.module.css';

interface Props {
  section: LearnSectionId;
  banner?: ReactNode;
  /** Stable test ids for a kind's card grid (defaults to hub-group-<kind>). */
  testIds?: Partial<Record<LearnKind, string>>;
  children?: ReactNode;
}

/** Section home in the Morse-hub style: one coloured block of cards per kind of content. */
export function SectionHub({ section, banner, testIds = {}, children }: Props) {
  const locale = useLocale();
  const text = useLearnText();
  const { groups } = LEARN_SECTIONS[section];
  return (
    <div className={s.hub} data-testid="section-hub" data-section={section}>
      {banner}
      <nav className={s.strip} aria-label="Ir a un tipo de contenido">
        {groups.map((group) => (
          <a key={group.kind} href={`#hub-${group.kind}`} className={s.stripChip} data-kind={group.kind}>
            <span aria-hidden="true">{KIND_META[group.kind].icon}</span> {KIND_META[group.kind].short}
          </a>
        ))}
      </nav>
      {groups.map((group) => {
        const meta = KIND_META[group.kind];
        return (
          <section key={group.kind} id={`hub-${group.kind}`} className={s.block} data-kind={group.kind} aria-labelledby={`hub-${group.kind}-title`}>
            <header className={s.blockHead}>
              <h2 id={`hub-${group.kind}-title`}><span className={s.icon} aria-hidden="true">{meta.icon}</span>{meta.title}</h2>
              <p>{group.hint}</p>
            </header>
            <div className={s.cards} data-testid={testIds[group.kind] ?? `hub-group-${group.kind}`}>
              {group.items.map((item) => (
                <Link key={item.id} href={`/${locale}${item.path}`} prefetch={false} className={s.card}>
                  {item.marker ? <span className={s.marker}>{item.marker}</span> : null}
                  <strong>{text.label(item)}{item.crossSection ? ' ↗' : ''}</strong>
                  {text.summary(item) ? <span className={s.summary}>{text.summary(item)}</span> : null}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {children}
    </div>
  );
}
