import { describe, expect, it } from 'vitest'
import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  PORTABLE_BACKUP_MIME_TYPE,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
  buildPortableBackupV1,
  createPortableBackupExport,
  createPortableRegistryPlan,
  validatePortableBackupV1,
} from '@/shared/persistence'
import {
  allPortableAndExcludedStorage,
  emptyPortableExportStorage,
  portableFixtureTimestamp,
  validPortableExportStorage,
} from './fixtures'
import { createInstrumentedStorage } from './storageHarness'

const buildExport = (values: Readonly<Record<string, string>> = validPortableExportStorage) => {
  const storage = createInstrumentedStorage(values)
  const result = createPortableBackupExport({
    storage: storage.adapter,
    exportedAt: portableFixtureTimestamp,
    appVersion: '1.2.3-fixture',
  })
  return { result, reads: storage.reads }
}

describe('PortableBackupV1 registry-driven export', () => {
  it('reads exactly the registry portable entries in deterministic order', () => {
    const { result, reads } = buildExport(allPortableAndExcludedStorage)
    expect(result.ok).toBe(true)
    expect(reads).toEqual(createPortableRegistryPlan().entries.map((entry) => entry.storageKey))
    expect(reads).toHaveLength(6)
  })

  it('builds the complete root and four module envelopes', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.backup).toMatchObject({
      format: LIFEBOARD_BACKUP_FORMAT,
      schemaVersion: LIFEBOARD_BACKUP_SCHEMA_VERSION,
      exportedAt: portableFixtureTimestamp,
      app: { name: 'LifeBoard', version: '1.2.3-fixture' },
      locale: 'zh-CN',
      data: {
        settings: { schemaVersion: SETTINGS_PORTABLE_SCHEMA_VERSION },
        weather: { schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION },
        todos: { schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION },
        bookmarks: { schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION },
      },
    })
    expect(Object.keys(result.data.backup.data)).toEqual([
      'settings',
      'weather',
      'todos',
      'bookmarks',
    ])
    expect(validatePortableBackupV1(result.data.backup).ok).toBe(true)
  })

  it('includes Theme and Language and keeps root locale consistent', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.backup.data.settings.payload).toEqual({
      themeMode: 'dark',
      language: 'zh-CN',
    })
    expect(result.data.backup.locale).toBe(result.data.backup.data.settings.payload.language)
  })

  it('includes only approved Weather location and favorite-city fields', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.backup.data.weather.payload.selectedLocation).toMatchObject({
      name: '上海',
      latitude: 31.2304,
      longitude: 121.4737,
    })
    expect(result.data.backup.data.weather.payload.favoriteCities).toHaveLength(1)
    expect(JSON.stringify(result.data.backup.data.weather.payload)).not.toContain('internalOnly')
  })

  it('maps Todos, Countdowns, and Bookmarks without internal fields', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.backup.data.todos.payload.tasks[0]).toMatchObject({
      id: 'task-alpha',
      title: '整理照片',
      deletedAt: null,
    })
    expect(result.data.backup.data.todos.payload.countdowns[0]?.id).toBe('countdown-alpha')
    expect(result.data.backup.data.bookmarks.payload.bookmarks[0]).toMatchObject({
      id: 'bookmark-alpha',
      category: '资料',
      pinned: true,
    })
    expect(result.data.download.text).not.toContain('OMIT_')
  })

  it('uses explicit defaults and valid empty payloads for missing keys', () => {
    const storage = createInstrumentedStorage(emptyPortableExportStorage)
    const result = buildPortableBackupV1({
      storage: storage.adapter,
      exportedAt: portableFixtureTimestamp,
      defaults: { themeMode: 'light', language: 'zh-CN' },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.app.version).toBe('unknown')
    expect(result.data.locale).toBe('zh-CN')
    expect(result.data.data.settings.payload.themeMode).toBe('light')
    expect(result.data.data.weather.payload).toEqual({
      selectedLocation: null,
      favoriteCities: [],
    })
    expect(result.data.data.todos.payload).toEqual({ tasks: [], countdowns: [] })
    expect(result.data.data.bookmarks.payload).toEqual({ bookmarks: [] })
  })

  it('uses the documented fallback defaults when none are injected', () => {
    const storage = createInstrumentedStorage(emptyPortableExportStorage)
    const result = buildPortableBackupV1({
      storage: storage.adapter,
      exportedAt: portableFixtureTimestamp,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.data.settings.payload).toEqual({
      themeMode: 'system',
      language: 'en-US',
    })
  })

  it('produces identical output for identical storage, clock, and app version', () => {
    const first = buildExport().result
    const second = buildExport().result
    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.data.download.text).toBe(second.data.download.text)
  })

  it('preserves user-facing collection order', () => {
    const todos = JSON.parse(validPortableExportStorage['lifeboard.todos'] as string) as {
      tasks: unknown[]
      countdowns: unknown[]
      version: 1
    }
    todos.tasks.push({
      ...(todos.tasks[0] as Record<string, unknown>),
      id: 'task-beta',
      title: '第二项',
    })
    const values = {
      ...validPortableExportStorage,
      'lifeboard.todos': JSON.stringify(todos),
    }
    const { result } = buildExport(values)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.backup.data.todos.payload.tasks.map((task) => task.id)).toEqual([
      'task-alpha',
      'task-beta',
    ])
  })
})

describe('PortableBackupV1 serialization and exclusions', () => {
  it('uses two-space JSON, LF with a trailing newline, UTF-8 bytes, and no BOM', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const { text, byteLength } = result.data.download
    expect(text).toContain('\n  "format": "lifeboard-backup"')
    expect(text.endsWith('\n')).toBe(true)
    expect(text).not.toContain('\r\n')
    expect(text.charCodeAt(0)).not.toBe(0xfeff)
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('NaN')
    expect(text).not.toContain('Infinity')
    expect(byteLength).toBe(new TextEncoder().encode(text).byteLength)
    expect(byteLength).toBeGreaterThan(text.length)
  })

  it('uses the fixed filename and MIME contract', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.download.filename).toBe('lifeboard-backup-v1-2026-07-12.json')
    expect(result.data.download.mimeType).toBe(PORTABLE_BACKUP_MIME_TYPE)
  })

  it('does not export excluded key names or canary values', () => {
    const { result } = buildExport(allPortableAndExcludedStorage)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const text = result.data.download.text
    for (const forbidden of [
      'lifeboard.weather.forecastCache.v1',
      'lifeboard.weather.provider',
      'lifeboard.weather.caiyunToken',
      'lifeboard.weather.amapKey',
      'lifeboard.weather.autoLocationOnHome',
      '__lifeboard_weather_runtime_debug',
      'EXCLUDED_FORECAST_CACHE',
      'EXCLUDED_PROVIDER_VALUE',
      'EXCLUDED_CAIYUN_TOKEN',
      'EXCLUDED_AMAP_KEY',
      'EXCLUDED_AUTO_LOCATION',
      'EXCLUDED_DEBUG_FLAG',
    ]) {
      expect(text).not.toContain(forbidden)
    }
  })

  it('does not expose raw portable storage key names', () => {
    const { result } = buildExport()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    for (const storageKey of createPortableRegistryPlan().entries.map((entry) => entry.storageKey)) {
      expect(result.data.download.text).not.toContain(storageKey)
    }
  })
})
