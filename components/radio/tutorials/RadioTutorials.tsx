'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { PageIntro } from '@/components/ui/PageIntro';
import { RadioCourseNavigation } from '@/components/radio-basics/RadioCourseNavigation';
import courseStyles from '@/components/radio-basics/radioCourse.module.css';
import { RadioSubNav } from '../RadioSubNav';
import { ChirpBuilder } from './ChirpBuilder';
import { KeypadMenusSection, RxTemplateSection, WalkieTalkieSection } from './TutorialSections';
import styles from './radioTutorials.module.css';

export function RadioTutorials() {
  const locale = useLocale();
  const base = `/${locale}/radio`;

  return (
    <main className={courseStyles.page} lang="es">
      <RadioSubNav />
      <PageIntro
        eyebrow={<Link href={base}>← Radioaficionado · Taller y Equipos</Link>}
        title="Tutoriales de Campo: Baofeng UV-5R, Escucha Segura y Walkie-Talkies"
        description="Guía técnica paso a paso para programar un handy de banda corrida en modo solo recepción (RX-only) mientras estudiás para la licencia, entender qué hace electrónicamente cada parámetro y cómo operan los equipos canaleros de uso libre."
        area="knowledge"
        compact
      />

      <div className={courseStyles.shell} data-wide="true">
        <RadioCourseNavigation page="tutoriales" />
        <div className={courseStyles.reading}>
          <div className={styles.warningBanner} role="note" aria-label="Advertencia legal y técnica sobre transmisión">
            <h2>⚠ Regla de oro antes de encender el equipo: Escuchar (RX) es libre; Transmitir (TX) requiere habilitación</h2>
            <p>
              Recibir ondas electromagnéticas del espacio libre no altera el espectro ni requiere licencia. En cambio, <strong>presionar el PTT (Push-To-Talk)</strong> inyecta potencia de radiofrecuencia (1 a 5 W en un handy) en la antena: hacerlo fuera de banda o sin señal distintiva puede interferir servicios de emergencia, aeronáutica o repetidoras y constituye una infracción ante ENACOM.
            </p>
            <p>
              Si compraste un <strong>Baofeng UV-5R</strong> (o similar) antes de rendir tu examen de radioaficionado, el primer paso de taller es <strong>inhibir la transmisión por software (Duplex = off en CHIRP)</strong> para convertirlo en un escáner de bolsillo seguro a prueba de botones apretados por error.
            </p>
          </div>

          <nav className={styles.navPills} aria-label="Índice de tutoriales">
            <a href="#generador-chirp" className={styles.navPill}>⚡ Armador CSV para CHIRP</a>
            <a href="#arquitectura-uv5r" className={styles.navPill}>1. Arquitectura interna del UV-5R</a>
            <a href="#bloqueo-tx-chirp" className={styles.navPill}>2. Bloquear TX por error (CHIRP)</a>
            <a href="#menus-teclado" className={styles.navPill}>3. Menús críticos del equipo</a>
            <a href="#walkie-talkie" className={styles.navPill}>4. Interoperabilidad Walkie-Talkie (FM, CTCSS/DCS)</a>
            <a href="#frecuencias-rx" className={styles.navPill}>5. Tabla de memorias RX para Argentina</a>
          </nav>

          <ChirpBuilder />

          <section id="arquitectura-uv5r" className={styles.section}>
            <span className={styles.kicker}>01 / ELECTRÓNICA DE RF DEL HANDY</span>
            <h2>Qué tiene adentro un Baofeng UV-5R (y por qué exige cuidado técnico)</h2>
            <div className={styles.dualGrid}>
              <article className={styles.approachCard}>
                <h3>Enfoque 1 · Qué pasa físicamente en el equipo</h3>
                <p>
                  A diferencia de un transceptor superheterodino tradicional con filtros de cristal estrechos en frecuencia intermedia (FI), el UV-5R integra casi toda la radio en un único chip DSP/RF (<strong>RDA1846 / AT1846S</strong>). Esto le permite sintonizar de corrido 136–174 MHz (VHF) y 400–520 MHz (UHF), pero lo deja con menor selectividad frente a señales fuertes cercanas y con un filtro pasabajo de salida ajustado al límite.
                </p>
              </article>
              <article className={styles.approachCard}>
                <h3>Enfoque 2 · Rigor electrónico (Conversión directa y armónicas)</h3>
                <p>
                  El chip AT1846S emplea una arquitectura de <strong>conversión directa (Zero-IF / Low-IF)</strong> con mezcladores en cuadratura (I/Q), sintetizador PLL fraccional y ADC/DAC internos. En transmisión, el amplificador de potencia (MOSFET de RF no lineal) genera armónicas (2·f₀, 3·f₀). Si transmitís en 145 MHz, la segunda armónica cae en 290 MHz y la tercera en 435 MHz; si el filtro LC pasabajo de salida no atenúa al menos 40–60 dBc, irradiás energía espuria en otras bandas.
                </p>
              </article>
            </div>
          </section>

          <section id="bloqueo-tx-chirp" className={styles.section}>
            <span className={styles.kicker}>02 / PROGRAMACIÓN SEGURA (RX-ONLY)</span>
            <h2>Cómo bloquear la transmisión accidental con CHIRP</h2>
            <p>
              El botón PTT lateral del UV-5R es blando: guardado en una mochila o bolsillo es muy fácil apretarlo sin querer. La solución definitiva es programar tus memorias con el software libre <strong>CHIRP</strong> e inhibir el transmisor a nivel de EEPROM.
            </p>
            <ol className={styles.stepsList}>
              <li><strong>Conexión física del cable (Kenwood 2 pines):</strong> Con el handy apagado, insertá la ficha doble a fondo (si queda medio milímetro afuera no cierra masa/UART y CHIRP dará error). Encendé el equipo con el volumen al 50 %.</li>
              <li><strong>Respaldo inicial:</strong> En CHIRP elegí <code>Radio → Download from radio</code>, seleccioná el puerto serie, marca <code>Baofeng</code> y modelo <code>UV-5R</code>. Guardá el archivo <code>.img</code> original de fábrica.</li>
              <li><strong>Inhibir TX en cada canal de memoria (Duplex = off):</strong> En la pestaña <em>Memories</em>, cargá las frecuencias que quieras escuchar y en la columna <strong><code>Duplex</code></strong> seleccioná <strong><code>off</code></strong>.</li>
              <li><strong>Inhibir TX también en el modo VFO (frecuencia libre):</strong> Abrí <em>Settings → Other Settings</em> y <strong>desmarcá</strong> las casillas <code>VHF TX Enabled</code> y <code>UHF TX Enabled</code>.</li>
              <li><strong>Subir la configuración:</strong> Ejecutá <code>Radio → Upload to radio</code>. Al presionar el PTT sonará una alerta y la etapa de potencia de RF permanecerá apagada.</li>
            </ol>
          </section>

          <KeypadMenusSection />
          <WalkieTalkieSection />
          <RxTemplateSection />
        </div>
      </div>
    </main>
  );
}
