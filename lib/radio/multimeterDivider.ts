import type { DmmSimulationInput, DmmSimulationResult } from './multimeterSim.ts';

/**
 * Scenario "high-z-divider": 12 V → R1 = 10 MΩ → node → R2 = 10 MΩ → GND.
 * The probes always go on R2. "Paralelo" = across R2 in circuit; "Serie" = one leg of R2
 * lifted and the meter closing the branch between R2 and GND.
 * Assumes the jack/selector mismatch checks already ran (red jack matches the mode).
 */
const BASE = {
  beep: false,
  fuseBlown: false,
};

const TIP_LOADING = 'Compará la resistencia de Thévenin del nodo con los 10 MΩ del multímetro: para menos de 1 % de error necesitás R_th < 100 kΩ.';

function unpowered(input: DmmSimulationInput): DmmSimulationResult {
  const { mode, placement } = input;
  const lifted = placement === 'series';
  if (mode === 'ohm') {
    return {
      ...BASE,
      displayMain: lifted ? '10,00' : '5,00',
      displayUnit: 'MΩ',
      displaySub: lifted ? 'R2 con una pata levantada: medís R2 sola' : 'R2 en el circuito: el óhmetro ve R2 ∥ R1',
      status: lifted ? 'ok' : 'warning',
      meterImpedanceText: 'Corriente de prueba del óhmetro ≈ 0,1 µA en el rango de MΩ',
      circuitCurrentText: '0 µA (fuente apagada)',
      burdenOrLoadingText: lifted ? 'Sin caminos en paralelo: lectura = R2 = 10 MΩ' : 'R1 vuelve a masa por la fuente apagada: 10 MΩ ∥ 10 MΩ = 5 MΩ',
      title: lifted ? 'Resistencia medida fuera del circuito' : 'Resistencia medida dentro del circuito',
      physicalExplanation: lifted
        ? 'Al levantar una pata de R2, la única resistencia entre las puntas es R2. Por eso el multímetro marca sus 10 MΩ reales.'
        : 'Con R2 soldada, la corriente de prueba también vuelve por R1 y la fuente apagada. El óhmetro mide el paralelo de los dos caminos, no la resistencia sola.',
      technicianTip: 'Si hay otros caminos en paralelo, levantá al menos un terminal del resistor para medirlo solo.',
    };
  }
  if (mode === 'continuity') {
    return {
      ...BASE,
      displayMain: 'OL',
      displayUnit: ')))',
      displaySub: '10 MΩ está muy por encima del umbral del buzzer (≈ 30 Ω)',
      status: 'ok',
      meterImpedanceText: 'Corriente de prueba del buzzer ≈ 1 mA',
      circuitCurrentText: '0 µA (fuente apagada)',
      burdenOrLoadingText: 'El buzzer solo suena si hay menos de ≈ 30 Ω',
      title: 'Continuidad: no suena sobre un resistor de 10 MΩ',
      physicalExplanation: 'La prueba de continuidad sirve para cables y pistas, no para resistores de valor alto.',
      technicianTip: 'Para conocer el valor de R2 usá la escala Ω.',
    };
  }
  const unit = mode === 'acv' ? 'V AC' : mode === 'ma' ? 'µA DC' : mode === '10a' ? 'A DC' : 'V DC';
  return {
    ...BASE,
    displayMain: '0,00',
    displayUnit: unit,
    displaySub: 'Fuente de 12 V apagada',
    status: 'ok',
    meterImpedanceText: mode === 'ma' || mode === '10a' ? 'Shunt de corriente en el camino' : 'R_in = 10 MΩ',
    circuitCurrentText: '0 µA',
    burdenOrLoadingText: 'Sin tensión ni corriente en el divisor',
    title: 'Divisor sin alimentación',
    physicalExplanation: 'Sin fuente no hay diferencia de potencial en el nodo ni corriente por R1 y R2.',
    technicianTip: 'Encendé la fuente para ver el efecto de carga de los 10 MΩ del multímetro.',
  };
}

