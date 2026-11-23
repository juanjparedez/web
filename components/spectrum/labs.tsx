'use client';

import dynamic from 'next/dynamic';
import type { LabSlug } from '@/lib/spectrum/labs';
import styles from './spectrum.module.css';

/**
 * Each simulator is its own chunk and only exists on its own page. Navigating away unmounts it,
 * which disposes its GPU context and stops its animation loop.
 */
const loading = () => <div className={styles.labLoading} role="status">Cargando simulador…</div>;

const VIEWS: Record<LabSlug, React.ComponentType> = {
  explorador: dynamic(() => import('./SpectrumExplorer').then((m) => m.SpectrumExplorer), { ssr: false, loading }),
  onda: dynamic(() => import('./WaveLab').then((m) => m.WaveLab), { ssr: false, loading }),
  cubeta: dynamic(() => import('./RippleTank').then((m) => m.RippleTank), { ssr: false, loading }),
  chladni: dynamic(() => import('./ChladniPlate').then((m) => m.ChladniPlate), { ssr: false, loading }),
  fibra: dynamic(() => import('./FiberLab').then((m) => m.FiberLab), { ssr: false, loading }),
  'cuerpo-negro': dynamic(() => import('./BlackbodyLab').then((m) => m.BlackbodyLab), { ssr: false, loading }),
};

export function LabView({ slug }: { slug: LabSlug }) {
  const View = VIEWS[slug];
  return <View />;
}
