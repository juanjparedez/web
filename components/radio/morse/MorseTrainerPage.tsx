import Link from 'next/link';
import { RadioCourseNavigation } from '@/components/radio-basics/RadioCourseNavigation';
import courseStyles from '@/components/radio-basics/radioCourse.module.css';
import { MORSE_SKILL_LABEL, MORSE_TRAINERS, MORSE_LEGACY_ANCHORS, type MorseTrainerInfo } from '@/lib/radio/morseTrainers';
import { SpanishOnlyNotice } from '../SpanishOnlyNotice';
import { MorseSoundControls } from '../widgets/MorseSoundControls';
import { MorseTrainerBody } from './MorseTrainerBody';
import s from './morse.module.css';

const anchorOf = (slug: string) => Object.entries(MORSE_LEGACY_ANCHORS).find(([, value]) => value === slug)?.[0] ?? slug;

/** One trainer per page, with a switcher to jump between them. */
export function MorseTrainerPage({ trainer, locale }: { trainer: MorseTrainerInfo; locale: string }) {
  const base = `/${locale}/radio/morse`;
  const index = MORSE_TRAINERS.findIndex((item) => item.slug === trainer.slug);
  const prev = MORSE_TRAINERS[index - 1];
  const next = MORSE_TRAINERS[index + 1];
  return (
    <main className={courseStyles.page} lang="es">
      <div className={courseStyles.shell} data-wide="true">
        <RadioCourseNavigation page="morse-console" />
        <div className={`${courseStyles.reading} ${s.layout}`}>
          <header className={s.head}>
            <Link href={base} className={s.back}>← Código Morse · todos los entrenadores</Link>
            <h1>{trainer.title}</h1>
            <p>{trainer.goal}</p>
            <div className={s.tags}>
              <span className={s.level}>{MORSE_SKILL_LABEL[trainer.skill]}</span>
              <span className={s.level}>{trainer.level}</span>
            </div>
          </header>
          {locale !== 'es' ? <SpanishOnlyNotice /> : null}
          <nav className={s.switcher} aria-label="Entrenadores Morse" data-testid="morse-trainer-switcher">
            {MORSE_TRAINERS.map((item, i) => (
              <Link key={item.slug} href={`${base}/${item.slug}`} aria-current={item.slug === trainer.slug ? 'page' : undefined}>
                {i + 1} · {item.title}
              </Link>
            ))}
          </nav>
          <section id={anchorOf(trainer.slug)} className={s.body} aria-label={trainer.title}>
            <MorseTrainerBody slug={trainer.slug} />
            <MorseSoundControls globalBar />
          </section>
          <nav className={s.pager} aria-label="Entrenador anterior y siguiente">
            {prev ? <Link href={`${base}/${prev.slug}`}><span>← Anterior</span><strong>{prev.title}</strong></Link> : <Link href={base}><span>← Volver</span><strong>Todos los entrenadores</strong></Link>}
            {next ? <Link href={`${base}/${next.slug}`}><span>Siguiente →</span><strong>{next.title}</strong></Link> : null}
          </nav>
        </div>
      </div>
    </main>
  );
}
