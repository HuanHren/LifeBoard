import type { PersistenceModuleId } from './types'

export type ValidationSeverity = 'fatal' | 'error' | 'warning'
export type ValidationModule =
  | 'file'
  | 'root'
  | PersistenceModuleId
  | 'transaction'

export interface ValidationIssue {
  readonly code: string
  readonly severity: ValidationSeverity
  readonly module: ValidationModule
  readonly path: string | null
  readonly message: string
  readonly userMessageKey: string
  readonly recoverable: boolean
  readonly details?: Readonly<Record<string, unknown>>
}

export type ValidationResult<T> =
  | {
      readonly ok: true
      readonly value: T
      readonly issues: readonly ValidationIssue[]
    }
  | {
      readonly ok: false
      readonly issues: readonly ValidationIssue[]
    }

export interface ValidationContext {
  readonly module: ValidationModule
  readonly maxDepth: number
}

export type PortableValidator<T> = (
  input: unknown,
  context: ValidationContext,
) => ValidationResult<T>

export interface MigrationContext {
  readonly currentLanguage: 'zh-CN' | 'en-US'
  readonly targetVersion: number
}

export type MigrationResult<T> =
  | { readonly ok: true; readonly value: T; readonly warnings: readonly ValidationIssue[] }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] }

export interface MigrationStep<TInput = unknown, TOutput = unknown> {
  readonly fromVersion: number
  readonly toVersion: number
  readonly migrate: (input: Readonly<TInput>, context: MigrationContext) => MigrationResult<TOutput>
}

export type MigrationPipeline = readonly MigrationStep[]

export type PersistenceReadResult<T> =
  | { readonly ok: true; readonly value: T | null }
  | { readonly ok: false; readonly error: unknown }

export type PersistenceWriteResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: unknown }

export type PersistenceVerifyResult =
  | { readonly ok: true; readonly matches: true }
  | { readonly ok: false; readonly matches: false; readonly error?: unknown }

export interface PortableSerializer<T> {
  readonly serialize: (value: Readonly<T>) => PersistenceReadResult<string>
}

export interface PortableDeserializer<T> {
  readonly deserialize: (serialized: string) => ValidationResult<T>
}

export interface KeyValueStorage {
  readonly getItem: (key: string) => string | null
  readonly setItem: (key: string, value: string) => void
  readonly removeItem: (key: string) => void
}

export interface PersistenceStorageAdapter {
  readonly read: (key: string) => PersistenceReadResult<string>
  readonly write: (key: string, value: string) => PersistenceWriteResult
  readonly remove: (key: string) => PersistenceWriteResult
  readonly readBack: (key: string, expectedValue: string | null) => PersistenceVerifyResult
}

export const createRawStorageAdapter = (
  storage: KeyValueStorage,
): PersistenceStorageAdapter =>
  Object.freeze({
    read(key: string) {
      try {
        return Object.freeze({ ok: true as const, value: storage.getItem(key) })
      } catch (error) {
        return Object.freeze({ ok: false as const, error })
      }
    },
    write(key: string, value: string) {
      try {
        storage.setItem(key, value)
        return Object.freeze({ ok: true as const })
      } catch (error) {
        return Object.freeze({ ok: false as const, error })
      }
    },
    remove(key: string) {
      try {
        storage.removeItem(key)
        return Object.freeze({ ok: true as const })
      } catch (error) {
        return Object.freeze({ ok: false as const, error })
      }
    },
    readBack(key: string, expectedValue: string | null) {
      try {
        const matches = storage.getItem(key) === expectedValue
        return matches
          ? Object.freeze({ ok: true as const, matches: true as const })
          : Object.freeze({ ok: false as const, matches: false as const })
      } catch (error) {
        return Object.freeze({ ok: false as const, matches: false as const, error })
      }
    },
  })

export const isPositiveIntegerVersion = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0

export const isSafeObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype'])

export const containsDangerousObjectKey = (value: unknown): boolean => {
  const visited = new WeakSet<object>()

  const visit = (current: unknown): boolean => {
    if (current === null || typeof current !== 'object') {
      return false
    }
    if (visited.has(current)) {
      return false
    }
    visited.add(current)

    for (const key of Object.keys(current)) {
      if (dangerousKeys.has(key) || visit((current as Record<string, unknown>)[key])) {
        return true
      }
    }
    return false
  }

  return visit(value)
}
