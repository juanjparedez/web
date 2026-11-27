'use client';

import dynamic from 'next/dynamic';
import styles from './spectrum.module.css';

/** Each simulator is its own chunk, fetched the first time its LabGate opens. */
const loading = () => <div className={styles.labLoading} role="status">Cargando simulador…</div>;

export const WaveSection = dynamic(() => import('./WaveSection').then((m) => m.WaveSection), { ssr: false, loading });
export const RippleTank = dynamic(() => import('./RippleTank').then((m) => m.RippleTank), { ssr: false, loading });
export const ChladniPlate = dynamic(() => import('./ChladniPlate').then((m) => m.ChladniPlate), { ssr: false, loading });
export const FiberLab = dynamic(() => import('./FiberLab').then((m) => m.FiberLab), { ssr: false, loading });
export const BlackbodyLab = dynamic(() => import('./BlackbodyLab').then((m) => m.BlackbodyLab), { ssr: false, loading });
