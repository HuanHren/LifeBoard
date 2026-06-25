import {
  BOOKMARKS_STORAGE_KEY,
  BOOKMARKS_STORAGE_VERSION,
} from '@/modules/bookmarks/constants/bookmarks'
import { loadBookmarksStorage } from '@/modules/bookmarks/services/bookmarksStorage'
import {
  SETTINGS_BACKUP_FILENAME_PREFIX,
  SETTINGS_BACKUP_VERSION,
  SETTINGS_MAX_IMPORT_BYTES,
} from '@/modules/settings/constants/settings'
import type {
  LifeBoardBackup,
  LifeBoardBackupV2,
  SettingsClearTarget,
  SettingsDataSnapshot,
  SettingsResult,
} from '@/modules/settings/types/settings'
import { validateLifeBoardBackup } from '@/modules/settings/utils/settingsBackupValidation'
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
  WEATHER_FAVORITES_STORAGE_VERSION,
  WEATHER_PROVIDER_STORAGE_KEY,
  WEATHER_STORAGE_KEY,
} from '@/modules/weather/constants/weather'
import { loadWeatherFavoritesStorage } from '@/modules/weather/services/weatherFavoritesStorage'
import { parseWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'
import type { ThemeMode } from '@/shared/types/theme'
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

export function createLifeBoardBackup(
  snapshot: SettingsDataSnapshot,
): LifeBoardBackupV2 {
  return {
    version: SETTINGS_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    preferences: {
      themeMode: snapshot.themeMode,
    },
    weather: {
      selectedLocation: snapshot.weatherLocation,
      favoriteCities: snapshot.weatherFavoriteCities,
    },
    todos: snapshot.todos,
    bookmarks: snapshot.bookmarks,
  }
}

export function downloadLifeBoardBackup(backup: LifeBoardBackup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${SETTINGS_BACKUP_FILENAME_PREFIX}-${backup.exportedAt.slice(0, 10)}.json`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function readBackupFile(
  file: File,
): Promise<SettingsResult<LifeBoardBackup>> {
  if (file.size > SETTINGS_MAX_IMPORT_BYTES) {
    return {
      ok: false,
      error: 'settings.error.backupTooLarge',
    }
  }

  let text: string

  try {
    text = await file.text()
  } catch {
    return { ok: false, error: 'settings.error.fileUnreadable' }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    return { ok: false, error: 'settings.error.fileInvalidJson' }
  }

  return validateLifeBoardBackup(parsed)
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

export function applyLifeBoardBackup(backup: LifeBoardBackup): SettingsResult {
  return runStorageTransaction((storage) => {
    storage.setItem(THEME_STORAGE_KEY, backup.preferences.themeMode)

    if (backup.weather.selectedLocation === null) {
      storage.removeItem(WEATHER_STORAGE_KEY)
    } else {
      storage.setItem(
        WEATHER_STORAGE_KEY,
        JSON.stringify(backup.weather.selectedLocation),
      )
    }

    storage.setItem(
      WEATHER_FAVORITES_STORAGE_KEY,
      JSON.stringify({
        version: WEATHER_FAVORITES_STORAGE_VERSION,
        favoriteCities: backup.version === 2 ? backup.weather.favoriteCities : [],
      }),
    )
    storage.setItem(TODOS_STORAGE_KEY, JSON.stringify(backup.todos))
    storage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(backup.bookmarks))
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
