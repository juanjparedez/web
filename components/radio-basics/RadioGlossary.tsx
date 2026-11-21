'use client';

import Link from 'next/link';
import { Button, Input, Pagination, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLocale, useTranslations } from 'next-intl';
import { glossaryCategories, glossarySources, type GlossaryCategory } from '@/lib/radio/glossary';
import { GLOSSARY_PAGE_SIZE, useRadioGlossary } from './useRadioGlossary';
import { GlossaryEntry } from './GlossaryEntry';
import lessonStyles from './radioBasics.module.css';
import styles from './radioGlossary.module.css';

function revealGlossary() {
  document.getElementById('glossary')?.scrollIntoView({ block: 'start' });
}

function GlossaryControls({ glossary }: { glossary: ReturnType<typeof useRadioGlossary> }) {
  const t = useTranslations('RadioGlossary');
  return (
    <div className={styles.controls}>
      <div className={styles.search}>
        <label htmlFor="radio-glossary-search">{t('search')}</label>
        <Input id="radio-glossary-search" prefix={<SearchOutlined aria-hidden />} allowClear
          placeholder={t('searchPlaceholder')} value={glossary.query} onChange={(event) => glossary.search(event.target.value)} />
      </div>
      <div className={styles.category}>
        <label htmlFor="radio-glossary-category">{t('category')}</label>
        <Select<GlossaryCategory | 'all'> id="radio-glossary-category" value={glossary.category}
          onChange={glossary.selectCategory} options={[
            { value: 'all', label: t('all') },
            ...glossaryCategories.map((value) => ({ value, label: t(`categories.${value}`) })),
          ]} />
      </div>
    </div>
  );
}

function GlossaryNotes() {
  const t = useTranslations('RadioGlossary');
  const locale = useLocale();
  const tools = [
    { href: `/${locale}/radio/lecciones/laboratory`, label: 'Laboratorio DC (Ohm y Kirchhoff)' },
    { href: `/${locale}/calculators`, label: 'Calculadoras RCL, Filtros y Decibeles' },
    { href: `/${locale}/radio/a-electricidad#resonancia`, label: 'Simulador de Resonancia LC y Factor Q' },
    { href: `/${locale}/radio/a-electricidad#filtros`, label: 'Simulador de Filtros Pasabajo y Armónicas (dBc)' },
    { href: `/${locale}/radio/b-modulacion-equipos#modulacion`, label: 'Osciloscopio de Modulación (CW, AM, FM, USB)' },
    { href: `/${locale}/workbench/qpsk-modulator`, label: 'Modulador Digital en Cuadratura (QPSK / I-Q)' },
    { href: `/${locale}/radio/c-antenas-propagacion#roe`, label: 'Simulador de Ondas Estacionarias (ROE / Γ)' },
    { href: `/${locale}/radio/c-antenas-propagacion#antenas`, label: 'Calculadora Física de Antenas' },
    { href: `/${locale}/radio/morse`, label: 'Consola Unificada de Código Morse (CW)' },
    { href: `/${locale}/radio/tutoriales`, label: 'Tutoriales: Baofeng UV-5R (RX-Only / CHIRP)' },
  ];
  return (
    <aside className={styles.notes}>
      <h3>Instrumentos y Simuladores Vinculados al Glosario</h3>
      <div className={styles.related}>
        {tools.map((item) => (
          <Link key={item.href} href={item.href} className={styles.toolLink}>
            {item.label}
          </Link>
        ))}
      </div>
      <p>{t('qNote')}</p>
      <p>{t('bandNote')}</p>
      <a href={glossarySources.enacom.href} target="_blank" rel="noreferrer">{t('bandRules')}</a>
      <p className={styles.sourcesNote}>{t('sourcesNote')}</p>
    </aside>
  );
}

export function RadioGlossary({ showTitle = true }: { showTitle?: boolean }) {
  const t = useTranslations('RadioGlossary');
  const glossary = useRadioGlossary();
  const consult = (term: string) => { glossary.consult(term); revealGlossary(); };
  return (
    <section id="glossary" className={lessonStyles.section} aria-label={t('title')} data-testid="radio-glossary">
      {showTitle ? <h2 id="glossary-title">{t('title')}</h2> : null}
      <p>{t('intro')}</p>
      <p className={styles.englishNote}>{t('englishNote')}</p>
      <GlossaryControls glossary={glossary} />
      <p role="status" className={styles.count}>{t('count', { count: glossary.filtered.length })}</p>
      {glossary.query.trim().toLowerCase() === 'qcl' ? (
        <div className={styles.hint}>
          <p>{t('qclHint')}</p><Button onClick={() => consult('QSL')}>{t('qslSuggestion')}</Button>
        </div>
      ) : null}
      {glossary.visible.length ? (
        <ul className={styles.entries}>
          {glossary.visible.map((entry) => <GlossaryEntry key={entry.id} entry={entry} entries={glossary.entries} consult={consult} />)}
        </ul>
      ) : <p>{t('empty')}</p>}
      <div className={styles.pagination}>
        <Pagination current={glossary.page} total={glossary.filtered.length} pageSize={GLOSSARY_PAGE_SIZE}
          onChange={(page) => { glossary.setPage(page); revealGlossary(); }} hideOnSinglePage showSizeChanger={false} size="small" responsive />
        {(glossary.query || glossary.category !== 'all') ? <Button onClick={() => { glossary.clear(); revealGlossary(); }}>{t('clear')}</Button> : null}
      </div>
      <GlossaryNotes />
    </section>
  );
}
