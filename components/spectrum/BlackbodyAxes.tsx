import { length, pow10 } from '@/lib/spectrum/format';
import { planck, wienPeak } from '@/lib/spectrum/physics';
import { PLOT_X, PLOT_Y, REFERENCES } from '@/lib/spectrum/planckScene';
import styles from './spectrum.module.css';

const xs = Array.from({ length: Math.floor(PLOT_X[1]) - Math.ceil(PLOT_X[0]) + 1 }, (_, i) => Math.ceil(PLOT_X[0]) + i);
const ys = Array.from({ length: 7 }, (_, i) => -12 + i * 4).filter((y) => y > PLOT_Y[0] && y < PLOT_Y[1]);

/** Tick labels for the Planck plot (HTML over the canvas so text stays crisp). */
export function BlackbodyAxes() {
  return (
    <div className={styles.plotAxes} aria-hidden="true">
      {xs.map((x, i) => (
        <span key={x} className={styles.xTick} data-hide-narrow={i % 2 === 1}
          style={{ left: `${((x - PLOT_X[0]) / (PLOT_X[1] - PLOT_X[0])) * 100}%` }}>{length(10 ** x)}</span>
      ))}
      {ys.map((y) => (
        <span key={y} className={styles.yTick} style={{ bottom: `${((y - PLOT_Y[0]) / (PLOT_Y[1] - PLOT_Y[0])) * 100}%` }}>
          {pow10(y)}
        </span>
      ))}
      {REFERENCES.map((r) => {
        const peak = wienPeak(r.kelvin);
        const x = (Math.log10(peak) - PLOT_X[0]) / (PLOT_X[1] - PLOT_X[0]);
        const y = (Math.log10(planck(peak, r.kelvin) * 1e-9) - PLOT_Y[0]) / (PLOT_Y[1] - PLOT_Y[0]);
        return <span key={r.label} className={styles.refLabel} style={{ left: `${x * 100}%`, bottom: `${y * 100}%` }}>{r.label}</span>;
      })}
      <span className={styles.yTitle}>W·sr⁻¹·m⁻²·nm⁻¹</span>
      <span className={styles.xTitle}>longitud de onda →</span>
    </div>
  );
}
