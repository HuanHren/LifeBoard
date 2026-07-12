import { describe, expect, it } from 'vitest'
import {
  MAX_PORTABLE_BACKUP_BYTES,
  preparePortableImportFile,
  preparePortableImportValue,
  scanPortableImportTree,
} from '@/shared/persistence'
import {
  futureRootMetadata,
  validLegacyBackupV1,
  validLegacyBackupV2,
  validPortableBackupV1,
} from './fixtures'
import { createFixtureFile } from './importHarness'

const options = { currentLanguage: 'en-US' as const, currentThemeMode: 'system' as const }
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

describe('portable import file validation', () => {
  it('rejects a missing file', async () => {
    expect(await preparePortableImportFile(null, options)).toMatchObject({ ok: false, error: { code: 'FILE_NOT_SELECTED' } })
  })

  it.each([
    ['', 'FILE_READ_FAILED'],
    ['   ', 'JSON_PARSE_FAILED'],
    ['{', 'JSON_PARSE_FAILED'],
  ])('rejects invalid text input %#', async (text, code) => {
    expect(await preparePortableImportFile(createFixtureFile(text), options)).toMatchObject({ ok: false, error: { code } })
  })

  it('rejects oversized metadata and actual bytes', async () => {
    expect(await preparePortableImportFile(createFixtureFile('{}', { size: MAX_PORTABLE_BACKUP_BYTES + 1 }), options)).toMatchObject({ ok: false, error: { code: 'FILE_TOO_LARGE' } })
    const bytes = new Uint8Array(MAX_PORTABLE_BACKUP_BYTES + 1)
    expect(await preparePortableImportFile(createFixtureFile(bytes, { size: 1 }), options)).toMatchObject({ ok: false, error: { code: 'FILE_TOO_LARGE' } })
  })

  it('rejects wrong extension and obvious non-JSON MIME', async () => {
    const json = JSON.stringify(validPortableBackupV1)
    expect(await preparePortableImportFile(createFixtureFile(json, { name: 'backup.txt' }), options)).toMatchObject({ ok: false, error: { code: 'FILE_TYPE_UNSUPPORTED' } })
    expect(await preparePortableImportFile(createFixtureFile(json, { type: 'text/plain' }), options)).toMatchObject({ ok: false, error: { code: 'FILE_TYPE_UNSUPPORTED' } })
  })

  it('accepts empty MIME for a valid JSON filename', async () => {
    expect((await preparePortableImportFile(createFixtureFile(JSON.stringify(validPortableBackupV1), { type: '' }), options)).ok).toBe(true)
  })

  it('rejects invalid UTF-8', async () => {
    expect(await preparePortableImportFile(createFixtureFile(new Uint8Array([0xc3, 0x28])), options)).toMatchObject({ ok: false, error: { code: 'INVALID_UTF8' } })
  })

  it('accepts and records one UTF-8 BOM', async () => {
    const body = new TextEncoder().encode(JSON.stringify(validPortableBackupV1))
    const bytes = new Uint8Array(body.length + 3)
    bytes.set([0xef, 0xbb, 0xbf])
    bytes.set(body, 3)
    const result = await preparePortableImportFile(createFixtureFile(bytes), options)
    expect(result).toMatchObject({ ok: true, data: { normalizedBom: true } })
  })

  it('returns a redacted read failure', async () => {
    const file = { ...createFixtureFile('{}'), arrayBuffer: async () => { throw new Error('private fixture') } }
    const result = await preparePortableImportFile(file, options)
    expect(result).toMatchObject({ ok: false, error: { code: 'FILE_READ_FAILED' } })
    expect(JSON.stringify(result)).not.toContain('private fixture')
  })
})

