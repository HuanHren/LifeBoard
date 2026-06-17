import { BOOKMARKS_STORAGE_VERSION } from '@/modules/bookmarks/constants/bookmarks'
import type { BookmarksStorageEnvelope } from '@/modules/bookmarks/types/bookmarks'
import { isBookmark } from '@/modules/bookmarks/utils/bookmarkValidation'
import { SETTINGS_BACKUP_VERSION } from '@/modules/settings/constants/settings'
import type {
  LifeBoardBackupV1,
  SettingsResult,
} from '@/modules/settings/types/settings'
import { TODOS_STORAGE_VERSION } from '@/modules/todos/constants/todos'
import type { TodosStorageEnvelope } from '@/modules/todos/types/todos'
import { isCountdown, isTask } from '@/modules/todos/utils/todoValidation'
import { isWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'
import type { ThemeMode } from '@/shared/types/theme'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(record: Record<string, unknown>, keys: string[]) {
  const recordKeys = Object.keys(record)
  return recordKeys.length === keys.length && keys.every((key) => key in record)
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function isTodosEnvelope(value: unknown): value is TodosStorageEnvelope {
  return (
    isRecord(value) &&
    hasExactKeys(value, ['version', 'tasks', 'countdowns']) &&
    value.version === TODOS_STORAGE_VERSION &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isTask) &&
    Array.isArray(value.countdowns) &&
    value.countdowns.every(isCountdown)
  )
}

function isBookmarksEnvelope(value: unknown): value is BookmarksStorageEnvelope {
  return (
    isRecord(value) &&
    hasExactKeys(value, ['version', 'bookmarks']) &&
    value.version === BOOKMARKS_STORAGE_VERSION &&
    Array.isArray(value.bookmarks) &&
    value.bookmarks.every(isBookmark)
  )
}

export function validateLifeBoardBackup(
  value: unknown,
): SettingsResult<LifeBoardBackupV1> {
  if (!isRecord(value) || !hasExactKeys(value, [
    'version',
    'exportedAt',
    'preferences',
    'weather',
    'todos',
    'bookmarks',
  ])) {
    return { ok: false, error: 'settings.error.backupIncomplete' }
  }

  if (value.version !== SETTINGS_BACKUP_VERSION) {
    return {
      ok: false,
      error: 'settings.error.backupVersionUnsupported',
    }
  }

  if (!isIsoTimestamp(value.exportedAt)) {
    return { ok: false, error: 'settings.error.backupDateInvalid' }
  }

  if (
    !isRecord(value.preferences) ||
    !hasExactKeys(value.preferences, ['themeMode']) ||
    !isThemeMode(value.preferences.themeMode)
  ) {
    return { ok: false, error: 'settings.error.backupThemeInvalid' }
  }

  if (
    !isRecord(value.weather) ||
    !hasExactKeys(value.weather, ['selectedLocation']) ||
    (value.weather.selectedLocation !== null &&
      !isWeatherLocation(value.weather.selectedLocation))
  ) {
    return { ok: false, error: 'settings.error.backupWeatherInvalid' }
  }

  if (!isTodosEnvelope(value.todos)) {
    return { ok: false, error: 'settings.error.backupTodosInvalid' }
  }

  if (!isBookmarksEnvelope(value.bookmarks)) {
    return { ok: false, error: 'settings.error.backupBookmarksInvalid' }
  }

  return { ok: true, data: value as unknown as LifeBoardBackupV1 }
}
