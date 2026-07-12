import type { PersistenceStorageAdapter } from './contracts'
import { createPortableImportPlan } from './plans'
import {
  importFailure,
  importSuccess,
  type PortableImportResult,
} from './portableImportValidation'
import type { PreparedPortableImport } from './portableImport'
import type { PersistenceEntryId, PortableBackupV1 } from './types'

export interface PortableStorageSnapshotEntry {
  readonly storageKey: string
  readonly existed: boolean
  readonly rawValue: string | null
}

export interface PortableWritePlanEntry {
  readonly id: PersistenceEntryId
  readonly storageKey: string
  readonly operation: 'set' | 'remove'
  readonly serializedValue: string | null
  readonly owner: 'settings' | 'weather' | 'todos' | 'bookmarks'
  readonly writeOrder: number
  readonly verifyStrategy: 'exact-raw' | 'absent'
}

export interface ImportHydrationHooks {
  readonly hydrate: (backup: PortableBackupV1) => boolean | void
  readonly verify: (backup: PortableBackupV1) => boolean
  readonly restore: () => boolean | void
  readonly verifyRestore: () => boolean
}

export interface ExecuteReplaceImportOptions {
  readonly storage: PersistenceStorageAdapter
  readonly prepared: PreparedPortableImport
  readonly hydration: ImportHydrationHooks
}

export interface ReplaceImportSuccess {
  readonly writeCount: number
  readonly sourceFormat: PreparedPortableImport['sourceFormat']
}

const ownerById: Readonly<Record<PersistenceEntryId, PortableWritePlanEntry['owner']>> = Object.freeze({
  'theme-mode': 'settings',
  language: 'settings',
  'weather-location': 'weather',
  'weather-forecast-cache': 'weather',
  'weather-favorite-cities': 'weather',
  'weather-provider': 'weather',
  'weather-caiyun-token': 'weather',
  'weather-amap-key': 'weather',
  'weather-auto-location-on-home': 'weather',
  todos: 'todos',
  bookmarks: 'bookmarks',
})

const serializeWriteValues = (backup: PortableBackupV1): Readonly<Record<string, string | null>> => {
  const values: Record<string, string | null> = {
    todos: JSON.stringify({
      version: 1,
      tasks: backup.data.todos.payload.tasks,
      countdowns: backup.data.todos.payload.countdowns,
    }),
    bookmarks: JSON.stringify({
      version: 1,
      bookmarks: backup.data.bookmarks.payload.bookmarks,
    }),
    'weather-favorite-cities': JSON.stringify({
      version: 1,
      favoriteCities: backup.data.weather.payload.favoriteCities,
    }),
    'weather-location': backup.data.weather.payload.selectedLocation === null
      ? null
      : JSON.stringify(backup.data.weather.payload.selectedLocation),
    'theme-mode': backup.data.settings.payload.themeMode,
    language: backup.data.settings.payload.language,
  }
  return Object.freeze(values)
}

export const createPortableWritePlan = (
  backup: PortableBackupV1,
): PortableImportResult<readonly PortableWritePlanEntry[]> => {
  let values: Readonly<Record<string, string | null>>
  try {
    values = serializeWriteValues(backup)
  } catch {
    return importFailure('SEMANTIC_VALIDATION_FAILED', 'transaction', null, 'Portable write plan could not be serialized.')
  }

  const registryPlan = createPortableImportPlan()
  if (registryPlan.entries.length !== 6) {
    return importFailure('SEMANTIC_VALIDATION_FAILED', 'transaction', null, 'Portable registry write set is incomplete.')
  }

  try {
    const plan = registryPlan.entries.map((entry) => {
      const serializedValue = values[entry.id]
      if (serializedValue === undefined) {
        throw new Error('Portable write value is missing.')
      }
      return Object.freeze({
        id: entry.id,
        storageKey: entry.storageKey,
        operation: serializedValue === null ? 'remove' as const : 'set' as const,
        serializedValue,
        owner: ownerById[entry.id],
        writeOrder: entry.order,
        verifyStrategy: serializedValue === null ? 'absent' as const : 'exact-raw' as const,
      })
    })
    return importSuccess(Object.freeze(plan))
  } catch {
    return importFailure('SEMANTIC_VALIDATION_FAILED', 'transaction', null, 'Portable registry write values are incomplete.')
  }
}

