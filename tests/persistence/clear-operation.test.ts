import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEVELOPMENT_ONLY_STORAGE_KEYS,
  PRODUCT_STORAGE_KEYS,
  createClearOperationCoordinator,
  createClearOperationPlan,
  createClearOperationPreview,
  executeClearOperation,
  type ClearOperationHydrationHooks,
  type PersistenceStorageAdapter,
} from '@/shared/persistence'
import { resolveDefaultLanguage } from '@/stores/language'

const DEBUG_KEY = DEVELOPMENT_ONLY_STORAGE_KEYS[0]
const EXTERNAL_KEY = 'external.preference'

const factoryOrder = [
  'lifeboard.todos',
  'lifeboard.bookmarks',
  'lifeboard-weather-favorite-cities',
  'lifeboard-weather-location',
  'lifeboard.weather.forecastCache.v1',
  'lifeboard.weather.provider',
  'lifeboard.weather.caiyunToken',
  'lifeboard.weather.amapKey',
  'lifeboard.weather.autoLocationOnHome',
  'lifeboard-theme',
  'lifeboard.language',
] as const

const contentOrder = factoryOrder.slice(0, 4)

const initialValues = () => Object.fromEntries([
  ...PRODUCT_STORAGE_KEYS.map((key, index) => [key, `raw:${index}:secret-safe-fixture`]),
  [DEBUG_KEY, 'debug-on'],
  [EXTERNAL_KEY, 'external-value'],
])

interface HarnessOptions {
  failReadAt?: number
  failRemoveAt?: number
  mismatchPrimaryReadBackAt?: number
  failRollbackWrite?: boolean
  mismatchRollbackReadBack?: boolean
}

function createHarness(options: HarnessOptions = {}) {
  const values = new Map(Object.entries(initialValues()))
  const reads: string[] = []
  const removes: string[] = []
  const writes: string[] = []
  const readBacks: string[] = []
  let primaryReadBacks = 0
  let failureStarted = false

  const adapter: PersistenceStorageAdapter = {
    read(key) {
      reads.push(key)
      if (reads.length === options.failReadAt) {
        return { ok: false, error: new Error('snapshot read failed') }
      }
      return { ok: true, value: values.get(key) ?? null }
    },
    remove(key) {
      removes.push(key)
      if (!failureStarted && removes.length === options.failRemoveAt) {
        failureStarted = true
        return { ok: false, error: new Error('remove failed') }
      }
      values.delete(key)
      return { ok: true }
    },
    write(key, value) {
      writes.push(key)
      if (options.failRollbackWrite) {
        return { ok: false, error: new Error('rollback write failed') }
      }
      values.set(key, value)
      return { ok: true }
    },
    readBack(key, expectedValue) {
      readBacks.push(key)
      if (writes.length === 0 && !failureStarted) {
        primaryReadBacks += 1
        if (primaryReadBacks === options.mismatchPrimaryReadBackAt) {
          failureStarted = true
          return { ok: false, matches: false }
        }
      } else if (writes.length > 0 && options.mismatchRollbackReadBack) {
        return { ok: false, matches: false }
      }
      const matches = (values.get(key) ?? null) === expectedValue
      return matches
        ? { ok: true, matches: true }
        : { ok: false, matches: false }
    },
  }

  return { adapter, values, reads, removes, writes, readBacks }
}

const successfulHydration = (): ClearOperationHydrationHooks => ({
  hydrate: () => undefined,
  verify: () => true,
  restore: () => undefined,
  verifyRestore: () => true,
})

function expectPreservedSentinels(values: Map<string, string>) {
  expect(values.get(DEBUG_KEY)).toBe('debug-on')
  expect(values.get(EXTERNAL_KEY)).toBe('external-value')
}

describe('registry-driven clear plans', () => {
  it('builds the exact deterministic 4-key and 11-key plans', () => {
    const content = createClearOperationPlan('user-content')
    const factory = createClearOperationPlan('factory-reset')

    expect(content.ok && content.data.entries.map((entry) => entry.storageKey)).toEqual(contentOrder)
    expect(factory.ok && factory.data.entries.map((entry) => entry.storageKey)).toEqual(factoryOrder)
    expect(factory.ok && factory.data.entries.every((entry) => entry.operation === 'remove')).toBe(true)
    expect(factory.ok && factory.data.entries.every((entry) => entry.verificationStrategy === 'absent')).toBe(true)
  })

  it('keeps previews count-only and explicitly states backup behavior', () => {
    const result = createClearOperationPreview('factory-reset', {
      taskCount: 2,
      countdownCount: 1,
      bookmarkCount: 3,
      favoriteCityCount: 4,
      hasSavedLocation: true,
    })
    expect(result).toEqual({
      ok: true,
      data: {
        kind: 'factory-reset',
        targetKeyCount: 11,
        taskCount: 2,
        countdownCount: 1,
        bookmarkCount: 3,
        favoriteCityCount: 4,
        hasSavedLocation: true,
        preservesPreferences: false,
        resetsPreferences: true,
        backupCreatedAutomatically: false,
      },
    })
    expect(JSON.stringify(result)).not.toContain('secret-safe-fixture')
  })
})

