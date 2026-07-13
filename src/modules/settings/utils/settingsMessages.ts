import { translationKeys } from '@/i18n/keys'
import type { TranslationKey } from '@/i18n/keys'
import type { TranslationParameters } from '@/i18n/types'
import type {
  ClearOperationErrorCode,
  DataPortabilityErrorCode,
} from '@/shared/persistence'

type SettingsTranslate = (
  key: TranslationKey,
  parameters?: TranslationParameters,
) => string

const errorKeys: Record<string, TranslationKey> = {
  'Browser storage is unavailable. No LifeBoard data was changed.':
    'settings.error.storageUnavailable',
  'The saved theme preference is invalid. It was left unchanged for recovery.':
    'settings.error.themeInvalid',
  'The saved weather location is invalid. It was left unchanged for recovery.':
    'settings.error.weatherInvalid',
  'The saved weather location contains invalid JSON. It was left unchanged for recovery.':
    'settings.error.weatherInvalidJson',
  'This backup is larger than 1MB. Choose a smaller LifeBoard JSON backup.':
    'settings.error.backupTooLarge',
  'The selected file could not be read.':
    'settings.error.fileUnreadable',
  'The selected file does not contain valid JSON.':
    'settings.error.fileInvalidJson',
  'The storage operation failed. Existing LifeBoard data was restored.':
    'settings.error.storageOperationRestored',
  'The storage operation failed and the browser could not fully restore the previous data.':
    'settings.error.storageOperationRestoreFailed',
  'This file is not a complete LifeBoard backup.':
    'settings.error.backupIncomplete',
  'The backup export date is missing or invalid.':
    'settings.error.backupDateInvalid',
  'The backup contains an invalid theme preference.':
    'settings.error.backupThemeInvalid',
  'The backup contains an invalid weather location.':
    'settings.error.backupWeatherInvalid',
  'The backup contains invalid Todos data.':
    'settings.error.backupTodosInvalid',
  'The backup contains invalid Bookmarks data.':
    'settings.error.backupBookmarksInvalid',
  'Local storage is unavailable. Your planning changes cannot be saved in this browser.':
    'settings.error.planningStorageUnavailable',
  'Saved planning data contains invalid JSON. It was left unchanged for recovery.':
    'settings.error.planningInvalidJson',
  'Saved planning data does not match the supported format. It was left unchanged.':
    'settings.error.planningFormatInvalid',
  'Local storage is unavailable. Bookmark changes cannot be saved in this browser.':
    'settings.error.bookmarkStorageUnavailable',
  'Saved bookmark data contains invalid JSON. It was left unchanged for recovery.':
    'settings.error.bookmarkInvalidJson',
  'Saved bookmark data does not match the supported format. It was left unchanged.':
    'settings.error.bookmarkFormatInvalid',
}

const importErrorKeys: Record<DataPortabilityErrorCode, TranslationKey> = {
  FILE_NOT_SELECTED: 'settings.importError.fileNotSelected',
  FILE_TOO_LARGE: 'settings.importError.fileTooLarge',
  FILE_TYPE_UNSUPPORTED: 'settings.importError.fileTypeUnsupported',
  FILE_READ_FAILED: 'settings.importError.fileReadFailed',
  INVALID_UTF8: 'settings.importError.invalidUtf8',
  JSON_PARSE_FAILED: 'settings.importError.invalidJson',
  DANGEROUS_OBJECT_KEY: 'settings.importError.unsafeData',
  TREE_LIMIT_EXCEEDED: 'settings.importError.treeLimit',
  INVALID_ROOT: 'settings.importError.validationFailed',
  INVALID_FORMAT: 'settings.importError.unsupportedBackup',
  UNSUPPORTED_FUTURE_VERSION: 'settings.importError.futureVersion',
  UNSUPPORTED_LEGACY_VERSION: 'settings.importError.unsupportedBackup',
  LEGACY_ADAPTER_FAILED: 'settings.importError.validationFailed',
  MODULE_VALIDATION_FAILED: 'settings.importError.validationFailed',
  SEMANTIC_VALIDATION_FAILED: 'settings.importError.validationFailed',
  IMPORT_CANCELLED: 'settings.importError.cancelled',
  SNAPSHOT_FAILED: 'settings.importError.snapshotFailed',
  WRITE_FAILED: 'settings.importError.importRestored',
  QUOTA_EXCEEDED: 'settings.importError.quotaRestored',
  VERIFY_FAILED: 'settings.importError.importRestored',
  HYDRATION_FAILED: 'settings.importError.importRestored',
  ROLLBACK_FAILED: 'settings.importError.rollbackFailed',
  ROLLBACK_VERIFY_FAILED: 'settings.importError.rollbackFailed',
}

export const getSettingsImportErrorKey = (code: DataPortabilityErrorCode) =>
  importErrorKeys[code]

const clearErrorKeys: Record<ClearOperationErrorCode, TranslationKey> = {
  CLEAR_OPERATION_CANCELLED: 'settings.error.clearOperationRestored',
  CLEAR_PLAN_INVALID: 'settings.error.clearPlanInvalid',
  CLEAR_SNAPSHOT_FAILED: 'settings.error.clearSnapshotFailed',
  CLEAR_REMOVE_FAILED: 'settings.error.clearOperationRestored',
  CLEAR_VERIFY_FAILED: 'settings.error.clearOperationRestored',
  CLEAR_HYDRATION_FAILED: 'settings.error.clearOperationRestored',
  CLEAR_ROLLBACK_FAILED: 'settings.error.clearRollbackFailed',
  CLEAR_ROLLBACK_VERIFY_FAILED: 'settings.error.clearRollbackFailed',
  CLEAR_CONCURRENT_OPERATION: 'settings.error.clearConcurrent',
  FACTORY_RESET_RELOAD_FAILED: 'settings.error.clearRollbackFailed',
}

export const getSettingsClearErrorKey = (code: ClearOperationErrorCode) =>
  clearErrorKeys[code]

export function localizeSettingsError(
  error: string | null,
  translate: SettingsTranslate,
) {
  if (error === null) return null

  if (translationKeys.includes(error as TranslationKey)) {
    return translate(error as TranslationKey)
  }

  if (error.startsWith('Backup version ')) {
    return translate('settings.error.backupVersionUnsupported')
  }

  const key = errorKeys[error]
  return key ? translate(key) : error
}
