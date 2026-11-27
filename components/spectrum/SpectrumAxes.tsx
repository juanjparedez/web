import { axisTicks, type AxisKind } from '@/lib/spectrum/ticks';
import type { Range } from './useSpectrumView';
import styles from './spectrum.module.css';

const AXES: readonly { kind: AxisKind; name: string }[] = [
  { kind: 'frequency', name: 'Frecuencia' },
  { kind: 'wavelength', name: 'Longitud de onda' },
  { kind: 'energy', name: 'Energía del fotón' },
];

/** Three synchronized scales under the strip: f, λ = c/f and E = hf. */
export function SpectrumAxes({ range, width }: { range: Range; width: number }) {
  const gap = width < 520 ? 40 : 64;
  return (
    <div className={styles.axes} aria-hidden="true">
      {AXES.map(({ kind, name }) => (
        <div key={kind} className={styles.axis} data-axis={kind}>
          <span className={styles.axisName}>{name}</span>
          <div className={styles.axisTrack}>
            {axisTicks(kind, range, width, gap).map((t) => {
              const x = ((t.logF - range[0]) / (range[1] - range[0])) * 100;
              return (
                <span key={`${kind}-${t.logF.toFixed(4)}`} className={styles.tick} data-edge={t.edge}
                  style={{ left: `${x}%` }}>{t.label}</span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
