import { createCsv } from '@/modules/settings/utils/csvExport'
import { createPortableExportFilename } from '@/modules/settings/utils/exportFilenames'
import {
  createBookmarksMarkdown,
  createSummaryMarkdown,
  createTodosMarkdown,
} from '@/modules/settings/utils/markdownExport'
import type {
  PortableExportData,
  PortableExportKind,
  PortableExportResult,
} from '@/modules/settings/types/settingsExports'

const MARKDOWN_MIME_TYPE = 'text/markdown;charset=utf-8'
const CSV_MIME_TYPE = 'text/csv;charset=utf-8'

const todosCsvHeaders = [
  'type',
  'title',
  'dueDate',
  'targetDate',
  'label',
  'completed',
  'completedAt',
  'createdAt',
  'updatedAt',
]

const bookmarksCsvHeaders = [
  'title',
  'url',
  'category',
  'note',
  'pinned',
  'createdAt',
  'updatedAt',
]

export function createPortableExport(
  kind: PortableExportKind,
  data: PortableExportData,
): PortableExportResult {
  if (kind === 'todosMarkdown') {
    return {
      filename: createPortableExportFilename('todos', 'md', data.generatedAt),
      content: createTodosMarkdown(
        data.locale,
        data.tasks,
        data.countdowns,
        data.generatedAt,
      ),
      mimeType: MARKDOWN_MIME_TYPE,
    }
  }

  if (kind === 'todosCsv') {
    const taskRows = data.tasks.map((task) => [
      'task',
      task.title,
      task.dueDate,
      '',
      task.label,
      task.completedAt !== null,
      task.completedAt,
      task.createdAt,
      task.updatedAt,
    ])
    const countdownRows = data.countdowns.map((countdown) => [
      'countdown',
      countdown.title,
      '',
      countdown.targetDate,
      '',
      false,
      '',
      countdown.createdAt,
      countdown.updatedAt,
    ])

    return {
      filename: createPortableExportFilename('todos', 'csv', data.generatedAt),
      content: createCsv(todosCsvHeaders, [...taskRows, ...countdownRows]),
      mimeType: CSV_MIME_TYPE,
    }
  }

  if (kind === 'bookmarksMarkdown') {
    return {
      filename: createPortableExportFilename('bookmarks', 'md', data.generatedAt),
      content: createBookmarksMarkdown(data.locale, data.bookmarks, data.generatedAt),
      mimeType: MARKDOWN_MIME_TYPE,
    }
  }

  if (kind === 'bookmarksCsv') {
    const rows = data.bookmarks.map((bookmark) => [
      bookmark.title,
      bookmark.url,
      bookmark.category,
      bookmark.note,
      bookmark.pinned,
      bookmark.createdAt,
      bookmark.updatedAt,
    ])

    return {
      filename: createPortableExportFilename('bookmarks', 'csv', data.generatedAt),
      content: createCsv(bookmarksCsvHeaders, rows),
      mimeType: CSV_MIME_TYPE,
    }
  }

  return {
    filename: createPortableExportFilename('summary', 'md', data.generatedAt),
    content: createSummaryMarkdown(
      data.locale,
      data.tasks,
      data.countdowns,
      data.bookmarks,
      data.weatherLocation,
      data.generatedAt,
    ),
    mimeType: MARKDOWN_MIME_TYPE,
  }
}

export function downloadPortableExport(exportResult: PortableExportResult) {
  const blob = new Blob([exportResult.content], { type: exportResult.mimeType })
  const url = window.URL.createObjectURL(blob)

  try {
    const link = document.createElement('a')
    link.href = url
    link.download = exportResult.filename
    link.rel = 'noopener'
    link.click()
  } finally {
    window.URL.revokeObjectURL(url)
  }
}
