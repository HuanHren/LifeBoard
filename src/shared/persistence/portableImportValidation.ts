import {
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  MAX_PORTABLE_BACKUP_BYTES,
  SUPPORTED_LEGACY_BACKUP_VERSIONS,
} from './constants'
import type { ValidationModule, ValidationSeverity } from './contracts'

export type DataPortabilityErrorCode =
  | 'FILE_NOT_SELECTED'
  | 'FILE_TOO_LARGE'
  | 'FILE_TYPE_UNSUPPORTED'
  | 'FILE_READ_FAILED'
  | 'INVALID_UTF8'
  | 'JSON_PARSE_FAILED'
  | 'DANGEROUS_OBJECT_KEY'
  | 'TREE_LIMIT_EXCEEDED'
  | 'INVALID_ROOT'
  | 'INVALID_FORMAT'
  | 'UNSUPPORTED_FUTURE_VERSION'
  | 'UNSUPPORTED_LEGACY_VERSION'
  | 'LEGACY_ADAPTER_FAILED'
  | 'MODULE_VALIDATION_FAILED'
  | 'SEMANTIC_VALIDATION_FAILED'
  | 'IMPORT_CANCELLED'
  | 'SNAPSHOT_FAILED'
  | 'WRITE_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'VERIFY_FAILED'
  | 'HYDRATION_FAILED'
  | 'ROLLBACK_FAILED'
  | 'ROLLBACK_VERIFY_FAILED'

export interface DataPortabilityError {
  readonly code: DataPortabilityErrorCode
  readonly severity: ValidationSeverity
  readonly module: ValidationModule
  readonly path: string | null
  readonly message: string
  readonly userMessageKey: string
  readonly recoverable: boolean
  readonly details?: Readonly<Record<string, string | number | boolean | null>>
}

export type PortableImportResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: DataPortabilityError }

export const createDataPortabilityError = (
  code: DataPortabilityErrorCode,
  module: ValidationModule,
  path: string | null,
  message: string,
  options: {
    readonly severity?: ValidationSeverity
    readonly recoverable?: boolean
    readonly details?: Readonly<Record<string, string | number | boolean | null>>
  } = {},
): DataPortabilityError =>
  Object.freeze({
    code,
    severity: options.severity ?? 'fatal',
    module,
    path,
    message,
    userMessageKey: `persistence.import.${code.toLowerCase()}`,
    recoverable: options.recoverable ?? false,
    ...(options.details ? { details: Object.freeze({ ...options.details }) } : {}),
  })

export const importSuccess = <T>(data: T): PortableImportResult<T> =>
  Object.freeze({ ok: true, data })

export const importFailure = (
  code: DataPortabilityErrorCode,
  module: ValidationModule,
  path: string | null,
  message: string,
  options: Parameters<typeof createDataPortabilityError>[4] = {},
): PortableImportResult<never> => ({
  ok: false,
  error: createDataPortabilityError(code, module, path, message, options),
})

export const isPlainImportRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

