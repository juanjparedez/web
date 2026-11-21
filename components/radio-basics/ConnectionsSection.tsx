'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MathLine } from '@/components/common/MathLine';
import { ConceptCircuit } from './ConceptCircuit';
import styles from './radioBasics.module.css';

function useWorkedExamples() {
  const locale = useLocale();
  const f = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return {
    series: ['Rₑq = 100 + 200 = 300 Ω', `I = 12 / 300 = ${f(0.04)} A = 40 mA`, `V₁ = ${f(0.04)} × 100 = 4 V`, `V₂ = ${f(0.04)} × 200 = 8 V`],
    parallel: [
      `Rₑq = (100 × 200) / (100 + 200) ≈ ${f(200 / 3)} Ω`,
      'I₁ = 12 V / 100 Ω', `= ${f(0.12)} A = 120 mA`,
      'I₂ = 12 V / 200 Ω', `= ${f(0.06)} A = 60 mA`,
      'I = 120 + 60 = 180 mA',
    ],
  };
}

function ConnectionExplanation({ mode }: { mode: 'series' | 'parallel' }) {
  const t = useTranslations('RadioBasics.connections');
  const examples = useWorkedExamples();
  return (
    <section className={styles.connection}>
      <h3>{t(`${mode}Title`)}</h3>
      <p>{t(`${mode}Body`)}</p>
      <div className={styles.formula}>
        <MathLine>{mode === 'series' ? 'I = I₁ = I₂' : 'V = V₁ = V₂'}</MathLine>
        <MathLine>{mode === 'series' ? 'V = V₁ + V₂' : 'I = I₁ + I₂'}</MathLine>
      </div>
      <p>{t(`${mode}Derivation`)}</p>
      <div className={styles.calculation}>
        {examples[mode].map((line) => <MathLine key={line}>{line}</MathLine>)}
      </div>
      <p className={styles.takeaway}>{t(`${mode}Check`)}</p>
    </section>
  );
}

export function ConnectionLesson({ mode }: { mode: 'series' | 'parallel' }) {
  const t = useTranslations('RadioBasics.connections');
  return (
    <section id={mode} aria-label={t(`${mode}Title`)}>
      <p>{t('intro')}</p>
      <p>{t('equivalent')}</p>
      <p className={styles.exampleLabel}>{t('exampleLabel')}</p>
      <ConceptCircuit mode={mode} />
      <ConnectionExplanation mode={mode} />
      <p className={styles.takeaway}>{t('remember')}</p>
      <p>{t('open')}</p>
      {mode === 'series' ? (
        <div className={styles.worked} data-testid="dual-approach-series">
          <h3>Enfoque 1 · Segunda Ley de Kirchhoff (LKT) y conservación de la energía</h3>
          <p>
            En un lazo cerrado sin bifurcaciones, la carga eléctrica que atraviesa cada sección por unidad de tiempo es idéntica (I = cte). Por conservación de la energía, el trabajo entregado por la fuente se reparte exactamente entre las caídas de potencial de cada elemento pasivo (∑ V_subida − ∑ V_caída = 0).
          </p>
          <h3>Enfoque 2 · Impacto en estaciones de radio: caída en líneas de 13,8 V y atenuadores</h3>
          <p>
            Un transceptor de HF de 100 W demanda ≈ 20 A en picos de transmisión a 13,8 V. Si el cable de alimentación, la fusiblera y los terminales suman apenas R_serie = 0,1 Ω, al pulsar el PTT cae ΔV = 20 A · 0,1 Ω = 2,0 V en el cable: al equipo le llegan solo 11,8 V, reduciendo la potencia de salida y provocando distorsión por recorte en BLU/SSB.
          </p>
          <MathLine className={styles.formula}>∑ V_malla = 0   |   Vn = V_total · (Rn / Req)   |   ΔV_cable = I_TX · R_línea</MathLine>
        </div>
      ) : (
        <div className={styles.worked} data-testid="dual-approach-parallel">
          <h3>Enfoque 1 · Primera Ley de Kirchhoff (LKC) y suma de conductancias</h3>
          <p>
            En un nodo eléctrico no se acumula carga neta: toda corriente que entra debe salir (∑ I_entran = ∑ I_salen). Al conectar ramas entre los mismos dos nodos equipotenciales, cada camino suma su conductancia G = 1/R, por lo que la resistencia equivalente siempre resulta menor que la menor de las ramas individuales.
          </p>
          <h3>Enfoque 2 · Construcción de cargas fantasma (Dummy Loads) de 50 Ω para RF</h3>
          <p>
            Para ajustar o medir un transmisor sin irradiar al éter se utiliza una carga fantasma no inductiva de 50 Ω. Conectando N resistores iguales de carbón o película metálica en paralelo (por ejemplo, 20 resistores de 1000 Ω / 2 W en paralelo), obtenemos Req = 1000 Ω / 20 = 50 Ω capaces de disipar 40 W totales, y además dividimos por 20 la inductancia parásita serie de cada componente.
          </p>
          <MathLine className={styles.formula}>∑ I_nodo = 0   |   Geq = 1 / Req = ∑ (1 / Rk)   |   Req(N iguales) = R / N</MathLine>
        </div>
      )}
    </section>
  );
}
