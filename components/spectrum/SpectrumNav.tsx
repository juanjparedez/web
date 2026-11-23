'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LABS } from '@/lib/spectrum/labs';
import styles from './spectrum.module.css';

/** The same menu on every spectrum page: the index plus one link per simulator. */
export function SpectrumNav({ locale }: { locale: string }) {
  const path = usePathname();
  const router = useRouter();
  const base = `/${locale}/espectro`;
  useEffect(() => {
    if (path !== base) return;
    const openLegacyLink = () => {
      const lab = LABS.find(item => item.slug === window.location.hash.slice(1));
      if (lab) router.replace(`${base}/${lab.slug}${window.location.search}`);
    };
    openLegacyLink();
    window.addEventListener('hashchange', openLegacyLink);
    return () => window.removeEventListener('hashchange', openLegacyLink);
  }, [base, path, router]);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    // On narrow screens the menu scrolls sideways: keep the current page's tab in view.
    const list = listRef.current, current = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (list && current) list.scrollLeft = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
  }, [path]);
  const items = [{ href: base, label: 'Índice', n: '' }, ...LABS.map((l, i) => ({ href: `${base}/${l.slug}`, label: l.short, n: String(i + 1) }))];
  return (
    <nav className={styles.labNav} aria-label="Secciones del espectro">
      <ol ref={listRef}>
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} prefetch={false} aria-current={path === it.href ? 'page' : undefined}>
              {it.n && <span>{it.n}</span>}{it.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
