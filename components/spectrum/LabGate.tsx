'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './spectrum.module.css';

interface Props {
  /** slug used for the section id and the #deep-link that opens it */
  id: string;
  title: string;
  /** one line shown on the closed card */
  summary: string;
  lead: string;
  /** file name in /images/spectrum (a real frame of the simulator) */
  preview: string;
  footnote?: string;
  children: ReactNode;
}

/**
 * A simulator that costs nothing until it is opened: the card is static, and the lab (its JS chunk,
 * its GPU context and its animation loop) only exists while open. Closing it frees everything.
 */
export function LabGate({ id, title, summary, lead, preview, footnote, children }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = () => { if (window.location.hash === `#${id}`) setOpen(true); };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [id]);
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`} data-lab={id} data-open={open}>
      <div className={styles.labHead}>
        <h2 id={`${id}-title`}>{title}</h2>
        {open && <button type="button" className={styles.labClose} onClick={() => {
          setOpen(false);
          if (window.location.hash === `#${id}`) history.replaceState(null, '', window.location.pathname + window.location.search);
        }}>Cerrar simulador</button>}
      </div>
      <p className={styles.lead}>{lead}</p>
      {open ? children : (
        <button type="button" className={styles.labCard} onClick={() => setOpen(true)} aria-label={`Abrir simulador: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/images/spectrum/${preview}.webp`} alt="" loading="lazy" decoding="async" />
          <span className={styles.labCardText}>
            <strong>▶ Abrir simulador</strong>
            <span>{summary}</span>
          </span>
        </button>
      )}
      {open && footnote && <p className={styles.footnote}>{footnote}</p>}
    </section>
  );
}
