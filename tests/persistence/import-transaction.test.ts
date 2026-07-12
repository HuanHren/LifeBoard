import { describe, expect, it } from 'vitest'
import {
  createPortableImportPlan,
  createPortableWritePlan,
  executeReplaceImport,
  preparePortableImportValue,
  type ImportHydrationHooks,
  type PortableBackupV1,
} from '@/shared/persistence'
import {
  nonPortableSentinelStorage,
  originalPortableStorage,
  validPortableBackupV1,
} from './fixtures'
import { createFaultStorage } from './importHarness'

const prepare = () => {
  const result = preparePortableImportValue(validPortableBackupV1, {
    currentLanguage: 'en-US',
    currentThemeMode: 'system',
  })
  if (!result.ok) throw new Error(result.error.code)
  return result.data
}

const createHydration = (options: {
  failHydrate?: boolean
  failVerify?: boolean
  failRestore?: boolean
  failRestoreVerify?: boolean
} = {}) => {
  const calls: string[] = []
  const hooks: ImportHydrationHooks = {
    hydrate() {
      calls.push('hydrate')
      return !options.failHydrate
    },
    verify() {
      calls.push('verify')
      return !options.failVerify
    },
    restore() {
      calls.push('restore')
      return !options.failRestore
    },
    verifyRestore() {
      calls.push('verify-restore')
      return !options.failRestoreVerify
    },
  }
  return { hooks, calls }
}

const snapshot = (values: Map<string, string>) => Object.fromEntries(values)

describe('portable replace write plan', () => {
  it('pre-serializes exactly six registry entries in durable-first order', () => {
    const result = createPortableWritePlan(validPortableBackupV1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.map((entry) => entry.id)).toEqual([
      'todos',
      'bookmarks',
      'weather-favorite-cities',
      'weather-location',
      'theme-mode',
      'language',
    ])
    expect(result.data.map((entry) => entry.storageKey)).toEqual(
      createPortableImportPlan().entries.map((entry) => entry.storageKey),
    )
  })

  it('uses remove semantics for a null saved location', () => {
    const backup = JSON.parse(JSON.stringify(validPortableBackupV1)) as PortableBackupV1
    ;(backup.data.weather.payload as { selectedLocation: unknown }).selectedLocation = null
    const result = createPortableWritePlan(backup)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.find((entry) => entry.id === 'weather-location')).toMatchObject({ operation: 'remove', serializedValue: null })
  })
})

describe('replace transaction success', () => {
  it('writes, verifies, then hydrates without touching non-portable sentinels', () => {
    const storage = createFaultStorage(originalPortableStorage)
    const hydration = createHydration()
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: hydration.hooks })
    expect(result).toMatchObject({ ok: true, data: { writeCount: 6, sourceFormat: 'portable-v1' } })
    expect(storage.mutations).toEqual(createPortableImportPlan().entries.map((entry) => entry.storageKey))
    expect(storage.readBacks).toEqual(storage.mutations)
    expect(hydration.calls).toEqual(['hydrate', 'verify'])
    for (const [key, value] of Object.entries(nonPortableSentinelStorage)) {
      expect(storage.values.get(key)).toBe(value)
    }
  })
})

describe('write, verification, and rollback failures', () => {
  it('makes zero writes when the exact snapshot cannot be captured', () => {
    const storage = createFaultStorage(originalPortableStorage)
    const adapter = {
      ...storage.adapter,
      read: () => ({ ok: false as const, error: new Error('fixture snapshot failure') }),
    }
    const result = executeReplaceImport({ storage: adapter, prepared: prepare(), hydration: createHydration().hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'SNAPSHOT_FAILED' } })
    expect(storage.mutations).toEqual([])
  })

  it.each([1, 3, 6])('restores the exact raw snapshot after write failure at mutation %s', (failMutationAt) => {
    const storage = createFaultStorage(originalPortableStorage, { failMutationAt })
    const before = snapshot(storage.values)
    const hydration = createHydration()
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: hydration.hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'WRITE_FAILED', details: { restored: true } } })
    expect(snapshot(storage.values)).toEqual(before)
    expect(hydration.calls).toEqual([])
  })

  it('classifies quota failure and restores exact data', () => {
    const storage = createFaultStorage(originalPortableStorage, { quotaMutationAt: 2 })
    const before = snapshot(storage.values)
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: createHydration().hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'QUOTA_EXCEEDED', details: { restored: true } } })
    expect(snapshot(storage.values)).toEqual(before)
  })

  it('rolls back after immediate read-back mismatch', () => {
    const storage = createFaultStorage(originalPortableStorage, { mismatchReadBackAt: 4 })
    const before = snapshot(storage.values)
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: createHydration().hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'VERIFY_FAILED', details: { restored: true } } })
    expect(snapshot(storage.values)).toEqual(before)
  })

  it('reports rollback write failure without claiming recovery', () => {
    const storage = createFaultStorage(originalPortableStorage, { failMutationAt: 2, failRollbackMutation: true })
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: createHydration().hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'ROLLBACK_FAILED', recoverable: false } })
    expect(result).not.toHaveProperty('error.details.restored')
  })

  it('reports rollback verification failure without claiming recovery', () => {
    const storage = createFaultStorage(originalPortableStorage, { failMutationAt: 2, mismatchRollbackReadBack: true })
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: createHydration().hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'ROLLBACK_VERIFY_FAILED' } })
  })
})

describe('hydration rollback', () => {
  it.each([
    [{ failHydrate: true }, 'hydrate'],
    [{ failVerify: true }, 'verify'],
  ] as const)('rolls storage and memory back after %s failure', (fault) => {
    const storage = createFaultStorage(originalPortableStorage)
    const before = snapshot(storage.values)
    const hydration = createHydration(fault)
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: hydration.hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'HYDRATION_FAILED', details: { restored: true } } })
    expect(snapshot(storage.values)).toEqual(before)
    expect(hydration.calls).toContain('restore')
    expect(hydration.calls).toContain('verify-restore')
  })

  it('escalates failed old-state hydration restoration', () => {
    const storage = createFaultStorage(originalPortableStorage)
    const hydration = createHydration({ failHydrate: true, failRestoreVerify: true })
    const result = executeReplaceImport({ storage: storage.adapter, prepared: prepare(), hydration: hydration.hooks })
    expect(result).toMatchObject({ ok: false, error: { code: 'ROLLBACK_VERIFY_FAILED' } })
  })
})
