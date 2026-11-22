'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BoardPinout } from '@/config/pinouts/modules/breakout';
import type { ModuleInfo, WiringGuide } from '@/config/pinouts/wiring';
import { moduleSections, moduleWires } from '@/lib/padWiring/assembly';
import { wireKeys, type ModuleDiagram as Spec } from '@/lib/padWiring/diagram';
import { RichText } from '../../RichText';
import { SolderJointGuide } from '../SolderJointGuide';
import { JointList } from './JointList';
import { ModuleDiagram } from './ModuleDiagram';
import { keyColors } from './geometry';
import styles from './panel.module.css';

/** Long module warnings fold to three lines so the joints stay in view. */
function Tip({ text }: { text: string }) {
  const t = useTranslations('Assembly');
  const [open, setOpen] = useState(false);
  const long = text.length > 160;
  return <div className={`${styles.tip} ${long && !open ? styles.clamped : ''}`}>
    <p><RichText text={text} /></p>
    {long ? <button type="button" onClick={() => setOpen(!open)}>{open ? t('showLess') : t('showMore')}</button> : null}
  </div>;
}

/** A module step: the drawing on the left, its joints to tick on the right. */
export function ModuleView({ guide, module, spec, board, index, total, done, ready, onToggle, onGo }: {
  guide: WiringGuide; module: ModuleInfo; spec: Spec; board: BoardPinout; index: number; total: number;
  done: string[]; ready: boolean; onToggle: (id: string) => void; onGo: (next: number) => void;
}) {
  const t = useTranslations('Assembly');
  const [active, setActive] = useState('');
  const joints = useMemo(() => [...wireKeys(moduleWires(guide, module.id, board))], [guide, module.id, board]);
  const colors = useMemo(() => keyColors(spec), [spec]);
  const doneKeys = joints.filter(([, wire]) => done.includes(wire.id)).map(([key]) => key);
  const notes = moduleSections(guide, module.id).filter(section => section.ascii || section.tip);
  const keys = guide.keymap?.rows.map(row => row.keys) ?? [];

  return <div data-module={module.id}>
    <div className={styles.work}>
      <figure className={styles.figure}>
        <ModuleDiagram spec={spec} board={board} keys={keys} active={active} done={doneKeys} onPick={setActive} title={module.name} />
      </figure>
      <aside className={styles.panel}>
        <div className={styles.panelHead}>
          <button type="button" onClick={() => onGo(index - 1)} aria-label={t('previous')}>←</button>
          <h3><span className={styles.of}>{t('stepOf', { current: index, total })}</span><br />{module.icon} {module.name}</h3>
          <button type="button" disabled={index === total} onClick={() => onGo(index + 1)} aria-label={t('next')}>→</button>
        </div>
        <p className={styles.meta}><strong>{t('power')}:</strong> <RichText text={module.power} /></p>
        {module.load ? <p className={styles.meta}><RichText text={module.load} /></p> : null}
        {module.tip ? <Tip text={module.tip} /> : null}
        <JointList joints={joints} colors={colors} done={done} ready={ready} active={active} onPick={setActive} onToggle={onToggle} />
        <div className={styles.progress}>
          <span role="status">{t('progress', { done: doneKeys.length, total: joints.length })}</span>
          {index < total ? <button type="button" className={styles.next} onClick={() => onGo(index + 1)}>{t('next')} →</button> : null}
        </div>
      </aside>
    </div>
    {notes.length > 0 ? <details className={styles.more}>
      <summary>{t('moduleNotes')}</summary>
      {notes.map(section => <div key={section.t}>
        <h4>{section.t}</h4>
        {section.ascii ? <pre className={styles.ascii}>{section.ascii}</pre> : null}
        {section.tip ? <p><RichText text={section.tip} /></p> : null}
      </div>)}
    </details> : null}
    <details className={styles.more}>
      <summary>{t('jointTitle')}</summary>
      <SolderJointGuide />
    </details>
  </div>;
}
