import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
} from './constants'
import type { PersistenceStorageAdapter, ValidationModule } from './contracts'
import { createPortableRegistryPlan } from './plans'
import {
  createPortableExportError,
  isCanonicalUtcTimestamp,
  isLifeBoardLocale,
  isThemeMode,
  mapPortableBookmarksEnvelope,
  mapPortableTodosEnvelope,
  mapPortableWeatherFavoritesEnvelope,
  mapPortableWeatherLocation,
  validatePortableBackupV1,
  type PortableExportResult,
} from './portableExportValidation'
import {
  createPortableBackupDownload,
  type PortableBackupDownloadDescriptor,
} from './portableSerialization'
import type {
  LifeBoardLocale,
  PersistenceEntryId,
  PortableBackupV1,
  PortableBookmarksPayloadV1,
  PortableTodosPayloadV1,
  PortableWeatherLocationV1,
  PortableWeatherPayloadV1,
  ThemeMode,
} from './types'

export interface PortableExportDefaults {
  readonly themeMode?: ThemeMode
  readonly language?: LifeBoardLocale
}

export interface BuildPortableBackupV1Options {
  readonly storage: PersistenceStorageAdapter
  readonly exportedAt?: string
  readonly clock?: () => Date
  readonly appVersion?: string
  readonly defaults?: PortableExportDefaults
}

export interface PortableExportSource {
  readonly themeMode: ThemeMode
  readonly language: LifeBoardLocale
  readonly weather: PortableWeatherPayloadV1
  readonly todos: PortableTodosPayloadV1
  readonly bookmarks: PortableBookmarksPayloadV1
}

export interface PortableBackupExport {
  readonly backup: PortableBackupV1
  readonly download: PortableBackupDownloadDescriptor
}

const expectedPortableEntryIds = Object.freeze([
  'theme-mode',
  'language',
  'todos',
  'bookmarks',
  'weather-location',
  'weather-favorite-cities',
] as const satisfies readonly PersistenceEntryId[])

const moduleByEntryId: Readonly<Record<PersistenceEntryId, ValidationModule>> = Object.freeze({
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

const entryPath: Readonly<Record<(typeof expectedPortableEntryIds)[number], string>> =
  Object.freeze({
    'theme-mode': '/data/settings/payload/themeMode',
    language: '/data/settings/payload/language',
    'weather-location': '/data/weather/payload/selectedLocation',
    'weather-favorite-cities': '/data/weather/payload/favoriteCities',
    todos: '/data/todos/payload',
    bookmarks: '/data/bookmarks/payload',
  })

const parseStorageJson = (
  raw: string,
  entryId: (typeof expectedPortableEntryIds)[number],
): PortableExportResult<unknown> => {
  try {
    return { ok: true, data: JSON.parse(raw) as unknown }
  } catch {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_STORAGE_PARSE_FAILED',
        moduleByEntryId[entryId],
        entryPath[entryId],
        'Portable storage contains invalid JSON.',
        { details: { entryId } },
      ),
    }
  }
}

const readRegistryValues = (
  storage: PersistenceStorageAdapter,
): PortableExportResult<ReadonlyMap<PersistenceEntryId, string | null>> => {
  const plan = createPortableRegistryPlan()
  const actualIds = plan.entries.map((entry) => entry.id)
  if (
    actualIds.length !== expectedPortableEntryIds.length ||
    expectedPortableEntryIds.some((id) => !actualIds.includes(id))
  ) {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_DATA_INVALID',
        'root',
        '/data',
        'Portable registry scope does not match the export contract.',
      ),
    }
  }

  const values = new Map<PersistenceEntryId, string | null>()
  for (const entry of plan.entries) {
    const result = storage.read(entry.storageKey)
    if (!result.ok) {
      return {
        ok: false,
        error: createPortableExportError(
          'PORTABLE_STORAGE_READ_FAILED',
          moduleByEntryId[entry.id],
          entryPath[entry.id as (typeof expectedPortableEntryIds)[number]],
          'Portable storage could not be read.',
          { recoverable: true, details: { entryId: entry.id } },
        ),
      }
    }
    values.set(entry.id, result.value)
  }
  return { ok: true, data: values }
}

