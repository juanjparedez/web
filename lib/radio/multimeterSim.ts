import { evaluateHighZDivider } from './multimeterDivider';
export type DmmMode = 'dcv' | 'acv' | 'ohm' | 'continuity' | 'ma' | '10a';
export type DmmJack = 'v-ohm' | 'ma' | '10a';
export type ProbePlacement = 'parallel' | 'series';
export type BenchScenarioId = 'psu-transceiver' | 'coax-antenna' | 'high-z-divider' | 'rf-dummy-load';

export interface BenchScenario {
  id: BenchScenarioId;
  title: string;
  badge: string;
  sourceV: number;
  loadOhm: number;
  poweredDefault: boolean;
  recommendedMode: DmmMode;
  recommendedJack: DmmJack;
  recommendedPlacement: ProbePlacement;
  summary: string;
}

export interface DmmSimulationInput {
  scenarioId: BenchScenarioId;
  mode: DmmMode;
  redJack: DmmJack;
  placement: ProbePlacement;
  circuitPowered: boolean;
}

export interface DmmSimulationResult {
  displayMain: string;
  displayUnit: string;
  displaySub: string;
  status: 'ok' | 'warning' | 'danger';
  beep: boolean;
  fuseBlown: boolean;
  meterImpedanceText: string;
  circuitCurrentText: string;
  burdenOrLoadingText: string;
  title: string;
  physicalExplanation: string;
  technicianTip: string;
}

export const BENCH_SCENARIOS: readonly BenchScenario[] = [
  {
    id: 'psu-transceiver',
    title: 'Fuente 13,8 V + Transceptor VHF en TX (1,5 A)',
    badge: '13,8 V DC · 1,5 A',
    sourceV: 13.8,
    loadOhm: 9.2,
    poweredDefault: true,
    recommendedMode: 'dcv',
    recommendedJack: 'v-ohm',
    recommendedPlacement: 'parallel',
    summary: 'Medición de tensión de alimentación en bornes (paralelo) o corriente consumida por el transmisor (serie en 10A).',
  },
  {
    id: 'coax-antenna',
    title: 'Latiguillo Coaxil RG-58 (50 Ω) y Conector PL-259',
    badge: 'CONTINUIDAD · Ω',
    sourceV: 0,
    loadOhm: 0.18,
    poweredDefault: false,
    recommendedMode: 'continuity',
    recommendedJack: 'v-ohm',
    recommendedPlacement: 'series',
    summary: 'Verificación de continuidad del conductor central (serie = 0,18 Ω) y aislamiento vivo-malla (paralelo = OL).',
  },
  {
    id: 'high-z-divider',
    title: 'Divisor de Alta Impedancia (10 MΩ / 10 MΩ a 12 V)',
    badge: 'CARGA R_in = 10 MΩ',
    sourceV: 12,
    loadOhm: 10_000_000,
    poweredDefault: true,
    recommendedMode: 'dcv',
    recommendedJack: 'v-ohm',
    recommendedPlacement: 'parallel',
    summary: 'Demuestra cómo la resistencia interna de 10 MΩ del voltímetro altera la tensión medida en nodos de alta impedancia.',
  },
  {
    id: 'rf-dummy-load',
    title: 'Handy 5 W (145 MHz) sobre Carga Fantasma 50 Ω + Punta RF',
    badge: 'RF 145 MHz · 50 Ω',
    sourceV: 22.36,
    loadOhm: 50,
    poweredDefault: true,
    recommendedMode: 'dcv',
    recommendedJack: 'v-ohm',
    recommendedPlacement: 'parallel',
    summary: 'Por qué el modo ACV común falla a 145 MHz y cómo medir potencia de RF usando una punta detectora Schottky en modo DCV.',
  },
] as const;

