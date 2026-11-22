'use client';

import { useState } from 'react';
import { Section, Prose } from '../ui/Prose';
import { Widget } from '../widgets/Widget';
import { SendPractice } from '../widgets/SendPractice';
import { MorseKeypad } from '../MorseKeypad';
import { MorseSoundControls } from '../widgets/MorseSoundControls';
import { stopAllMorse } from '../widgets/morseSound';
import s from '../morsePractice.module.css';

type StationId = 'all' | 'transmision' | 'alfabeto' | 'traductor' | 'entrenador';

const STATIONS: { id: StationId; label: string }[] = [
  { id: 'all', label: 'Todas las estaciones' },
  { id: 'transmision', label: '1 · Transmitir' },
  { id: 'alfabeto', label: '2 · Alfabeto' },
  { id: 'traductor', label: '3 · Traductor' },
  { id: 'entrenador', label: '4 · Recepción Koch' },
];

export function ChapterMorse() {
  const [station, setStation] = useState<StationId>('all');

  const selectStation = (next: StationId) => {
    stopAllMorse();
    setStation(next);
    if (next !== 'all') {
      document.getElementById(next)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <>
      <div className={s.console} data-testid="morse-global-console">
        <div className={s.stationBar} role="group" aria-label="Selector de estación Morse">
          {STATIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={s.stationBtn}
              data-selected={station === item.id ? 'true' : 'false'}
              aria-pressed={station === item.id}
              onClick={() => selectStation(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <MorseSoundControls globalBar />
      </div>

      <Section id="por-que" kicker="CW.1" title="Por qué Morse todavía importa">
        <Prose>
          <p>Para empezar, <a href="lecciones/morse">recorré el árbol de letras y aprendé el ritmo</a>. Desde la consola de arriba podés ajustar el <strong>tono del oscilador (BFO)</strong> y el <strong>ruido de banda (QRN)</strong> para toda la página, o elegir una estación puntual sin que queden dos reproductores sonando a la vez.</p>
          <ul>
            <li>Es parte del examen en <strong>todas</strong> las categorías. Para Novicio se piden conocimientos generales (art. 4.4.3.4); para General, recibir a 5 palabras por minuto (art. 4.5.5.1); para Superior, recibir y transmitir a 10 (art. 4.6.5.1).</li>
            <li><strong>Densidad espectral de potencia:</strong> una portadora CW ocupa apenas ≈ 150 Hz de ancho de banda frente a los 2400 Hz de SSB o 12,5–25 kHz de FM. Toda la potencia del transmisor se concentra en ese filtro estrecho, logrando una ventaja de relación señal a ruido (SNR) de más de 12 dB respecto de la voz analógica.</li>
            <li>El transceptor CW es la arquitectura de RF más pura: un oscilador controlado, un mezclador y una etapa de salida clase C o E de alta eficiencia.</li>
          </ul>
          <p>Truco para aprender: no cuentes puntos y rayas. Cada letra es un <strong>patrón rítmico</strong> («di-dah» = A). Por eso el entrenador usa velocidad de carácter real desde el primer día y estira los espacios entre letras (método Farnsworth) para evitar la traducción mental punto por punto.</p>
        </Prose>
      </Section>

      <div
        className={s.stationWrap}
        data-highlighted={station === 'transmision' ? 'true' : 'false'}
        data-hidden={station !== 'all' && station !== 'transmision' ? 'true' : 'false'}
      >
        <Section id="transmision" kicker="CW · Estación 1" title="Entrenador de transmisión (Manipulador y Árbol)">
          <SendPractice />
        </Section>
      </div>

      <div
        className={s.stationWrap}
        data-highlighted={station === 'alfabeto' ? 'true' : 'false'}
        data-hidden={station !== 'all' && station !== 'alfabeto' ? 'true' : 'false'}
      >
        <Section id="alfabeto" kicker="CW · Estación 2" title="Alfabeto Morse (ITU-R M.1677)">
          <Prose><p>Código Morse internacional (ITU-R M.1677). Cada letra lleva su palabra del alfabeto fonético OACI. Relación temporal normalizada: la raya dura 3 puntos (3·T_dit), el espacio interno entre signos de una letra dura 1·T_dit, entre letras 3·T_dit y entre palabras 7·T_dit. Tocá una letra para escucharla y armar un mensaje.</p></Prose>
          <MorseKeypad />
        </Section>
      </div>

      <div
        className={s.stationWrap}
        data-highlighted={station === 'traductor' ? 'true' : 'false'}
        data-hidden={station !== 'all' && station !== 'traductor' ? 'true' : 'false'}
      >
        <Section id="traductor" kicker="CW · Estación 3" title="Traductor texto ↔ Morse">
          <Widget name="morse" />
        </Section>
      </div>

      <div
        className={s.stationWrap}
        data-highlighted={station === 'entrenador' ? 'true' : 'false'}
        data-hidden={station !== 'all' && station !== 'entrenador' ? 'true' : 'false'}
      >
        <Section id="entrenador" kicker="CW · Estación 4" title="Entrenador auditivo (Método Koch)">
          <Widget name="koch" />
        </Section>
      </div>
    </>
  );
}
