import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  MAX_PORTABLE_BACKUP_BYTES,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
} from './constants'
import { createPortableImportPreview, type PortableImportPreview } from './importPreview'
import { adaptLegacyBackupV1, adaptLegacyBackupV2 } from './legacyBackupAdapters'
import { validatePortableBackupV1 } from './portableExportValidation'
import {
  detectBackupFormat,
  importFailure,
  importSuccess,
  isPlainImportRecord,
  scanPortableImportTree,
  type DetectedBackupFormat,
  type PortableImportResult,
} from './portableImportValidation'
import type { LifeBoardLocale, PortableBackupV1, ThemeMode } from './types'

export interface PortableImportFile {
  readonly name: string
  readonly size: number
  readonly type: string
  readonly arrayBuffer: () => Promise<ArrayBuffer>
}

export interface PreparePortableImportOptions {
  readonly currentLanguage: LifeBoardLocale
  readonly currentThemeMode: ThemeMode
}

export interface PreparedPortableImport {
  readonly backup: PortableBackupV1
  readonly sourceFormat: DetectedBackupFormat
  readonly sourceVersion: number
  readonly preview: PortableImportPreview
  readonly normalizedBom: boolean
}

const acceptedMimeTypes = new Set(['application/json', 'text/json', ''])

const hasFutureModuleVersion = (value: unknown) => {
  if (!isPlainImportRecord(value) || !isPlainImportRecord(value.data)) return false
  const data = value.data
  const versions = [
    ['settings', SETTINGS_PORTABLE_SCHEMA_VERSION],
    ['weather', WEATHER_PORTABLE_SCHEMA_VERSION],
    ['todos', TODOS_PORTABLE_SCHEMA_VERSION],
    ['bookmarks', BOOKMARKS_PORTABLE_SCHEMA_VERSION],
  ] as const
  return versions.some(([module, current]) => {
    const envelope = data[module]
    return isPlainImportRecord(envelope) && typeof envelope.schemaVersion === 'number' && envelope.schemaVersion > current
  })
}

export const preparePortableImportValue = (
  value: unknown,
  options: PreparePortableImportOptions,
  normalizedBom = false,
): PortableImportResult<PreparedPortableImport> => {
  const scan = scanPortableImportTree(value)
  if (!scan.ok) return scan
  const detected = detectBackupFormat(value)
  if (!detected.ok) return detected

  let canonical: PortableImportResult<PortableBackupV1>
  if (detected.data === 'portable-v1') {
    if (hasFutureModuleVersion(value)) {
      return importFailure('UNSUPPORTED_FUTURE_VERSION', 'root', '/data', 'Portable module requires a newer LifeBoard version.')
    }
    const validation = validatePortableBackupV1(value)
    canonical = validation.ok
      ? importSuccess(validation.data)
      : importFailure(
          validation.error.module === 'root' ? 'INVALID_ROOT' : 'MODULE_VALIDATION_FAILED',
          validation.error.module,
          validation.error.path,
          'Portable backup failed strict validation.',
        )
  } else if (detected.data === 'legacy-v1') {
    canonical = adaptLegacyBackupV1(value, { currentLanguage: options.currentLanguage })
  } else {
    canonical = adaptLegacyBackupV2(value, { currentLanguage: options.currentLanguage })
  }
  if (!canonical.ok) return canonical

  const postAdapter = validatePortableBackupV1(canonical.data)
  if (!postAdapter.ok) {
    return importFailure('SEMANTIC_VALIDATION_FAILED', postAdapter.error.module, postAdapter.error.path, 'Canonical backup failed post-adapter validation.')
  }

  const sourceVersion = detected.data === 'legacy-v2' ? 2 : 1
  return importSuccess(Object.freeze({
    backup: postAdapter.data,
    sourceFormat: detected.data,
    sourceVersion,
    preview: createPortableImportPreview(postAdapter.data, detected.data, {
      themeMode: options.currentThemeMode,
      language: options.currentLanguage,
    }),
    normalizedBom,
  }))
}

export const preparePortableImportFile = async (
  file: PortableImportFile | null | undefined,
  options: PreparePortableImportOptions,
): Promise<PortableImportResult<PreparedPortableImport>> => {
  if (!file) return importFailure('FILE_NOT_SELECTED', 'file', null, 'No backup file was selected.', { recoverable: true, severity: 'error' })
  if (!file.name.toLocaleLowerCase().endsWith('.json')) {
    return importFailure('FILE_TYPE_UNSUPPORTED', 'file', null, 'Backup filename must use the .json extension.')
  }
  const mime = file.type.toLocaleLowerCase().split(';', 1)[0]?.trim() ?? ''
  if (!acceptedMimeTypes.has(mime)) {
    return importFailure('FILE_TYPE_UNSUPPORTED', 'file', null, 'Backup MIME type is not supported.')
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return importFailure('FILE_READ_FAILED', 'file', null, 'Backup file is empty.')
  }
  if (file.size > MAX_PORTABLE_BACKUP_BYTES) {
    return importFailure('FILE_TOO_LARGE', 'file', null, 'Backup file exceeds the 1 MiB limit.')
  }

  let bytes: Uint8Array
  try {
    bytes = new Uint8Array(await file.arrayBuffer())
  } catch {
    return importFailure('FILE_READ_FAILED', 'file', null, 'Backup file could not be read.', { recoverable: true, severity: 'error' })
  }
  if (bytes.byteLength === 0) return importFailure('FILE_READ_FAILED', 'file', null, 'Backup file is empty.')
  if (bytes.byteLength > MAX_PORTABLE_BACKUP_BYTES) return importFailure('FILE_TOO_LARGE', 'file', null, 'Backup file exceeds the 1 MiB limit.')

  const hasBom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(hasBom ? bytes.subarray(3) : bytes)
  } catch {
    return importFailure('INVALID_UTF8', 'file', null, 'Backup file is not valid UTF-8.')
  }
  if (text.trim().length === 0) return importFailure('JSON_PARSE_FAILED', 'file', null, 'Backup file contains no JSON data.')

  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    return importFailure('JSON_PARSE_FAILED', 'file', null, 'Backup file does not contain valid JSON.')
  }
  return preparePortableImportValue(parsed, options, hasBom)
}
