import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getTranslatedMetadata } from '@/lib/seo-metadata';
import { PageIntro } from '@/components/ui/PageIntro';
import { BlackbodyLab } from '@/components/spectrum/BlackbodyLab';
import { SpectrumExplorer } from '@/components/spectrum/SpectrumExplorer';
import { SpectrumFacts } from '@/components/spectrum/SpectrumFacts';
import { RippleTank } from '@/components/spectrum/RippleTank';
import { FiberLab } from '@/components/spectrum/FiberLab';
import styles from '@/components/spectrum/spectrum.module.css';

export const dynamic = 'force-static';

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
      <div className={styles.section}>
        <h2 id="spectrum-all-title">De 1 Hz a 10²⁶ Hz, en una sola regla</h2>
        <p className={styles.lead}>
          Veintiséis órdenes de magnitud: de ondas más largas que la Tierra a fotones con la energía de un
          acelerador de partículas. La escala es logarítmica: cada marca multiplica por diez. Abajo ves qué
          parte llega al suelo atravesando la atmósfera.
        </p>
        <SpectrumExplorer />
      </div>
      <section className={styles.section} aria-labelledby="spectrum-ripple-title">
        <h2 id="spectrum-ripple-title">Interferencia: dos ondas en el agua</h2>
        <p className={styles.lead}>
          Toda onda se suma a otra punto por punto. Donde llegan dos crestas juntas el agua sube el doble;
          donde una cresta se encuentra con un valle, se queda quieta. Esta cubeta resuelve la ecuación de onda
          en la GPU, en tiempo real, y es la misma física que el experimento de la doble rendija de Young (1801),
          que demostró que la luz es una onda. Tocá el agua para tirar una gota.
        </p>
        <RippleTank />
        <p className={styles.footnote}>
          Modelo: ecuación de onda lineal en 2D (diferencias finitas, 1 celda = 1 mm) con bordes absorbentes.
          En el agua real la velocidad depende de la longitud de onda; el patrón de interferencia es el mismo.
        </p>
      </section>
      <section className={styles.section} aria-labelledby="spectrum-fiber-title">
        <h2 id="spectrum-fiber-title">Fibra óptica: luz atrapada en vidrio</h2>
        <p className={styles.lead}>
          Cuando la luz va de un medio más denso a uno menos denso y pega con un ángulo mayor al crítico,
          no sale: se refleja entera. Una fibra es un núcleo de índice n₁ rodeado de un revestimiento de índice
          n₂ un poco menor. Inclinate más que el cono de aceptación y la luz empieza a escaparse en cada rebote.
        </p>
        <FiberLab />
      </section>
      <section className={styles.section} aria-labelledby="spectrum-bb-title">
        <h2 id="spectrum-bb-title">Todo lo que tiene temperatura brilla</h2>
        <p className={styles.lead}>
          Un cuerpo negro ideal emite según la ley de Planck. Subí la temperatura: el pico se corre hacia
          frecuencias más altas y la potencia total se dispara. Los ejes son logarítmicos en los dos sentidos.
        </p>
        <BlackbodyLab />
      </section>
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
