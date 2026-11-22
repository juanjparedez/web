'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './electronicsSubNav.module.css';

export function ElectronicsSubNav() {
  const locale = useLocale();
  const pathname = usePathname() ?? '';
  const base = `/${locale}`;

  const items = [
    { href: `${base}/calculators`, label: 'Suite Calculadoras (RCL / ADC / Térmica)', badge: '15' },
    { href: `${base}/workbench/ohms-law`, label: 'Ley de Ohm', badge: 'V=I·R' },
    { href: `${base}/workbench/resistor-color-code`, label: 'Código de Resistencias', badge: 'E24' },
    { href: `${base}/radio/lecciones/laboratory`, label: 'Laboratorio de Circuitos DC', badge: 'LAB' },
    { href: `${base}/radio/instrumentos`, label: 'Instrumentos (DMM / DSO / ROE / VNA)', badge: '4 INST' },
    { href: `${base}/workbench/qpsk-modulator`, label: 'Modulador QPSK (I/Q)', badge: 'DSP' },
    { href: `${base}/workbench/serial-monitor`, label: 'Monitor Serial UART', badge: 'USB' },
  ];

  return (
    <div className={styles.bar} data-testid="electronics-subnav">
      <nav className={styles.links} aria-label="Banco de electrónica e instrumentación">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              className={`${styles.link} ${active ? styles.linkActive : ''}`}
            >
              <span className={styles.badge}>{item.badge}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