function evaluateJackMismatch(input: DmmSimulationInput): DmmSimulationResult | null {
  const { scenarioId, mode, redJack, placement, circuitPowered } = input;
  const isCurrentJack = redJack === 'ma' || redJack === '10a';
  const isVoltageOrOhmMode = mode === 'dcv' || mode === 'acv' || mode === 'ohm' || mode === 'continuity';

  if (isCurrentJack && placement === 'parallel' && circuitPowered && scenarioId !== 'coax-antenna' && scenarioId !== 'high-z-divider') {
    const rShunt = redJack === '10a' ? 0.01 : 1.0;
    const iShort = 13.8 / rShunt;
    return {
      displayMain: redJack === 'ma' ? 'FUSE' : 'ALERTA',
      displayUnit: 'CORTO',
      displaySub: `I_cc ≈ ${iShort.toFixed(0)} A sobre shunt de ${rShunt} Ω`,
      status: 'danger',
      beep: true,
      fuseBlown: true,
      meterImpedanceText: `R_shunt = ${rShunt} Ω (borne ${redJack.toUpperCase()})`,
      circuitCurrentText: `${iShort.toFixed(0)} A (cortocircuito directo)`,
      burdenOrLoadingText: 'Disipación instantánea P = I²·R_shunt → fusión del fusible HRC',
      title: '¡Peligro! Punta roja en borne de corriente conectada en paralelo',
      physicalExplanation:
        'Aunque el selector esté en otra posición, los bornes mA y 10A están conectados internamente de forma directa a la resistencia shunt de bajísima impedancia hacia COM. Apoyar las puntas en paralelo sobre una fuente equivale a puentear positivo y negativo con un alambre.',
      technicianTip:
        'Regla de oro de taller: apenas terminás de medir corriente, devolvé la punta roja al borne V/Ω antes de soltar el multímetro.',
    };
  }

  if (isVoltageOrOhmMode && isCurrentJack) {
    return {
      displayMain: 'LEAD',
      displayUnit: 'ERR',
      displaySub: `Selector en ${mode.toUpperCase()} pero punta roja en ${redJack.toUpperCase()}`,
      status: 'warning',
      beep: true,
      fuseBlown: false,
      meterImpedanceText: 'Borne incorrecto para la función seleccionada',
      circuitCurrentText: 'Medición inválida',
      burdenOrLoadingText: 'Pasá la punta roja al borne V/Ω/)))',
      title: 'Inconsistencia entre el selector giratorio y el borne de la punta roja',
      physicalExplanation:
        'El conversor ADC espera la señal en el divisor de entrada de alta impedancia (borne V/Ω), pero el cable rojo está insertado en el bucle de corriente (shunt).',
      technicianTip: 'Para tensión (V), resistencia (Ω), diodos y continuidad ())) la punta roja va siempre en el borne derecho V/Ω.',
    };
  }

  if ((mode === 'ma' && redJack !== 'ma') || (mode === '10a' && redJack !== '10a')) {
    const expected = mode === '10a' ? '10A' : 'mA';
    return {
      displayMain: 'LEAD',
      displayUnit: 'ERR',
      displaySub: `Selector en ${expected} pero punta roja en ${redJack.toUpperCase()}`,
      status: 'warning',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: 'Circuito de medición abierto entre selector y borne',
      circuitCurrentText: '0,00 A',
      burdenOrLoadingText: `Mové la punta roja al borne ${expected}`,
      title: `Para medir en escala ${expected}, la punta roja debe ir en el borne ${expected}`,
      physicalExplanation:
        'El shunt calibrado para esa escala solo cierra el circuito cuando el conector banana rojo entra físicamente en su borne dedicado.',
      technicianTip: 'Si dudás de cuánta corriente consume un equipo, empezá siempre por el borne y la escala de 10A.',
    };
  }

  return null;
}

