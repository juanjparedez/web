'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RadioOfflineButton } from '@/components/radio/RadioOfflineButton';
import { KIND_META, LEARN_SECTIONS, findItem, type LearnSectionId } from './learningNav';
import { SectionNavBody } from './SectionNavBody';
import s from './sectionNav.module.css';

function useSheet() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open]);
  return [open, setOpen] as const;
}

/**
 * The one navigation for Radioaficionado and Medición: a sidebar on desktop,
 * and on mobile a sticky "section › kind" bar whose Menú button opens the same menu as a sheet.
 */
export function SectionNav({ section, page = 'home' }: { section: LearnSectionId; page?: string }) {
  const [open, setOpen] = useSheet();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);
  const current = LEARN_SECTIONS[section];
  const kind = findItem(section, page)?.group.kind;
  return (
    <aside className={s.sidebar} data-testid="section-nav" data-section={section}>
      <div className={s.desktop}>
        <SectionNavBody section={section} page={page} idPrefix="nav" />
        {section === 'radio' ? <RadioOfflineButton /> : null}
      </div>
      <div className={s.bar}>
        <span className={s.where}>
          <span aria-hidden="true">{current.icon}</span>
          <strong>{current.title}</strong>
          {kind ? <span className={s.chip} data-kind={kind}>{KIND_META[kind].short}</span> : null}
        </span>
        <button type="button" className={s.menuButton} aria-expanded={open} aria-controls="section-sheet"
          aria-label={`Menú de ${current.title}`} onClick={() => setOpen(!open)}>
          Menú ▾
        </button>
      </div>
      {open ? (
        <div className={s.backdrop} onClick={() => setOpen(false)}>
          <div id="section-sheet" className={s.sheet} role="dialog" aria-modal="true" aria-label={`Menú de ${current.title}`}
            onClick={(event) => event.stopPropagation()}>
            <div className={s.sheetHead}>
              <span>{current.icon} {current.title}</span>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)}>Cerrar ✕</button>
            </div>
            <SectionNavBody section={section} page={page} idPrefix="sheet" />
            {section === 'radio' ? <RadioOfflineButton /> : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
