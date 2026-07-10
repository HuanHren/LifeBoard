import { describe, expect, it } from 'vitest'
import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  LEGACY_BACKUP_ROOT_VERSION_1,
  LEGACY_BACKUP_ROOT_VERSION_2,
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  PORTABLE_MODULE_IDS,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  SUPPORTED_LEGACY_BACKUP_VERSIONS,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
  containsDangerousObjectKey,
  createRawStorageAdapter,
  isPositiveIntegerVersion,
  isSafeObject,
} from '@/shared/persistence'
import {
  emptyPortableBackupV1,
  futureRootMetadata,
  legacyRootV1Metadata,
  legacyRootV2Metadata,
  validPortableBackupV1,
} from './fixtures'

describe('portable schema constants and fixtures', () => {
  it('defines the current root format and schema independently', () => {
    expect(LIFEBOARD_BACKUP_FORMAT).toBe('lifeboard-backup')
    expect(LIFEBOARD_BACKUP_SCHEMA_VERSION).toBe(1)
  })

  it('defines all module ids and positive portable schema versions', () => {
    expect(PORTABLE_MODULE_IDS).toEqual(['settings', 'weather', 'todos', 'bookmarks'])
    expect([
      SETTINGS_PORTABLE_SCHEMA_VERSION,
      WEATHER_PORTABLE_SCHEMA_VERSION,
      TODOS_PORTABLE_SCHEMA_VERSION,
      BOOKMARKS_PORTABLE_SCHEMA_VERSION,
    ].every(isPositiveIntegerVersion)).toBe(true)
  })

  it('keeps legacy root versions distinct from the new root schema contract', () => {
    expect(SUPPORTED_LEGACY_BACKUP_VERSIONS).toEqual([
      LEGACY_BACKUP_ROOT_VERSION_1,
      LEGACY_BACKUP_ROOT_VERSION_2,
    ])
    expect(legacyRootV1Metadata).toHaveProperty('version', 1)
    expect(legacyRootV1Metadata).not.toHaveProperty('schemaVersion')
    expect(legacyRootV2Metadata).toHaveProperty('version', 2)
    expect(validPortableBackupV1).toHaveProperty('schemaVersion', 1)
    expect(validPortableBackupV1).not.toHaveProperty('version')
  })

  it('provides current, empty, and future metadata fixtures without secrets or cache data', () => {
    expect(validPortableBackupV1.data.todos.payload.tasks).toHaveLength(1)
    expect(emptyPortableBackupV1.data.todos.payload.tasks).toHaveLength(0)
    expect(futureRootMetadata.schemaVersion).toBe(2)
    expect(JSON.stringify(validPortableBackupV1)).not.toContain('caiyunToken')
    expect(JSON.stringify(validPortableBackupV1)).not.toContain('forecastCache')
  })
})

describe('validation helpers and raw storage adapter', () => {
  it('recognizes safe objects and positive integer versions', () => {
    expect(isSafeObject({ value: 1 })).toBe(true)
    expect(isSafeObject(Object.create(null))).toBe(true)
    expect(isSafeObject([])).toBe(false)
    expect(isPositiveIntegerVersion(1)).toBe(true)
    expect(isPositiveIntegerVersion(0)).toBe(false)
  })

  it('detects dangerous keys recursively', () => {
    const unsafe = JSON.parse('{"nested":{"__proto__":{"polluted":true}}}') as unknown
    expect(containsDangerousObjectKey(unsafe)).toBe(true)
    expect(containsDangerousObjectKey({ nested: { value: true } })).toBe(false)
  })

  it('adapts injected storage without reading browser globals', () => {
    const values = new Map<string, string>()
    const adapter = createRawStorageAdapter({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => void values.set(key, value),
      removeItem: (key) => void values.delete(key),
    })

    expect(adapter.write('fixture', 'value')).toEqual({ ok: true })
    expect(adapter.read('fixture')).toEqual({ ok: true, value: 'value' })
    expect(adapter.readBack('fixture', 'value')).toEqual({ ok: true, matches: true })
    expect(adapter.remove('fixture')).toEqual({ ok: true })
    expect(adapter.read('fixture')).toEqual({ ok: true, value: null })
  })

  it('returns structured failures from injected storage errors', () => {
    const adapter = createRawStorageAdapter({
      getItem: () => {
        throw new Error('read failed')
      },
      setItem: () => {
        throw new Error('write failed')
      },
      removeItem: () => {
        throw new Error('remove failed')
      },
    })

    expect(adapter.read('fixture').ok).toBe(false)
    expect(adapter.write('fixture', 'value').ok).toBe(false)
    expect(adapter.remove('fixture').ok).toBe(false)
    expect(adapter.readBack('fixture', null).ok).toBe(false)
  })
})
