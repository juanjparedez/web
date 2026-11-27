import Image from 'next/image';
import type { ReactNode } from 'react';
import type { InstrumentTabId } from '@/lib/radio/benchInstrumentsSim';
import { INSTRUMENT_PHOTOS } from '@/lib/radio/instrumentPhotos';
import { DmmCurrentDiagram, DmmVoltageDiagram, ScopeDiagram, SwrDiagram, VnaDiagram } from './InstrumentDiagrams';
import s from './instrumentFigure.module.css';

const DIAGRAMS: Record<InstrumentTabId, { title: string; body: ReactNode }> = {
  multimeter: {
    title: 'Cómo se conecta',
    body: (
      <div className={s.pair}>
        <DmmVoltageDiagram />
        <DmmCurrentDiagram />
      </div>
    ),
  },
  oscilloscope: { title: 'Qué leer en la pantalla', body: <ScopeDiagram /> },
  'swr-meter': { title: 'Dónde va y qué mide', body: <SwrDiagram /> },
  nanovna: { title: 'Cómo leer el barrido', body: <VnaDiagram /> },
};

/** Real photo (credited, self-hosted) next to a drawn diagram of how the instrument is used. */
export function InstrumentFigure({ id }: { id: InstrumentTabId }) {
  const photo = INSTRUMENT_PHOTOS[id];
  const diagram = DIAGRAMS[id];
  return (
    <div className={s.figureRow} data-testid={`instrument-figure-${id}`}>
      <figure className={s.photo}>
        <Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt}
          sizes="(max-width: 760px) 100vw, 420px" />
        <figcaption>
          {photo.caption}{' '}
          <small>
            Foto: {photo.author},{' '}
            <a href={photo.licenseUrl} rel="license noopener" target="_blank">{photo.license}</a>, vía{' '}
            <a href={photo.sourceUrl} rel="noopener" target="_blank">Wikimedia Commons</a>.
          </small>
        </figcaption>
      </figure>
      <figure className={s.diagram}>
        <span className={s.diagramTitle}>{diagram.title}</span>
        {diagram.body}
      </figure>
    </div>
  );
}
