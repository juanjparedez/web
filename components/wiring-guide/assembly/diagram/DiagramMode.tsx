'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BoardPinout } from '@/config/pinouts/modules/breakout';
import type { ModuleDiagram as Spec } from '@/lib/padWiring/diagram';
import { assemblyModules, moduleWires } from '@/lib/padWiring/assembly';
import { readRaw, writeRaw } from '@/lib/storage/safeLocalStorage';
import { useWiringGuide } from '../../WiringGuideContext';
import { useAssemblyProgress } from '../useAssemblyProgress';
import { ModuleView } from './ModuleView';
import { Overview } from './Overview';
import styles from './panel.module.css';

/**
 * Soldering mode with drawings: step 0 is the whole PAD on one sheet, then one
 * module per step with every joint drawn as a wire from the ESP32 header.
 */
export function DiagramMode({ diagrams, board }: { diagrams: Record<string, Spec>; board: BoardPinout }) {
  const guide = useWiringGuide();
  const t = useTranslations('Assembly');
  const modules = assemblyModules(guide).filter(item => diagrams[item.id]);
  const progress = useAssemblyProgress(guide);
  const viewKey = `hios:solder:view:${guide.meta.id}`;
  const [view, setView] = useState(0);
  useEffect(() => {
    const saved = Number(readRaw(viewKey));
    if (Number.isInteger(saved) && saved > 0 && saved <= modules.length) setView(saved);
  }, [viewKey, modules.length]);
  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(modules.length, next));
    setView(clamped);
    writeRaw(viewKey, String(clamped));
  };
  const count = (id: string) => {
    const wires = moduleWires(guide, id);
    return [wires.filter(wire => progress.done.includes(wire.id)).length, wires.length];
  };
  const current = view > 0 ? modules[view - 1] : undefined;

  return <section className={styles.mode} data-soldering-mode aria-label={t('title')}>
    <nav className={styles.steps} aria-label={t('modules')}>
      <button type="button" aria-current={view === 0 ? 'step' : undefined} onClick={() => go(0)}>
        <span className={styles.num}>◎</span>{t('overview')}
      </button>
      {modules.map((item, i) => {
        const [n, total] = count(item.id);
        const complete = total > 0 && n === total;
        return <button key={item.id} type="button" aria-current={view === i + 1 ? 'step' : undefined}
          className={complete ? styles.complete : undefined} onClick={() => go(i + 1)} title={item.name}>
          <span className={styles.num}>{complete ? '✓' : i + 1}</span>
          {t(`short.${item.id}`)} <span className={styles.count}>{n}/{total}</span>
        </button>;
      })}
    </nav>
    <p className={styles.notice}><strong>⚠</strong> {t('unpowered')}</p>

    {current ? <ModuleView key={current.id} guide={guide} module={current} spec={diagrams[current.id]} board={board}
      index={view} total={modules.length} done={progress.done} ready={progress.ready} onToggle={progress.toggle} onGo={go} />
      : <>
        <p className={styles.overviewHint}>{t('overviewHint')}</p>
        <Overview guide={guide} onOpen={id => go(modules.findIndex(item => item.id === id) + 1)} />
      </>}
    <p className={styles.muted}>{t('progressHint')}</p>
    {progress.saveFailed ? <p role="alert" className={styles.alert}>{t('saveFailed')}</p> : null}
  </section>;
}
