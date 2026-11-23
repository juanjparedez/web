import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getTranslatedMetadata } from '@/lib/seo-metadata';
import { PageIntro } from '@/components/ui/PageIntro';
import { LabGate } from '@/components/spectrum/LabGate';
import { BlackbodyLab, ChladniPlate, FiberLab, RippleTank } from '@/components/spectrum/labs';
import { SpectrumExplorer } from '@/components/spectrum/SpectrumExplorer';
import { SpectrumFacts } from '@/components/spectrum/SpectrumFacts';
import styles from '@/components/spectrum/spectrum.module.css';

export const dynamic = 'force-static';

const LABS: readonly [string, string][] = [
  ['onda', 'Onda en 3D'], ['cubeta', 'Cubeta de ondas'], ['chladni', 'Placa de Chladni'], ['fibra', 'Fibra óptica'], ['cuerpo-negro', 'Cuerpo negro'],
];

const locales = ['en', 'es', 'de', 'it'];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getTranslatedMetadata(locale, '/espectro', 'Spectrum');
}

export default async function SpectrumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className={styles.page} lang="es" data-spectrum-page>
      <PageIntro eyebrow="Física · Ondas" title="El espectro electromagnético" area="knowledge" compact
        description="Radio, microondas, infrarrojo, luz, ultravioleta, rayos X y gamma son lo mismo: campos eléctricos y magnéticos que se propagan. Sólo cambia la frecuencia, y con ella todo lo demás." />
      <nav className={styles.labIndex} aria-label="Simuladores">
        <span>Simuladores:</span>
        {LABS.map(([id, name]) => <a key={id} href={`#${id}`}>{name}</a>)}
      </nav>
      <div className={styles.section}>
        <h2 id="spectrum-all-title">De 1 Hz a 10²⁶ Hz, en una sola regla</h2>
        <p className={styles.lead}>
          Veintiséis órdenes de magnitud: de ondas más largas que la Tierra a fotones con la energía de un
          acelerador de partículas. La escala es logarítmica: cada marca multiplica por diez. Abajo ves qué
          parte llega al suelo atravesando la atmósfera.
        </p>
        <SpectrumExplorer />
      </div>
      <LabGate id="cubeta" title="Interferencia: dos ondas en el agua" preview="ripple"
        summary="La ecuación de onda resuelta en la GPU: dos fuentes, doble rendija, difracción y gotas."
        lead="Toda onda se suma a otra punto por punto. Donde llegan dos crestas juntas el agua sube el doble; donde una cresta se encuentra con un valle, se queda quieta. Esta cubeta resuelve la ecuación de onda en la GPU, en tiempo real, y es la misma física que el experimento de la doble rendija de Young (1801), que demostró que la luz es una onda. Tocá el agua para tirar una gota."
        footnote="Modelo: ecuación de onda lineal en 2D (diferencias finitas, 1 celda = 1 mm) con bordes absorbentes. En el agua real la velocidad depende de la longitud de onda; el patrón de interferencia es el mismo.">
        <RippleTank />
      </LabGate>
      <LabGate id="chladni" title="Ondas que se ven: la placa de Chladni" preview="chladni"
        summary="Una placa de aluminio con arena encima: cambiá la frecuencia y mirá cómo la arena dibuja los nodos."
        lead="Ernst Chladni (1787) espolvoreó arena sobre una placa de metal y la hizo vibrar con un arco de violín. La arena salta lejos de donde la placa se mueve y se acumula donde queda quieta: las líneas nodales. Cada resonancia dibuja una figura distinta. Es una onda estacionaria en 2D, la misma idea que fija los modos de una antena, de una cavidad de microondas o de los orbitales de un átomo."
        footnote="Modelo: placa cuadrada de aluminio de 240 mm y 1 mm de espesor, bordes libres, excitada en un punto. Modos y frecuencias por el método de energía de Ritz (1909), a menos de un 6 % de los valores exactos; amortiguamiento Q = 60. Cada grano da saltos al azar proporcionales a cuánto vibra la placa debajo suyo.">
        <ChladniPlate />
      </LabGate>
      <LabGate id="fibra" title="Fibra óptica: luz atrapada en vidrio" preview="fiber"
        summary="Reflexión total interna: cambiá los índices y el ángulo, y mirá cuándo la luz se escapa."
        lead="Cuando la luz va de un medio más denso a uno menos denso y pega con un ángulo mayor al crítico, no sale: se refleja entera. Una fibra es un núcleo de índice n₁ rodeado de un revestimiento de índice n₂ un poco menor. Inclinate más que el cono de aceptación y la luz empieza a escaparse en cada rebote.">
        <FiberLab />
      </LabGate>
      <LabGate id="cuerpo-negro" title="Todo lo que tiene temperatura brilla" preview="blackbody"
        summary="La ley de Planck en vivo: de una persona a 310 K hasta el Sol y las estrellas azules."
        lead="Un cuerpo negro ideal emite según la ley de Planck. Subí la temperatura: el pico se corre hacia frecuencias más altas y la potencia total se dispara. Los ejes son logarítmicos en los dos sentidos.">
        <BlackbodyLab />
      </LabGate>
      <section className={styles.section} aria-labelledby="spectrum-laws-title">
        <h2 id="spectrum-laws-title">Cuatro relaciones que explican todo lo de arriba</h2>
        <SpectrumFacts />
      </section>
      <p className={styles.related}>
        Para usar estas ondas: el <Link href={`/${locale}/radio`} prefetch={false}>curso de radioaficionado</Link>.
        Para medirlas: <Link href={`/${locale}/medicion`} prefetch={false}>medición e instrumentos</Link>.
      </p>
    </main>
  );
}
