import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_PORTABLE_BACKUP_BYTES,
  buildPortableBackupV1,
  createPortableBackupExport,
  serializePortableBackupV1,
  type PortableBackupV1,
} from '@/shared/persistence'
import {
  corruptBookmarksStorage,
  corruptTodosStorage,
  createOversizedPortableExportStorage,
  duplicateTaskIdStorage,
  invalidLanguageStorage,
  portableFixtureTimestamp,
  validPortableBackupV1,
  validPortableExportStorage,
} from './fixtures'
import { createInstrumentedStorage } from './storageHarness'

afterEach(() => {
  vi.restoreAllMocks()
})

const createExport = (values: Readonly<Record<string, string>>) =>
  createPortableBackupExport({
    storage: createInstrumentedStorage(values).adapter,
    exportedAt: portableFixtureTimestamp,
    appVersion: 'fixture',
  })

const replaceStoredRecord = (
  storageKey: 'lifeboard.todos' | 'lifeboard.bookmarks',
  mutate: (value: Record<string, unknown>) => void,
) => {
  const parsed = JSON.parse(validPortableExportStorage[storageKey] as string) as Record<string, unknown>
  mutate(parsed)
  return { ...validPortableExportStorage, [storageKey]: JSON.stringify(parsed) }
}

describe('portable export failure handling', () => {
  it('fails on corrupt JSON without returning a partial backup', () => {
    const result = createExport(corruptTodosStorage)
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_STORAGE_PARSE_FAILED', module: 'todos' },
    })
    expect(result).not.toHaveProperty('data')
  })

  it('fails on an invalid storage envelope', () => {
    const result = createExport(corruptBookmarksStorage)
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'bookmarks' },
    })
  })

  it('does not treat a stored JSON null as a missing Weather location', () => {
    const result = createExport({
      ...validPortableExportStorage,
      'lifeboard-weather-location': 'null',
    })
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'weather' },
    })
  })

  it('fails on duplicate collection IDs', () => {
    const result = createExport(duplicateTaskIdStorage)
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', path: '/data/todos/payload/tasks' },
    })
  })

  it('fails on an invalid bookmark URL', () => {
    const values = replaceStoredRecord('lifeboard.bookmarks', (envelope) => {
      const bookmarks = envelope.bookmarks as Array<Record<string, unknown>>
      bookmarks[0]!.url = 'javascript:alert(1)'
    })
    const result = createExport(values)
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'bookmarks' },
    })
    expect(JSON.stringify(result)).not.toContain('javascript:alert')
  })

  it('fails on an invalid canonical timestamp', () => {
    const values = replaceStoredRecord('lifeboard.todos', (envelope) => {
      const tasks = envelope.tasks as Array<Record<string, unknown>>
      tasks[0]!.createdAt = '2026-07-10'
    })
    expect(createExport(values)).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'todos' },
    })
  })

  it('rejects non-finite coordinates before serialization', () => {
    const selectedLocation = validPortableBackupV1.data.weather.payload.selectedLocation
    expect(selectedLocation).not.toBeNull()
    if (!selectedLocation) return
    const backup = {
      ...validPortableBackupV1,
      data: {
        ...validPortableBackupV1.data,
        weather: {
          ...validPortableBackupV1.data.weather,
          payload: {
            ...validPortableBackupV1.data.weather.payload,
            selectedLocation: { ...selectedLocation, latitude: Number.POSITIVE_INFINITY },
          },
        },
      },
    } as PortableBackupV1
    const result = serializePortableBackupV1(backup)
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'weather' },
    })
  })

  it('rejects unpaired Unicode surrogate data', () => {
    const values = replaceStoredRecord('lifeboard.todos', (envelope) => {
      const tasks = envelope.tasks as Array<Record<string, unknown>>
      tasks[0]!.title = '\ud800'
    })
    expect(createExport(values)).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'todos' },
    })
  })

  it('fails on an invalid stored Language', () => {
    expect(createExport(invalidLanguageStorage)).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'settings' },
    })
  })

  it('returns a redacted structured storage-read error', () => {
    const storage = createInstrumentedStorage(validPortableExportStorage, 'lifeboard.todos')
    const result = buildPortableBackupV1({
      storage: storage.adapter,
      exportedAt: portableFixtureTimestamp,
    })
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'PORTABLE_STORAGE_READ_FAILED',
        severity: 'error',
        module: 'todos',
        recoverable: true,
      },
    })
    expect(JSON.stringify(result)).not.toContain('整理照片')
  })

  it('rejects dangerous prototype keys before DTO mapping', () => {
    const raw = validPortableExportStorage['lifeboard.todos'] as string
    const unsafe = raw.replace('"id":"task-alpha"', '"__proto__":{"polluted":true},"id":"task-alpha"')
    const result = createExport({ ...validPortableExportStorage, 'lifeboard.todos': unsafe })
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', module: 'todos' },
    })
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined()
  })

  it('does not invoke an unexpected toJSON method', () => {
    let called = false
    const value = {
      ...validPortableBackupV1,
      toJSON() {
        called = true
        return validPortableBackupV1
      },
    } as unknown as PortableBackupV1
    const result = serializePortableBackupV1(value)
    expect(result).toMatchObject({ ok: false, error: { code: 'PORTABLE_DATA_INVALID' } })
    expect(called).toBe(false)
  })

  it('returns the serialization error code when JSON serialization throws', () => {
    vi.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw new TypeError('fixture serialization failure')
    })
    expect(serializePortableBackupV1(validPortableBackupV1)).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_SERIALIZATION_FAILED' },
    })
  })

  it('rejects output over 1 MiB without returning a download descriptor', () => {
    const result = createExport(createOversizedPortableExportStorage())
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'PORTABLE_BACKUP_TOO_LARGE',
        details: { maximumBytes: MAX_PORTABLE_BACKUP_BYTES },
      },
    })
    expect(result).not.toHaveProperty('data')
  })

  it('fails cleanly when the injected clock is invalid', () => {
    const result = buildPortableBackupV1({
      storage: createInstrumentedStorage(validPortableExportStorage).adapter,
      clock: () => new Date(Number.NaN),
    })
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'PORTABLE_DATA_INVALID', path: '/exportedAt' },
    })
  })
})
