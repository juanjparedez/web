'use client';

import { useState } from 'react';
import { MathLine } from '@/components/common/MathLine';
import type { InstrumentTabId } from '@/lib/radio/benchInstrumentsSim';
import { MultimeterLab } from './MultimeterLab';
import { OscilloscopeLab } from './OscilloscopeLab';
import { SwrMeterLab } from './SwrMeterLab';
import { NanoVnaLab } from './NanoVnaLab';
import styles from './multimeter.module.css';

type TabChoice = InstrumentTabId | 'all';

const INSTRUMENT_TABS: readonly { id: TabChoice; label: string }[] = [
  { id: 'multimeter', label: '1 · Multímetro Digital (DMM)' },
  { id: 'oscilloscope', label: '2 · Osciloscopio (DSO y Puntas)' },
  { id: 'swr-meter', label: '3 · Medidor de ROE y Carga 50 Ω' },
  { id: 'nanovna', label: '4 · NanoVNA (S11 y Antenas)' },
  { id: 'all', label: 'Ver los 4 instrumentos' },
];

export function MultimeterGuide() {
  const [activeTab, setActiveTab] = useState<TabChoice>('multimeter');

  const showDmm = activeTab === 'all' || activeTab === 'multimeter';
  const showScope = activeTab === 'all' || activeTab === 'oscilloscope';
  const showSwr = activeTab === 'all' || activeTab === 'swr-meter';
  const showVna = activeTab === 'all' || activeTab === 'nanovna';

  return (
    <div data-testid="multimeter-guide">
      <div className={styles.instrumentSelector} role="group" aria-label="Selector de instrumento de banco">
        {INSTRUMENT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`${styles.instrumentTab} ${activeTab === tab.id ? styles.instrumentTabActive : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showDmm ? <MultimeterLab /> : null}
      {showScope ? <OscilloscopeLab /> : null}
      {showSwr ? <SwrMeterLab /> : null}
      {showVna ? <NanoVnaLab /> : null}

      <section className={styles.guideSection} id="anatomia-dmm">
        <span className={styles.kicker}>01 · ARQUITECTURA INTERNA DE LOS 4 INSTRUMENTOS</span>
        <h2>Qué mide cada instrumento de banco y cuándo usar cada uno</h2>
        <div className={styles.cardsGrid}>
          <article className={styles.infoCard}>
            <span className={styles.kicker}>01 · MULTÍMETRO (DMM TRUE-RMS)</span>
            <h3>Magnitudes estáticas y eficaces (DC / AC baja f / Ω)</h3>
            <p>
              Divisor de entrada de 10 MΩ en paralelo para tensión y shunt de 0,01 Ω en serie para corriente (10A).
              Con una punta detectora de diodo Schottky (1N5711) permite medir tensión pico de RF sobre 50 Ω.
            </p>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.kicker}>02 · OSCILOSCOPIO DIGITAL (DSO)</span>
            <h3>Dominio del tiempo v(t), ripple, fase y flancos</h3>
            <p>
              Muestra la forma de onda instantánea, excursión pico a pico (V_pp) y componente continua vs. alterna.
              Se usa siempre con punta en posición ×10 (10 MΩ ∥ ~12 pF) compensada para no cargar el circuito.
            </p>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.kicker}>03 · WATÍMETRO DIRECCIONAL + CARGA 50 Ω</span>
            <h3>Potencia Directa (FWD), Reflejada (REF) y ROE en TX</h3>
            <p>
              Se intercala en serie sobre el coaxil de 50 Ω para medir en transmisión real (modo CW/FM a baja potencia).
              Junto con la carga fantasma de 50 Ω permite separar fallas de coaxil de fallas de antena.
            </p>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.kicker}>04 · NANOVNA (ANALIZADOR VECTORIAL)</span>
            <h3>Barrido S₁₁(f), curva de ROE y reactancia ±jX</h3>
            <p>
              Previa calibración SOLT (Short, Open, Load 50 Ω), barre toda la banda e indica la frecuencia exacta de
              resonancia y si el irradiante quedó largo (+jX_L, resuena abajo) o corto (−jX_C, resuena arriba).
            </p>
          </article>
        </div>
        <MathLine>V_medido = V_th · (R_in / (R_th + R_in))   |   V_pp = 2 · √2 · V_RMS   |   ROE = (1 + |Γ|) / (1 − |Γ|)   |   S₁₁ [dB] = 20 · log₁₀(|Γ|)</MathLine>
      </section>

      <section className={styles.guideSection} id="protocolo-medicion">
        <span className={styles.kicker}>02 · PROTOCOLO DE BANCO Y SEGURIDAD DE INSTRUMENTOS</span>
        <h2>Tabla resumen de conexión segura en el taller</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Instrumento / Función</th>
                <th>Configuración</th>
                <th>Conexión física</th>
                <th>Impedancia presentada</th>
                <th>Precaución crítica de taller</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>DMM · Tensión DC/AC</strong></td>
                <td><code>V⎓</code> / <code>V∼</code> · Borne <code>V/Ω</code></td>
                <td>En Paralelo</td>
                <td>10 MΩ (alta Z)</td>
                <td>Verificar que la punta roja NO haya quedado en <code>10A</code> o <code>mA</code></td>
              </tr>
              <tr>
                <td><strong>DMM · Corriente TX</strong></td>
                <td><code>10A⎓</code> · Borne <code>10A</code></td>
                <td>En Serie (abrir rama)</td>
                <td>0,01 Ω (shunt directo)</td>
                <td>Nunca apoyar en paralelo sobre una fuente; devolver punta a <code>V/Ω</code> al terminar</td>
              </tr>
              <tr>
                <td><strong>DMM · Resistencia / Coaxil</strong></td>
                <td><code>Ω</code> / <code>)))</code> · Borne <code>V/Ω</code></td>
                <td>Circuito desenergizado</td>
                <td>Fuente I_test ≈ 1 mA</td>
                <td>Apagar fuente y descargar electrolíticos antes de apoyar las puntas</td>
              </tr>
              <tr>
                <td><strong>Osciloscopio (DSO)</strong></td>
                <td>Punta <code>×10</code> compensada</td>
                <td>En Paralelo (BNC a masa)</td>
                <td>10 MΩ ∥ ~12 pF</td>
                <td>El cocodrilo negro del BNC está unido a Tierra (PE 220 V): no tocar nodos vivos</td>
              </tr>
              <tr>
                <td><strong>Medidor de ROE + Carga 50 Ω</strong></td>
                <td>Modo <code>CW/FM</code> en <code>1 W (LOW)</code></td>
                <td>En Serie coaxial 50 Ω</td>
                <td>Pasante coaxial 50 Ω</td>
                <td>En BLU/SSB sin audio no marca; nunca transmitir alta potencia sin carga o con ROE &gt; 3:1</td>
              </tr>
              <tr>
                <td><strong>NanoVNA (Puerto S11)</strong></td>
                <td>Calibrado <code>SOLT</code> en 50 Ω</td>
                <td>Directo al coaxil/antena</td>
                <td>Puerto de 50 Ω (mW)</td>
                <td>Nunca transmitir con un equipo hacia el puerto del NanoVNA ni conectar antenas con estática sin descargar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
