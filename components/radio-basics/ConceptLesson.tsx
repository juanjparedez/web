'use client';

import { useTranslations } from 'next-intl';
import { MathLine } from '@/components/common/MathLine';
import { ConceptCircuit } from './ConceptCircuit';
import styles from './radioBasics.module.css';

export type ElectricalConcept = 'voltage' | 'current' | 'resistance' | 'power';

const CONCEPT_DUAL: Record<ElectricalConcept, { physicalTitle: string; physicalBody: string; rigorTitle: string; rigorBody: string; equation: string }> = {
  voltage: {
    physicalTitle: 'Enfoque 1 · Física del campo eléctrico y potencial (Sin magia)',
    physicalBody:
      'La tensión no es «velocidad de los electrones» ni requiere que haya corriente circulando. Es la diferencia de energía potencial electrostática por unidad de carga (ΔV = W / q) creada por la separación de cargas entre dos bornes. Un campo eléctrico conservativo E existe entre los terminales de una batería o fuente aun en circuito abierto (I = 0 A).',
    rigorTitle: 'Enfoque 2 · Rigor en AC y Radiofrecuencia (Valor eficaz RMS, pico y 50 Ω)',
    rigorBody:
      'En corriente alterna senoidal v(t) = Vp·sen(ωt), el valor que produce la misma disipación térmica en una carga resistiva que una fuente continua es el valor eficaz o cuadrático medio V_RMS = Vp / √2. En sistemas de RF normalizados a Z₀ = 50 Ω, un handy transmitiendo 5 W desarrolla V_RMS = √(P·Z₀) = 15,81 V (22,36 V de pico) en el conector de antena, mientras que en recepción una señal S9 en HF equivale a apenas 50 μV_RMS (−73 dBm):',
    equation: 'ΔV = W / q [J/C = V]   |   V_RMS = Vp / √2   |   V_RMS(50 Ω) = √(P · 50 Ω)',
  },
  current: {
    physicalTitle: 'Enfoque 1 · Velocidad de deriva electrónica vs. propagación del campo',
    physicalBody:
      'Cuando cerrás un interruptor o presionás el PTT, los electrones libres dentro del metal se desplazan con una velocidad de deriva media lentísima (fracciones de milímetro por segundo). Lo que viaja casi a la velocidad de la luz (multiplicada por el factor de velocidad vf del dieléctrico, 0,66 a 0,85·c) es la perturbación del campo electromagnético que pone en movimiento a todos los portadores del conductor casi simultáneamente.',
    rigorTitle: 'Enfoque 2 · Caudal de carga, densidad de corriente J y corriente de desplazamiento',
    rigorBody:
      'La corriente de conducción es la derivada temporal de la carga i(t) = dq/dt = ∫ J·dA. En dieléctricos (entre las placas de un capacitor o en el espacio que rodea a una antena), Maxwell demostró que la continuidad del circuito se cierra mediante la corriente de desplazamiento Id = ε·(dΦE/dt), que genera campo magnético igual que una corriente de electrones:',
    equation: 'i(t) = dq / dt [C/s = A]   |   I = n · e · A · vd   |   Id = ε · (dΦE / dt)',
  },
  resistance: {
    physicalTitle: 'Enfoque 1 · Dispersión en la red cristalina y conversión térmica (Joule)',
    physicalBody:
      'Dentro de un conductor metálico, los electrones acelerados por el campo eléctrico chocan continuamente contra las imperfecciones y vibraciones térmicas (fonones) de la red de iones. Esa fricción microscópica frena el flujo neto y convierte energía potencial eléctrica de forma irreversible en calor, proporcional a la resistividad ρ y a la longitud L, e inversamente proporcional a la sección transversal A.',
    rigorTitle: 'Enfoque 2 · Resistencia en RF: Efecto Pelicular (Skin Effect) y Resistencia de Radiación',
    rigorBody:
      'En corriente continua la corriente ocupa toda la sección del alambre (R_DC = ρ·L/A). En radiofrecuencia, el campo magnético alterno induce corrientes parásitas internas que obligan a los electrones a circular solo por una cáscara superficial de espesor δ (profundidad pelicular o skin depth; en cobre a 145 MHz, δ ≈ 5,5 μm), aumentando la resistencia efectiva de RF. Además, una antena presenta una resistencia de radiación Rr (≈ 73 Ω en un dipolo de λ/2) que representa la potencia entregada como onda electromagnética al espacio libre:',
    equation: 'R_DC = ρ · L / A [Ω]   |   δ = √(2ρ / (ω · μ))   |   η_antena = Rr / (Rr + R_pérdidas)',
  },
  power: {
    physicalTitle: 'Enfoque 1 · Tasa temporal de transferencia energética',
    physicalBody:
      'La potencia eléctrica mide cuántos joules de energía se transfieren o convierten por cada segundo (1 W = 1 J/s). En un resistor puro toda esa potencia se disipa como flujo térmico; en una etapa de salida de RF conectada a una antena resonante, la potencia activa alimenta el campo electromagnético radiado.',
    rigorTitle: 'Enfoque 2 · Adaptación de impedancias y decibeles en RF (dBm y dBW)',
    rigorBody:
      'Para transferir la máxima potencia desde un transmisor con impedancia interna de 50 Ω hacia la línea y la antena, la carga debe presentar exactamente 50 Ω resistivos (ROE = 1:1). En ingeniería de RF expresamos la potencia en escala logarítmica respecto de 1 mW (dBm): cada +3 dB duplica la potencia y cada +10 dB la multiplica por diez:',
    equation: 'P[dBm] = 10 · log₁₀(P[mW])   |   P_neta = P_dir · (1 − |Γ|²)',
  },
};

export function ConceptLesson({ concept }: { concept: ElectricalConcept }) {
  const t = useTranslations('RadioBasics.concepts');
  const dual = CONCEPT_DUAL[concept];
  return (
    <section data-concept={concept} aria-label={t(`${concept}.title`)}>
      <p className={styles.eyebrow}>{t(`${concept}.unit`)}</p>
      {concept === 'voltage' ? <p>{t('intro')}</p> : null}
      <p>{t(`${concept}.definition`)}</p>
      <MathLine className={styles.formula}>{t(`${concept}.formula`)}</MathLine>
      <ConceptCircuit />
      <p>{t(`${concept}.example`)}</p>
      <p className={styles.takeaway}>{t(`${concept}.caution`)}</p>
      <div className={styles.worked} data-testid={`dual-approach-${concept}`}>
        <h2>{dual.physicalTitle}</h2>
        <p>{dual.physicalBody}</p>
        <h3>{dual.rigorTitle}</h3>
        <p>{dual.rigorBody}</p>
        <MathLine className={styles.formula}>{dual.equation}</MathLine>
      </div>
    </section>
  );
}
