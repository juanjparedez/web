'use client';

import { useEffect, useMemo, useState } from 'react';
import { laserColor } from '@/lib/spectrum/color';
import { sci, sig } from '@/lib/spectrum/format';
import { bouncesPerMetre, FIBERS, modalDispersionNsPerKm, traceFiber } from '@/lib/spectrum/fiber/trace';
import { createFiberRenderer } from '@/lib/spectrum/fiber/render';
import { useRenderer } from './useRenderer';
import styles from './spectrum.module.css';

const LASERS: readonly [number, string][] = [[650, 'Rojo 650 nm'], [532, 'Verde 532 nm']];

function Cell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className={styles.cell}><dt>{label}</dt><dd>{value}{hint && <small>{hint}</small>}</dd></div>;
}

/** Light trapped by total internal reflection: Snell, the critical angle and Fresnel losses. */
export function FiberLab() {
  const [fiberId, setFiberId] = useState('water');
  const [launch, setLaunch] = useState(30);
  const [laser, setLaser] = useState(650);
  const fiber = FIBERS.find((f) => f.id === fiberId)!;
  const result = useMemo(() => traceFiber(fiber.core, fiber.cladding, launch), [fiber, launch]);
  const color = useMemo(() => laserColor(laser), [laser]);
  const { canvasRef, rendererRef, mode } = useRenderer(createFiberRenderer);
  useEffect(() => {
    const draw = () => rendererRef.current?.render({ core: fiber.core, cladding: fiber.cladding, acceptanceDeg: result.acceptanceDeg, color, segments: result.segments });
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [fiber, result, color, mode, rendererRef]);

  return (
    <div className={styles.wave} data-testid="fiber-lab" data-renderer={mode} data-guided={result.guided}>
      <div role="group" aria-label="Tipo de fibra" className={styles.btnRow}>
        {FIBERS.map((f) => <button key={f.id} type="button" aria-pressed={f.id === fiberId} onClick={() => setFiberId(f.id)}>{f.name}</button>)}
      </div>
      <div className={styles.fiberStage}>
        <canvas ref={canvasRef} className={styles.rippleCanvas} role="img"
          aria-label={`Rayo de luz en una fibra, lanzado a ${launch}°: ${result.guided ? 'guiado por reflexión total' : 'se escapa por el revestimiento'}`} />
        <span className={styles.fiberTag} data-pos="core">núcleo n₁ = {sig(fiber.core, 5)}</span>
        <span className={styles.fiberTag} data-pos="clad">{fiber.cladding === 1 ? 'aire' : 'revestimiento'} n₂ = {sig(fiber.cladding, 5)}</span>
        <span className={styles.fiberStatus} data-guided={result.guided}>
          {result.guided ? 'Reflexión total: la luz queda atrapada' : 'Ángulo fuera del cono: la luz se fuga en cada rebote'}
        </span>
      </div>
      <div className={styles.rippleControls}>
        <label className={styles.slider}>
          <span>Ángulo de entrada: <strong data-testid="fiber-launch">{launch}°</strong> (aceptación: {sig(result.acceptanceDeg)}°)</span>
          <input type="range" min={0} max={85} step={1} value={launch} onChange={(e) => setLaunch(Number(e.target.value))} />
        </label>
        <div role="group" aria-label="Color del láser" className={styles.btnRow}>
          {LASERS.map(([nm, name]) => <button key={nm} type="button" aria-pressed={laser === nm} onClick={() => setLaser(nm)}>{name}</button>)}
        </div>
      </div>
      <dl className={styles.cells} data-wide="true">
        <Cell label="Ángulo dentro del núcleo" value={`${sig(result.insideDeg)}°`} hint="Snell: sen θ₀ = n₁ sen θ₁" />
        <Cell label="Incidencia vs crítico" value={`${sig(result.incidenceDeg)}° / ${sig(result.criticalDeg)}°`} hint="θc = arcsen(n₂/n₁)" />
        <Cell label="Apertura numérica" value={sig(result.na)} hint="NA = √(n₁² − n₂²)" />
        <Cell label="Llega al otro extremo" value={`${sig(result.delivered * 100)} %`} hint={`${result.bounces} rebotes en este tramo`} />
        <Cell label="Rebotes por metro" value={launch === 0 ? '0' : sci(bouncesPerMetre(result.insideDeg, fiber.coreUm))} hint={`núcleo real de ${sig(fiber.coreUm)} µm`} />
        <Cell label="Dispersión modal" value={`${sig(modalDispersionNsPerKm(fiber.core, fiber.cladding))} ns/km`} hint="rayo axial vs. el más inclinado" />
      </dl>
      <p className={styles.waveFacts}>{fiber.note} Dibujo fuera de escala.</p>
      {mode === 'canvas' && <p className={styles.hint}>Tu navegador no ofrece WebGL: se muestra una versión simplificada.</p>}
    </div>
  );
}
