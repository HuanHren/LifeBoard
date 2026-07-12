import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
} from './constants'
import {
  isCanonicalUtcTimestamp,
  isThemeMode,
  mapPortableBookmarksEnvelope,
  mapPortableTodosEnvelope,
  mapPortableWeatherFavoritesEnvelope,
  mapPortableWeatherLocation,
  validatePortableBackupV1,
} from './portableExportValidation'
import {
  hasExactImportKeys,
  importFailure,
  importSuccess,
  isPlainImportRecord,
  type PortableImportResult,
} from './portableImportValidation'
import type { LifeBoardLocale, PortableBackupV1, PortableWeatherLocationV1 } from './types'

export interface LegacyAdapterContext {
  readonly currentLanguage: LifeBoardLocale
}

const legacyRootKeys = ['version', 'exportedAt', 'preferences', 'weather', 'todos', 'bookmarks'] as const

const adaptLegacyBackup = (
  input: unknown,
  expectedVersion: 1 | 2,
  context: LegacyAdapterContext,
): PortableImportResult<PortableBackupV1> => {
  if (
    !isPlainImportRecord(input) ||
    !hasExactImportKeys(input, legacyRootKeys) ||
    input.version !== expectedVersion ||
    !isCanonicalUtcTimestamp(input.exportedAt)
  ) {
    return importFailure('LEGACY_ADAPTER_FAILED', 'root', '/', 'Legacy backup root is invalid.')
  }

  if (
    !isPlainImportRecord(input.preferences) ||
    !hasExactImportKeys(input.preferences, ['themeMode']) ||
    !isThemeMode(input.preferences.themeMode)
  ) {
    return importFailure('LEGACY_ADAPTER_FAILED', 'settings', '/preferences', 'Legacy Settings payload is invalid.')
  }

  const expectedWeatherKeys = expectedVersion === 1
    ? ['selectedLocation'] as const
    : ['selectedLocation', 'favoriteCities'] as const
  if (!isPlainImportRecord(input.weather) || !hasExactImportKeys(input.weather, expectedWeatherKeys)) {
    return importFailure('LEGACY_ADAPTER_FAILED', 'weather', '/weather', 'Legacy Weather payload is invalid.')
  }

  let selectedLocation: PortableWeatherLocationV1 | null = null
  if (input.weather.selectedLocation !== null) {
    const location = mapPortableWeatherLocation(input.weather.selectedLocation, '/weather/selectedLocation', true)
    if (!location.ok) {
      return importFailure('LEGACY_ADAPTER_FAILED', 'weather', '/weather/selectedLocation', 'Legacy Weather location is invalid.')
    }
    selectedLocation = location.data
  }

  let favoriteCities: PortableBackupV1['data']['weather']['payload']['favoriteCities'] = Object.freeze([])
  if (expectedVersion === 2) {
    const favorites = mapPortableWeatherFavoritesEnvelope({
      version: 1,
      favoriteCities: input.weather.favoriteCities,
    }, true)
    if (!favorites.ok) {
      return importFailure('LEGACY_ADAPTER_FAILED', 'weather', '/weather/favoriteCities', 'Legacy favorite cities are invalid.')
    }
    favoriteCities = favorites.data
  }

  const todos = mapPortableTodosEnvelope(input.todos, true)
  if (!todos.ok) {
    return importFailure('LEGACY_ADAPTER_FAILED', 'todos', '/todos', 'Legacy Todos payload is invalid.')
  }
  const bookmarks = mapPortableBookmarksEnvelope(input.bookmarks, true)
  if (!bookmarks.ok) {
    return importFailure('LEGACY_ADAPTER_FAILED', 'bookmarks', '/bookmarks', 'Legacy Bookmarks payload is invalid.')
  }

  const candidate = Object.freeze({
    format: LIFEBOARD_BACKUP_FORMAT,
    schemaVersion: LIFEBOARD_BACKUP_SCHEMA_VERSION,
    exportedAt: input.exportedAt,
    app: Object.freeze({ name: 'LifeBoard' as const, version: `legacy-v${expectedVersion}` }),
    locale: context.currentLanguage,
    data: Object.freeze({
      settings: Object.freeze({
        schemaVersion: SETTINGS_PORTABLE_SCHEMA_VERSION,
        payload: Object.freeze({
          themeMode: input.preferences.themeMode,
          language: context.currentLanguage,
        }),
      }),
      weather: Object.freeze({
        schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION,
        payload: Object.freeze({ selectedLocation, favoriteCities }),
      }),
      todos: Object.freeze({
        schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION,
        payload: todos.data,
      }),
      bookmarks: Object.freeze({
        schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION,
        payload: bookmarks.data,
      }),
    }),
  } satisfies PortableBackupV1)

  const validation = validatePortableBackupV1(candidate)
  return validation.ok
    ? importSuccess(validation.data)
    : importFailure('LEGACY_ADAPTER_FAILED', validation.error.module, validation.error.path, 'Legacy adapter output failed current validation.')
}

export const adaptLegacyBackupV1 = (
  input: unknown,
  context: LegacyAdapterContext,
) => adaptLegacyBackup(input, 1, context)

export const adaptLegacyBackupV2 = (
  input: unknown,
  context: LegacyAdapterContext,
) => adaptLegacyBackup(input, 2, context)
