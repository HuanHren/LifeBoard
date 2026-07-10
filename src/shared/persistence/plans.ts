import {
  getContentClearEntries,
  getFactoryResetEntries,
  getPortableEntries,
} from './registry'
import type { PersistenceEntryId } from './types'

export type PersistencePlanKind =
  | 'portable-export'
  | 'portable-import'
  | 'content-clear'
  | 'factory-reset'

export interface PersistencePlanEntry {
  readonly id: PersistenceEntryId
  readonly storageKey: string
  readonly order: number
}

export interface PersistenceRegistryPlan {
  readonly kind: PersistencePlanKind
  readonly entries: readonly PersistencePlanEntry[]
}

const createPlan = (
  kind: PersistencePlanKind,
  entries: ReturnType<typeof getPortableEntries>,
  orderField: 'writeOrder' | 'clearOrder',
): PersistenceRegistryPlan => {
  const planEntries = entries
    .map((entry) =>
      Object.freeze({
        id: entry.id,
        storageKey: entry.storageKey,
        order: entry[orderField],
      }),
    )
    .sort((left, right) => left.order - right.order)

  return Object.freeze({ kind, entries: Object.freeze(planEntries) })
}

export const createPortableRegistryPlan = () =>
  createPlan('portable-export', getPortableEntries(), 'writeOrder')

export const createPortableImportPlan = () =>
  createPlan('portable-import', getPortableEntries(), 'writeOrder')

export const createContentClearPlan = () =>
  createPlan('content-clear', getContentClearEntries(), 'clearOrder')

export const createFactoryResetPlan = () =>
  createPlan('factory-reset', getFactoryResetEntries(), 'clearOrder')