const captureSnapshot = (
  storage: PersistenceStorageAdapter,
  plan: readonly PortableWritePlanEntry[],
): PortableImportResult<readonly PortableStorageSnapshotEntry[]> => {
  const snapshot: PortableStorageSnapshotEntry[] = []
  for (const entry of plan) {
    const result = storage.read(entry.storageKey)
    if (!result.ok) {
      return importFailure('SNAPSHOT_FAILED', 'transaction', null, 'Current portable data could not be snapshotted.', { recoverable: true, severity: 'error' })
    }
    snapshot.push(Object.freeze({
      storageKey: entry.storageKey,
      existed: result.value !== null,
      rawValue: result.value,
    }))
  }
  return importSuccess(Object.freeze(snapshot))
}

const isQuotaFailure = (error: unknown) => {
  if (error instanceof DOMException) {
    return error.name === 'QuotaExceededError' || error.code === 22
  }
  return typeof error === 'object' && error !== null &&
    ('name' in error && (error as { name?: unknown }).name === 'QuotaExceededError')
}

const rollbackStorage = (
  storage: PersistenceStorageAdapter,
  snapshot: readonly PortableStorageSnapshotEntry[],
): PortableImportResult<undefined> => {
  for (const entry of [...snapshot].reverse()) {
    const restored = entry.existed && entry.rawValue !== null
      ? storage.write(entry.storageKey, entry.rawValue)
      : storage.remove(entry.storageKey)
    if (!restored.ok) {
      return importFailure('ROLLBACK_FAILED', 'transaction', null, 'Portable storage rollback failed.')
    }
    const verified = storage.readBack(entry.storageKey, entry.existed ? entry.rawValue : null)
    if (!verified.ok) {
      return importFailure('ROLLBACK_VERIFY_FAILED', 'transaction', null, 'Portable storage rollback could not be verified.')
    }
  }
  return importSuccess(undefined)
}

const failAfterRollback = (
  storage: PersistenceStorageAdapter,
  snapshot: readonly PortableStorageSnapshotEntry[],
  original: { readonly code: 'WRITE_FAILED' | 'QUOTA_EXCEEDED' | 'VERIFY_FAILED'; readonly message: string },
) => {
  const rollback = rollbackStorage(storage, snapshot)
  if (!rollback.ok) return rollback
  return importFailure(original.code, 'transaction', null, original.message, {
    recoverable: true,
    severity: 'error',
    details: { restored: true },
  })
}

export const executeReplaceImport = (
  options: ExecuteReplaceImportOptions,
): PortableImportResult<ReplaceImportSuccess> => {
  const planResult = createPortableWritePlan(options.prepared.backup)
  if (!planResult.ok) return planResult
  const snapshotResult = captureSnapshot(options.storage, planResult.data)
  if (!snapshotResult.ok) return snapshotResult

  for (const entry of planResult.data) {
    const write = entry.operation === 'set' && entry.serializedValue !== null
      ? options.storage.write(entry.storageKey, entry.serializedValue)
      : options.storage.remove(entry.storageKey)
    if (!write.ok) {
      return failAfterRollback(options.storage, snapshotResult.data, {
        code: isQuotaFailure(write.error) ? 'QUOTA_EXCEEDED' : 'WRITE_FAILED',
        message: 'Portable import write failed; previous data was restored.',
      })
    }
    const verified = options.storage.readBack(entry.storageKey, entry.serializedValue)
    if (!verified.ok) {
      return failAfterRollback(options.storage, snapshotResult.data, {
        code: 'VERIFY_FAILED',
        message: 'Portable import read-back failed; previous data was restored.',
      })
    }
  }

  try {
    if (options.hydration.hydrate(options.prepared.backup) === false ||
        !options.hydration.verify(options.prepared.backup)) {
      throw new Error('Hydration verification failed.')
    }
  } catch {
    const rollback = rollbackStorage(options.storage, snapshotResult.data)
    if (!rollback.ok) return rollback
    try {
      if (options.hydration.restore() === false || !options.hydration.verifyRestore()) {
        return importFailure('ROLLBACK_VERIFY_FAILED', 'transaction', null, 'Old in-memory state could not be restored after hydration failure.')
      }
    } catch {
      return importFailure('ROLLBACK_FAILED', 'transaction', null, 'Old in-memory state restoration failed after hydration failure.')
    }
    return importFailure('HYDRATION_FAILED', 'transaction', null, 'Import hydration failed; previous data and state were restored.', {
      recoverable: true,
      severity: 'error',
      details: { restored: true },
    })
  }

  return importSuccess(Object.freeze({
    writeCount: planResult.data.length,
    sourceFormat: options.prepared.sourceFormat,
  }))
}
