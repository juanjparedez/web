'use client';

import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import type { SolderWire } from '@/lib/padWiring/assembly';
import { RichText } from '../../RichText';
import styles from './panel.module.css';

/** One compact line per joint, coloured like its wire. Hover a line to light the wire. */
export function JointList({ joints, colors, done, ready, active, onPick, onToggle }: {
  joints: Array<[string, SolderWire]>; colors: Map<string, string>; done: string[]; ready: boolean;
  active: string; onPick: (key: string) => void; onToggle: (id: string) => void;
}) {
  const t = useTranslations('Assembly');
  return <ol className={styles.joints} onMouseLeave={() => onPick('')}>
    {joints.map(([key, wire]) => {
      const isDone = done.includes(wire.id);
      return <li key={key} data-wire={wire.id} className={`${styles.joint} ${isDone ? styles.jointDone : ''}`} aria-current={active === key || undefined}
        style={{ '--wire': colors.get(key) ?? 'var(--hios-text-muted)' } as CSSProperties} onMouseEnter={() => onPick(key)}>
        <input type="checkbox" checked={isDone} disabled={!ready} onChange={() => onToggle(wire.id)}
          aria-label={t('markDone', { name: wire.name })} />
        <button type="button" onClick={() => onPick(active === key ? '' : key)}>
          <span className={styles.jointTop}>
            <span className={styles.chip}>{wire.spot ? `${wire.spot.header}·${wire.spot.pos}` : wire.pin}</span>
            {wire.spot ? <span className={styles.silk}>{wire.spot.silk}</span> : null}
            <strong>{wire.name}</strong>
          </span>
          {wire.to ? <span className={styles.to}><RichText text={wire.to} /></span> : null}
          {wire.note ? <span className={styles.note}>⚠ <RichText text={wire.note} /></span> : null}
        </button>
      </li>;
    })}
  </ol>;
}
