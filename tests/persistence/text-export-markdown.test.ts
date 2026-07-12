import { describe, expect, it } from 'vitest'
import {
  createPortableExport,
  MARKDOWN_MIME_TYPE,
} from '@/modules/settings/services/settingsPortableExports'
import {
  createBookmarksMarkdown,
  createSafeMarkdownUrl,
  escapeMarkdownText,
} from '@/modules/settings/utils/markdownExport'
import {
  emptyTextExportFixture,
  generatedAt,
  textExportFixture,
} from './textExportFixtures'

describe('Markdown safety contract', () => {
  it('escapes headings, lists, blockquotes, code, links, images, pipes, and raw HTML', () => {
    const unsafe = '# heading\n- item > quote `code` [link](x) ![image](x) | <script>&'
    const escaped = escapeMarkdownText(unsafe)

    expect(escaped).toContain('\\# heading / \\- item')
    expect(escaped).toContain('&lt;script&gt;&amp;')
    expect(escaped).not.toContain('<script>')
    expect(escaped).not.toContain('\n')
    expect(escaped).toContain('\\`code\\`')
    expect(escaped).toContain('\\[link\\]\\(x\\)')
    expect(escaped).toContain('!\\[image\\]\\(x\\)')
    expect(escaped).toContain('\\|')
  })

  it('accepts only safe HTTP(S) link destinations and encodes structural delimiters', () => {
    expect(createSafeMarkdownUrl('javascript:alert(1)')).toBeNull()
    expect(createSafeMarkdownUrl('https://user:pass@example.test/')).toBeNull()
    expect(createSafeMarkdownUrl('not a url')).toBeNull()
    expect(createSafeMarkdownUrl('https://example.test/path_(guide)')).toContain('%28guide%29')
  })

  it('falls back to plain escaped text for an invalid bookmark URL', () => {
    const markdown = createBookmarksMarkdown('en-US', [{
      ...textExportFixture.bookmarks[0],
      url: 'javascript:alert(1)',
    }], generatedAt)
    expect(markdown).toContain('Docs \\[safe\\]')
    expect(markdown).not.toContain('javascript:')
  })
})

describe('Todo and Bookmark Markdown exports', () => {
  it('uses UTF-8 without BOM, LF, localized structure, MIME, and stable filename', () => {
    const result = createPortableExport('todosMarkdown', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.filename).toBe('lifeboard-todos-2026-07-13.md')
    expect(result.data.mimeType).toBe(MARKDOWN_MIME_TYPE)
    expect(result.data.hasBom).toBe(false)
    expect(result.data.lineEnding).toBe('lf')
    expect(result.data.content.startsWith('# Todos and Countdowns')).toBe(true)
    expect(result.data.content).not.toContain('\r')
    expect(result.data.byteLength).toBe(new TextEncoder().encode(result.data.content).byteLength)
  })

  it('includes completed and expired records, excludes deleted records, and escapes user text', () => {
    const result = createPortableExport('todosMarkdown', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.content).toContain('[x]')
    expect(result.data.content).toContain('Launch / \\- checklist')
    expect(result.data.content).not.toContain('PRIVATE-DELETED-CANARY')
    expect(result.data.content).toContain('&lt;script&gt;')
    expect(result.data.content).not.toContain('<script>')
  })

  it('renders safe bookmark links, escaped categories/notes, and no raw HTML', () => {
    const result = createPortableExport('bookmarksMarkdown', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.content).toContain('https://example.test/path_%28guide%29?a=1&b=2#part')
    expect(result.data.content).toContain('\\+Reference \\| &lt;img onerror=alert\\(1\\)&gt;')
    expect(result.data.content).toContain('First line / &gt; quoted &lt;script&gt;')
    expect(result.data.content).not.toContain('<img')
    expect(result.data.content).not.toContain('<script>')
  })

  it('emits localized non-empty documents for empty datasets', () => {
    const todos = createPortableExport('todosMarkdown', emptyTextExportFixture)
    const bookmarks = createPortableExport('bookmarksMarkdown', emptyTextExportFixture)
    expect(todos.ok && todos.data.content).toContain('# 待办与倒计时')
    expect(todos.ok && todos.data.content).toContain('没有已保存的进行中任务。')
    expect(bookmarks.ok && bookmarks.data.content).toContain('# 书签')
    expect(bookmarks.ok && bookmarks.data.content).toContain('没有已保存的书签。')
  })

  it('keeps the summary human-readable without reading or exporting Weather data', () => {
    const result = createPortableExport('summaryMarkdown', textExportFixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.content).not.toContain('weather city')
    expect(result.data.content).not.toContain('Selected weather')
    expect(result.data.content).toContain('Active tasks')
    expect(result.data.content).toContain('Pinned bookmarks')
  })
})
