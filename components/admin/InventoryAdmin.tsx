'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  INVENTORY_DOMAINS,
  type InventoryDomainId,
  type InventoryEntity,
  type InventoryEntityKind,
} from '@/config/inventory';
import {
  deleteCustomInventoryEntity,
  upsertCustomInventoryEntity,
  useAllInventoryEntities,
  useCustomInventory,
} from '@/lib/inventory/store';
import styles from './adminPanel.module.css';

const KINDS: { id: InventoryEntityKind; label: string }[] = [
  { id: 'section', label: 'Sección' },
  { id: 'project', label: 'Proyecto' },
  { id: 'tutorial', label: 'Tutorial / Guía' },
  { id: 'interest', label: 'Interés / Idea' },
  { id: 'tool', label: 'Herramienta' },
];

export function InventoryAdmin() {
  const locale = useLocale();
  const [filterDomain, setFilterDomain] = useState<InventoryDomainId | 'all'>('all');
  const [domain, setDomain] = useState<InventoryDomainId>('radio');
  const [kind, setKind] = useState<InventoryEntityKind>('tutorial');
  const [badge, setBadge] = useState('TALLER · RF');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [href, setHref] = useState('/radio/tutoriales');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [copied, setCopied] = useState(false);

  const entities = useAllInventoryEntities(filterDomain === 'all' ? undefined : filterDomain, true);
  const custom = useCustomInventory();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    upsertCustomInventoryEntity({
      id: `custom:${domain}:${slug || Date.now()}`,
      domain,
      kind,
      badge: badge.trim() || kind.toUpperCase(),
      title: title.trim(),
      summary: summary.trim(),
      href: href.trim() || '/radio',
      status,
    });
    setTitle('');
    setSummary('');
  };

  const exportJson = () => {
    void navigator.clipboard?.writeText(JSON.stringify(custom, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={styles.invBox} data-testid="admin-inventory-manager">
      <h2 className={styles.sectionTitle}>Inventario de Entidades (Secciones, Tutoriales, Proyectos e Intereses)</h2>
      <div className={styles.rangeRow} role="group" aria-label="Filtrar dominio">
        <button type="button" onClick={() => setFilterDomain('all')}
          className={styles.rangeButton + (filterDomain === 'all' ? ' ' + styles.rangeButtonActive : '')}>
          Todos ({entities.length})
        </button>
        {INVENTORY_DOMAINS.map((d) => (
          <button key={d.id} type="button" onClick={() => setFilterDomain(d.id)}
            className={styles.rangeButton + (filterDomain === d.id ? ' ' + styles.rangeButtonActive : '')}>
            {d.label}
          </button>
        ))}
      </div>

      <form className={styles.invForm} onSubmit={handleSave}>
        <label className={styles.invField}>Dominio
          <select value={domain} onChange={(e) => setDomain(e.target.value as InventoryDomainId)}>
            {INVENTORY_DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </label>
        <label className={styles.invField}>Tipo de entidad
          <select value={kind} onChange={(e) => setKind(e.target.value as InventoryEntityKind)}>
            {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </label>
        <label className={styles.invField}>Badge / Código
          <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="TALLER · UV-5R" />
        </label>
        <label className={styles.invField}>Estado
          <select value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
        </label>
        <label className={styles.invField}>Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Antena dipolo portátil 2m" required />
        </label>
        <label className={styles.invField}>Ruta interna (/radio/...)
          <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/radio/tutoriales" />
        </label>
        <label className={`${styles.invField} ${styles.invFull}`}>Resumen / Nota técnica
          <textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Descripción breve de la sección, tutorial o proyecto..." />
        </label>
        <div className={styles.invActions}>
          <button type="submit" className={`${styles.rangeButton} ${styles.rangeButtonActive}`}>+ Guardar entidad</button>
          {custom.length > 0 ? (
            <button type="button" className={styles.rangeButton} onClick={exportJson}>
              {copied ? '✓ JSON copiado' : `Exportar ${custom.length} custom (JSON)`}
            </button>
          ) : null}
        </div>
      </form>

      <div className={styles.invGrid}>
        {entities.map((item: InventoryEntity) => (
          <article key={item.id} className={styles.invCard}>
            <div className={styles.invMeta}>
              <span>{item.badge}</span>
              <span>{item.builtIn ? 'CORE' : item.status.toUpperCase()}</span>
            </div>
            <h3 className={styles.invTitle}>{item.title}</h3>
            <p className={styles.invSummary}>{item.summary}</p>
            <div className={styles.invActions}>
              <Link href={`/${locale}${item.href}`} className={styles.link}>Abrir →</Link>
              {!item.builtIn ? (
                <button type="button" className={styles.rangeButton} onClick={() => deleteCustomInventoryEntity(item.id)}>
                  Eliminar
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
