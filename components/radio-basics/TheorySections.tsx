'use client';

import { useTranslations } from 'next-intl';
import { MathLine } from '@/components/common/MathLine';
import { OhmGraph } from './OhmGraph';
import styles from './radioBasics.module.css';

function OhmWorkedExample() {
  const t = useTranslations('RadioBasics.ohm');
  return (
    <div className={styles.worked}>
      <h3>{t('workedTitle')}</h3>
      <ol>
        <li>{t('stepOne')}</li>
        <li>{t('stepTwo')}</li>
        <li>{t('stepThree')}</li>
      </ol>
      <p className={styles.takeaway}>{t('units')}</p>
    </div>
  );
}

export function OhmSection({ showTitle = true }: { showTitle?: boolean }) {
  const t = useTranslations('RadioBasics.ohm');
  return (
    <section id="ohm" aria-label={t('title')}>
      {showTitle ? <h2>{t('title')}</h2> : null}
      <p>{t('intro')}</p>
      <div className={styles.formulas}>
        {([
          ['currentLabel', 'I = V / R'],
          ['voltageLabel', 'V = I · R'],
          ['resistanceLabel', 'R = V / I'],
        ] as const).map(([label, formula]) => (
          <div key={label}><span>{t(label)}</span><strong><MathLine>{formula}</MathLine></strong></div>
        ))}
      </div>
      <OhmWorkedExample />
      <p>{t('prediction')}</p>
      <figure className={styles.graph}>
        <h3>{t('graphTitle')}</h3>
        <OhmGraph />
        <figcaption>{t('graphText')}</figcaption>
      </figure>
      <div className={styles.worked} data-testid="dual-approach-ohm">
        <h3>Enfoque 1 · Linealidad óhmica vs. dispositivos no lineales de RF</h3>
        <p>
          Un resistor metálico a temperatura constante es un componente lineal: su pendiente I/V (conductancia G = 1/R) es fija y no deforma la forma de onda. En cambio, los diodos y transistores tienen curvas I–V no lineales: esa alinealidad es indispensable para mezclar señales (heterodinaje) y detectar envolventes, pero si sobreexcitás un amplificador de RF genera distorsión armónica e intermodulación (IMD).
        </p>
        <h3>Enfoque 2 · Ley de Ohm generalizada en AC/RF (Fasores e Impedancia compleja Z)</h3>
        <p>
          En corriente alterna de frecuencia f (pulsación ω = 2πf), bobinas y capacitores almacenan energía en campos magnéticos y eléctricos, introduciendo un desfasaje φ entre tensión y corriente. La resistencia R se generaliza a la impedancia compleja Z = R + jX, donde X = XL − XC = ωL − 1/(ωC):
        </p>
        <MathLine className={styles.formula}>Z = R + j(ωL − 1/(ωC))   |   |Z| = √(R² + X²) [Ω]   |   φ = arctan(X / R)</MathLine>
      </div>
    </section>
  );
}