function evaluateRfScenario(input: DmmSimulationInput): DmmSimulationResult {
  if (!input.circuitPowered) {
    return {
      displayMain: '0,00',
      displayUnit: 'V DC',
      displaySub: 'PTT suelto (sin portadora de RF)',
      status: 'ok',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: 'R_in = 10 MΩ (detrás de punta detectora Schottky)',
      circuitCurrentText: '0 mA en carga fantasma de 50 Ω',
      burdenOrLoadingText: 'P_RF = 0 W',
      title: 'Transmisor en recepción (PTT libre)',
      physicalExplanation: 'Sin excitación de RF sobre la carga fantasma no hay tensión pico rectificada en el capacitor de la punta detectora.',
      technicianTip: 'Activá la alimentación / PTT para inyectar los 5 W de 145 MHz sobre la carga de 50 Ω.',
    };
  }
  if (input.mode === 'acv') {
    return {
      displayMain: '0,04',
      displayUnit: 'V AC',
      displaySub: 'Lectura falsa: f = 145 MHz supera el ancho de banda AC del DMM (~1 kHz)',
      status: 'warning',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: 'C_parásita ≈ 100 pF → X_C ≈ 11 Ω a 145 MHz (desadapta los 50 Ω)',
      circuitCurrentText: 'I_RF = 316 mA RMS sobre 50 Ω',
      burdenOrLoadingText: 'El amplificador True-RMS interno filtra frecuencias de VHF',
      title: 'Un multímetro en V∼ (ACV) NO puede medir radiofrecuencia directamente',
      physicalExplanation:
        'El canal ACV de un multímetro de banco o de mano está diseñado para 45 Hz – 1 kHz (o hasta 100 kHz en modelos True-RMS de laboratorio). A 145 MHz, la reactancia capacitiva de los cables (X_C = 1/(2πfC)) deriva la RF y el rectificador operacional interno no responde.',
      technicianTip:
        'Cambiá el selector a V⎓ (DCV) e intercalá una punta detectora de pico con diodo Schottky (1N5711 / BAT85) sobre la carga de 50 Ω.',
    };
  }
  if (input.mode === 'dcv' && input.placement === 'parallel') {
    const vPeak = Math.sqrt(2 * 5 * 50); // 22.3607 V
    const vDiode = 0.25;
    const vDc = vPeak - vDiode; // 22.11 V
    return {
      displayMain: vDc.toFixed(2).replace('.', ','),
      displayUnit: 'V DC',
      displaySub: `V_pico = ${vPeak.toFixed(2).replace('.', ',')} V → P = V_p² / (2·50 Ω) = 5,00 W`,
      status: 'ok',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: 'R_in = 10 MΩ (descarga lenta del capacitor detector de 10 nF)',
      circuitCurrentText: 'I_RF = 316,2 mA RMS (15,81 V_RMS en 50 Ω)',
      burdenOrLoadingText: 'Caída en diodo Schottky V_d ≈ 0,25 V compensada en la fórmula',
      title: 'Medición correcta de Potencia RF con Punta Detectora + Multímetro en V⎓',
      physicalExplanation:
        'El diodo Schottky de alta velocidad rectifica los semiciclos de 145 MHz y carga un capacitor cerámico al valor pico de la portadora (V_p = √2 · V_RMS). El multímetro en DCV mide esa tensión continua con su entrada de 10 MΩ sin cargar al detector.',
      technicianTip: 'Fórmula de taller sobre carga fantasma de 50 Ω: P[W] = (V_leído + 0,25 V)² / 100.',
    };
  }
  return {
    displayMain: 'ERR',
    displayUnit: 'RF',
    displaySub: 'En RF sobre carga fantasma se mide tensión continua detectada en paralelo',
    status: 'warning',
    beep: false,
    fuseBlown: false,
    meterImpedanceText: 'Desadaptación de línea coaxial de 50 Ω',
    circuitCurrentText: 'ROE elevada por abrir la línea coaxial',
    burdenOrLoadingText: 'Usá V⎓ en paralelo sobre el puerto de muestreo de la carga fantasma',
    title: 'Nunca abras un coaxil de RF para intercalar un multímetro en serie',
    physicalExplanation:
      'Intercalar cables de multímetro en serie con una línea de transmisión de 145 MHz destruye la geometría coaxial de 50 Ω, introduce inductancia serie (~1 µH → X_L ≈ 910 Ω) y refleja la potencia hacia el transistor final de RF.',
    technicianTip: 'Para medir en RF mantené siempre la continuidad coaxial de 50 Ω y medí en paralelo con punta detectora o watímetro direccional.',
  };
}

