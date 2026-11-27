import Link from 'next/link';
import { PageIntro } from '@/components/ui/PageIntro';
import { RadioCourseNavigation } from '@/components/radio-basics/RadioCourseNavigation';
import courseStyles from '@/components/radio-basics/radioCourse.module.css';
import { MORSE_SKILL_LABEL, MORSE_TRAINERS } from '@/lib/radio/morseTrainers';
import { SpanishOnlyNotice } from '../SpanishOnlyNotice';
import { MorseLegacyAnchors } from './MorseLegacyAnchors';
import { MorseWhy } from './MorseWhy';
import radio from '../radio.module.css';
import s from './morse.module.css';

/** Morse section entry: pick a trainer, then read why CW still matters. */
export function MorseHub({ locale }: { locale: string }) {
  const base = `/${locale}/radio/morse`;
  return (
    <main className={courseStyles.page} lang="es">
      <MorseLegacyAnchors base={base} />
      <div className={courseStyles.shell} data-wide="true">
        <RadioCourseNavigation page="morse-console" />
        <div className={`${courseStyles.reading} ${radio.content}`}>
          <PageIntro
            eyebrow="Practicar · Código Morse (CW)"
            title="Código Morse"
            description="Seis entrenadores, uno por habilidad. Empezá por el árbol, pasá a reconocer de oído y terminá transmitiendo con llave."
            area="knowledge"
            compact
          />
          {locale !== 'es' ? <SpanishOnlyNotice /> : null}
          <section className={s.hubSection} aria-labelledby="morse-trainers-title" data-testid="morse-trainer-picker">
            <h2 id="morse-trainers-title">Elegí un entrenador</h2>
            <div className={s.hubGrid}>
              {MORSE_TRAINERS.map((trainer, index) => (
                <Link key={trainer.slug} href={`${base}/${trainer.slug}`} className={s.card} data-skill={trainer.skill}>
                  <span className={s.cardHead}>
                    <span className={s.skill}>{index + 1} · {MORSE_SKILL_LABEL[trainer.skill]}</span>
                    <span className={s.level}>{trainer.level}</span>
                  </span>
                  <span className={s.glyph} aria-hidden="true">{trainer.glyph}</span>
                  <span><h3>{trainer.title}</h3><p>{trainer.summary}</p></span>
                  <span className={s.cta}>Abrir →</span>
                </Link>
              ))}
            </div>
          </section>
          <MorseWhy />
        </div>
      </div>
    </main>
  );
}