function poweredVoltage(input: DmmSimulationInput): DmmSimulationResult {
  if (input.mode === 'acv') {
    return {
      ...BASE,
      displayMain: '0,00',
      displayUnit: 'V AC',
      displaySub: 'El nodo tiene continua pura: en V∼ el capacitor de entrada la bloquea',
      status: 'warning',
      meterImpedanceText: 'R_in = 10 MΩ con acople capacitivo',
      circuitCurrentText: 'I = 12 V / 20 MΩ = 0,60 µA de continua',
      burdenOrLoadingText: 'No hay componente alterna que medir',
      title: 'Escala equivocada: V∼ sobre un circuito de continua',
      physicalExplanation: 'El divisor está alimentado con 12 V de continua. En V∼ el multímetro solo muestra la parte alterna, que acá es cero.',
      technicianTip: 'Para una fuente de continua usá V⎓.',
    };
  }
  if (input.placement === 'series') {
    return {
      ...BASE,
      displayMain: '4,00',
      displayUnit: 'V DC',
      displaySub: 'Marca su propia caída, no la tensión de R2',
      status: 'warning',
      meterImpedanceText: 'R_in = 10 MΩ en serie con R1 y R2 (30 MΩ en total)',
      circuitCurrentText: 'I = 12 V / 30 MΩ = 0,40 µA por toda la cadena',
      burdenOrLoadingText: 'Cada 10 MΩ se lleva 4 V: R1, R2 y el multímetro',
      title: 'Voltímetro conectado en serie',
      physicalExplanation: 'Al abrir la rama de R2 e intercalar el voltímetro, sus 10 MΩ quedan en serie y forman un divisor de tres resistencias iguales. La pantalla muestra la tensión sobre el propio instrumento, que acá coincide en 4 V pero no es la tensión del nodo.',
      technicianTip: 'La tensión se mide en paralelo, entre dos puntos, sin abrir el circuito.',
    };
  }
  return {
    ...BASE,
    displayMain: '4,00',
    displayUnit: 'V DC',
    displaySub: 'Sin el tester el nodo está en 6,00 V: la lectura queda 33 % abajo',
    status: 'warning',
    meterImpedanceText: 'R_in = 10 MΩ en paralelo con R2 = 10 MΩ → 5 MΩ',
    circuitCurrentText: 'I = 12 V / (10 MΩ + 5 MΩ) = 0,80 µA; 0,40 µA pasan por el tester',
    burdenOrLoadingText: 'V = 12 V · 5 MΩ / 15 MΩ = 4,00 V en vez de 6,00 V',
    title: 'Efecto de carga del voltímetro',
    physicalExplanation: 'La conexión es correcta, pero el multímetro tiene 10 MΩ de entrada. Sobre un nodo de 10 MΩ esa resistencia ya no es despreciable: queda en paralelo con R2, baja la resistencia de abajo del divisor a 5 MΩ y la tensión del nodo cae de 6 V a 4 V mientras medís.',
    technicianTip: TIP_LOADING,
  };
}

function poweredCurrent(input: DmmSimulationInput): DmmSimulationResult {
  const micro = input.mode === 'ma';
  const across = input.placement === 'parallel';
  const amps = across ? 1.2e-6 : 0.6e-6;
  const reading = micro ? (amps * 1e6).toFixed(2).replace('.', ',') : '0,00';
  return {
    ...BASE,
    displayMain: reading,
    displayUnit: micro ? 'µA DC' : 'A DC',
    displaySub: across
      ? 'El amperímetro puentea R2: la corriente solo la limita R1'
      : micro ? 'Medición correcta de la corriente del divisor' : 'Correcto, pero la escala de 10 A no resuelve microamperes',
    status: across ? 'warning' : micro ? 'ok' : 'warning',
    meterImpedanceText: micro ? 'Shunt del borne mA ≈ 1 Ω (despreciable frente a 10 MΩ)' : 'Shunt de 10 A = 0,01 Ω',
    circuitCurrentText: across ? 'I = 12 V / 10 MΩ = 1,20 µA (R2 en cortocircuito)' : 'I = 12 V / 20 MΩ = 0,60 µA',
    burdenOrLoadingText: across ? 'El nodo cae a 0 V mientras las puntas están apoyadas' : 'Caída en el shunt < 1 µV: no altera el circuito',
    title: across ? 'Amperímetro en paralelo sobre R2' : 'Corriente del divisor medida en serie',
    physicalExplanation: across
      ? 'El amperímetro es casi un cable: apoyado sobre R2 la anula. Acá no se quema nada porque R1 limita la corriente a 1,2 µA, pero sobre una fuente sin resistencia el mismo error funde el fusible.'
      : 'Con la rama abierta y el amperímetro cerrándola, pasa por él la misma corriente que por R1 y R2.',
    technicianTip: across ? 'La corriente se mide en serie, abriendo la rama.' : 'Elegí la escala más chica que soporte la corriente esperada.',
  };
}

/** Returns the reading for the high-impedance divider, or null for other scenarios. */
export function evaluateHighZDivider(input: DmmSimulationInput): DmmSimulationResult | null {
  if (input.scenarioId !== 'high-z-divider') return null;
  if (!input.circuitPowered) return unpowered(input);
  if (input.mode === 'ma' || input.mode === '10a') return poweredCurrent(input);
  return poweredVoltage(input);
}
