'use client';

import { MathLine } from '@/components/common/MathLine';
import { MultimeterLab } from './MultimeterLab';
import styles from './multimeter.module.css';

export function MultimeterGuide() {
  return (
    <div data-testid="multimeter-guide">
      <MultimeterLab />

      <section className={styles.guideSection} id="anatomia-dmm">
        <span className={styles.kicker}>01 · ARQUITECTURA INTERNA DEL INSTRUMENTO</span>
        <h2>Qué hay adentro de un Multímetro Digital (DMM)</h2>
        <p>
          Un multímetro no mide tensión, corriente y resistencia con tres aparatos distintos: su corazón es un
          único <strong>conversor analógico-digital (ADC de doble rampa o Sigma-Delta)</strong> que solo sabe
          medir una tensión continua pequeña (típicamente ±200 mV de fondo de escala). Todas las
          demás posiciones del selector giratorio son circuitos acondicionadores que convierten la magnitud física
          en esos milivolts:
        </p>

        <div className={styles.cardsGrid}>
          <article className={styles.infoCard}>
            <span className={styles.kicker}>VOLTÍMETRO (V⎓ / V∼)</span>
            <h3>Divisor de entrada de 10 MΩ</h3>
            <p>
              Una escalera de resistores de precisión (9 MΩ + 900 kΩ + 90 kΩ + 10 kΩ)
              presenta siempre R_in = 10 MΩ hacia las puntas. Se conecta <strong>en paralelo</strong> para
              derivar menos de 1,4 µA al medir 13,8 V.
            </p>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.kicker}>AMPERÍMETRO (mA / 10A)</span>
            <h3>Resistencia Shunt y Burden Voltage</h3>
            <p>
              Hace pasar la corriente del circuito <strong>en serie</strong> por un resistor calibrado de manganina
              (R_shunt = 0,01 Ω en 10 A; 1 Ω a 100 Ω en mA/µA). El ADC mide la
              caída V_burden = I · R_shunt.
            </p>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.kicker}>ÓHMETRO Y CONTINUIDAD (Ω / ))))</span>
            <h3>Fuente de corriente constante</h3>
            <p>
              El multímetro inyecta una corriente conocida (I_test ≈ 1 mA en escala baja) sobre el
              componente <strong>desenergizado</strong> y mide la caída V = I_test · R_x. Si hay tensión
              externa en el circuito, la lectura se invalida.
            </p>
          </article>
        </div>

        <MathLine>V_medido = V_th · (R_in / (R_th + R_in))   |   V_burden = I_circuito · R_shunt   |   V_RMS = √((1/T) · ∫ v²(t) dt)</MathLine>
      </section>

      <section className={styles.guideSection} id="protocolo-medicion">
        <span className={styles.kicker}>02 · PROTOCOLO DE BANCO Y ERRORES QUE QUEMAN FUSIBLES</span>
        <h2>Tabla de operación segura por magnitud</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Magnitud</th>
                <th>Selector</th>
                <th>Borne Punta Roja</th>
                <th>Conexión al circuito</th>
                <th>Estado de la fuente</th>
                <th>Impedancia del tester</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tensión DC (Fuente / Batería)</strong></td>
                <td><code>V⎓ (DCV)</code></td>
                <td><code>V / Ω / )))</code></td>
                <td><strong>En Paralelo</strong></td>
                <td>Encendida (ON)</td>
                <td>10 MΩ (muy alta)</td>
              </tr>
              <tr>
                <td><strong>Tensión AC (Red / Audio / Ripple)</strong></td>
                <td><code>V∼ (ACV)</code></td>
                <td><code>V / Ω / )))</code></td>
                <td><strong>En Paralelo</strong></td>
                <td>Encendida (ON)</td>
                <td>10 MΩ ∥ ~100 pF</td>
              </tr>
              <tr>
                <td><strong>Corriente de TX (&gt; 400 mA)</strong></td>
                <td><code>10A⎓</code></td>
                <td><code>10A MAX</code></td>
                <td><strong>En Serie (abrir rama)</strong></td>
                <td>Encendida al medir</td>
                <td>0,01 Ω (cortocircuito virtual)</td>
              </tr>
              <tr>
                <td><strong>Corriente de señal (&lt; 400 mA)</strong></td>
                <td><code>mA⎓ / µA⎓</code></td>
                <td><code>mA / µA</code></td>
                <td><strong>En Serie (abrir rama)</strong></td>
                <td>Encendida al medir</td>
                <td>1 Ω – 100 Ω (con fusible rápido)</td>
              </tr>
              <tr>
                <td><strong>Resistencia y Continuidad Coaxil</strong></td>
                <td><code>Ω</code> / <code>)))</code></td>
                <td><code>V / Ω / )))</code></td>
                <td>Componente aislado</td>
                <td><strong>Apagada (OFF) y descargada</strong></td>
                <td>Inyecta I_test (0,5 V – 3 V)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.guideSection} id="multimetro-en-rf">
        <span className={styles.kicker}>03 · DOBLE ENFOQUE: FÍSICA DE INSTRUMENTACIÓN Y RADIOFRECUENCIA</span>
        <h2>True-RMS, Seguridad CAT y cómo medir Potencia de RF con tu Multímetro</h2>
        <div className={styles.cardsGrid}>
          <article className={styles.infoCard}>
            <span className={styles.kicker}>ENFOQUE 1 · TRUE-RMS VS. VALOR MEDIO</span>
            <h3>Por qué importa la forma de onda</h3>
            <p>
              Un multímetro económico rectifica la onda y multiplica el promedio por 1,11 (π / (2√2)), lo cual
              solo es exacto para una senoidal pura. Un multímetro <strong>True-RMS</strong> calcula el valor eficaz
              térmico real integrando v²(t), indispensable para salidas de inversores, PWM o fuentes conmutadas.
            </p>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.kicker}>ENFOQUE 2 · PUNTA DETECTORA SCHOTTKY EN 50 Ω</span>
            <h3>Medir un transmisor de 145 MHz en modo V⎓</h3>
            <p>
              El canal <code>V∼</code> del multímetro solo llega a ~1 kHz. Para medir la potencia de un
              handy sobre una carga fantasma de 50 Ω, rectificamos la envolvente de RF con un diodo Schottky
              (<code>1N5711</code> o <code>BAT85</code>, V_d ≈ 0,25 V) y un capacitor cerámico de 10 nF,
              y leemos la tensión pico en <strong><code>V⎓ (DCV)</code></strong>:
            </p>
          </article>
        </div>
        <MathLine>V_pico = V_DC_leído + 0,25 V   |   V_RMS = V_pico / √2   |   P_RF[W] = V_RMS² / 50 Ω = (V_DC_leído + 0,25 V)² / 100</MathLine>
      </section>
    </div>
  );
}
