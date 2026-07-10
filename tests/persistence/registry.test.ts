import { describe, expect, it } from 'vitest'
import {
  DEVELOPMENT_ONLY_STORAGE_KEYS,
  PERSISTENCE_REGISTRY,
  PRODUCT_STORAGE_KEYS,
  createContentClearPlan,
  createFactoryResetPlan,
  createPortableRegistryPlan,
  getCacheEntries,
  getEntriesByOwner,
  getFactoryResetEntries,
  getPersistenceEntryById,
  getPersistenceEntryByStorageKey,
  getPortableEntries,
  getSecretEntries,
} from '@/shared/persistence'

describe('persistence registry inventory', () => {
  it('covers exactly the 11 product storage keys', () => {
    expect(PERSISTENCE_REGISTRY).toHaveLength(11)
    expect(PERSISTENCE_REGISTRY.map((entry) => entry.storageKey).sort()).toEqual(
      [...PRODUCT_STORAGE_KEYS].sort(),
    )
  })

  it('has unique entry ids and storage keys', () => {
    expect(new Set(PERSISTENCE_REGISTRY.map((entry) => entry.id))).toHaveLength(11)
    expect(new Set(PERSISTENCE_REGISTRY.map((entry) => entry.storageKey))).toHaveLength(11)
  })

  it('excludes the developer runtime debug flag', () => {
    expect(PERSISTENCE_REGISTRY.map((entry) => entry.storageKey)).not.toContain(
      DEVELOPMENT_ONLY_STORAGE_KEYS[0],
    )
  })

  it('is immutable at the registry and entry levels', () => {
    expect(Object.isFrozen(PERSISTENCE_REGISTRY)).toBe(true)
    expect(PERSISTENCE_REGISTRY.every(Object.isFrozen)).toBe(true)
  })
})

describe('portable and sensitivity policies', () => {
  it.each([
    'theme-mode',
    'language',
    'weather-location',
    'weather-favorite-cities',
    'todos',
    'bookmarks',
  ] as const)('%s is portable', (id) => {
    expect(getPersistenceEntryById(id)?.portable).toBe(true)
  })

  it.each([
    'weather-forecast-cache',
    'weather-provider',
    'weather-auto-location-on-home',
    'weather-caiyun-token',
    'weather-amap-key',
  ] as const)('%s is non-portable', (id) => {
    expect(getPersistenceEntryById(id)?.portable).toBe(false)
  })

  it('marks both credentials secret and non-portable', () => {
    expect(getSecretEntries().map((entry) => entry.id).sort()).toEqual([
      'weather-amap-key',
      'weather-caiyun-token',
    ])
    expect(getSecretEntries().every((entry) => !entry.portable && entry.sensitivity === 'secret')).toBe(true)
  })

  it('marks all cache entries non-portable', () => {
    expect(getCacheEntries()).toHaveLength(1)
    expect(getCacheEntries().every((entry) => !entry.portable)).toBe(true)
  })
})

describe('selectors and metadata plans', () => {
  it('finds entries by id, storage key, and owner', () => {
    expect(getPersistenceEntryById('language')?.storageKey).toBe('lifeboard.language')
    expect(getPersistenceEntryByStorageKey('lifeboard.todos')?.id).toBe('todos')
    expect(getEntriesByOwner('weather')).toHaveLength(7)
    expect(getPersistenceEntryByStorageKey('missing')).toBeUndefined()
  })

  it('returns frozen selector lists', () => {
    expect(Object.isFrozen(getPortableEntries())).toBe(true)
    expect(Object.isFrozen(getFactoryResetEntries())).toBe(true)
  })

  it('covers all product keys in the factory reset target contract', () => {
    expect(getFactoryResetEntries().map((entry) => entry.storageKey).sort()).toEqual(
      [...PRODUCT_STORAGE_KEYS].sort(),
    )
    expect(getPersistenceEntryById('language')?.factoryReset).toBe(true)
  })

  it('content clear only contains durable user content and saved locations', () => {
    expect(createContentClearPlan().entries.map((entry) => entry.id)).toEqual([
      'todos',
      'bookmarks',
      'weather-location',
      'weather-favorite-cities',
    ])
  })

  it('creates read-only metadata-only plans without storage access', () => {
    const portablePlan = createPortableRegistryPlan()
    const factoryPlan = createFactoryResetPlan()
    expect(portablePlan.entries).toHaveLength(6)
    expect(factoryPlan.entries).toHaveLength(11)
    expect(Object.isFrozen(portablePlan.entries)).toBe(true)
    expect(Object.isFrozen(factoryPlan.entries)).toBe(true)
  })
})
