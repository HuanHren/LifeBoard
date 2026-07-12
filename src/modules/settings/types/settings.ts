import type { BookmarksStorageEnvelope } from '@/modules/bookmarks/types/bookmarks'
import type { TodosStorageEnvelope } from '@/modules/todos/types/todos'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type { WeatherFavoriteCity } from '@/modules/weather/types/weatherFavorites'
import type { ThemeMode } from '@/shared/types/theme'
import type { DetectedBackupFormat, LifeBoardLocale } from '@/shared/persistence'

export interface LifeBoardBackupV1 {
  version: 1
  exportedAt: string
  preferences: {
    themeMode: ThemeMode
  }
  weather: {
    selectedLocation: WeatherLocation | null
  }
  todos: TodosStorageEnvelope
  bookmarks: BookmarksStorageEnvelope
}

export interface LifeBoardBackupV2 {
  version: 2
  exportedAt: string
  preferences: {
    themeMode: ThemeMode
  }
  weather: {
    selectedLocation: WeatherLocation | null
    favoriteCities: WeatherFavoriteCity[]
  }
  todos: TodosStorageEnvelope
  bookmarks: BookmarksStorageEnvelope
}

export type LifeBoardBackup = LifeBoardBackupV1 | LifeBoardBackupV2

export interface SettingsDataSnapshot {
  themeMode: ThemeMode
  weatherLocation: WeatherLocation | null
  weatherFavoriteCities: WeatherFavoriteCity[]
  todos: TodosStorageEnvelope
  bookmarks: BookmarksStorageEnvelope
}

export interface BackupImportSummaryData {
  exportedAt: string
  sourceFormat: DetectedBackupFormat
  mode: 'replace'
  themeMode: ThemeMode
  language: LifeBoardLocale
  themeWillChange: boolean
  languageWillChange: boolean
  hasSavedLocation: boolean
  favoriteCityCount: number
  taskCount: number
  countdownCount: number
  bookmarkCount: number
  nonPortableWeatherPreserved: true
  mergeSupported: false
}

export type SettingsClearTarget = 'weather' | 'todos' | 'bookmarks' | 'all'

export type SettingsResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }
