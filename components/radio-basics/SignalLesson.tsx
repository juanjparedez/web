'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { MathLine } from '@/components/common/MathLine';
import { MorseBranches } from './MorseBranches';
import styles from './radioBasics.module.css';

type Topic = 'waves' | 'propagation' | 'morse';

function SignalFigure({ topic, caption }: { topic: Topic; caption: string }) {
  return (
    <figure className={styles.graph}>
      <div className={styles.graphPlot}>
        <svg viewBox="0 0 300 100" role="img" aria-label={caption}>
          {topic === 'waves' && <>
            <path className={styles.axis} d="M10 50H290" />
            <path className={styles.lineOne} fill="none" d="M10 50q30 -65 60 0t60 0t60 0t60 0" />
            <path className={styles.axis} d="M40 62v12m0 -6h120m0 -6v12" />
            <text x="100" y="90" textAnchor="middle">λ</text>
          </>}
          {topic === 'propagation' && <>
            <path className={styles.axis} fill="none" d="M5 90Q150 60 295 90" />
            <path className={styles.lineOne} fill="none" d="M30 84V45m0 0h240m0 0V84" />
            <text x="30" y="37" textAnchor="middle">TX</text>
            <text x="270" y="37" textAnchor="middle">RX</text>
          </>}
          {topic === 'morse' && <>
            <path className={styles.axis} d="M20 62H280" />
            <path className={styles.lineOne} fill="none" d="M25 62V28h40v34h40V28h120v34" />
            <text x="45" y="86" textAnchor="middle">1</text>
            <text x="85" y="86" textAnchor="middle">1</text>
            <text x="165" y="86" textAnchor="middle">3</text>
          </>}
        </svg>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

const DUAL_APPROACH: Record<Topic, { physicalTitle: string; physicalBody: string; rigorTitle: string; rigorBody: string; equation: string }> = {
  waves: {
    physicalTitle: 'Enfoque 1 · Física del campo electromagnético (Sin magia)',
    physicalBody:
      'Una corriente continua (DC) genera un campo magnético estático y una carga quieta genera un campo eléctrico estático; ninguno de los dos se desprende del conductor. Para radiar al espacio libre las cargas deben acelerarse (corriente alterna de RF). Esa aceleración hace que la variación temporal del campo eléctrico ∂E/∂t engendre un campo magnético rotacional B, y la variación ∂B/∂t regenere a su vez al campo eléctrico E, propagándose de forma autónoma a la velocidad de la luz c.',
    rigorTitle: 'Enfoque 2 · Rigor Electromagnético (Maxwell, Poynting e Impedancia de Onda)',
    rigorBody:
      'En zona lejana (campo radiado, r ≫ λ/2π), los vectores de campo eléctrico E y densidad de flujo magnético B están en fase, son mutuamente ortogonales (E ⊥ B) y transversales a la dirección de propagación k (onda TEM). El flujo de densidad de potencia instantánea lo da el vector de Poynting S, y el cociente E/H define la impedancia intrínseca del vacío Z₀ ≈ 377 Ω:',
    equation: 'λ = c / f   |   Z₀ = √(μ₀ / ε₀) ≈ 376,73 Ω   |   S = (1 / μ₀) · (E × B)',
  },
  propagation: {
    physicalTitle: 'Enfoque 1 · Refracción ionosférica, línea de vista y difracción',
    physicalBody:
      'Las ondas de radio no «rebotan como pelotas contra un techo duro». Al entrar en las capas ionizadas D, E, F1 y F2 (gas neutro con electrones libres arrancados por radiación UV/X solar), los electrones oscilan con el campo eléctrico de la onda y cambian el índice de refracción efectivo del medio (n < 1), curvando gradualmente la trayectoria de vuelta hacia la Tierra.',
    rigorTitle: 'Enfoque 2 · Frecuencia Crítica de Plasma, MUF y Pérdida de Espacio Libre (FSPL)',
    rigorBody:
      'Un plasma con densidad electrónica Ne (e⁻/m³) tiene una frecuencia crítica vertical fc ≈ 9·√Ne. Para incidencia oblicua con ángulo cenital θi, la Frecuencia Máxima Utilizable sigue la ley de la secante MUF = fc·sec(θi); por encima de la MUF (como ocurre en VHF/UHF), el índice n → 1 y la onda atraviesa la ionosfera hacia el espacio. En propagación directa, la densidad de potencia cae con 1/r² (esfera de área 4πd²):',
    equation: 'fc ≈ 9 · √Ne [Hz]   |   MUF = fc / cos(θi)   |   FSPL [dB] = 32,44 + 20·log₁₀(f_MHz) + 20·log₁₀(d_km)',
  },
  morse: {
    physicalTitle: 'Enfoque 1 · Por qué una portadora interrumpida llega donde la voz desaparece',
    physicalBody:
      'En telegrafía CW (onda continua modulada en amplitud por todo o nada, OOK), el transmisor solo emite energía cuando cerrás el manipulador. Como no hay que reproducir el timbre complejo de la voz humana, el receptor puede usar un filtro pasabanda de cristal o DSP ultrangosto (150 a 250 Hz), rechazando más del 90 % del ruido térmico de fondo que entraría en un canal de voz SSB (2400 Hz).',
    rigorTitle: 'Enfoque 2 · Ancho de Banda de Manipulación, Tiempo de Subida y Relación S/N',
    rigorBody:
      'La potencia de ruido térmico en el receptor es Pn = kB·T·B. Reducir el ancho de banda B de 2400 Hz (SSB) a 150 Hz (CW) mejora la relación señal a ruido en 10·log₁₀(2400/150) = +12,04 dB (equivalente a multiplicar por 16 la potencia del transmisor). Para evitar clics de manipulación (espurias laterales por transiciones abruptas), la envolvente de RF se conforma con rampas suaves de ~4 a 5 ms:',
    equation: 'T_dit [ms] = 1200 / WPM   |   B_CW ≈ 4 / T_dit   |   ΔSNR = 10·log₁₀(B_SSB / B_CW) ≈ +12 dB',
  },
};

export function SignalLesson({ topic }: { topic: Topic }) {
  const t = useTranslations(`RadioCourse.pages.${topic}`);
  const locale = useLocale();
  const dual = DUAL_APPROACH[topic];
  return (
    <section>
      {topic === 'morse' ? (
        <div className={styles.worked} data-testid="morse-console-callout" style={{ marginBottom: 24, borderColor: 'var(--accent-2-text)' }}>
          <h2>★ Consola Interactiva de Código Morse (CW): Audio, Transmisión, Traductor y Koch</h2>
          <p>
            Esta página explica los fundamentos físicos del tiempo de punto y el ancho de banda en CW. Para practicar
            con sonido real, control global de ruido QRN, manipulador (llave o paletas), traductor y recepción Koch,
            entrá directo a la consola completa:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            <Link href={`/${locale}/radio/morse#transmision`} style={{ fontWeight: 700, color: 'var(--accent-2-text)' }}>
              ▶ {t('link')} (Consola CW Completa) →
            </Link>
            <Link href={`/${locale}/radio/morse#alfabeto`}>2 · Alfabeto Sonoro ITU →</Link>
            <Link href={`/${locale}/radio/morse#traductor`}>3 · Traductor Texto ↔ Morse →</Link>
            <Link href={`/${locale}/radio/morse#entrenador`}>4 · Entrenador Koch →</Link>
          </div>
        </div>
      ) : null}
      <p>{t('definition')}</p>
      <SignalFigure topic={topic} caption={t('caption')} />
      <div className={styles.worked}>
        <h2>{t('question')}</h2>
        <p>{t('example')}</p>
        <MathLine className={styles.formula}>{t('calculation')}</MathLine>
        <p>{t('answer')}</p>
      </div>
      <div className={styles.worked} data-testid={`dual-approach-${topic}`}>
        <h2>{dual.physicalTitle}</h2>
        <p>{dual.physicalBody}</p>
        <h3>{dual.rigorTitle}</h3>
        <p>{dual.rigorBody}</p>
        <MathLine className={styles.formula}>{dual.equation}</MathLine>
      </div>
      {topic === 'morse' && <MorseBranches />}
      {topic === 'waves' && <Link href={`/${locale}/radio/a-electricidad#alterna`}>{t('link')}</Link>}
      {topic === 'propagation' && <Link href={`/${locale}/radio/lecciones/bands`}>{t('link')}</Link>}
    </section>
  );
}