describe('format detection and strict validation', () => {
  it.each([
    [validPortableBackupV1, 'portable-v1'],
    [validLegacyBackupV1, 'legacy-v1'],
    [validLegacyBackupV2, 'legacy-v2'],
  ] as const)('accepts recognized format %#', (value, sourceFormat) => {
    expect(preparePortableImportValue(value, options)).toMatchObject({ ok: true, data: { sourceFormat } })
  })

  it('rejects future, unknown, unsupported legacy, and mixed markers', () => {
    expect(preparePortableImportValue(futureRootMetadata, options)).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_FUTURE_VERSION' } })
    expect(preparePortableImportValue({ hello: 'world' }, options)).toMatchObject({ ok: false, error: { code: 'INVALID_FORMAT' } })
    expect(preparePortableImportValue({ version: 9 }, options)).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_LEGACY_VERSION' } })
    expect(preparePortableImportValue({ ...validPortableBackupV1, version: 2 }, options)).toMatchObject({ ok: false, error: { code: 'INVALID_FORMAT' } })
  })

  it('rejects future module versions', () => {
    const value = clone(validPortableBackupV1)
    value.data.todos.schemaVersion = 2 as 1
    expect(preparePortableImportValue(value, options)).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_FUTURE_VERSION' } })
  })

  it.each([
    ['missing module', (value: any) => { delete value.data.weather }],
    ['extra module', (value: any) => { value.data.notes = {} }],
    ['locale mismatch', (value: any) => { value.locale = 'en-US' }],
    ['invalid theme', (value: any) => { value.data.settings.payload.themeMode = 'blue' }],
    ['invalid location', (value: any) => { value.data.weather.payload.selectedLocation.latitude = 100 }],
    ['duplicate favorite', (value: any) => {
      const favorite = {
        id: 'favorite-1', name: 'City', region: null, country: 'Country', latitude: 0,
        longitude: 0, displayLabel: 'City', createdAt: '2026-07-10T10:00:00.000Z',
        updatedAt: '2026-07-10T10:00:00.000Z',
      }
      value.data.weather.payload.favoriteCities = [favorite, favorite]
    }],
    ['duplicate task', (value: any) => { value.data.todos.payload.tasks.push(value.data.todos.payload.tasks[0]) }],
    ['duplicate countdown', (value: any) => {
      const countdown = {
        id: 'countdown-1', title: 'Date', targetDate: '2026-08-01',
        createdAt: '2026-07-10T10:00:00.000Z', updatedAt: '2026-07-10T10:00:00.000Z',
      }
      value.data.todos.payload.countdowns = [countdown, countdown]
    }],
    ['invalid date', (value: any) => { value.data.todos.payload.tasks[0].dueDate = '2026-02-30' }],
    ['invalid URL', (value: any) => { value.data.bookmarks.payload.bookmarks[0].url = 'javascript:alert(1)' }],
    ['invalid timestamp', (value: any) => { value.data.bookmarks.payload.bookmarks[0].updatedAt = 'yesterday' }],
  ])('rejects %s', (_label, mutate) => {
    const value = clone(validPortableBackupV1)
    mutate(value)
    expect(preparePortableImportValue(value, options).ok).toBe(false)
  })
})

describe('import preview metadata', () => {
  it('contains approved counts and settings only, without raw titles or URLs', () => {
    const result = preparePortableImportValue(validPortableBackupV1, options)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.preview).toMatchObject({
      sourceFormat: 'portable-v1',
      mode: 'replace',
      taskCount: 1,
      bookmarkCount: 1,
      hasSavedLocation: true,
      nonPortableWeatherPreserved: true,
      mergeSupported: false,
    })
    const preview = JSON.stringify(result.data.preview)
    expect(preview).not.toContain(validPortableBackupV1.data.todos.payload.tasks[0]?.title)
    expect(preview).not.toContain(validPortableBackupV1.data.bookmarks.payload.bookmarks[0]?.url)
  })
})

describe('safe import tree', () => {
  it.each(['__proto__', 'constructor', 'prototype'])('rejects dangerous key %s', (key) => {
    const value = JSON.parse(`{"nested":{"${key}":true}}`) as unknown
    expect(scanPortableImportTree(value)).toMatchObject({ ok: false, error: { code: 'DANGEROUS_OBJECT_KEY' } })
  })

  it('rejects excessive depth, array length, properties, strings, and non-finite numbers', () => {
    let deep: Record<string, unknown> = {}
    for (let index = 0; index < 34; index += 1) deep = { nested: deep }
    expect(scanPortableImportTree(deep).ok).toBe(false)
    expect(scanPortableImportTree(new Array(10_001).fill(null)).ok).toBe(false)
    expect(scanPortableImportTree(Object.fromEntries(Array.from({ length: 65 }, (_, index) => [`k${index}`, true]))).ok).toBe(false)
    expect(scanPortableImportTree('x'.repeat(4_097)).ok).toBe(false)
    expect(scanPortableImportTree({ value: Number.POSITIVE_INFINITY }).ok).toBe(false)
  })

  it('rejects cycles, class instances, symbols, and accessors without invoking getters', () => {
    const cycle: { self?: unknown } = {}
    cycle.self = cycle
    expect(scanPortableImportTree(cycle).ok).toBe(false)
    expect(scanPortableImportTree(new Date()).ok).toBe(false)
    expect(scanPortableImportTree({ value: Symbol('x') }).ok).toBe(false)
    let called = false
    const accessor = Object.defineProperty({}, 'value', { enumerable: true, get() { called = true; return 1 } })
    expect(scanPortableImportTree(accessor).ok).toBe(false)
    expect(called).toBe(false)
  })
})
