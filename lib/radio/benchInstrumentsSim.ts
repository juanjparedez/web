export type InstrumentTabId = 'multimeter' | 'oscilloscope' | 'swr-meter' | 'nanovna';

export type ScopeSignalId = 'psu-ripple' | 'cal-square-1khz' | 'rf-oscillator-14mhz';
export type ScopeCoupling = 'dc' | 'ac' | 'gnd';
export type ScopeProbeRatio = '1x' | '10x';
export type ScopeCompensation = 'calibrated' | 'under' | 'over';
export type ScopeGroundClip = 'circuit-gnd' | 'hot-node';

export interface ScopeSimulationInput {
  signalId: ScopeSignalId;
  coupling: ScopeCoupling;
  probeRatio: ScopeProbeRatio;
  compensation: ScopeCompensation;
  groundClip: ScopeGroundClip;
  triggerLocked: boolean;
}

export interface ScopeSimulationResult {
  status: 'ok' | 'warning' | 'danger';
  vppText: string;
  vrmsDmmText: string;
  dcOffsetText: string;
  probeLoadText: string;
  tracePoints: string;
  headline: string;
  physicalExplanation: string;
  technicianTip: string;
}

function buildScopeTrace(input: ScopeSimulationInput): string {
  if (input.groundClip === 'hot-node' || input.coupling === 'gnd') {
    const y = input.coupling === 'gnd' ? 60 : 60;
    return `0,${y} 320,${y}`;
  }

  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const x = i * 5;
    const t = (i / 64) * Math.PI * 4;
    let y = 60;

    if (input.signalId === 'psu-ripple') {
      const ripple = Math.sin(t) * 18;
      y = input.coupling === 'dc' ? 12 + ripple * 0.25 : 60 - ripple;
    } else if (input.signalId === 'cal-square-1khz') {
      const phase = i % 32;
      const high = phase < 16;
      const base = high ? 28 : 92;
      if (input.compensation === 'under') {
        const exp = Math.exp(-(phase % 16) / 4.2);
        y = high ? 28 + 64 * exp : 92 - 64 * exp;
      } else if (input.compensation === 'over') {
        const spike = (phase % 16) === 0 ? (high ? -16 : 16) : (phase % 16) === 1 ? (high ? 6 : -6) : 0;
        y = base + spike;
      } else {
        y = base;
      }
      if (input.coupling === 'dc') y -= 6;
    } else {
      const amp = input.probeRatio === '10x' ? 34 : 9;
      y = 60 - Math.sin(t * 2) * amp;
    }

    const clampedY = Math.max(6, Math.min(114, y));
    pts.push(`${x},${clampedY.toFixed(1)}`);
  }
  return pts.join(' ');
}