export const hasOwnImportKey = (record: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(record, key)

export const hasExactImportKeys = (
  record: Record<string, unknown>,
  keys: readonly string[],
) => {
  const actual = Object.keys(record)
  return actual.length === keys.length && keys.every((key) => hasOwnImportKey(record, key))
}

export interface SafeTreeLimits {
  readonly maximumDepth: number
  readonly maximumArrayLength: number
  readonly maximumObjectProperties: number
  readonly maximumStringLength: number
  readonly maximumNodes: number
}

export const DEFAULT_SAFE_TREE_LIMITS: SafeTreeLimits = Object.freeze({
  maximumDepth: 32,
  maximumArrayLength: 10_000,
  maximumObjectProperties: 64,
  maximumStringLength: 4_096,
  maximumNodes: 250_000,
})

const dangerousKeys = new Set(['__proto__', 'prototype', 'constructor'])

export const scanPortableImportTree = (
  value: unknown,
  limits: SafeTreeLimits = DEFAULT_SAFE_TREE_LIMITS,
): PortableImportResult<undefined> => {
  const active = new WeakSet<object>()
  let nodes = 0

  const visit = (current: unknown, depth: number, path: string): PortableImportResult<undefined> => {
    nodes += 1
    if (nodes > limits.maximumNodes || depth > limits.maximumDepth) {
      return importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import tree exceeds resource limits.')
    }

    if (current === null || typeof current === 'boolean') return importSuccess(undefined)
    if (typeof current === 'string') {
      return current.length <= limits.maximumStringLength
        ? importSuccess(undefined)
        : importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import string exceeds its limit.')
    }
    if (typeof current === 'number') {
      return Number.isFinite(current)
        ? importSuccess(undefined)
        : importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import contains a non-finite number.')
    }
    if (typeof current !== 'object') {
      return importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import contains an unsupported value type.')
    }
    if (active.has(current)) {
      return importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import contains a circular reference.')
    }

    active.add(current)
    if (Array.isArray(current)) {
      if (current.length > limits.maximumArrayLength) {
        active.delete(current)
        return importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import array exceeds its limit.')
      }
      for (let index = 0; index < current.length; index += 1) {
        const result = visit(current[index], depth + 1, `${path}/${index}`)
        if (!result.ok) return result
      }
      active.delete(current)
      return importSuccess(undefined)
    }

    if (!isPlainImportRecord(current)) {
      active.delete(current)
      return importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import contains a non-plain object.')
    }

    const keys = Reflect.ownKeys(current)
    if (keys.length > limits.maximumObjectProperties || keys.some((key) => typeof key !== 'string')) {
      active.delete(current)
      return importFailure('TREE_LIMIT_EXCEEDED', 'root', path, 'Import object exceeds its property limit.')
    }

    for (const key of keys as string[]) {
      const childPath = `${path === '/' ? '' : path}/${key}` || '/'
      if (dangerousKeys.has(key)) {
        active.delete(current)
        return importFailure('DANGEROUS_OBJECT_KEY', 'root', childPath, 'Import contains a dangerous object key.')
      }
      const descriptor = Object.getOwnPropertyDescriptor(current, key)
      if (!descriptor || !('value' in descriptor)) {
        active.delete(current)
        return importFailure('TREE_LIMIT_EXCEEDED', 'root', childPath, 'Import contains an accessor property.')
      }
      const result = visit(descriptor.value, depth + 1, childPath)
      if (!result.ok) return result
    }

    active.delete(current)
    return importSuccess(undefined)
  }

  return visit(value, 0, '/')
}

export type DetectedBackupFormat = 'portable-v1' | 'legacy-v1' | 'legacy-v2'

export const detectBackupFormat = (
  value: unknown,
): PortableImportResult<DetectedBackupFormat> => {
  if (!isPlainImportRecord(value)) {
    return importFailure('INVALID_ROOT', 'root', '/', 'Backup root must be an object.')
  }

  const hasFormat = hasOwnImportKey(value, 'format')
  const hasSchemaVersion = hasOwnImportKey(value, 'schemaVersion')
  const hasLegacyVersion = hasOwnImportKey(value, 'version')

  if ((hasFormat || hasSchemaVersion) && hasLegacyVersion) {
    return importFailure('INVALID_FORMAT', 'root', '/', 'Backup mixes portable and legacy version markers.')
  }

  if (hasFormat || hasSchemaVersion) {
    if (value.format !== LIFEBOARD_BACKUP_FORMAT || typeof value.schemaVersion !== 'number') {
      return importFailure('INVALID_FORMAT', 'root', '/', 'Portable backup markers are incomplete or invalid.')
    }
    if (value.schemaVersion > LIFEBOARD_BACKUP_SCHEMA_VERSION) {
      return importFailure('UNSUPPORTED_FUTURE_VERSION', 'root', '/schemaVersion', 'Portable backup requires a newer LifeBoard version.')
    }
    return value.schemaVersion === LIFEBOARD_BACKUP_SCHEMA_VERSION
      ? importSuccess('portable-v1')
      : importFailure('INVALID_FORMAT', 'root', '/schemaVersion', 'Portable backup schema version is invalid.')
  }

  if (hasLegacyVersion) {
    if (value.version === 1) return importSuccess('legacy-v1')
    if (value.version === 2) return importSuccess('legacy-v2')
    if (typeof value.version === 'number' && !SUPPORTED_LEGACY_BACKUP_VERSIONS.includes(value.version as 1 | 2)) {
      return importFailure('UNSUPPORTED_LEGACY_VERSION', 'root', '/version', 'Legacy backup version is not supported.')
    }
  }

  return importFailure('INVALID_FORMAT', 'root', '/', 'File is not a recognized LifeBoard backup.')
}

export const maximumPortableFileBytes = MAX_PORTABLE_BACKUP_BYTES
