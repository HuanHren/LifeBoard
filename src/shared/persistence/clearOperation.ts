import type {
  PersistenceEntryId,
  PersistenceOwner,
} from './types'
import type {
  PersistenceStorageAdapter,
  ValidationSeverity,
} from './contracts'
import {
  createContentClearPlan,
  createFactoryResetPlan,
} from './plans'
import { getPersistenceEntryById } from './registry'

export type ClearOperationKind = 'user-content' | 'factory-reset'

export type ClearOperationErrorCode =
  | 'CLEAR_OPERATION_CANCELLED'
  | 'CLEAR_PLAN_INVALID'
  | 'CLEAR_SNAPSHOT_FAILED'
  | 'CLEAR_REMOVE_FAILED'
  | 'CLEAR_VERIFY_FAILED'
  | 'CLEAR_HYDRATION_FAILED'
  | 'CLEAR_ROLLBACK_FAILED'
  | 'CLEAR_ROLLBACK_VERIFY_FAILED'
  | 'CLEAR_CONCURRENT_OPERATION'
  | 'FACTORY_RESET_RELOAD_FAILED'

export interface ClearOperationError {
  readonly code: ClearOperationErrorCode
  readonly severity: ValidationSeverity
  readonly module: 'transaction'
  readonly path: string | null
  readonly message: string
  readonly userMessageKey: string
  readonly recoverable: boolean
  readonly details?: Readonly<Record<string, string | number | boolean | null>>
}

export type ClearOperationResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ClearOperationError }

export interface ClearOperationPlanEntry {
  readonly id: PersistenceEntryId
  readonly storageKey: string
  readonly owner: PersistenceOwner
  readonly operation: 'remove'
  readonly order: number
  readonly verificationStrategy: 'absent'
}

export interface ClearOperationPlan {
  readonly kind: ClearOperationKind
  readonly entries: readonly ClearOperationPlanEntry[]
}

export interface ClearOperationSnapshotEntry {
  readonly storageKey: string
  readonly existed: boolean
  readonly rawValue: string | null
}

export interface ClearOperationPreviewCounts {
  readonly taskCount: number
  readonly countdownCount: number
  readonly bookmarkCount: number
  readonly favoriteCityCount: number
  readonly hasSavedLocation: boolean
}

export interface ClearOperationPreview extends ClearOperationPreviewCounts {
  readonly kind: ClearOperationKind
  readonly targetKeyCount: 4 | 11
  readonly preservesPreferences: boolean
  readonly resetsPreferences: boolean
  readonly backupCreatedAutomatically: false
}

export interface ClearOperationHydrationHooks {
  readonly hydrate: (kind: ClearOperationKind) => boolean | void
  readonly verify: (kind: ClearOperationKind) => boolean
  readonly restore: () => boolean | void
  readonly verifyRestore: () => boolean
}

export interface ExecuteClearOperationOptions {
  readonly kind: ClearOperationKind
  readonly storage: PersistenceStorageAdapter
  readonly hydration: ClearOperationHydrationHooks
}

export interface ClearOperationSuccess {
  readonly kind: ClearOperationKind
  readonly removedKeyCount: 4 | 11
}

const expectedEntryCount: Readonly<Record<ClearOperationKind, 4 | 11>> = Object.freeze({
  'user-content': 4,
  'factory-reset': 11,
})

export const createClearOperationError = (
  code: ClearOperationErrorCode,
  message: string,
  options: {
    readonly severity?: ValidationSeverity
    readonly recoverable?: boolean
    readonly path?: string | null
    readonly details?: Readonly<Record<string, string | number | boolean | null>>
  } = {},
): ClearOperationError => Object.freeze({
  code,
  severity: options.severity ?? 'fatal',
  module: 'transaction',
  path: options.path ?? null,
  message,
  userMessageKey: `persistence.clear.${code.toLowerCase()}`,
  recoverable: options.recoverable ?? false,
  ...(options.details ? { details: Object.freeze({ ...options.details }) } : {}),
})

const clearSuccess = <T>(data: T): ClearOperationResult<T> =>
  Object.freeze({ ok: true, data })