export function simulateOscilloscope(input: ScopeSimulationInput): ScopeSimulationResult {
  const tracePoints = buildScopeTrace(input);

  if (input.groundClip === 'hot-node') {
    return {
      status: 'danger',
      vppText: 'CORTO PE',
      vrmsDmmText: 'Disparo de diferencial / fusible',
      dcOffsetText: 'Chasis BNC unido a Tierra (PE 220 V)',
      probeLoadText: 'Corriente de falla por malla del coaxil BNC',
      tracePoints,
      headline: '¡Cortocircuito a Tierra! El cocodrilo negro del osciloscopio NO es flotante',
      physicalExplanation:
        'A diferencia del borne COM de un multímetro a batería (totalmente aislado de tierra), el anillo exterior metálico de los conectores BNC del osciloscopio de banco está unido eléctricamente al chasis y al tercer pin de Tierra de Protección (PE) del enchufe de red.',
      technicianTip:
        'Conectar el cocodrilo negro de la punta a un punto vivo no aislado pone ese nodo directamente a tierra. Para medir diferencias entre dos puntos vivos usá dos canales en modo matemático (CH1 − CH2) sin conectar el cocodrilo al nodo vivo, o una punta diferencial.',
    };
  }

  if (input.coupling === 'gnd') {
    return {
      status: 'ok',
      vppText: '0,00 Vpp',
      vrmsDmmText: 'Referencia 0 V interna',
      dcOffsetText: 'Entrada desconectada y puesta a 0 V',
      probeLoadText: 'Circuito aislado mientras ubicás el cero en pantalla',
      tracePoints,
      headline: 'Acoplamiento GND: calibración de la línea de referencia de 0 V',
      physicalExplanation:
        'En modo GND el osciloscopio desconecta la señal de entrada y conecta el amplificador vertical a su masa interna para que puedas ver y ubicar en qué división de la retícula está exactamente el nivel de 0 V.',
      technicianTip: 'Una vez ubicada la línea base de 0 V, pasá a DC para ver la señal completa o a AC para ver solo la variación alterna.',
    };
  }

  if (!input.triggerLocked) {
    return {
      status: 'warning',
      vppText: 'Traza inestable',
      vrmsDmmText: 'Trigger fuera de rango',
      dcOffsetText: 'Barrido libre (Auto / Untriggered)',
      probeLoadText: input.probeRatio === '10x' ? '10 MΩ ∥ ~12 pF (×10)' : '1 MΩ ∥ ~100 pF (×1)',
      tracePoints,
      headline: 'Onda corrida en pantalla: Nivel de Disparo (Trigger Level) fuera de la señal',
      physicalExplanation:
        'El comparador de Trigger espera que la señal cruce un umbral de tensión con pendiente positiva (flanco ascendente) para iniciar cada barrido horizontal en el mismo punto de fase. Si el nivel de Trigger está por encima de V_max o por debajo de V_min, cada barrido arranca en cualquier fase y la onda «camina» o se ve doble.',
      technicianTip: 'Pulsá "Centrar Nivel de Trigger (50 %)" para enganchar el flanco al centro de la excursión pico a pico.',
    };
  }

  if (input.signalId === 'psu-ripple') {
    if (input.coupling === 'dc') {
      return {
        status: 'warning',
        vppText: '0,60 Vpp (saturado arriba)',
        vrmsDmmText: 'DMM en V⎓ lee 13,80 V DC',
        dcOffsetText: '+13,80 V DC desplazan la traza fuera de escala fina',
        probeLoadText: input.probeRatio === '10x' ? '10 MΩ ∥ 12 pF' : '1 MΩ ∥ 100 pF',
        tracePoints,
        headline: 'En acoplamiento DC los 13,8 V de continua empujan el ripple fuera de la pantalla',
        physicalExplanation:
          'Si usás una escala vertical sensible (0,2 V/div) para inspeccionar un ripple de 600 mVpp montado sobre 13,8 V DC, el desplazamiento continuo equivale a 69 divisiones hacia arriba y satura el amplificador vertical.',
        technicianTip: 'Cambiá el acoplamiento a AC: el capacitor serie interno bloqueará los 13,8 V DC y centrará los 0,60 Vpp de ripple en el medio de la pantalla.',
      };
    }
    return {
      status: 'ok',
      vppText: '0,60 Vpp (100 Hz)',
      vrmsDmmText: 'DMM en V∼ lee 0,21 V RMS',
      dcOffsetText: 'Componente de 13,8 V DC bloqueada por capacitor AC',
      probeLoadText: input.probeRatio === '10x' ? '10 MΩ ∥ 12 pF' : '1 MΩ ∥ 100 pF',
      tracePoints,
      headline: 'Inspección correcta de Ripple en Acoplamiento AC (0,60 Vpp = 0,21 V RMS)',
      physicalExplanation:
        'Con acoplamiento AC bloqueamos el nivel medio de 13,8 V y amplificamos únicamente el rizado de 100 Hz del rectificador de onda completa. Observá cómo el osciloscopio muestra V_pp = 0,60 V mientras un multímetro en V∼ solo indicaría V_RMS = V_p / √2 = 0,30 / 1,414 = 0,21 V.',
      technicianTip: 'En una fuente lineal de estación de 13,8 V bajo carga de TX, un ripple superior a 100 mVpp indica falta de capacidad en el filtro electrolítico o regulador fuera de regulación.',
    };
  }

  if (input.signalId === 'cal-square-1khz') {
    if (input.compensation !== 'calibrated') {
      const isUnder = input.compensation === 'under';
      return {
        status: 'warning',
        vppText: isUnder ? '2,65 Vpp (atenuado)' : '3,55 Vpp (sobrepico)',
        vrmsDmmText: 'DMM lee ~1,50 V',
        dcOffsetText: '+1,50 V medio (onda 0 a 3 V, 1 kHz)',
        probeLoadText: 'Divisor RC desbalanceado (R₁·C₁ ≠ R_in·C_in)',
        tracePoints,
        headline: isUnder
          ? 'Punta ×10 Subcompensada: flancos redondeados (pérdida de armónicas de alta frecuencia)'
          : 'Punta ×10 Sobrecompensada: sobrepicos agudos (overshoot) en los flancos',
        physicalExplanation:
          'Una punta ×10 tiene un resistor de 9 MΩ en paralelo con un trimmer capacitivo C₁, formando un divisor con el 1 MΩ ∥ C_in del osciloscopio. Para que la división sea 10:1 en todas las frecuencias, debe cumplirse exactamente R₁·C₁ = R_in·C_in. Si C₁ es chico, las frecuencias altas se atenúan más (flanco redondeado); si C₁ es grande, pasan de más (sobrepico).',
        technicianTip: 'Girá el tornillo trimmer de la punta ×10 con un destornillador cerámico/plástico hasta que la onda cuadrada de 1 kHz tenga esquinas perfectamente rectas y techo plano.',
      };
    }
    return {
      status: 'ok',
      vppText: '3,00 Vpp (1,00 kHz)',
      vrmsDmmText: 'T = 1,00 ms (50 % duty)',
      dcOffsetText: '+1,50 V promedio',
      probeLoadText: 'Divisor compensado: R₁·C₁ = R_in·C_in (10 MΩ ∥ 12 pF)',
      tracePoints,
      headline: 'Punta ×10 correctamente compensada: respuesta plana en frecuencia',
      physicalExplanation:
        'Al igualarse las constantes de tiempo RC de la punta y de la entrada BNC, la atenuación vale exactamente 1/10 desde continua (DC) hasta el límite de ancho de banda del instrumento, preservando las armónicas impares (3f, 5f, 7f…) que forman los flancos verticales de la onda cuadrada.',
      technicianTip: 'Chequeá siempre la compensación cuando cambies una punta de un canal a otro o de un osciloscopio a otro, porque C_in varía entre entradas.',
    };
  }

  // rf-oscillator-14mhz
  if (input.probeRatio === '1x') {
    return {
      status: 'warning',
      vppText: '2,22 Vpp (¡caída de −13,1 dB!)',
      vrmsDmmText: '0,78 V RMS (falso por carga)',
      dcOffsetText: 'f = 14,00 MHz (T = 71,4 ns)',
      probeLoadText: 'Punta ×1: C_in ≈ 100 pF → X_C = 1/(2π·14MHz·100pF) = 113,7 Ω',
      tracePoints,
      headline: 'Error clásico: La punta en ×1 (100 pF) ahoga y desafina al circuito de RF de 14 MHz',
      physicalExplanation:
        'En posición ×1, la capacidad del propio cable coaxial de la punta (~90 a 110 pF) queda conectada directamente al nodo medido. A 14 MHz, 100 pF presentan una reactancia X_C = 113,7 Ω que cortocircuita un nodo de 500 Ω (haciendo caer la señal de 10 Vpp a 2,22 Vpp) y desplaza la frecuencia de cualquier tanque LC.',
      technicianTip: 'En electrónica digital rápida y radiofrecuencia usá SIEMPRE la punta en posición ×10: reduce la capacidad parásita vista por el circuito casi 10 veces (~12 pF).',
    };
  }

  return {
    status: 'ok',
    vppText: '8,84 Vpp (4,42 Vp)',
    vrmsDmmText: '3,12 V RMS reales en 14 MHz',
    dcOffsetText: 'f = 14,00 MHz (Banda de 20 m HF)',
    probeLoadText: 'Punta ×10: C_in ≈ 12 pF → X_C = 947 Ω (perturbación mínima)',
    tracePoints,
    headline: 'Medición de RF en 14 MHz con Punta ×10 de baja capacidad (12 pF)',
    physicalExplanation:
      'En posición ×10, el capacitor del trimmer queda en serie con la capacidad de entrada del cable, bajando la carga capacitiva total a ~12 pF (X_C ≈ 947 Ω a 14 MHz). El oscilador mantiene su amplitud y frecuencia de trabajo casi sin alteración.',
    technicianTip: 'Para frecuencias aún más altas (VHF/UHF) reemplazá la colilla larga de masa de la punta por el resorte corto de masa sobre el capuchón para eliminar la inductancia parásita (~150 nH) del cable negro.',
  };
}

