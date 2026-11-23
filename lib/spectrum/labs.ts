/** The spectrum section's sub-pages: one simulator per page, in reading order. */
export type LabSlug = 'explorador' | 'onda' | 'cubeta' | 'chladni' | 'fibra' | 'cuerpo-negro';

export interface Lab {
  slug: LabSlug;
  /** short name for the section menu */
  short: string;
  title: string;
  /** one line for the index card and the meta description */
  summary: string;
  lead: string;
  footnote?: string;
  /** /images/spectrum/<preview>.webp: a real frame of the simulator */
  preview: string;
}

export const LABS: readonly Lab[] = [
  {
    slug: 'explorador', short: 'Espectro', preview: 'explorer',
    title: 'De 1 Hz a 10²⁶ Hz, en una sola regla',
    summary: 'Todo el espectro en escala logarítmica: frecuencia, longitud de onda, energía del fotón y qué atraviesa la atmósfera.',
    lead: 'Veintiséis órdenes de magnitud: de ondas más largas que la Tierra a fotones con la energía de un acelerador de partículas. La escala es logarítmica: cada marca multiplica por diez. Abajo ves qué parte llega al suelo atravesando la atmósfera.',
  },
  {
    slug: 'onda', short: 'Onda en 3D', preview: 'wave',
    title: 'La onda por dentro',
    summary: 'El campo eléctrico y el magnético de cualquier frecuencia, en 3D. Polarización lineal o circular.',
    lead: 'Un campo eléctrico (E) y uno magnético (B) oscilan en fase, perpendiculares entre sí y a la dirección de avance. Ninguno necesita un medio: uno sostiene al otro y viajan juntos a 299 792 458 m/s en el vacío. Elegí una frecuencia, cambiá la polarización y girá la vista.',
  },
  {
    slug: 'cubeta', short: 'Cubeta de ondas', preview: 'ripple',
    title: 'Interferencia: dos ondas en el agua',
    summary: 'La ecuación de onda resuelta en la GPU: dos fuentes, doble rendija, difracción y gotas.',
    lead: 'Toda onda se suma a otra punto por punto. Donde llegan dos crestas juntas el agua sube el doble; donde una cresta se encuentra con un valle, se queda quieta. Esta cubeta resuelve la ecuación de onda en la GPU, en tiempo real, y es la misma física que el experimento de la doble rendija de Young (1801), que demostró que la luz es una onda. Tocá el agua para tirar una gota.',
    footnote: 'Modelo: ecuación de onda lineal en 2D (diferencias finitas, 1 celda = 1 mm) con bordes absorbentes. En el agua real la velocidad depende de la longitud de onda; el patrón de interferencia es el mismo.',
  },
  {
    slug: 'chladni', short: 'Placa de Chladni', preview: 'chladni',
    title: 'Ondas que se ven: la placa de Chladni',
    summary: 'Una placa de aluminio con arena encima: cambiá la frecuencia y mirá cómo la arena dibuja los nodos.',
    lead: 'Ernst Chladni (1787) espolvoreó arena sobre una placa de metal y la hizo vibrar con un arco de violín. La arena salta lejos de donde la placa se mueve y se acumula donde queda quieta: las líneas nodales. Cada resonancia dibuja una figura distinta. Es una onda estacionaria en 2D, la misma idea que fija los modos de una antena, de una cavidad de microondas o de los orbitales de un átomo.',
    footnote: 'Modelo: placa cuadrada de aluminio de 240 mm y 1 mm de espesor, bordes libres, excitada en un punto. Modos y frecuencias por el método de energía de Ritz (1909), a menos de un 6 % de los valores exactos; amortiguamiento Q = 60. Cada grano da saltos al azar proporcionales a cuánto vibra la placa debajo suyo.',
  },
  {
    slug: 'fibra', short: 'Fibra óptica', preview: 'fiber',
    title: 'Fibra óptica: luz atrapada en vidrio',
    summary: 'Reflexión total interna: cambiá los índices y el ángulo, y mirá cuándo la luz se escapa.',
    lead: 'Cuando la luz va de un medio más denso a uno menos denso y pega con un ángulo mayor al crítico, no sale: se refleja entera. Una fibra es un núcleo de índice n₁ rodeado de un revestimiento de índice n₂ un poco menor. Inclinate más que el cono de aceptación y la luz empieza a escaparse en cada rebote.',
  },
  {
    slug: 'cuerpo-negro', short: 'Cuerpo negro', preview: 'blackbody',
    title: 'Todo lo que tiene temperatura brilla',
    summary: 'La ley de Planck en vivo: de una persona a 310 K hasta el Sol y las estrellas azules.',
    lead: 'Un cuerpo negro ideal emite según la ley de Planck. Subí la temperatura: el pico se corre hacia frecuencias más altas y la potencia total se dispara. Los ejes son logarítmicos en los dos sentidos.',
  },
];

export const labBySlug = (slug: string) => LABS.find((l) => l.slug === slug);
