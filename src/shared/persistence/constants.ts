import type { PersistenceModuleId } from './types'

export const LIFEBOARD_BACKUP_FORMAT = 'lifeboard-backup' as const
export const LIFEBOARD_BACKUP_SCHEMA_VERSION = 1 as const

export const SETTINGS_PORTABLE_SCHEMA_VERSION = 1 as const
export const WEATHER_PORTABLE_SCHEMA_VERSION = 1 as const
export const TODOS_PORTABLE_SCHEMA_VERSION = 1 as const
export const BOOKMARKS_PORTABLE_SCHEMA_VERSION = 1 as const

export const MAX_PORTABLE_BACKUP_BYTES = 1_048_576
export const PORTABLE_BACKUP_MIME_TYPE = 'application/json;charset=utf-8' as const
export const PORTABLE_BACKUP_FILENAME_PREFIX = 'lifeboard-backup-v1' as const

export const PORTABLE_MODULE_IDS = Object.freeze([
  'settings',
  'weather',
  'todos',
  'bookmarks',
] as const satisfies readonly PersistenceModuleId[])

// Legacy backup roots use `version`; the new portable root uses `schemaVersion`.
export const LEGACY_BACKUP_ROOT_VERSION_1 = 1 as const
export const LEGACY_BACKUP_ROOT_VERSION_2 = 2 as const
export const SUPPORTED_LEGACY_BACKUP_VERSIONS = Object.freeze([
  LEGACY_BACKUP_ROOT_VERSION_1,
  LEGACY_BACKUP_ROOT_VERSION_2,
] as const)

export const PRODUCT_STORAGE_KEYS = Object.freeze([
  'lifeboard-theme',
  'lifeboard.language',
  'lifeboard-weather-location',
  'lifeboard.weather.forecastCache.v1',
  'lifeboard-weather-favorite-cities',
  'lifeboard.weather.provider',
  'lifeboard.weather.caiyunToken',
  'lifeboard.weather.amapKey',
  'lifeboard.weather.autoLocationOnHome',
  'lifeboard.todos',
  'lifeboard.bookmarks',
] as const)

export const DEVELOPMENT_ONLY_STORAGE_KEYS = Object.freeze([
  '__lifeboard_weather_runtime_debug',
] as const)
