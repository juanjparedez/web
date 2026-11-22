'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { BoardPinout } from '@/config/pinouts/modules/breakout';
import { DIAGRAM_H, DIAGRAM_W, HEADER_X, type ModuleDiagram as Spec } from '@/lib/padWiring/diagram';
import { EspBoard, ESP_W } from './EspBoard';
import { LinkView } from './LinkView';
import { PartCard } from './PartCard';
import { assignLanes, extentX, keyColors, pinGeometry, toScreen } from './geometry';
import styles from './diagram.module.css';

const TAG_KEYS = new Set(['rail5v', 'rail3v3', 'tftLed']);

/**
 * One module, drawn: the ESP32 as you hold it, the real part(s), and a wire from
 * each header hole to the pin it lands on. Hover or tap a wire to isolate it.
 */
export function ModuleDiagram({ spec, board, keys, active, done, onPick, title }: {
  spec: Spec; board: BoardPinout; keys: string[][]; active: string; done: string[];
  onPick: (key: string) => void; title: string;
}) {
  const t = useTranslations('Assembly');
  const mirrored = spec.header === 'J1';
  const map = toScreen(mirrored);
  const pins = useMemo(() => pinGeometry(spec), [spec]);
  const colors = useMemo(() => keyColors(spec), [spec]);
  const lanes = useMemo(() => assignLanes(spec.links.filter(l => l.kind === 'esp'), pins), [spec, pins]);
  const width = useMemo(() => extentX(spec, pins), [spec, pins]);
  const label = (text: string) => (TAG_KEYS.has(text) ? t(`tag.${text}`) : text);
  const activeHoles = new Map<string, string>();
  spec.links.forEach(link => { if (link.kind === 'esp') activeHoles.set(`${spec.header}-${link.pos}`, colors.get(link.key) ?? ''); });
  const boardX = mirrored ? DIAGRAM_W - HEADER_X - 9 : HEADER_X + 9 - ESP_W;
  const state = (key: string) => [
    active && key === active ? styles.on : '', active && key !== active ? styles.dim : '',
    key && done.includes(key) ? styles.done : '',
  ].join(' ');

  return <svg viewBox={`${mirrored ? DIAGRAM_W - width : 0} 0 ${width} ${DIAGRAM_H}`} className={styles.svg} role="img" aria-label={title}
    onClick={event => { if (event.target === event.currentTarget) onPick(''); }}>
    <EspBoard board={board} x={boardX} active={activeHoles} antenna={t('antenna')} />
    {spec.caption ? <text x={mirrored ? DIAGRAM_W - width + 24 : width - 24} y={DIAGRAM_H - 8} textAnchor={mirrored ? 'start' : 'end'} className="dgCaption">{t(spec.caption)}</text> : null}
    {spec.cards.map(card => <g key={card.id} className={card.pins.some(pin => pin.key === active) || !active ? '' : styles.dimCard}>
      <PartCard card={card} title={t(`part.${card.title}`)} pins={pins} map={map} colors={colors} mirrored={mirrored}
        keys={keys} active={active} onPick={onPick} />
    </g>)}
    {spec.links.map((link, i) => <g key={i} className={`${styles.link} ${state(link.key)}`} data-key={link.key}
      onClick={link.key ? () => onPick(link.key === active ? '' : link.key) : undefined}>
      <LinkView link={link} pins={pins} lane={link.kind === 'esp' ? lanes.get(link) : undefined} map={map}
        color={colors.get(link.key) ?? 'var(--dg-neutral)'} label={label} />
    </g>)}
  </svg>;
}