export function simulateMultimeter(input: DmmSimulationInput): DmmSimulationResult {
  const mismatch = evaluateJackMismatch(input);
  if (mismatch) return mismatch;

  if (input.scenarioId === 'rf-dummy-load') {
    return evaluateRfScenario(input);
  }

  const { scenarioId, mode, placement, circuitPowered } = input;

  if ((mode === 'ohm' || mode === 'continuity') && circuitPowered && scenarioId !== 'coax-antenna') {
    return {
      displayMain: 'ERR',
      displayUnit: mode === 'continuity' ? ')))' : 'Ω',
      displaySub: '¡Circuito con tensión externa! Apagá la fuente antes de medir Ω',
      status: 'danger',
      beep: true,
      fuseBlown: false,
      meterImpedanceText: 'Fuente de corriente de prueba del DMM saturada por tensión externa',
      circuitCurrentText: 'Tensión externa aplicada al ADC del óhmetro',
      burdenOrLoadingText: 'Lectura errónea y riesgo para la protección PTC del instrumento',
      title: 'Nunca midas resistencia ni continuidad sobre un circuito energizado',
      physicalExplanation:
        'En modo Ω y continuidad, el multímetro inyecta una pequeña corriente constante conocida (I_test ≈ 0,1 mA a 1 mA) y mide la caída V = I_test · R. Si el circuito tiene su propia fuente encendida, esa tensión externa engaña al conversor ADC y puede dañar la entrada.',
      technicianTip: 'Apagá el interruptor de "Fuente encendida" (y descargá los capacitores electrolíticos) antes de usar Ω o continuidad.',
    };
  }

  const divider = evaluateHighZDivider(input);
  if (divider) return divider;

  if (scenarioId === 'coax-antenna') {
    if (mode === 'continuity' || mode === 'ohm') {
      if (placement === 'series') {
        return {
          displayMain: '0,18',
          displayUnit: 'Ω',
          displaySub: mode === 'continuity' ? 'BEEP activo (< 30 Ω): conductor central sano' : 'Resistencia óhmica DC del latiguillo coaxial',
          status: 'ok',
          beep: mode === 'continuity',
          fuseBlown: false,
          meterImpedanceText: 'I_test = 1,0 mA (tensión de prueba en circuito abierto ~2,8 V)',
          circuitCurrentText: '1,0 mA de prueba del óhmetro',
          burdenOrLoadingText: 'Caída en cables de prueba compensada (REL / Zero)',
          title: 'Continuidad correcta de extremo a extremo del conductor central',
          physicalExplanation:
            'Al medir en serie de punta a punta del vivo del coaxil, la resistencia DC es apenas 0,18 Ω (cobre del conductor central), muy por debajo del umbral de ~30 Ω del comparador acústico.',
          technicianTip: 'Después de verificar la continuidad del vivo y de la malla por separado, pasá a "Paralelo" para verificar que no estén en corto entre sí.',
        };
      }
      return {
        displayMain: 'OL',
        displayUnit: 'MΩ',
        displaySub: 'Overload (Circuito abierto > 40 MΩ): aislamiento perfecto entre vivo y malla',
        status: 'ok',
        beep: false,
        fuseBlown: false,
        meterImpedanceText: 'I_test = 0 A (aislamiento dieléctrico de polietileno/PTFE)',
        circuitCurrentText: '0,00 mA',
        burdenOrLoadingText: 'Sin fugas entre conductor central y blindaje exterior',
        title: 'Aislamiento vivo-malla correcto (sin cortocircuito en el conector PL-259/SMA)',
        physicalExplanation:
          'En un latiguillo coaxial desconectado (o conectado a un dipolo abierto de λ/2), entre el pin central y la rosca exterior de masa debe haber resistencia infinita ("OL") y el buzzer debe permanecer mudo.',
        technicianTip: 'Ojo: si medís con una antena tipo J-Pole, Yagi con Gamma-Match o vertical con bobina a masa conectada, en DC dará continuidad aunque en RF tenga 50 Ω.',
      };
    }
  }

  if (!circuitPowered) {
    if (mode === 'ohm') {
      return {
        displayMain: '9,20',
        displayUnit: 'Ω',
        displaySub: 'Resistencia equivalente de carga con la fuente desconectada',
        status: 'ok',
        beep: false,
        fuseBlown: false,
        meterImpedanceText: 'Corriente de prueba I_test = 1 mA',
        circuitCurrentText: '0 A (fuente de 13,8 V apagada)',
        burdenOrLoadingText: 'Medición óhmica segura en frío',
        title: 'Medición de resistencia en frío (circuito desenergizado)',
        physicalExplanation: 'Con la fuente apagada, el óhmetro mide de forma segura la resistencia estática de la rama.',
        technicianTip: 'Recordá que en circuitos con semiconductores (como la etapa final de un transceptor) la resistencia estática en frío no refleja la impedancia dinámica en operación.',
      };
    }
    return {
      displayMain: '0,00',
      displayUnit: mode === '10a' ? 'A DC' : mode === 'ma' ? 'mA DC' : 'V DC',
      displaySub: 'Fuente de 13,8 V apagada',
      status: 'ok',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: mode === '10a' ? 'R_shunt = 0,01 Ω' : 'R_in = 10 MΩ',
      circuitCurrentText: '0,00 A',
      burdenOrLoadingText: 'Sin tensión ni corriente en el circuito',
      title: 'Circuito desenergizado',
      physicalExplanation: 'La fuente de alimentación está apagada; no existe campo eléctrico impulsor ni circulación de corriente.',
      technicianTip: 'Activá "Fuente encendida" para alimentar el circuito de 13,8 V.',
    };
  }

  if (mode === 'dcv') {
    if (placement === 'parallel') {
      return {
        displayMain: '13,80',
        displayUnit: 'V DC',
        displaySub: 'Medición correcta en paralelo sobre la alimentación del transceptor',
        status: 'ok',
        beep: false,
        fuseBlown: false,
        meterImpedanceText: 'R_in = 10 MΩ (deriva apenas 1,38 µA)',
        circuitCurrentText: 'I_carga = 13,8 V / 9,2 Ω = 1,50 A hacia el equipo',
        burdenOrLoadingText: 'Perturbación del instrumento < 0,0001 %',
        title: 'Medición correcta de Tensión Continua (V⎓ en Paralelo)',
        physicalExplanation:
          'Al colocar el voltímetro en paralelo, ambos bornes sienten la misma diferencia de potencial que el equipo (13,80 V). Como la resistencia interna es de 10 MΩ, por el instrumento solo se desvían 1,38 µA mientras el transceptor recibe sus 1,50 A intactos.',
        technicianTip: 'Para detectar caídas en cables o portafusibles sulfatados, medí primero en bornes de la fuente y luego directo en la ficha del transceptor mientras apretás PTT.',
      };
    }
    return {
      displayMain: '13,80',
      displayUnit: 'V DC',
      displaySub: '¡El equipo NO enciende! Los 10 MΩ en serie bloquean la corriente a 1,38 µA',
      status: 'warning',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: 'R_in = 10 MΩ intercalados en serie con la carga de 9,2 Ω',
      circuitCurrentText: 'I = 13,8 V / (10.000.000 Ω + 9,2 Ω) = 1,38 µA (equipo apagado)',
      burdenOrLoadingText: 'Caen 13,79998 V en el multímetro y solo 12,7 µV en el equipo',
      title: 'Error común: Voltímetro conectado en Serie',
      physicalExplanation:
        'No se rompe nada, pero al abrir el cable positivo e intercalar los 10 MΩ del voltímetro en serie con los 9,2 Ω del equipo, toda la tensión de la fuente cae sobre el propio multímetro (por divisor resistivo) y la corriente cae un millón de veces. El tester marca 13,80 V pero el equipo queda muerto.',
      technicianTip: 'La tensión es diferencia de potencial entre dos puntos: se mide siempre en PARALELO sin abrir el circuito.',
    };
  }

  if (mode === 'acv') {
    return {
      displayMain: '0,01',
      displayUnit: 'V AC',
      displaySub: 'Fuente continua limpia (bajo ripple de alterna)',
      status: 'ok',
      beep: false,
      fuseBlown: false,
      meterImpedanceText: 'R_in = 10 MΩ con desacople capacitivo DC',
      circuitCurrentText: 'I_DC = 1,50 A',
      burdenOrLoadingText: 'En V∼ con acoplamiento AC solo ves el zumbido (ripple) de la fuente',
      title: 'Modo V∼ (Alterna) sobre una fuente de Continua',
      physicalExplanation:
        'Con acoplamiento AC, el capacitor de entrada bloquea el valor medio continuo de 13,8 V y el instrumento solo muestra la componente alterna residual (ripple de 100 Hz de la fuente). Si el ripple supera ~100 mV en TX, vas a escuchar zumbido en la portadora.',
      technicianTip: 'Medir V∼ sobre una fuente regulada bajo carga es un excelente truco de taller para diagnosticar capacitores electrolíticos secos.',
    };
  }

  if (mode === 'ma') {
    return {
      displayMain: 'FUSE',
      displayUnit: 'mA',
      displaySub: '¡Fusible de 400 mA quemado! El circuito demandó 1,35 A por el borne mA',
      status: 'danger',
      beep: true,
      fuseBlown: true,
      meterImpedanceText: 'R_shunt = 1,0 Ω + Fusible rápido F1 (400 mA / 250 V)',
      circuitCurrentText: 'Pico de 1,35 A (> 330 % del calibre del fusible)',
      burdenOrLoadingText: 'Circuito abierto tras fundirse el fusible de protección',
      title: 'Fusible del canal mA fundido por exceso de corriente (1,5 A > 400 mA)',
      physicalExplanation:
        'La conexión en serie fue correcta, pero un handy transmitiendo 5 W consume ~1,5 A y la entrada de miliamperes está protegida por un fusible rápido de 200 mA o 400 mA para salvar el shunt de precisión de 1 Ω.',
      technicianTip: 'Para consumos de transmisión o fuentes de estación usá siempre la escala y el borne de 10A.',
    };
  }

  // mode === '10a' && placement === 'series'
  const rShunt = 0.01;
  const iActual = 13.8 / (9.2 + rShunt);
  const vBurden = iActual * rShunt;
  return {
    displayMain: iActual.toFixed(2).replace('.', ','),
    displayUnit: 'A DC',
    displaySub: `Medición correcta en serie (caída en shunt V_burden = ${(vBurden * 1000).toFixed(1).replace('.', ',')} mV)`,
    status: 'ok',
    beep: false,
    fuseBlown: false,
    meterImpedanceText: 'R_shunt = 0,01 Ω (10 mΩ de manganina en serie)',
    circuitCurrentText: `${iActual.toFixed(3).replace('.', ',')} A atraviesan el shunt y el transceptor`,
    burdenOrLoadingText: `Tensión efectiva en el equipo: ${(13.8 - vBurden).toFixed(2).replace('.', ',')} V`,
    title: 'Medición correcta de Corriente Continua (10A⎓ en Serie)',
    physicalExplanation:
      'Para contar cuántos coulombs por segundo alimentan al transmisor, abrimos la rama positiva e intercalamos el shunt de 0,01 Ω en serie. Toda la corriente de 1,50 A atraviesa el shunt generando una caída de 15 mV que el conversor ADC traduce a 1,50 A sin restarle tensión apreciable al equipo.',
    technicianTip: 'Al terminar la prueba, apagá la fuente, sacá el multímetro de la serie y pasá inmediatamente la punta roja al borne V/Ω.',
  };
}
