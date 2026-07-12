import {
  BOOKMARKS_STORAGE_KEY,
  BOOKMARKS_STORAGE_VERSION,
} from '@/modules/bookmarks/constants/bookmarks'
import { loadBookmarksStorage } from '@/modules/bookmarks/services/bookmarksStorage'
import type {
  SettingsClearTarget,
  SettingsDataSnapshot,
  SettingsResult,
} from '@/modules/settings/types/settings'
import {
  TODOS_STORAGE_KEY,
  TODOS_STORAGE_VERSION,
} from '@/modules/todos/constants/todos'
import { loadTodosStorage } from '@/modules/todos/services/todosStorage'
import {
  WEATHER_CAIYUN_TOKEN_STORAGE_KEY,
  WEATHER_AMAP_KEY_STORAGE_KEY,
  WEATHER_AUTO_LOCATION_HOME_STORAGE_KEY,
  WEATHER_FORECAST_CACHE_STORAGE_KEY,
  WEATHER_FAVORITES_STORAGE_KEY,
  WEATHER_PROVIDER_STORAGE_KEY,
  WEATHER_STORAGE_KEY,
} from '@/modules/weather/constants/weather'
import { loadWeatherFavoritesStorage } from '@/modules/weather/services/weatherFavoritesStorage'
import { parseWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'
import type { ThemeMode } from '@/shared/types/theme'
import {
  createDataPortabilityError,
  createPortableBackupExport,
  createPortableExportError,
  createRawStorageAdapter,
  executeReplaceImport,
  preparePortableImportFile,
  type ImportHydrationHooks,
  type LifeBoardLocale,
  type PortableBackupDownloadDescriptor,
  type PortableBackupExport,
  type PortableExportResult,
  type PortableImportResult,
  type PreparedPortableImport,
} from '@/shared/persistence'
import { THEME_STORAGE_KEY } from '@/stores/theme'

const OWNED_STORAGE_KEYS = [
  THEME_STORAGE_KEY,
  WEATHER_STORAGE_KEY,
  WEATHER_FORECAST_CACHE_STORAGE_KEY,
  WEATHER_FAVORITES_STORAGE_KEY,
  WEATHER_PROVIDER_STORAGE_KEY,
  WEATHER_CAIYUN_TOKEN_STORAGE_KEY,
  WEATHER_AMAP_KEY_STORAGE_KEY,
  WEATHER_AUTO_LOCATION_HOME_STORAGE_KEY,
  TODOS_STORAGE_KEY,
  BOOKMARKS_STORAGE_KEY,
] as const

type OwnedStorageKey = (typeof OWNED_STORAGE_KEYS)[number]

function storageErrorMessage() {
  return 'settings.error.storageUnavailable'
}

function getStorage(): SettingsResult<Storage> {
  if (typeof window === 'undefined') {
    return { ok: false, error: storageErrorMessage() }
  }

  try {
    window.localStorage.length
    return { ok: true, data: window.localStorage }
  } catch {
    return { ok: false, error: storageErrorMessage() }
  }
}

function readThemeMode(storage: Storage): SettingsResult<ThemeMode> {
  const stored = storage.getItem(THEME_STORAGE_KEY)

  if (stored === null) return { ok: true, data: 'system' }
  if (stored === 'system' || stored === 'light' || stored === 'dark') {
    return { ok: true, data: stored }
  }

  return {
    ok: false,
    error: 'settings.error.themeInvalid',
  }
}

function readWeatherLocation(storage: Storage) {
  const stored = storage.getItem(WEATHER_STORAGE_KEY)
  if (stored === null) return { ok: true, data: null } as const

  try {
    const parsed: unknown = JSON.parse(stored)
    const location = parseWeatherLocation(parsed)

    return location
      ? ({ ok: true, data: location } as const)
      : ({
          ok: false,
          error: 'settings.error.weatherInvalid',
        } as const)
  } catch {
    return {
      ok: false,
      error: 'settings.error.weatherInvalidJson',
    } as const
  }
}

function readWeatherFavorites() {
  const result = loadWeatherFavoritesStorage()

  if (result.ok) {
    return { ok: true, data: result.data?.favoriteCities ?? [] } as const
  }

  return {
    ok: false,
    error: 'settings.error.weatherFavoritesInvalid',
  } as const
}

export function loadSettingsSnapshot(): SettingsResult<SettingsDataSnapshot> {
  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  try {
    const themeResult = readThemeMode(storageResult.data)
    if (!themeResult.ok) return themeResult

    const weatherResult = readWeatherLocation(storageResult.data)
    if (!weatherResult.ok) return weatherResult

    const weatherFavoritesResult = readWeatherFavorites()
    if (!weatherFavoritesResult.ok) return weatherFavoritesResult

    const todosResult = loadTodosStorage()
    if (!todosResult.ok) return { ok: false, error: todosResult.error }

    const bookmarksResult = loadBookmarksStorage()
    if (!bookmarksResult.ok) return { ok: false, error: bookmarksResult.error }

    return {
      ok: true,
      data: {
        themeMode: themeResult.data,
        weatherLocation: weatherResult.data,
        weatherFavoriteCities: weatherFavoritesResult.data,
        todos: todosResult.data ?? {
          version: TODOS_STORAGE_VERSION,
          tasks: [],
          countdowns: [],
        },
        bookmarks: bookmarksResult.data ?? {
          version: BOOKMARKS_STORAGE_VERSION,
          bookmarks: [],
        },
      },
    }
  } catch {
    return { ok: false, error: storageErrorMessage() }
  }
}

export function createLifeBoardBackup(defaults: {
  readonly themeMode: ThemeMode
  readonly language: LifeBoardLocale
}): PortableExportResult<PortableBackupExport> {
  const storageResult = getStorage()
  if (!storageResult.ok) {
    return {
      ok: false,
      error: createPortableExportError(
        'PORTABLE_STORAGE_READ_FAILED',
        'root',
        null,
        'Browser storage is unavailable for portable export.',
        { recoverable: true },
      ),
    }
  }
  return createPortableBackupExport({
    storage: createRawStorageAdapter(storageResult.data),
    appVersion: '0.0.0',
    defaults,
  })
}

export function downloadLifeBoardBackup(download: PortableBackupDownloadDescriptor) {
  const blob = new Blob([download.text], {
    type: download.mimeType,
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = download.filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function readBackupFile(
  file: File,
  current: { readonly language: LifeBoardLocale; readonly themeMode: ThemeMode },
): Promise<PortableImportResult<PreparedPortableImport>> {
  return preparePortableImportFile(file, {
    currentLanguage: current.language,
    currentThemeMode: current.themeMode,
  })
}

function captureStorage(storage: Storage) {
  return new Map<OwnedStorageKey, string | null>(
    OWNED_STORAGE_KEYS.map((key) => [key, storage.getItem(key)]),
  )
}

function restoreStorage(
  storage: Storage,
  snapshot: Map<OwnedStorageKey, string | null>,
) {
  for (const [key, value] of snapshot) {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, value)
  }
}

function runStorageTransaction(
  operation: (storage: Storage) => void,
): SettingsResult {
  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  let snapshot: Map<OwnedStorageKey, string | null>

  try {
    snapshot = captureStorage(storageResult.data)
  } catch {
    return { ok: false, error: storageErrorMessage() }
  }

  try {
    operation(storageResult.data)
    return { ok: true, data: undefined }
  } catch {
    try {
      restoreStorage(storageResult.data, snapshot)
      return {
        ok: false,
        error: 'settings.error.storageOperationRestored',
      }
    } catch {
      return {
        ok: false,
        error: 'settings.error.storageOperationRestoreFailed',
      }
    }
  }
}

export function applyLifeBoardBackup(
  prepared: PreparedPortableImport,
  hydration: ImportHydrationHooks,
) {
  const storageResult = getStorage()
  if (!storageResult.ok) {
    return {
      ok: false as const,
      error: createDataPortabilityError(
        'SNAPSHOT_FAILED',
        'transaction',
        null,
        'Browser storage is unavailable for portable import.',
        { recoverable: true, severity: 'error' },
      ),
    }
  }
  return executeReplaceImport({
    storage: createRawStorageAdapter(storageResult.data),
    prepared,
    hydration,
  })
}

export function clearLifeBoardData(target: SettingsClearTarget): SettingsResult {
  return runStorageTransaction((storage) => {
    if (target === 'weather' || target === 'all') {
      storage.removeItem(WEATHER_STORAGE_KEY)
      storage.removeItem(WEATHER_FORECAST_CACHE_STORAGE_KEY)
      storage.removeItem(WEATHER_FAVORITES_STORAGE_KEY)
    }

    if (target === 'todos' || target === 'all') {
      storage.removeItem(TODOS_STORAGE_KEY)
    }

    if (target === 'bookmarks' || target === 'all') {
      storage.removeItem(BOOKMARKS_STORAGE_KEY)
    }

    if (target === 'all') {
      storage.removeItem(THEME_STORAGE_KEY)
      storage.removeItem(WEATHER_PROVIDER_STORAGE_KEY)
      storage.removeItem(WEATHER_CAIYUN_TOKEN_STORAGE_KEY)
      storage.removeItem(WEATHER_AMAP_KEY_STORAGE_KEY)
      storage.removeItem(WEATHER_AUTO_LOCATION_HOME_STORAGE_KEY)
    }
  })
}
