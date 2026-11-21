'use client';

import { Alert } from 'antd';
import { useTranslations } from 'next-intl';
import { MathLine } from '@/components/common/MathLine';
import { MeterDiagram } from './MeterDiagram';
import styles from './radioBasics.module.css';

export function MeasurementSection() {
  const t = useTranslations('RadioBasics.power');
  return (
    <section id="measurement" aria-label={t('measurementTitle')}>
      <div className={styles.connections}>
        <figure className={styles.measurement}>
          <h2>{t('voltmeterTitle')}</h2>
          <MeterDiagram kind="voltage" />
          <figcaption>{t('voltmeter')}</figcaption>
        </figure>
        <figure className={styles.measurement}>
          <h2>{t('ammeterTitle')}</h2>
          <MeterDiagram kind="current" />
          <figcaption>{t('ammeter')}</figcaption>
        </figure>
      </div>
      <p>{t('ohmmeter')}</p>
      <Alert type="warning" showIcon message={t('meterWarning')} />
      <div className={styles.worked} data-testid="dual-approach-measurement">
        <h3>Enfoque 1 · Perturbación del circuito por la impedancia del instrumento</h3>
        <p>
          Medir es interactuar con el circuito: un voltímetro real se modela como una resistencia interna muy alta (R_V ≈ 10 MΩ en un multímetro digital) en paralelo con los puntos medidos, para derivar una corriente despreciable. Un amperímetro real se modela como una resistencia shunt muy baja (R_A → 0 Ω) en serie; si lo apoyás en paralelo sobre una fuente de tensión, provocás un cortocircuito directo I = V / R_A.
        </p>
        <h3>Enfoque 2 · Mediciones en Radiofrecuencia: Watímetro direccional, Punta RF y NanoVNA</h3>
        <p>
          Un multímetro convencional solo responde en DC y AC de baja frecuencia (50–400 Hz). En RF (MHz/GHz), las capacidades e inductancias parásitas de las puntas alteran la impedancia del nodo. Por eso en el banco de RF medimos con acopladores direccionales de 50 Ω (medidor de ROE y potencia directa/reflejada), puntas detectoras de diodo Schottky con carga de 50 Ω, puntas de osciloscopio ×10 compensadas (10 MΩ ∥ ~12 pF) y analizadores vectoriales de redes (VNA).
        </p>
        <MathLine className={styles.formula}>ROE = (1 + √(P_ref / P_dir)) / (1 − √(P_ref / P_dir))   |   P_neta = P_dir − P_ref</MathLine>
      </div>
    </section>
  );
}

export function PowerSection({ showTitle = true }: { showTitle?: boolean }) {
  const t = useTranslations('RadioBasics.power');
  return (
    <section id="power" aria-label={t('title')}>
      {showTitle ? <h2>{t('title')}</h2> : null}
      <p>{t('intro')}</p>
      <MathLine className={styles.formula}>P = V · I = I² · R = V² / R</MathLine>
      <div className={styles.worked}>
        <h3>{t('workedTitle')}</h3>
        <p>{t('workedBody')}</p>
        <p>{t('rating')}</p>
      </div>
      <p>{t('conservation')}</p>
      <p className={styles.takeaway}>{t('rf')}</p>
      <div className={styles.worked} data-testid="dual-approach-power-section">
        <h3>Enfoque 1 · Transferencia de energía y disipación térmica vs. radiación</h3>
        <p>
          La potencia instantánea p(t) = v(t)·i(t) mide la rapidez con que el campo electromagnético entrega energía a un elemento. Si la carga es un resistor, la energía se disipa en calor (efecto Joule); si es una antena adaptada a la línea de transmisión, la potencia activa abandona el conductor como radiación electromagnética.
        </p>
        <h3>Enfoque 2 · Teorema de Máxima Transferencia de Potencia, PEP y escala dBm</h3>
        <p>
          Una fuente de RF con impedancia interna Zs = 50 Ω entrega la máxima potencia activa a la carga cuando ZL = 50 Ω (sin reactancia). En modos con envolvente variable como BLU/SSB, la potencia se especifica como PEP (Potencia Pico de Envolvente, medida en la cresta de modulación sobre 50 Ω), y en telemetría o recepción usamos decibeles referidos a 1 mW (dBm):
        </p>
        <MathLine className={styles.formula}>P[dBm] = 10 · log₁₀(P[W] / 0,001 W)   |   1 W = +30 dBm   |   5 W ≈ +37 dBm</MathLine>
      </div>
    </section>
  );
}