export type SwrTerminationId =
  | 'dummy-50-tx'
  | 'dummy-50-end'
  | 'tuned-dipole'
  | 'detuned-antenna'
  | 'shorted-coax';
export type SwrTxMode = 'fm-cw' | 'ssb-idle';

export interface SwrSimulationInput {
  termination: SwrTerminationId;
  txMode: SwrTxMode;
  txPowerW: 1 | 5 | 50;
}

export interface SwrSimulationResult {
  status: 'ok' | 'warning' | 'danger';
  pFwdW: number;
  pRefW: number;
  pNetW: number;
  gamma: number;
  swrText: string;
  returnLossDbText: string;
  headline: string;
  physicalExplanation: string;
  technicianTip: string;
}

const TERMINATION_GAMMA: Record<SwrTerminationId, { gamma: number; label: string }> = {
  'dummy-50-tx': { gamma: 0.0, label: 'Carga Fantasma 50 Ω en salida TX' },
  'dummy-50-end': { gamma: 0.024, label: 'Carga Fantasma 50 Ω al final del coaxil' },
  'tuned-dipole': { gamma: 0.087, label: 'Antena Dipolo / Vertical ajustada (Z ≈ 42 Ω)' },
  'detuned-antenna': { gamma: 0.5, label: 'Antena fuera de resonancia (Z = 150 Ω)' },
  'shorted-coax': { gamma: 0.947, label: 'Coaxil en corto o antena desconectada' },
};

