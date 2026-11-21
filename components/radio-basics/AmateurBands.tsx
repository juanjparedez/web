'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { amateurBands, amateurBandSources, formatAmateurBandRange, type AmateurBand, type AmateurBandId } from '@/lib/radio/amateurBands';
import styles from './amateurBands.module.css';

function AmateurBandTable({ selected, onSelect }: {
  selected: AmateurBandId; onSelect: (id: AmateurBandId) => void;
}) {
  const t = useTranslations('RadioAmateurBands');
  const locale = useLocale();
  return (
    <table className={styles.table} data-testid="amateur-band-table" role="table">
      <caption className={styles.srOnly}>{t('title')}</caption>
      <thead><tr>{(['band', 'range', 'propagation', 'use'] as const).map((column) => <th key={column} scope="col">{t(`columns.${column}`)}</th>)}</tr></thead>
      <tbody>{amateurBands.map((band) => (
        <tr key={band.id} data-selected={selected === band.id} data-amateur-band={band.id}>
          <th scope="row" className={styles.bandCell}>
            <Button type="link" aria-pressed={selected === band.id} onClick={() => onSelect(band.id)}>{band.label}</Button>
            <span>{band.family}</span>
          </th>
          <td data-label={t('columns.range')} className={styles.range}>{formatAmateurBandRange(band, locale)}</td>
          <td data-label={t('columns.propagation')}>{t(`entries.${band.id}.propagation`)}</td>
          <td data-label={t('columns.use')}>{t(`entries.${band.id}.use`)}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function AmateurBandDetail({ band }: { band: AmateurBand }) {
  const t = useTranslations('RadioAmateurBands');
  return (
    <section id="amateur-band-detail" className={styles.detail} aria-live="polite" aria-atomic="true" data-testid="amateur-band-detail">
      <p className={styles.eyebrow}>{t('detailTitle')}</p>
      <h2>{t(`entries.${band.id}.name`)}</h2>
      <dl>
        <div><dt>{t('antennas')}</dt><dd>{t(`entries.${band.id}.antennas`)}</dd></div>
        <div><dt>{t('modes')}</dt><dd>{t(`entries.${band.id}.modes`)}</dd></div>
        <div className={styles.detailNote}><dt>{t('notes')}</dt><dd>{t(`entries.${band.id}.notes`)}</dd></div>
      </dl>
      <p className={styles.conditions}>{t('antennaNote')}</p>
      {band.family !== 'HF' ? <p className={styles.conditions}>{t('buildingNote')}</p> : null}
    </section>
  );
}

function TechnologyExplanation() {
  const t = useTranslations('RadioAmateurBands');
  const locale = useLocale();
  return (
    <section className={styles.technology}>
      <h2>{t('technologyTitle')}</h2>
      <dl>
        <div><dt>{t('modulationLabel')}</dt><dd>{t('modulation')}</dd></div>
        <div><dt>{t('protocolLabel')}</dt><dd>{t('protocol')}</dd></div>
        <div><dt>{t('cipherTitle')}</dt><dd>{t('cipherText')}</dd></div>
      </dl>

      <div className={styles.legalAlert} role="note" aria-label="Advertencia sobre frecuencias libres y licenciadas">
        <h3>⚠ Advertencia Reglamentaria: Uso Libre vs. Licenciado vs. Servicios Críticos (ENACOM)</h3>
        <p>
          <strong>Escuchar (RX) es libre; transmitir (TX) exige atribución legal.</strong> Que un equipo comercial (como un Baofeng UV-5R) permita digitar cualquier frecuencia entre 136–174 MHz y 400–520 MHz no habilita a transmitir en ella.
        </p>
        <div className={styles.legalGrid}>
          <article className={styles.legalCard}>
            <h4>1. Bandas de Radioaficionados (Licencia LU/LW)</h4>
            <p>
              Segmentos como 80 m, 40 m, 20 m, 2 m (144–148 MHz) y 70 cm (430–440 MHz) requieren licencia otorgada por ENACOM (Res. 3635-E/2017), respetar los límites de categoría (Novicio, General, Superior) e identificarse con tu señal distintiva.
            </p>
          </article>
          <article className={styles.legalCard}>
            <h4>2. Uso Libre / Canalero (PMR, FRS, CB 27 MHz, ISM)</h4>
            <p>
              Operar sin licencia individual exige <strong>equipos homologados para uso canalero</strong> (antena fija no desmontable, canales preprogramados sin VFO libre y potencia radiada aparente limitada, típicamente ≤ 0,5 W). Un handy de banda corrida no cumple homologación canalera aunque se baje su potencia.
            </p>
          </article>
          <article className={styles.legalCard}>
            <h4>3. Frecuencias Prohibidas y Críticas</h4>
            <p>
              Aeronáutica (108–137 MHz AM), Marítima (156–162 MHz, Canal 16 en 156,800 MHz), Fuerzas de Seguridad, Bomberos y Emergencias Médicas. Para usar tu handy como receptor seguro sin riesgo de apretar el PTT por error, seguí el <Link href={`/${locale}/radio/tutoriales`}>Tutorial de programación RX-Only con CHIRP</Link>.
            </p>
          </article>
        </div>
      </div>

      <div className={styles.sdrSection}>
        <h3>Arquitectura Digital en Radiofrecuencia: SDR, Compresión, FEC y Encriptación (Doble Enfoque)</h3>
        <div className={styles.dualApproach}>
          <article className={styles.approachBox}>
            <h4>SDR (Software Defined Radio) · Modelo Físico e I/Q</h4>
            <p>
              <strong>Enfoque 1 (Intuición física):</strong> En lugar de filtrar y demodular con bobinas, cristales y diodos fijos, un SDR desplaza la porción del espectro a banda base en dos ramas desfasadas 90° —Fase (I) y Cuadratura (Q)— y las digitaliza con un conversor analógico-digital (ADC). Esto permite distinguir frecuencias por encima y por debajo del oscilador local y cambiar de AM a SSB, CW o FM por software.
            </p>
          </article>
          <article className={styles.approachBox}>
            <h4>SDR y DSP · Rigor Electrónico y Matemático</h4>
            <p>
              <strong>Enfoque 2 (Rigor técnico):</strong> Toda señal pasabanda real se expresa como la envolvente compleja s(t) = I(t)·cos(ωc·t) − Q(t)·sin(ωc·t). Por el teorema de Nyquist-Shannon, digitalizar un ancho de banda complejo con muestreo I/Q a tasa fs captura un span espectral completo Δf = fs sin ambigüedad de imagen. El rango dinámico del ADC crece a razón de ≈ 6,02 dB por bit efectivo (ENOB), y el diezmado (decimation) con filtros FIR aumenta la resolución efectiva al reducir el ancho de banda de ruido.
            </p>
          </article>
          <article className={styles.approachBox}>
            <h4>Compresión de Fuente vs. Codificación de Canal (FEC)</h4>
            <p>
              <strong>Compresión (Codec2 / AMBE+2):</strong> Modela el tracto vocal para reducir la tasa binaria de voz a 1,2–3,6 kbps, permitiendo transmitir voz digital en apenas 2,4 kHz (HF FreeDV) o 12,5 kHz (DMR). <strong>Codificación de canal (FEC / LDPC en FT8):</strong> Agrega bits de paridad estructurados para corregir errores sobre el canal ruidoso, logrando decodificar señales hasta −21 dB de SNR (en 2,5 kHz), cerca del límite teórico de Shannon-Hartley C = B·log2(1 + S/N).
            </p>
          </article>
          <article className={styles.approachBox}>
            <h4>Encriptación Criptográfica vs. Codificación Abierta</h4>
            <p>
              <strong>Diferencia fundamental:</strong> Codificar (Morse, Baudot, FT8, DMR, APRS) traduce información usando un estándar público que cualquiera puede demodular. <strong>Encriptar (AES, ARC4)</strong> aplica una transformación matemática con clave secreta para ocultar el mensaje. El Reglamento de Radiocomunicaciones de la UIT (Art. 25) y ENACOM <strong>prohíben la encriptación en bandas de radioaficionados</strong> (salvo el canal de telecomando de satélites amateur), porque el servicio es abierto, experimental y auditable.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function AmateurBands() {
  const t = useTranslations('RadioAmateurBands');
  const [selected, setSelected] = useState<AmateurBandId>('forty');
  const band = amateurBands.find((candidate) => candidate.id === selected) ?? amateurBands[1];
  const selectBand = (id: AmateurBandId) => {
    setSelected(id);
    document.getElementById('amateur-band-detail')?.scrollIntoView({ block: 'start' });
  };
  return (
    <section className={styles.amateur} aria-label={t('title')}>
      <p>{t('intro')}</p>
      <AmateurBandTable selected={selected} onSelect={selectBand} />
      <AmateurBandDetail band={band} />
      <TechnologyExplanation />
      <p className={styles.conditions}>{t('conditions')}</p>
      <p className={styles.permission}>{t('permission')}</p>
      <footer className={styles.sources}>
        <p>{t('referenceLabel')}</p>
        <p>{t('sourcesNote')}</p>
        <a href={amateurBandSources.bands} target="_blank" rel="noreferrer">{t('sourceLabel')}</a>
        <a href={amateurBandSources.regulation} target="_blank" rel="noreferrer">{t('regulationSource')}</a>
        <a href={amateurBandSources.propagation} target="_blank" rel="noreferrer">{t('propagationSource')}</a>
        <a href={amateurBandSources.indoor} target="_blank" rel="noreferrer">{t('indoorSource')}</a>
      </footer>
    </section>
  );
}