export const readPortableExportSource = (
  storage: PersistenceStorageAdapter,
  defaults: PortableExportDefaults = {},
): PortableExportResult<PortableExportSource> => {
  const stored = readRegistryValues(storage)
  if (!stored.ok) return stored

  const themeMode = stored.data.get('theme-mode') ?? defaults.themeMode ?? 'system'
  if (!isThemeMode(themeMode)) {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_DATA_INVALID',
        'settings',
        entryPath['theme-mode'],
        'Stored theme preference is invalid.',
      ),
    }
  }

  const language = stored.data.get('language') ?? defaults.language ?? 'en-US'
  if (!isLifeBoardLocale(language)) {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_DATA_INVALID',
        'settings',
        entryPath.language,
        'Stored language preference is invalid.',
      ),
    }
  }

  let selectedLocation: PortableWeatherLocationV1 | null = null
  const rawLocation = stored.data.get('weather-location')
  if (rawLocation !== null && rawLocation !== undefined) {
    const parsed = parseStorageJson(rawLocation, 'weather-location')
    if (!parsed.ok) return parsed
    const mapped = mapPortableWeatherLocation(parsed.data)
    if (!mapped.ok) return mapped
    selectedLocation = mapped.data
  }

  let favoriteCities: PortableWeatherPayloadV1['favoriteCities'] = Object.freeze([])
  const rawFavorites = stored.data.get('weather-favorite-cities')
  if (rawFavorites !== null && rawFavorites !== undefined) {
    const parsed = parseStorageJson(rawFavorites, 'weather-favorite-cities')
    if (!parsed.ok) return parsed
    const mapped = mapPortableWeatherFavoritesEnvelope(parsed.data)
    if (!mapped.ok) return mapped
    favoriteCities = mapped.data
  }

  let todos: PortableTodosPayloadV1 = Object.freeze({
    tasks: Object.freeze([]),
    countdowns: Object.freeze([]),
  })
  const rawTodos = stored.data.get('todos')
  if (rawTodos !== null && rawTodos !== undefined) {
    const parsed = parseStorageJson(rawTodos, 'todos')
    if (!parsed.ok) return parsed
    const mapped = mapPortableTodosEnvelope(parsed.data)
    if (!mapped.ok) return mapped
    todos = mapped.data
  }

  let bookmarks: PortableBookmarksPayloadV1 = Object.freeze({ bookmarks: Object.freeze([]) })
  const rawBookmarks = stored.data.get('bookmarks')
  if (rawBookmarks !== null && rawBookmarks !== undefined) {
    const parsed = parseStorageJson(rawBookmarks, 'bookmarks')
    if (!parsed.ok) return parsed
    const mapped = mapPortableBookmarksEnvelope(parsed.data)
    if (!mapped.ok) return mapped
    bookmarks = mapped.data
  }

  return {
    ok: true,
    data: Object.freeze({
      themeMode,
      language,
      weather: Object.freeze({ selectedLocation, favoriteCities }),
      todos,
      bookmarks,
    }),
  }
}

const resolveExportedAt = (
  options: BuildPortableBackupV1Options,
): PortableExportResult<string> => {
  try {
    const exportedAt =
      options.exportedAt ?? (options.clock ? options.clock() : new Date()).toISOString()
    return isCanonicalUtcTimestamp(exportedAt)
      ? { ok: true, data: exportedAt }
      : {
          ok: false,
          error: createPortableExportError(
            'PORTABLE_DATA_INVALID',
            'root',
            '/exportedAt',
            'Portable backup export time must be canonical UTC ISO 8601.',
          ),
        }
  } catch {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_DATA_INVALID',
        'root',
        '/exportedAt',
        'Portable backup export time could not be resolved.',
      ),
    }
  }
}

export const buildPortableBackupV1 = (
  options: BuildPortableBackupV1Options,
): PortableExportResult<PortableBackupV1> => {
  const exportedAt = resolveExportedAt(options)
  if (!exportedAt.ok) return exportedAt

  const source = readPortableExportSource(options.storage, options.defaults)
  if (!source.ok) return source

  const appVersion = options.appVersion?.trim() || 'unknown'
  const backup = Object.freeze({
    format: LIFEBOARD_BACKUP_FORMAT,
    schemaVersion: LIFEBOARD_BACKUP_SCHEMA_VERSION,
    exportedAt: exportedAt.data,
    app: Object.freeze({ name: 'LifeBoard' as const, version: appVersion }),
    locale: source.data.language,
    data: Object.freeze({
      settings: Object.freeze({
        schemaVersion: SETTINGS_PORTABLE_SCHEMA_VERSION,
        payload: Object.freeze({
          themeMode: source.data.themeMode,
          language: source.data.language,
        }),
      }),
      weather: Object.freeze({
        schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION,
        payload: source.data.weather,
      }),
      todos: Object.freeze({
        schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION,
        payload: source.data.todos,
      }),
      bookmarks: Object.freeze({
        schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION,
        payload: source.data.bookmarks,
      }),
    }),
  } satisfies PortableBackupV1)

  return validatePortableBackupV1(backup)
}

export const createPortableBackupExport = (
  options: BuildPortableBackupV1Options,
): PortableExportResult<PortableBackupExport> => {
  const backup = buildPortableBackupV1(options)
  if (!backup.ok) return backup
  const download = createPortableBackupDownload(backup.data)
  if (!download.ok) return download
  return {
    ok: true,
    data: Object.freeze({ backup: backup.data, download: download.data }),
  }
}
