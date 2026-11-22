import styles from './spectrum.module.css';

const LAWS: readonly { formula: string; name: string; text: string }[] = [
  { formula: 'c = λ · f', name: 'Una sola velocidad', text: 'En el vacío toda la radiación viaja a c = 299 792 458 m/s. Si la frecuencia sube, la longitud de onda baja en la misma proporción.' },
  { formula: 'E = h · f', name: 'La luz viene en paquetes', text: 'Cada fotón lleva una energía proporcional a su frecuencia (h = 6,626 × 10⁻³⁴ J·s). Por eso un solo fotón UV puede romper un enlace y un millón de fotones de radio, no.' },
  { formula: 'λmáx = b / T', name: 'Ley de Wien', text: 'Un cuerpo a temperatura T emite con pico en b / T, con b = 2,898 mm·K. El Sol, en el visible; vos, en el infrarrojo; el universo, en microondas.' },
  { formula: 'M = σ · T⁴', name: 'Stefan–Boltzmann', text: 'La potencia total radiada crece con la cuarta potencia de la temperatura: el doble de caliente, dieciséis veces más brillante.' },
];

const NOTES: readonly string[] = [
  'Los límites entre bandas son convenciones (ISO 21348, UIT, CIE): el espectro es continuo. Rayos X y gamma se solapan; el nombre depende del origen (electrones o núcleo), no de la energía.',
  'Fuera del visible los colores son falsos y sólo distinguen bandas. Dentro del visible se calculan con las funciones CIE 1931; los colores espectrales puros no entran en ninguna pantalla, así que se muestran con la mínima desaturación posible.',
  'La curva de la atmósfera es una aproximación para cielo despejado, mirando al cenit, a nivel del mar. Sirve para ver las ventanas, no para calcular un enlace.',
  'Todos los números se calculan en tu navegador con las constantes exactas del SI (redefinición 2019).',
];

export function SpectrumFacts() {
  return (
    <>
      <div className={styles.laws}>
        {LAWS.map((l) => (
          <article key={l.formula} className={styles.law}>
            <code>{l.formula}</code>
            <h3>{l.name}</h3>
            <p>{l.text}</p>
          </article>
        ))}
      </div>
      <ul className={styles.notes}>
        {NOTES.map((n) => <li key={n.slice(0, 24)}>{n}</li>)}
      </ul>
    </>
  );
}
