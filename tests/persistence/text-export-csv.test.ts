import { describe, expect, it } from 'vitest'
import {
  createPortableExport,
  CSV_MIME_TYPE,
  TODOS_CSV_HEADERS,
} from '@/modules/settings/services/settingsPortableExports'
import {
  createCsv,
  csvText,
  csvValue,
  escapeCsvField,
  hasUtf8Bom,
  neutralizeCsvFormula,
} from '@/modules/settings/utils/csvExport'
import {
  emptyTextExportFixture,
  textExportFixture,
} from './textExportFixtures'

describe('CSV field safety contract', () => {
  it.each([
    ['=SUM(1,2)', "'=SUM(1,2)"],
    ['+CMD', "'+CMD"],
    ['-1+1', "'-1+1"],
    ['@SUM(A1:A2)', "'@SUM(A1:A2)"],
    ['\t=SUM(1,2)', "'\t=SUM(1,2)"],
    ['\r=SUM(1,2)', "'\r=SUM(1,2)"],
    ['  =SUM(1,2)', "'  =SUM(1,2)"],
  ])('neutralizes formula-like user text %j', (input, expected) => {
    expect(neutralizeCsvFormula(input)).toBe(expected)
  })

  it('does not alter typed ISO dates, booleans, or negative numbers', () => {
    expect(escapeCsvField(csvValue('2026-07-13'))).toBe('2026-07-13')
    expect(escapeCsvField(csvValue(false))).toBe('false')
    expect(escapeCsvField(csvValue(-12))).toBe('-12')
  })

  it('quotes commas, quotes, CR, LF, CRLF, and surrounding spaces', () => {
    expect(escapeCsvField(csvText('a,b'))).toBe('"a,b"')
    expect(escapeCsvField(csvText('a"b'))).toBe('"a""b"')
    expect(escapeCsvField(csvText('a\rb'))).toBe('"a\r\nb"')
    expect(escapeCsvField(csvText('a\nb'))).toBe('"a\r\nb"')
    expect(escapeCsvField(csvText('a\r\nb'))).toBe('"a\r\nb"')
    expect(escapeCsvField(csvText(' leading '))).toBe('" leading "')
  })

  it('normalizes null and undefined while preserving Unicode and emoji', () => {
    expect(escapeCsvField(csvText(null))).toBe('')
    expect(escapeCsvField(csvText(undefined))).toBe('')
    expect(escapeCsvField(csvText('中文 ✅'))).toBe('中文 ✅')
  })

  it('rejects rows that do not match the fixed column count', () => {
    expect(() => createCsv(['a', 'b'], [[csvValue('one')]])).toThrow(/column contract/)
  })
})

describe('Todo and Bookmark CSV exports', () => {
  it('uses UTF-8 BOM, CRLF, stable headers, MIME, filename, and byte length', () => {
    const result = createPortableExport('todosCsv', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.filename).toBe('lifeboard-todos-2026-07-13.csv')
    expect(result.data.mimeType).toBe(CSV_MIME_TYPE)
    expect(result.data.encoding).toBe('utf-8')
    expect(result.data.lineEnding).toBe('crlf')
    expect(result.data.hasBom).toBe(true)
    expect(hasUtf8Bom(result.data.content)).toBe(true)
    expect(result.data.content.slice(1).split('\r\n')[0]).toBe(TODOS_CSV_HEADERS.join(','))
    expect(result.data.content.replaceAll('\r\n', '')).not.toContain('\n')
    expect(result.data.byteLength).toBe(new TextEncoder().encode(result.data.content).byteLength)
  })

  it('includes completed tasks and expired countdowns but excludes soft-deleted tasks', () => {
    const result = createPortableExport('todosCsv', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.content).toContain('task-completed')
    expect(result.data.content).toContain('countdown-expired')
    expect(result.data.content).not.toContain('PRIVATE-DELETED-CANARY')
    expect(result.data.content).toContain('completed')
    expect(result.data.content).toContain('false')
    expect(result.data.content).toContain("'=SUM(1,2)")
    expect(result.data.content).toContain("'  @planning")
  })

  it('exports bookmark IDs, safe user text, URL, category, note, pin, and timestamps', () => {
    const result = createPortableExport('bookmarksCsv', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const lines = result.data.content.slice(1).split('\r\n')
    expect(lines[0]).toBe('id,title,url,category,note,pinned,createdAt,updatedAt')
    expect(result.data.content).toContain('bookmark-pinned')
    expect(result.data.content).toContain('https://example.test/path_(guide)?a=1&b=2#part')
    expect(result.data.content).toContain("'+Reference | <img onerror=alert(1)>")
    expect(result.data.content).toContain('true')
  })

  it('creates header-only CSV for empty datasets when invoked programmatically', () => {
    const todos = createPortableExport('todosCsv', emptyTextExportFixture)
    const bookmarks = createPortableExport('bookmarksCsv', emptyTextExportFixture)
    expect(todos.ok && todos.data.content.slice(1)).toBe(TODOS_CSV_HEADERS.join(','))
    expect(bookmarks.ok && bookmarks.data.content.slice(1)).toBe(
      'id,title,url,category,note,pinned,createdAt,updatedAt',
    )
  })
})