describe('clear transaction success and preservation', () => {
  it('clears only durable user content and preserves every preference and sentinel', () => {
    const harness = createHarness()
    const result = executeClearOperation({
      kind: 'user-content',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })

    expect(result).toEqual({ ok: true, data: { kind: 'user-content', removedKeyCount: 4 } })
    expect(harness.removes).toEqual(contentOrder)
    expect(harness.reads).toEqual(contentOrder)
    for (const key of contentOrder) expect(harness.values.has(key)).toBe(false)
    for (const key of factoryOrder.slice(4)) expect(harness.values.has(key)).toBe(true)
    expectPreservedSentinels(harness.values)
  })

  it('factory-resets all 11 product keys and preserves debug and external storage', () => {
    const harness = createHarness()
    const result = executeClearOperation({
      kind: 'factory-reset',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })

    expect(result).toEqual({ ok: true, data: { kind: 'factory-reset', removedKeyCount: 11 } })
    expect(harness.removes).toEqual(factoryOrder)
    for (const key of PRODUCT_STORAGE_KEYS) expect(harness.values.has(key)).toBe(false)
    expectPreservedSentinels(harness.values)
  })

  it('is repeatable when every factory-reset target is already absent', () => {
    const harness = createHarness()
    const options = {
      kind: 'factory-reset' as const,
      storage: harness.adapter,
      hydration: successfulHydration(),
    }
    expect(executeClearOperation(options).ok).toBe(true)
    expect(executeClearOperation(options)).toEqual({
      ok: true,
      data: { kind: 'factory-reset', removedKeyCount: 11 },
    })
    expectPreservedSentinels(harness.values)
  })
})

describe('clear transaction failure safety', () => {
  it('performs zero mutations when an exact raw snapshot cannot be captured', () => {
    const harness = createHarness({ failReadAt: 3 })
    const result = executeClearOperation({
      kind: 'factory-reset',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('CLEAR_SNAPSHOT_FAILED')
    expect(harness.removes).toEqual([])
    expect(harness.writes).toEqual([])
  })

  it.each([1, 2, 4])('restores exact raw values when content remove %s fails', (failRemoveAt) => {
    const harness = createHarness({ failRemoveAt })
    const result = executeClearOperation({
      kind: 'user-content',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('CLEAR_REMOVE_FAILED')
    expect(Object.fromEntries(harness.values)).toEqual(initialValues())
    expectPreservedSentinels(harness.values)
  })

  it.each([1, 6, 11])('restores exact raw values when factory remove %s fails', (failRemoveAt) => {
    const harness = createHarness({ failRemoveAt })
    const result = executeClearOperation({
      kind: 'factory-reset',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('CLEAR_REMOVE_FAILED')
    expect(Object.fromEntries(harness.values)).toEqual(initialValues())
  })

  it.each([1, 6, 11])('rolls back when factory read-back %s does not prove absence', (mismatchPrimaryReadBackAt) => {
    const harness = createHarness({ mismatchPrimaryReadBackAt })
    const result = executeClearOperation({
      kind: 'factory-reset',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('CLEAR_VERIFY_FAILED')
    expect(Object.fromEntries(harness.values)).toEqual(initialValues())
  })

  it('reports rollback write failure without exposing raw values', () => {
    const harness = createHarness({ failRemoveAt: 2, failRollbackWrite: true })
    const result = executeClearOperation({
      kind: 'user-content',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('CLEAR_ROLLBACK_FAILED')
      expect(JSON.stringify(result.error)).not.toContain('secret-safe-fixture')
    }
  })

  it('reports rollback verification failure', () => {
    const harness = createHarness({ failRemoveAt: 2, mismatchRollbackReadBack: true })
    const result = executeClearOperation({
      kind: 'user-content',
      storage: harness.adapter,
      hydration: successfulHydration(),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('CLEAR_ROLLBACK_VERIFY_FAILED')
  })

  it('restores storage and runtime state when hydration verification fails', () => {
    const harness = createHarness()
    let runtime = 'before'
    const result = executeClearOperation({
      kind: 'factory-reset',
      storage: harness.adapter,
      hydration: {
        hydrate() {
          runtime = 'after'
        },
        verify: () => false,
        restore() {
          runtime = 'before'
        },
        verifyRestore: () => runtime === 'before',
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('CLEAR_HYDRATION_FAILED')
    expect(runtime).toBe('before')
    expect(Object.fromEntries(harness.values)).toEqual(initialValues())
  })

  it('rejects a nested operation while the coordinator is active', () => {
    const coordinator = createClearOperationCoordinator()
    const outerHarness = createHarness()
    const innerHarness = createHarness()
    let nestedCode: string | null = null

    const result = coordinator.execute({
      kind: 'user-content',
      storage: outerHarness.adapter,
      hydration: {
        ...successfulHydration(),
        hydrate() {
          const nested = coordinator.execute({
            kind: 'factory-reset',
            storage: innerHarness.adapter,
            hydration: successfulHydration(),
          })
          if (!nested.ok) nestedCode = nested.error.code
        },
      },
    })

    expect(result.ok).toBe(true)
    expect(nestedCode).toBe('CLEAR_CONCURRENT_OPERATION')
    expect(innerHarness.removes).toEqual([])
  })
})

describe('language reset default', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses Chinese when any browser locale is Chinese', () => {
    vi.stubGlobal('navigator', { languages: ['en-US', 'zh-CN'] })
    expect(resolveDefaultLanguage()).toBe('zh-CN')
  })

  it('uses English when browser locales do not include Chinese', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR', 'en-US'] })
    expect(resolveDefaultLanguage()).toBe('en-US')
  })
})