export function simulateSwrMeter(input: SwrSimulationInput): SwrSimulationResult {
  if (input.txMode === 'ssb-idle') {
    return {
      status: 'warning',
      pFwdW: 0,
      pRefW: 0,
      pNetW: 0,
      gamma: 0,
      swrText: '— (Sin portadora)',
      returnLossDbText: '— dB',
      headline: 'En modo BLU / SSB sin modulación de voz no hay portadora para medir ROE',
      physicalExplanation:
        'En Banda Lateral Única con portadora suprimida (J3E), cuando el micrófono está en silencio la potencia de salida de RF es cero. Las agujas del watímetro direccional no se mueven y no podés calibrar el fondo de escala SET.',
      technicianTip: 'Para medir ROE o calibrar un acoplador, pasá siempre el equipo a un modo de portadora continua constante (CW, FM o RTTY) y seleccioná baja potencia (1 W / LOW).',
    };
  }

  const { gamma } = TERMINATION_GAMMA[input.termination];
  const pFwdW = input.txPowerW;
  const pRefW = Number((pFwdW * gamma * gamma).toFixed(2));
  const pNetW = Number((pFwdW - pRefW).toFixed(2));
  const swr = gamma >= 0.99 ? Infinity : (1 + gamma) / (1 - gamma);
  const swrText = !Number.isFinite(swr) ? '∞ : 1' : `${swr.toFixed(2).replace('.', ',')} : 1`;
  const rlDb = gamma <= 0.001 ? 60 : -20 * Math.log10(gamma);
  const returnLossDbText = gamma <= 0.001 ? '> 50 dB' : `${rlDb.toFixed(1).replace('.', ',')} dB`;

  if (input.termination === 'shorted-coax') {
    return {
      status: 'danger',
      pFwdW,
      pRefW,
      pNetW,
      gamma,
      swrText,
      returnLossDbText,
      headline:
        input.txPowerW >= 50
          ? '¡Peligro para la etapa final! ROE extrema (36,7:1) transmitiendo a 50 W'
          : 'ROE extrema (36,7:1): el 90 % de la potencia rebota hacia el transmisor',
      physicalExplanation:
        `De los ${pFwdW} W enviados por el transmisor, ${pRefW.toFixed(2).replace('.', ',')} W regresan reflejados por la línea debido a la discontinuidad total de impedancia (|Γ| ≈ 0,95). Las ondas directa y reflejada forman crestas estacionarias de tensión y corriente que pueden perforar dieléctricos o destruir el MOSFET de salida.`,
      technicianTip:
        'Por eso la primera prueba de una instalación desconocida se hace SIEMPRE en potencia mínima (1 W) y pulsos de menos de 2 segundos.',
    };
  }

  if (input.termination === 'detuned-antenna') {
    return {
      status: 'warning',
      pFwdW,
      pRefW,
      pNetW,
      gamma,
      swrText,
      returnLossDbText,
      headline: 'ROE 3,00 : 1 — Desadaptación severa (se refleja el 25 % de la potencia)',
      physicalExplanation:
        `Con Z_L = 150 Ω frente a Z₀ = 50 Ω, el coeficiente de reflexión vale |Γ| = (150 − 50)/(150 + 50) = 0,50. La fracción de potencia reflejada es |Γ|² = 0,25 (25 % = ${pRefW.toFixed(2).replace('.', ',')} W reflejados). La mayoría de los transceptores modernos activan su protección ALC/foldback a partir de ROE 2,0:1 o 3,0:1.`,
      technicianTip:
        'Para saber si este 3:1 es culpa de la antena o del cable coaxial, desconectá la antena allá arriba y poné la Carga Fantasma de 50 Ω en la punta del coaxil: si baja a ~1,05:1, el coaxil está sano y hay que ajustar la antena.',
    };
  }

  if (input.termination === 'dummy-50-tx' || input.termination === 'dummy-50-end') {
    const isEnd = input.termination === 'dummy-50-end';
    return {
      status: 'ok',
      pFwdW,
      pRefW,
      pNetW,
      gamma,
      swrText,
      returnLossDbText,
      headline: isEnd
        ? 'Diagnóstico con Carga Fantasma en la punta del coaxil: Línea coaxial 100 % sana'
        : 'Prueba sobre Carga Fantasma de 50 Ω: Transmisor calibrado y sin radiación al aire',
      physicalExplanation: isEnd
        ? 'Al terminar el extremo lejano del cable coaxial con un resistor no inductivo de 50 Ω, toda la onda progresiva es absorbida sin reflexión (ROE = 1,05:1). Esto demuestra que ni el cable RG-58/RG-213 ni las fichas PL-259 tienen cortos, agua ni aplastamientos.'
        : 'Una carga fantasma (Dummy Load) de 50 Ω no reactivos absorbe el 100 % de la potencia de RF en calor sin radiar al espectro. Te permite verificar que el transmisor entrega su potencia nominal antes de conectarlo a la antena.',
      technicianTip: 'La carga fantasma de 50 Ω es el patrón de referencia obligado antes de tocar cualquier varilla de antena.',
    };
  }

  return {
    status: 'ok',
    pFwdW,
    pRefW,
    pNetW,
    gamma,
    swrText,
    returnLossDbText,
    headline: 'Antena ajustada en banda (ROE 1,19 : 1 — Return Loss 21,2 dB)',
    physicalExplanation:
      `Con ROE 1,19:1 (|Γ| = 0,087), apenas el 0,76 % de la potencia (${pRefW.toFixed(2).replace('.', ',')} W) se refleja y el 99,24 % (${pNetW.toFixed(2).replace('.', ',')} W) se entrega limpiamente a la resistencia de radiación de la antena.`,
    technicianTip: 'En la práctica, cualquier ROE entre 1,0:1 y 1,5:1 en el centro de la banda de operación es óptima y no justifica seguir cortando alambre.',
  };
}

