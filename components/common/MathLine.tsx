import type { ReactNode } from 'react';
import styles from './mathLine.module.css';

/** Independent formulas written as "A   |   B" (three spaces around the bar) are shown one per line. */
const SEPARATOR = /\s{3}\|\s{3}/;

/** Keep a complete expression together; long equations scroll within their block. */
export function MathLine({ children, className = '' }: { children: ReactNode; className?: string }) {
  if (typeof children === 'string' && SEPARATOR.test(children)) {
    return (
      <>
        {children.split(SEPARATOR).map((part) => (
          <code key={part} className={`${styles.line} ${className}`} data-math-line tabIndex={0}>{part.trim()}</code>
        ))}
      </>
    );
  }
  return <code className={`${styles.line} ${className}`} data-math-line tabIndex={0}>{children}</code>;
}
