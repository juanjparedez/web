'use client';

import Link from 'next/link';
import { Button, Tag } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { glossarySources, type GlossaryEntry as Entry, type GlossaryEntryId } from '@/lib/radio/glossary';
import styles from './radioGlossary.module.css';

const ENTRY_TOOLS: Partial<Record<GlossaryEntryId, { href: string; label: string }>> = {
  ptt: { href: '/radio/tutoriales#bloqueo-tx-chirp', label: 'Guía bloqueo PTT / CHIRP →' },
  squelch: { href: '/radio/tutoriales#menus-teclado', label: 'Ajuste de Squelch en handy →' },
  repeater: { href: '/radio/tutoriales#frecuencias-rx', label: 'Ver frecuencias de repetidoras →' },
  simplex: { href: '/radio/c-antenas-propagacion#alcance', label: 'Simulador de enlace directo →' },
  rx: { href: '/radio/b-modulacion-equipos#receptor', label: 'Simulador de receptor →' },
  tx: { href: '/radio/a-electricidad#filtros', label: 'Simulador de filtro y armónicas TX →' },
  hf: { href: '/radio/c-antenas-propagacion#ionosfera', label: 'Simulador de ionosfera HF →' },
  vhf: { href: '/radio/c-antenas-propagacion#alcance', label: 'Simulador de enlace VHF/UHF →' },
  uhf: { href: '/radio/lecciones/bands', label: 'Ver espectro UHF y bandas →' },
  fortyMeters: { href: '/radio/c-antenas-propagacion#antenas', label: 'Calculadora de dipolo 40 m →' },
  twentyMeters: { href: '/radio/c-antenas-propagacion#antenas', label: 'Calculadora de antenas HF →' },
  twoMeters: { href: '/radio/lecciones/bands', label: 'Ver banda de 2 m (144–148 MHz) →' },
  seventyCentimeters: { href: '/radio/lecciones/bands', label: 'Ver banda de 70 cm (430–440 MHz) →' },
  fm: { href: '/radio/b-modulacion-equipos#modulacion', label: 'Osciloscopio de modulación FM →' },
  am: { href: '/radio/b-modulacion-equipos#modulacion', label: 'Osciloscopio de modulación AM →' },
  ssb: { href: '/radio/b-modulacion-equipos#modulacion', label: 'Osciloscopio de banda lateral SSB →' },
  cw: { href: '/radio/morse', label: 'Abrir Consola Morse (CW) →' },
  ft8: { href: '/workbench/qpsk-modulator', label: 'Simulador de modulación digital →' },
  dmr: { href: '/radio/lecciones/bands', label: 'Ver DMR, compresión y TDMA →' },
  qrn: { href: '/radio/morse', label: 'Probar filtro de ruido QRN en CW →' },
  qrp: { href: '/radio/c-antenas-propagacion#alcance', label: 'Calcular presupuesto de enlace →' },
};

export function GlossaryEntry({ entry, entries, consult }: {
  entry: Entry; entries: Entry[]; consult: (term: string) => void;
}) {
  const t = useTranslations('RadioGlossary');
  const locale = useLocale();
  const source = glossarySources[entry.source];
  const related = entries.filter((candidate) => entry.related?.includes(candidate.id));
  const qCode = entry.id.startsWith('q');
  const tool = ENTRY_TOOLS[entry.id];
  return (
    <li className={styles.entry} data-glossary-entry={entry.id}>
      <div className={styles.entryHeading}>
        <h3><span className={styles.term}>{entry.term}</span><span>{entry.name}</span></h3>
        <Tag>{t(`categories.${entry.category}`)}</Tag>
      </div>
      <p className={styles.english}>
        <span>{t(qCode ? 'englishCodeLabel' : 'englishLabel')}: </span>
        <span lang="en">{entry.english}</span>
      </p>
      <p>{entry.meaning}</p>
      <p className={styles.example}><strong>{t('example')}: </strong>{entry.example}</p>
      <div className={styles.entryFooter}>
        <a href={source.href} target="_blank" rel="noreferrer">{t('source')}: {source.label}</a>
        {tool ? (
          <Link href={`/${locale}${tool.href}`} className={styles.toolLink}>
            {tool.label}
          </Link>
        ) : null}
        {related.length ? (
          <div className={styles.related} aria-label={t('related')}>
            {related.map((item) => <Button key={item.id} size="small" onClick={() => consult(item.term)}>{item.term}</Button>)}
          </div>
        ) : null}
      </div>
    </li>
  );
}