export interface NanoVnaSimulationInput {
  calibratedSolt: boolean;
  elementLengthCm: number;
}

export interface NanoVnaSweepPoint {
  freqMHz: number;
  swr: number;
}

export interface NanoVnaSimulationResult {
  status: 'ok' | 'warning';
  resonantFreqMHz: number;
  swrAt145: number;
  s11DbAt145: number;
  impedanceAt145Text: string;
  smithRegionText: string;
  adjustmentActionText: string;
  sweep: readonly NanoVnaSweepPoint[];
  headline: string;
  physicalExplanation: string;
  technicianTip: string;
}

export function simulateNanoVna(input: NanoVnaSimulationInput): NanoVnaSimulationResult {
  const idealLengthCm = 49.0; // λ/4 at 145.0 MHz with velocity factor 0.953
  const resonantFreqMHz = Number((145.0 * (idealLengthCm / input.elementLengthCm)).toFixed(2));
  const deltaCm = Number((input.elementLengthCm - idealLengthCm).toFixed(1));

  // Reactance at 145.0 MHz: +jX_L when element is too long (f_res < 145), -jX_C when too short (f_res > 145)
  const reactanceOhm = Number((deltaCm * 18.5).toFixed(1));
  const rRadiation = 50;
  const zDiffRe = rRadiation - 50;
  const zSumRe = rRadiation + 50;
  const gammaMag = Math.min(
    0.92,
    Math.max(0.01, Math.hypot(zDiffRe, reactanceOhm) / Math.hypot(zSumRe, reactanceOhm)),
  );
  const swrAt145 = Number(((1 + gammaMag) / (1 - gammaMag)).toFixed(2));
  const s11DbAt145 = Number((20 * Math.log10(gammaMag)).toFixed(1));

  const sweep: NanoVnaSweepPoint[] = [];
  for (let f = 138; f <= 152; f += 1) {
    const df = f - resonantFreqMHz;
    const xF = df * 12.5;
    const gF = Math.min(0.9, Math.max(0.01, Math.abs(xF) / Math.hypot(100, xF)));
    sweep.push({
      freqMHz: f,
      swr: Number(((1 + gF) / (1 - gF)).toFixed(2)),
    });
  }

  if (!input.calibratedSolt) {
    return {
      status: 'warning',
      resonantFreqMHz,
      swrAt145,
      s11DbAt145,
      impedanceAt145Text: 'Plano de fase desplazado (falta calibración SOLT)',
      smithRegionText: 'Rotación de fase del latiguillo de prueba no descontada',
      adjustmentActionText: 'Ejecutá primero la calibración Short · Open · Load 50 Ω',
      sweep,
      headline: 'NanoVNA sin calibrar en el plano de medición (SOLT pendiente)',
      physicalExplanation:
        'Un analizador vectorial mide amplitud y fase del coeficiente complejo S₁₁. Si no calibrás con los tres patrones (Short = corto, Open = abierto, Load = 50 Ω) en la punta del latiguillo que va a la antena, el retardo de fase del cable rota la Carta de Smith y falsea el signo de la reactancia.',
      technicianTip: 'Activá "Calibración SOLT aplicada (50 Ω)" antes de decidir si cortar o alargar la antena.',
    };
  }

  const sign = reactanceOhm >= 0 ? '+' : '−';
  const absX = Math.abs(reactanceOhm).toFixed(1).replace('.', ',');
  const impedanceAt145Text = `Z(145 MHz) = 50,0 ${sign} j${absX} Ω`;

  if (Math.abs(deltaCm) <= 0.3) {
    return {
      status: 'ok',
      resonantFreqMHz,
      swrAt145,
      s11DbAt145,
      impedanceAt145Text,
      smithRegionText: 'Centro de la Carta de Smith (puramente resistivo 50 + j0 Ω)',
      adjustmentActionText: '✓ Longitud óptima (49,0 cm): no cortar más',
      sweep,
      headline: 'Antena en resonancia exacta en 145,00 MHz (ROE 1,02 : 1 · S₁₁ = −40 dB)',
      physicalExplanation:
        'A 49,0 cm (λ/4 físico corregido por factor de velocidad del conductor), las reactancias inductiva y capacitiva de la varilla se cancelan mutuamente en 145,0 MHz (X = 0 Ω), dejando únicamente la resistencia de radiación adaptada a los 50 Ω del coaxil.',
      technicianTip: 'Guardá esta calibración en una memoria (SAVE 0) del NanoVNA para futuros controles periódicos de tu estación.',
    };
  }

  const isLong = deltaCm > 0;
  return {
    status: 'warning',
    resonantFreqMHz,
    swrAt145,
    s11DbAt145,
    impedanceAt145Text,
    smithRegionText: isLong
      ? 'Hemisferio SUPERIOR de la Carta de Smith (+jX_L · Comportamiento Inductivo)'
      : 'Hemisferio INFERIOR de la Carta de Smith (−jX_C · Comportamiento Capacitivo)',
    adjustmentActionText: isLong
      ? `✂ Antena LARGA: acortar varilla ${Math.abs(deltaCm).toFixed(1).replace('.', ',')} cm para subir la resonancia a 145 MHz`
      : `➕ Antena CORTA: alargar varilla ${Math.abs(deltaCm).toFixed(1).replace('.', ',')} cm para bajar la resonancia a 145 MHz`,
    sweep,
    headline: isLong
      ? `El valle de ROE cayó en ${resonantFreqMHz.toFixed(2).replace('.', ',')} MHz (abajo de 145 MHz) → La antena está LARGA`
      : `El valle de ROE subió a ${resonantFreqMHz.toFixed(2).replace('.', ',')} MHz (arriba de 145 MHz) → La antena está CORTA`,
    physicalExplanation: isLong
      ? `Como f_res = c / (4·L_ef), una varilla de ${input.elementLengthCm.toFixed(1).replace('.', ',')} cm resuena a una frecuencia menor (${resonantFreqMHz.toFixed(2).replace('.', ',')} MHz). Al excitarla en 145,0 MHz (por encima de su resonancia natural), sobra longitud eléctrica y la antena presenta reactancia inductiva (+j${absX} Ω).`
      : `Una varilla de ${input.elementLengthCm.toFixed(1).replace('.', ',')} cm tiene su cuarto de onda más arriba en frecuencia (${resonantFreqMHz.toFixed(2).replace('.', ',')} MHz). Al medirla en 145,0 MHz (por debajo de su resonancia), falta longitud eléctrica y presenta reactancia capacitiva (−j${absX} Ω).`,
    technicianTip:
      'Regla mnemotécnica universal de antenas: si el pozo de ROE está en frecuencia más BAJA que la deseada, la antena está LARGA (hay que acortar de a 3–5 mm por vez).',
  };
}
