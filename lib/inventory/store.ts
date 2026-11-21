'use client';

import { useSyncExternalStore } from 'react';
import {
  CORE_INVENTORY_ENTITIES,
  type InventoryDomainId,
  type InventoryEntity,
  type InventoryEntityKind,
} from '@/config/inventory';

const STORAGE_KEY = 'hios.inventory.custom.v1';
const listeners = new Set<() => void>();
let cachedCustom: readonly InventoryEntity[] | null = null;
const emptyList: readonly InventoryEntity[] = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function getCustomInventoryEntities(): readonly InventoryEntity[] {
  if (typeof window === 'undefined') return emptyList;
  if (cachedCustom) return cachedCustom;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedCustom = emptyList;
      return cachedCustom;
    }
    const parsed = JSON.parse(raw);
    cachedCustom = Array.isArray(parsed) ? parsed : emptyList;
  } catch {
    cachedCustom = emptyList;
  }
  return cachedCustom;
}

function persistCustom(next: readonly InventoryEntity[]) {
  cachedCustom = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Storage optional */
  }
  notify();
}

export function upsertCustomInventoryEntity(
  input: Omit<InventoryEntity, 'builtIn'>,
): InventoryEntity {
  const current = [...getCustomInventoryEntities()];
  const entity: InventoryEntity = { ...input, builtIn: false };
  const idx = current.findIndex((item) => item.id === entity.id);
  if (idx >= 0) current[idx] = entity;
  else current.unshift(entity);
  persistCustom(current);
  return entity;
}

export function deleteCustomInventoryEntity(id: string) {
  const next = getCustomInventoryEntities().filter((item) => item.id !== id);
  persistCustom(next);
}

export function importCustomInventoryEntities(jsonText: string): number {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error('Invalid format');
  const valid: InventoryEntity[] = parsed
    .filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string')
    .map((item) => ({
      id: String(item.id),
      domain: (['hardware', 'radio', 'workbench', 'archive'].includes(item.domain)
        ? item.domain
        : 'archive') as InventoryDomainId,
      kind: (['section', 'project', 'tutorial', 'interest', 'tool'].includes(item.kind)
        ? item.kind
        : 'interest') as InventoryEntityKind,
      badge: String(item.badge ?? 'ITEM'),
      title: String(item.title),
      summary: String(item.summary ?? ''),
      href: String(item.href ?? '/radio'),
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      status: item.status === 'draft' ? 'draft' : 'published',
      builtIn: false,
    }));
  persistCustom(valid);
  return valid.length;
}

export function subscribeInventory(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useCustomInventory() {
  return useSyncExternalStore(subscribeInventory, getCustomInventoryEntities, () => emptyList);
}

export function useAllInventoryEntities(domain?: InventoryDomainId, includeDrafts = false) {
  const custom = useCustomInventory();
  const all = [...CORE_INVENTORY_ENTITIES, ...custom];
  return all.filter(
    (item) =>
      (!domain || item.domain === domain) &&
      (includeDrafts || item.status === 'published'),
  );
}