const clearFailure = (
  code: ClearOperationErrorCode,
  message: string,
  options?: Parameters<typeof createClearOperationError>[2],
): ClearOperationResult<never> => Object.freeze({
  ok: false,
  error: createClearOperationError(code, message, options),
})

export const createClearOperationPlan = (
  kind: ClearOperationKind,
): ClearOperationResult<ClearOperationPlan> => {
  const registryPlan = kind === 'user-content'
    ? createContentClearPlan()
    : createFactoryResetPlan()

  if (registryPlan.entries.length !== expectedEntryCount[kind]) {
    return clearFailure(
      'CLEAR_PLAN_INVALID',
      'Registry clear coverage does not match the operation contract.',
      { details: { kind, entryCount: registryPlan.entries.length } },
    )
  }

  const entries: ClearOperationPlanEntry[] = []
  const ids = new Set<PersistenceEntryId>()
  const keys = new Set<string>()

  for (const entry of registryPlan.entries) {
    const registryEntry = getPersistenceEntryById(entry.id)
    if (
      !registryEntry ||
      registryEntry.storageKey !== entry.storageKey ||
      ids.has(entry.id) ||
      keys.has(entry.storageKey)
    ) {
      return clearFailure(
        'CLEAR_PLAN_INVALID',
        'Registry clear plan contains an invalid or duplicate entry.',
        { path: `/entries/${entry.id}`, details: { kind, entryId: entry.id } },
      )
    }

    ids.add(entry.id)
    keys.add(entry.storageKey)
    entries.push(Object.freeze({
      id: entry.id,
      storageKey: entry.storageKey,
      owner: registryEntry.owner,
      operation: 'remove' as const,
      order: entry.order,
      verificationStrategy: 'absent' as const,
    }))
  }

  return clearSuccess(Object.freeze({ kind, entries: Object.freeze(entries) }))
}

export const createClearOperationPreview = (
  kind: ClearOperationKind,
  counts: ClearOperationPreviewCounts,
): ClearOperationResult<ClearOperationPreview> => {
  const plan = createClearOperationPlan(kind)
  if (!plan.ok) return plan

  const numericCounts = [
    counts.taskCount,
    counts.countdownCount,
    counts.bookmarkCount,
    counts.favoriteCityCount,
  ]
  if (
    numericCounts.some((value) => !Number.isSafeInteger(value) || value < 0) ||
    typeof counts.hasSavedLocation !== 'boolean'
  ) {
    return clearFailure('CLEAR_PLAN_INVALID', 'Clear preview counts are invalid.')
  }

  return clearSuccess(Object.freeze({
    kind,
    targetKeyCount: expectedEntryCount[kind],
    taskCount: counts.taskCount,
    countdownCount: counts.countdownCount,
    bookmarkCount: counts.bookmarkCount,
    favoriteCityCount: counts.favoriteCityCount,
    hasSavedLocation: counts.hasSavedLocation,
    preservesPreferences: kind === 'user-content',
    resetsPreferences: kind === 'factory-reset',
    backupCreatedAutomatically: false as const,
  }))
}

const captureSnapshot = (
  storage: PersistenceStorageAdapter,
  plan: ClearOperationPlan,
): ClearOperationResult<readonly ClearOperationSnapshotEntry[]> => {
  const snapshot: ClearOperationSnapshotEntry[] = []
  for (const entry of plan.entries) {
    const read = storage.read(entry.storageKey)
    if (!read.ok) {
      return clearFailure(
        'CLEAR_SNAPSHOT_FAILED',
        'Clear operation could not capture the current raw storage state.',
        {
          severity: 'error',
          recoverable: true,
          path: `/entries/${entry.id}`,
          details: { kind: plan.kind, entryId: entry.id },
        },
      )
    }
    snapshot.push(Object.freeze({
      storageKey: entry.storageKey,
      existed: read.value !== null,
      rawValue: read.value,
    }))
  }
  return clearSuccess(Object.freeze(snapshot))
}

