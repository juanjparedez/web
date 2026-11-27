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

const BENCH_CONCEPTS = [
  {
    id: 'true-rms',
    badge: 'DMM · VALOR EFICAZ',
    title: 'True-RMS vs. Valor Medio y Punta Detectora RF',
    body: 'Un multímetro True-RMS integra v²(t) en vez de asumir forma senoidal (factor 1,11). Con un diodo Schottky (1N5711) rectifica picos de 145 MHz sobre 50 Ω para medir potencia en modo V⎓.',
    href: '/medicion/instrumentos/multimetro',
    cta: 'Abrir Multímetro Digital →',
  },
  {
    id: 'probe-10x',
    badge: 'DSO · 10 MΩ ∥ 12 pF',
    title: 'Punta de Osciloscopio ×10, Compensación RC y Masa PE',
    body: 'La posición ×10 baja la capacidad parásita de ~100 pF a ~12 pF para no ahogar circuitos de RF. Recordá que el cocodrilo negro del BNC está conectado a Tierra (PE 220 V).',
    href: '/medicion/instrumentos/osciloscopio',
    cta: 'Abrir Osciloscopio DSO →',
  },
  {
    id: 'dummy-load',
    badge: 'RF · PATRÓN 50 Ω',
    title: 'Carga Fantasma (Dummy Load 50 Ω) y ROE',
    body: 'Resistor no inductivo de 50 Ω que absorbe el 100 % de la onda directa (|Γ| = 0, ROE 1,0:1) sin irradiar. Colocada al final del coaxil permite distinguir fallas de cable de fallas de antena.',
    href: '/medicion/instrumentos/roe',
    cta: 'Abrir Medidor de ROE →',
  },
  {
    id: 'nanovna-s11',
    badge: 'VNA · S₁₁ Y CARTA DE SMITH',
    title: 'NanoVNA, Calibración SOLT y Reactancia ±jX',
    body: 'Tras calibrar Short-Open-Load (50 Ω), barre la banda e indica si la antena quedó larga (resuena abajo, +jX_L → acortar) o corta (resuena arriba, −jX_C → alargar).',
    href: '/medicion/instrumentos/nanovna',
    cta: 'Abrir Simulador NanoVNA →',
  },
  {
    id: 'ctcss-dcs',
    badge: 'WALKIE-TALKIE · 67–254 Hz',
    title: 'Subtonos CTCSS / DCS ("Subcanales") y FM Narrow',
    body: 'Los códigos 1 a 38 de los walkie-talkies son tonos subaudibles que abren el squelch (no dan privacidad ni encriptan). En UHF canalero se opera en NFM (12,5 kHz).',
    href: '/radio/tutoriales#generador-chirp',
    cta: 'Traductor CTCSS y CHIRP →',
  },
  {
    id: 'duplex-off',
    badge: 'CHIRP · RX-ONLY',
    title: 'Duplex = off (Inhibición de PTT por Firmware)',
    body: 'Configuración de memoria en CHIRP que bloquea la etapa de potencia de RF del Baofeng UV-5R ante pulsaciones accidentales del PTT mientras escuchás sin licencia.',
    href: '/radio/tutoriales#bloqueo-tx-chirp',
    cta: 'Guía RX-Only y CSV →',
  },
] as const;

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
    { href: `/${locale}/medicion`, label: 'Medición: multímetro, osciloscopio, ROE y NanoVNA' },
    { href: `/${locale}/radio/morse`, label: 'Código Morse: seis entrenadores (CW)' },
    { href: `/${locale}/radio/tutoriales#generador-chirp`, label: 'Tutorial Baofeng UV-5R y Armador CSV CHIRP' },
    { href: `/${locale}/radio/b-modulacion-equipos#digitales`, label: 'Simulador SDR (I/Q), SNR y Límite de Shannon' },
    { href: `/${locale}/radio/lecciones/laboratory`, label: 'Laboratorio DC (Ohm y Kirchhoff)' },
    { href: `/${locale}/calculators`, label: 'Calculadoras Electrónicas RCL, Filtros y Ohm' },
    { href: `/${locale}/radio/a-electricidad#resonancia`, label: 'Simulador de Resonancia LC y Factor Q' },
    { href: `/${locale}/radio/a-electricidad#filtros`, label: 'Simulador de Filtros Pasabajo y Armónicas (dBc)' },
    { href: `/${locale}/radio/b-modulacion-equipos#modulacion`, label: 'Osciloscopio de Modulación (CW, AM, FM, USB)' },
    { href: `/${locale}/radio/c-antenas-propagacion#antenas`, label: 'Calculadora Física de Antenas y ROE' },
  ];
  return (
    <aside className={styles.notes} data-testid="glossary-bench-concepts">
      <h3>Conceptos de Instrumentación de Banco, CHIRP y SDR</h3>
      <div className={styles.benchGrid}>
        {BENCH_CONCEPTS.map((item) => (
          <article key={item.id} className={styles.benchCard}>
            <span className={styles.benchBadge}>{item.badge}</span>
            <h4>{item.title}</h4>
            <p>{item.body}</p>
            <Link href={`/${locale}${item.href}`} className={styles.toolLink}>
              {item.cta}
            </Link>
          </article>
        ))}
      </div>
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
