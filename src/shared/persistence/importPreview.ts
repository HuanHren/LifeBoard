import type { DetectedBackupFormat } from './portableImportValidation'
import type { LifeBoardLocale, PortableBackupV1, ThemeMode } from './types'

export interface PortableImportPreview {
  readonly sourceFormat: DetectedBackupFormat
  readonly exportedAt: string
  readonly mode: 'replace'
  readonly taskCount: number
  readonly countdownCount: number
  readonly bookmarkCount: number
  readonly favoriteCityCount: number
  readonly hasSavedLocation: boolean
  readonly themeMode: ThemeMode
  readonly language: LifeBoardLocale
  readonly themeWillChange: boolean
  readonly languageWillChange: boolean
  readonly nonPortableWeatherPreserved: true
  readonly mergeSupported: false
}

export const createPortableImportPreview = (
  backup: PortableBackupV1,
  sourceFormat: DetectedBackupFormat,
  current: { readonly themeMode: ThemeMode; readonly language: LifeBoardLocale },
): PortableImportPreview => Object.freeze({
  sourceFormat,
  exportedAt: backup.exportedAt,
  mode: 'replace',
  taskCount: backup.data.todos.payload.tasks.length,
  countdownCount: backup.data.todos.payload.countdowns.length,
  bookmarkCount: backup.data.bookmarks.payload.bookmarks.length,
  favoriteCityCount: backup.data.weather.payload.favoriteCities.length,
  hasSavedLocation: backup.data.weather.payload.selectedLocation !== null,
  themeMode: backup.data.settings.payload.themeMode,
  language: backup.data.settings.payload.language,
  themeWillChange: current.themeMode !== backup.data.settings.payload.themeMode,
  languageWillChange: current.language !== backup.data.settings.payload.language,
  nonPortableWeatherPreserved: true,
  mergeSupported: false,
})
