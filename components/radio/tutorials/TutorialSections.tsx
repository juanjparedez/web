'use client';

import { MathLine } from '@/components/common/MathLine';
import styles from './radioTutorials.module.css';

const MENU_ROWS = [
  ['0 · SQL', 'Squelch (Silenciador)', 'Nivel 3 a 5', 'Define el umbral de relación señal a ruido a la salida del discriminador FM para habilitar el amplificador de audio. En 0 queda abierto escuchando ruido térmico (kB·T·B).'],
  ['1 · STEP', 'Paso del PLL', '5 / 6.25 / 12.5 / 25 kHz', 'Incremento mínimo del divisor fraccional del sintetizador PLL. Para repetidoras de 2 m se usa 10 o 25 kHz; para PMR446 es indispensable 6,25 kHz.'],
  ['2 · TXP', 'Potencia de salida', 'LOW (1 W)', 'Polarización de la etapa final de RF (LOW ≈ 1 W = 30 dBm, HIGH ≈ 4–5 W = 36–37 dBm). Subir de 1 W a 4 W son apenas +6 dB (1 punto S), pero cuadruplica el consumo.'],
  ['5 · WN', 'Ancho de banda FM', 'WIDE (Afición) / NARR (Canalero)', 'Ajusta la desviación pico Δf y el filtro de FI. WIDE usa Δf = ±5 kHz (canal de 25 kHz, estándar en radioafición); NARR usa Δf = ±2,5 kHz (canal de 12,5 kHz, estándar en PMR/FRS).'],
  ['6 · TOT', 'Time-Out Timer', '15 s a 60 s', 'Temporizador de corte de transmisión continua. Si el PTT queda presionado, corta la portadora a los 15 s para proteger el MOSFET de salida y no bloquear el canal.'],
  ['11 / 13', 'R-CTCS / T-CTCS', 'R-CTCS: OFF en escucha', 'Subtonos analógicos (67,0 a 254,1 Hz). En escucha dejá R-CTCS = OFF: si activás un subtono en recepción, el handy quedará mudo ante estaciones que no transmitan ese tono.'],
  ['23 · BCL', 'Busy Channel Lockout', 'ON', 'Inhibe el PTT si el receptor detecta portadora activa en la frecuencia, evitando pisar una comunicación en curso.'],
  ['24 · AUTOLK', 'Bloqueo de teclado', 'ON', 'Bloquea automáticamente el teclado tras unos segundos para evitar cambios accidentales de frecuencia o menú.'],
] as const;

const RX_CHANNELS = [
  ['2M LLAMADA', '145.50000', 'FM · WIDE (25 kHz)', 'off (RX-Only)', 'safe', 'Frecuencia nacional de encuentro y llamada en fonía FM dentro de la banda de 2 m (144–148 MHz). TX solo con licencia ENACOM.'],
  ['ISS DOWNLINK', '145.80000', 'FM · WIDE (25 kHz)', 'off (RX-Only)', 'safe', 'Bajada de voz, SSTV y repetidora de la Estación Espacial Internacional (ARISS) durante pasadas orbitales visibles.'],
  ['APRS ARG', '144.93000', 'FM · WIDE (25 kHz)', 'off (RX-Only)', 'safe', 'Tramas digitales AX.25 AFSK 1200 bps de telemetría y posición de radioaficionados en Argentina.'],
  ['REPE VHF (Ej.)', '145.100–145.490', 'FM · WIDE (25 kHz)', 'off (RX-Only)', 'safe', 'Salidas de repetidoras de Radio Clubes locales (shift estándar −600 kHz). En escucha se programa solo la salida con Duplex = off.'],
  ['70CM SIMPLEX', '433.50000', 'FM · WIDE (25 kHz)', 'off (RX-Only)', 'safe', 'Frecuencia de encuentro FM en la banda de 70 cm (430–440 MHz). TX solo con licencia ENACOM.'],
  ['UHF CANALERO 1', '462.56250', 'FM · NARR (12.5 kHz)', 'off en UV-5R', 'warn', 'Canal 1 típico de walkie-talkies familiares UHF (FRS/GMRS). Programalo en NARR con R-CTCS = OFF y Duplex = off para monitorear handies comerciales.'],
  ['PMR446 CH1', '446.00625', 'FM · NARR (12.5 kHz)', 'off en UV-5R', 'warn', 'Canal 1 de walkie-talkies estándar PMR446 (requiere STEP = 6.25 kHz). Solo monitoreo en equipos con VFO y antena desmontable.'],
  ['MARITIMO C16', '156.80000', 'FM · WIDE (25 kHz)', 'PROHIBIDO TX', 'danger', 'Canal internacional de socorro y llamada marítima (Prefectura Naval). Prohibido transmitir fuera de emergencia náutica real.'],
] as const;

export function KeypadMenusSection() {
  return (
    <section id="menus-teclado" className={styles.section}>
      <span className={styles.kicker}>03 / CONFIGURACIÓN EN EL EQUIPO</span>
      <h2>Menús del UV-5R que tenés que conocer</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Menú</th><th>Parámetro</th><th>Valor recomendado</th><th>Qué hace física y electrónicamente</th></tr>
          </thead>
          <tbody>
            {MENU_ROWS.map(([menu, param, rec, desc]) => (
              <tr key={menu}>
                <td className={styles.mono}>{menu}</td>
                <td>{param}</td>
                <td><span className={styles.tagSafe}>{rec}</span></td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function WalkieTalkieSection() {
  return (
    <section id="walkie-talkie" className={styles.section}>
      <span className={styles.kicker}>04 / INTEROPERABILIDAD CON WALKIE-TALKIES</span>
      <h2>Cómo funcionan los Walkie-Talkies (UHF / PMR / FRS) y el mito de los «subcanales privados»</h2>
      <div className={styles.dualGrid}>
        <article className={styles.approachCard}>
          <h3>Enfoque 1 · Por qué a veces dos radios no se escuchan</h3>
          <p>
            Los walkie-talkies comerciales muestran en pantalla «Canal 4 · Subcanal 12». Ese «subcanal» <strong>no es otra frecuencia ni encripta tu voz</strong>: es un tono grave continuo (CTCSS) o una palabra binaria lenta (DCS) sumada a tu voz. Si un walkie-talkie tiene activado el subcanal 12 (100,0 Hz), su parlante solo se abre cuando recibe una portadora con ese tono de 100,0 Hz, pero <strong>cualquier receptor en esa frecuencia con R-CTCS = OFF escucha toda la conversación</strong>.
          </p>
        </article>
        <article className={styles.approachCard}>
          <h3>Enfoque 2 · Rigor técnico (Regla de Carson, CTCSS/DCS y Homologación)</h3>
          <p>
            En FM de banda estrecha (NARROW, canal de 12,5 kHz), la desviación pico es Δf = 2,5 kHz con audio máximo fm = 3 kHz; por la Regla de Carson ocupa BW ≈ 11 kHz. El subtono CTCSS se inyecta entre 67,0 y 254,1 Hz con desviación de ±0,3 a ±0,5 kHz (filtrado antes del parlante por un pasaaltos de 300 Hz). En Argentina, transmitir sin licencia individual en canales de uso libre exige equipos homologados con antena fija y potencia ERP limitada; un UV-5R sirve para escucharlos con Duplex = off o para transmitir en bandas amateur una vez obtenida tu licencia LU/LW.
          </p>
        </article>
      </div>
      <MathLine>BW_Carson = 2 · (Δf + fm) = 2 · (2,5 kHz + 3 kHz) = 11 kHz (modo NARROW)</MathLine>
    </section>
  );
}

export function RxTemplateSection() {
  return (
    <section id="frecuencias-rx" className={styles.section}>
      <span className={styles.kicker}>05 / PLANTILLA CHIRP · ARGENTINA</span>
      <h2>Frecuencias útiles para programar en modo Solo Escucha (Duplex = off)</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Nombre sugerido</th><th>Frecuencia (MHz)</th><th>Modo / Ancho</th><th>Duplex (CHIRP)</th><th>Qué vas a escuchar y condición legal</th></tr>
          </thead>
          <tbody>
            {RX_CHANNELS.map(([name, freq, mode, duplex, tone, desc]) => (
              <tr key={name}>
                <td className={styles.mono}>{name}</td>
                <td className={styles.mono}>{freq}</td>
                <td>{mode}</td>
                <td>
                  <span className={tone === 'safe' ? styles.tagSafe : tone === 'warn' ? styles.tagWarn : styles.tagDanger}>
                    {duplex}
                  </span>
                </td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
