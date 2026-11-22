import { Section, Prose } from '../ui/Prose';

/** Why Morse still matters: shared by the Morse hub and the printable guide. */
export function MorseWhy() {
  return (
    <Section id="por-que" kicker="CW.1" title="Por qué Morse todavía importa">
      <Prose>
        <p>Para empezar, <a href="lecciones/morse">leé la lección de Morse</a> y después elegí un entrenador. En cada uno podés ajustar el <strong>tono del oscilador (BFO)</strong> y el <strong>ruido de banda (QRN)</strong>; el ajuste se comparte entre todos y nunca suenan dos a la vez.</p>
        <ul>
          <li>Es parte del examen en <strong>todas</strong> las categorías. Para Novicio se piden conocimientos generales (art. 4.4.3.4); para General, recibir a 5 palabras por minuto (art. 4.5.5.1); para Superior, recibir y transmitir a 10 (art. 4.6.5.1).</li>
          <li><strong>Densidad espectral de potencia:</strong> una portadora CW ocupa apenas ≈ 150 Hz de ancho de banda frente a los 2400 Hz de SSB o 12,5–25 kHz de FM. Toda la potencia del transmisor se concentra en ese filtro estrecho, logrando una ventaja de relación señal a ruido (SNR) de más de 12 dB respecto de la voz analógica.</li>
          <li>El transceptor CW es la arquitectura de RF más pura: un oscilador controlado, un mezclador y una etapa de salida clase C o E de alta eficiencia.</li>
        </ul>
        <p>Truco para aprender: no cuentes puntos y rayas. Cada letra es un <strong>patrón rítmico</strong> («di-dah» = A). Por eso el entrenador usa velocidad de carácter real desde el primer día y estira los espacios entre letras (método Farnsworth) para evitar la traducción mental punto por punto.</p>
      </Prose>
    </Section>
  );
}