const rollbackStorage = (
  storage: PersistenceStorageAdapter,
  snapshot: readonly ClearOperationSnapshotEntry[],
): ClearOperationResult<undefined> => {
  for (const entry of [...snapshot].reverse()) {
    const restored = entry.existed && entry.rawValue !== null
      ? storage.write(entry.storageKey, entry.rawValue)
      : storage.remove(entry.storageKey)
    if (!restored.ok) {
      return clearFailure(
        'CLEAR_ROLLBACK_FAILED',
        'Clear operation rollback failed.',
      )
    }

    const verified = storage.readBack(
      entry.storageKey,
      entry.existed ? entry.rawValue : null,
    )
    if (!verified.ok) {
      return clearFailure(
        'CLEAR_ROLLBACK_VERIFY_FAILED',
        'Clear operation rollback could not be verified.',
      )
    }
  }
  return clearSuccess(undefined)
}

const failAfterRollback = (
  storage: PersistenceStorageAdapter,
  snapshot: readonly ClearOperationSnapshotEntry[],
  original: {
    readonly code: 'CLEAR_REMOVE_FAILED' | 'CLEAR_VERIFY_FAILED'
    readonly message: string
    readonly kind: ClearOperationKind
    readonly entryId: PersistenceEntryId
  },
) => {
  const rollback = rollbackStorage(storage, snapshot)
  if (!rollback.ok) return rollback
  return clearFailure(original.code, original.message, {
    severity: 'error',
    recoverable: true,
    path: `/entries/${original.entryId}`,
    details: {
      kind: original.kind,
      entryId: original.entryId,
      restored: true,
    },
  })
}

export const executeClearOperation = (
  options: ExecuteClearOperationOptions,
): ClearOperationResult<ClearOperationSuccess> => {
  const plan = createClearOperationPlan(options.kind)
  if (!plan.ok) return plan

  const snapshot = captureSnapshot(options.storage, plan.data)
  if (!snapshot.ok) return snapshot

  for (const entry of plan.data.entries) {
    const removed = options.storage.remove(entry.storageKey)
    if (!removed.ok) {
      return failAfterRollback(options.storage, snapshot.data, {
        code: 'CLEAR_REMOVE_FAILED',
        message: 'Clear operation failed; previous data was restored.',
        kind: options.kind,
        entryId: entry.id,
      })
    }

    const verified = options.storage.readBack(entry.storageKey, null)
    if (!verified.ok) {
      return failAfterRollback(options.storage, snapshot.data, {
        code: 'CLEAR_VERIFY_FAILED',
        message: 'Clear operation verification failed; previous data was restored.',
        kind: options.kind,
        entryId: entry.id,
      })
    }
  }

  try {
    if (
      options.hydration.hydrate(options.kind) === false ||
      !options.hydration.verify(options.kind)
    ) {
      throw new Error('Clear hydration verification failed.')
    }
  } catch {
    const rollback = rollbackStorage(options.storage, snapshot.data)
    if (!rollback.ok) return rollback

    try {
      if (
        options.hydration.restore() === false ||
        !options.hydration.verifyRestore()
      ) {
        return clearFailure(
          'CLEAR_ROLLBACK_VERIFY_FAILED',
          'Old in-memory state could not be verified after clear hydration failed.',
        )
      }
    } catch {
      return clearFailure(
        'CLEAR_ROLLBACK_FAILED',
        'Old in-memory state could not be restored after clear hydration failed.',
      )
    }

    return clearFailure(
      'CLEAR_HYDRATION_FAILED',
      'Clear hydration failed; previous data and state were restored.',
      {
        severity: 'error',
        recoverable: true,
        details: { kind: options.kind, restored: true },
      },
    )
  }

  return clearSuccess(Object.freeze({
    kind: options.kind,
    removedKeyCount: expectedEntryCount[options.kind],
  }))
}

export interface ClearOperationCoordinator {
  readonly execute: (
    options: ExecuteClearOperationOptions,
  ) => ClearOperationResult<ClearOperationSuccess>
  readonly isActive: () => boolean
}

export const createClearOperationCoordinator = (): ClearOperationCoordinator => {
  let active = false

  return Object.freeze({
    execute(options: ExecuteClearOperationOptions) {
      if (active) {
        return clearFailure(
          'CLEAR_CONCURRENT_OPERATION',
          'Another clear operation is already running.',
          { severity: 'error', recoverable: true, details: { kind: options.kind } },
        )
      }

      active = true
      try {
        return executeClearOperation(options)
      } finally {
        active = false
      }
    },
    isActive: () => active,
  })
}
