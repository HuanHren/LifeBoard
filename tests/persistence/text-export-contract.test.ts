import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createPortableExport,
  downloadPortableExport,
} from '@/modules/settings/services/settingsPortableExports'
import { createLifeBoardBackup } from '@/modules/settings/services/settingsBackup'
import { preparePortableImportValue } from '@/shared/persistence'
import { validPortableExportStorage } from './fixtures'
import { textExportFixture } from './textExportFixtures'

afterEach(() => vi.unstubAllGlobals())

describe('text export contract integration', () => {
  it.each([
    'todosCsv',
    'todosMarkdown',
    'bookmarksCsv',
    'bookmarksMarkdown',
    'summaryMarkdown',
  ] as const)('is deterministic for %s with a fixed clock and locale', (kind) => {
    const first = createPortableExport(kind, textExportFixture)
    const second = createPortableExport(kind, textExportFixture)
    expect(first).toEqual(second)
  })

  it('does not mutate arrays, record values, or ordering', () => {
    const before = JSON.stringify(textExportFixture)
    createPortableExport('todosCsv', textExportFixture)
    createPortableExport('bookmarksMarkdown', textExportFixture)
    expect(JSON.stringify(textExportFixture)).toBe(before)
  })

  it('produces identical output when equivalent record arrays arrive in another order', () => {
    const ordered = createPortableExport('bookmarksCsv', textExportFixture)
    const reordered = createPortableExport('bookmarksCsv', {
      ...textExportFixture,
      tasks: [...textExportFixture.tasks].reverse(),
      countdowns: [...textExportFixture.countdowns].reverse(),
      bookmarks: [...textExportFixture.bookmarks].reverse(),
    })
    expect(reordered).toEqual(ordered)
  })

  it('rejects invalid records, duplicate IDs, invalid dates, and invalid URLs', () => {
    const badTask = createPortableExport('todosCsv', {
      ...textExportFixture,
      tasks: [{ ...textExportFixture.tasks[0], createdAt: 'invalid' }],
    })
    const duplicate = createPortableExport('bookmarksCsv', {
      ...textExportFixture,
      bookmarks: [textExportFixture.bookmarks[0], textExportFixture.bookmarks[0]],
    })
    const badUrl = createPortableExport('bookmarksMarkdown', {
      ...textExportFixture,
      bookmarks: [{ ...textExportFixture.bookmarks[0], url: 'javascript:alert(1)' }],
    })
    const badClock = createPortableExport('todosMarkdown', {
      ...textExportFixture,
      generatedAt: new Date('invalid'),
    })
    const emptyId = createPortableExport('todosCsv', {
      ...textExportFixture,
      tasks: [{ ...textExportFixture.tasks[0], id: '' }],
    })

    for (const result of [badTask, duplicate, badUrl, badClock, emptyId]) {
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('TEXT_EXPORT_INVALID_DATA')
        expect(result.error.details).toBeUndefined()
      }
    }
  })

  it('rejects unsupported runtime kinds instead of falling through to summary', () => {
    const result = createPortableExport('pdf' as never, textExportFixture)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('TEXT_EXPORT_UNSUPPORTED_FORMAT')
  })

  it('returns a redacted recoverable error when browser download APIs are unavailable', () => {
    const prepared = createPortableExport('todosCsv', textExportFixture)
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return
    const result = downloadPortableExport(prepared.data)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('TEXT_EXPORT_DOWNLOAD_FAILED')
      expect(result.error.recoverable).toBe(true)
      expect(result.error.details).toBeUndefined()
    }
  })

  it('preserves the production portable JSON export/import round trip', () => {
    const values = new Map(Object.entries(validPortableExportStorage))
    vi.stubGlobal('window', {
      localStorage: {
        get length() { return values.size },
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => void values.set(key, value),
        removeItem: (key: string) => void values.delete(key),
      },
    })
    const exported = createLifeBoardBackup({ themeMode: 'system', language: 'en-US' })
    expect(exported.ok).toBe(true)
    if (!exported.ok) return
    const parsed = JSON.parse(exported.data.download.text) as unknown
    const imported = preparePortableImportValue(parsed, {
      currentLanguage: 'zh-CN',
      currentThemeMode: 'dark',
    })
    expect(imported.ok).toBe(true)
  })
})
