import { isBookmark } from '@/modules/bookmarks/utils/bookmarkValidation'
import type {
  BookmarkCsvRow,
  CountdownCsvRow,
  PortableExportData,
  PortableExportKind,
  PortableExportResult,
  TextExportError,
  TextExportErrorCode,
  TextExportModule,
  TextExportResult,
  TodoCsvRow,
} from '@/modules/settings/types/settingsExports'
import {
  createCsv,
  csvText,
  csvValue,
  type CsvCell,
} from '@/modules/settings/utils/csvExport'
import { createPortableExportFilename } from '@/modules/settings/utils/exportFilenames'
import {
  createBookmarksMarkdown,
  createSummaryMarkdown,
  createTodosMarkdown,
} from '@/modules/settings/utils/markdownExport'
import { isCountdown, isTask } from '@/modules/todos/utils/todoValidation'

export const MARKDOWN_MIME_TYPE = 'text/markdown;charset=utf-8'
export const CSV_MIME_TYPE = 'text/csv;charset=utf-8'

export const TODOS_CSV_HEADERS = Object.freeze([
  'type',
  'id',
  'title',
  'status',
  'dueDate',
  'targetDate',
  'label',
  'completed',
  'completedAt',
  'createdAt',
  'updatedAt',
])

export const BOOKMARKS_CSV_HEADERS = Object.freeze([
  'id',
  'title',
  'url',
  'category',
  'note',
  'pinned',
  'createdAt',
  'updatedAt',
])

const messageKeyByCode = {
  TEXT_EXPORT_INVALID_DATA: 'settings.exports.errorInvalidData',
  TEXT_EXPORT_SERIALIZATION_FAILED: 'settings.exports.errorSerialization',
  TEXT_EXPORT_TOO_LARGE: 'settings.exports.errorTooLarge',
  TEXT_EXPORT_DOWNLOAD_FAILED: 'settings.exports.errorDownload',
  TEXT_EXPORT_UNSUPPORTED_FORMAT: 'settings.exports.errorUnsupported',
} as const

function exportError(
  code: TextExportErrorCode,
  module: TextExportModule,
  path: string | null,
  message: string,
  recoverable = false,
): TextExportError {
  return Object.freeze({
    code,
    severity: recoverable ? 'error' : 'fatal',
    module,
    path,
    message,
    userMessageKey: messageKeyByCode[code],
    recoverable,
  })
}

const success = <T>(data: T): TextExportResult<T> => Object.freeze({ ok: true, data })
const failure = (
  code: TextExportErrorCode,
  module: TextExportModule,
  path: string | null,
  message: string,
  recoverable = false,
): TextExportResult<never> => Object.freeze({
  ok: false,
  error: exportError(code, module, path, message, recoverable),
})

function compareText(left: string, right: string) {
  if (left === right) return 0
  return left < right ? -1 : 1
}

function normalizedSortText(value: string | null) {
  return (value ?? '').normalize('NFKC').toLowerCase()
}

function isValidLocale(value: unknown): value is PortableExportData['locale'] {
  return value === 'zh-CN' || value === 'en-US'
}

function hasUniqueIds(records: readonly { readonly id: string }[]) {
  return records.every((record) => record.id.length > 0) &&
    new Set(records.map((record) => record.id)).size === records.length
}

function validateExportData(data: PortableExportData): TextExportResult<undefined> {
  if (
    !Array.isArray(data.tasks) ||
    !Array.isArray(data.countdowns) ||
    !Array.isArray(data.bookmarks) ||
    !isValidLocale(data.locale) ||
    !(data.generatedAt instanceof Date) ||
    Object.getPrototypeOf(data.generatedAt) !== Date.prototype ||
    !Number.isFinite(data.generatedAt.getTime())
  ) {
    return failure('TEXT_EXPORT_INVALID_DATA', 'summary', null, 'Text export input is invalid.')
  }

  const taskIndex = data.tasks.findIndex((task) => !isTask(task))
  if (taskIndex >= 0 || !hasUniqueIds(data.tasks)) {
    return failure('TEXT_EXPORT_INVALID_DATA', 'todos', taskIndex >= 0 ? `/tasks/${taskIndex}` : '/tasks', 'Todo export data is invalid.')
  }
  const countdownIndex = data.countdowns.findIndex((countdown) => !isCountdown(countdown))
  if (countdownIndex >= 0 || !hasUniqueIds(data.countdowns)) {
    return failure('TEXT_EXPORT_INVALID_DATA', 'todos', countdownIndex >= 0 ? `/countdowns/${countdownIndex}` : '/countdowns', 'Countdown export data is invalid.')
  }
  const bookmarkIndex = data.bookmarks.findIndex((bookmark) => !isBookmark(bookmark))
  if (bookmarkIndex >= 0 || !hasUniqueIds(data.bookmarks)) {
    return failure('TEXT_EXPORT_INVALID_DATA', 'bookmarks', bookmarkIndex >= 0 ? `/bookmarks/${bookmarkIndex}` : '/bookmarks', 'Bookmark export data is invalid.')
  }

  return success(undefined)
}

function includedTasks(data: PortableExportData) {
  return data.tasks
    .filter((task) => task.deletedAt == null)
    .sort(
      (left, right) =>
        compareText(left.dueDate ?? '9999-12-31', right.dueDate ?? '9999-12-31') ||
        compareText(left.createdAt, right.createdAt) ||
        compareText(left.id, right.id),
    )
}

function orderedCountdowns(data: PortableExportData) {
  return [...data.countdowns].sort(
    (left, right) =>
      compareText(left.targetDate, right.targetDate) ||
      compareText(left.createdAt, right.createdAt) ||
      compareText(left.id, right.id),
  )
}

function orderedBookmarks(data: PortableExportData) {
  return [...data.bookmarks].sort(
    (left, right) =>
      Number(right.pinned) - Number(left.pinned) ||
      compareText(normalizedSortText(left.category), normalizedSortText(right.category)) ||
      compareText(normalizedSortText(left.title), normalizedSortText(right.title)) ||
      compareText(left.id, right.id),
  )
}

function mapTodoCsvRow(task: PortableExportData['tasks'][number]): TodoCsvRow {
  return Object.freeze({
    type: 'task',
    id: task.id,
    title: task.title,
    status: task.completedAt === null ? 'active' : 'completed',
    dueDate: task.dueDate,
    targetDate: null,
    label: task.label,
    completed: task.completedAt !== null,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  })
}

function mapCountdownCsvRow(countdown: PortableExportData['countdowns'][number]): CountdownCsvRow {
  return Object.freeze({
    type: 'countdown',
    id: countdown.id,
    title: countdown.title,
    status: 'countdown',
    dueDate: null,
    targetDate: countdown.targetDate,
    label: null,
    completed: false,
    completedAt: null,
    createdAt: countdown.createdAt,
    updatedAt: countdown.updatedAt,
  })
}

function mapBookmarkCsvRow(bookmark: PortableExportData['bookmarks'][number]): BookmarkCsvRow {
  return Object.freeze({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    category: bookmark.category,
    note: bookmark.note,
    pinned: bookmark.pinned,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
  })
}

function todoCsvCells(row: TodoCsvRow | CountdownCsvRow): readonly CsvCell[] {
  return [
    csvValue(row.type),
    csvText(row.id),
    csvText(row.title),
    csvValue(row.status),
    csvValue(row.dueDate),
    csvValue(row.targetDate),
    csvText(row.label),
    csvValue(row.completed),
    csvValue(row.completedAt),
    csvValue(row.createdAt),
    csvValue(row.updatedAt),
  ]
}

function bookmarkCsvCells(row: BookmarkCsvRow): readonly CsvCell[] {
  return [
    csvText(row.id),
    csvText(row.title),
    csvValue(row.url),
    csvText(row.category),
    csvText(row.note),
    csvValue(row.pinned),
    csvValue(row.createdAt),
    csvValue(row.updatedAt),
  ]
}

function descriptor(
  filename: string,
  content: string,
  mimeType: string,
  lineEnding: PortableExportResult['lineEnding'],
  hasBom: boolean,
): PortableExportResult {
  return Object.freeze({
    filename,
    content,
    mimeType,
    encoding: 'utf-8',
    lineEnding,
    hasBom,
    byteLength: new TextEncoder().encode(content).byteLength,
  })
}

export function createPortableExport(
  kind: PortableExportKind,
  data: PortableExportData,
): TextExportResult<PortableExportResult> {
  const supportedKinds: readonly PortableExportKind[] = [
    'todosMarkdown',
    'todosCsv',
    'bookmarksMarkdown',
    'bookmarksCsv',
    'summaryMarkdown',
  ]
  if (!supportedKinds.includes(kind)) {
    return failure('TEXT_EXPORT_UNSUPPORTED_FORMAT', 'summary', null, 'Text export format is unsupported.')
  }

  const validation = validateExportData(data)
  if (!validation.ok) return validation
  const exportModule: TextExportModule = kind.startsWith('todos')
    ? 'todos'
    : kind.startsWith('bookmarks')
      ? 'bookmarks'
      : 'summary'

  try {
    const tasks = includedTasks(data)
    const countdowns = orderedCountdowns(data)
    const bookmarks = orderedBookmarks(data)

    if (kind === 'todosMarkdown') {
      return success(descriptor(
        createPortableExportFilename('todos', 'md', data.generatedAt),
        createTodosMarkdown(data.locale, tasks, countdowns, data.generatedAt),
        MARKDOWN_MIME_TYPE,
        'lf',
        false,
      ))
    }

    if (kind === 'todosCsv') {
      const rows = [
        ...tasks.map(mapTodoCsvRow),
        ...countdowns.map(mapCountdownCsvRow),
      ]
      return success(descriptor(
        createPortableExportFilename('todos', 'csv', data.generatedAt),
        createCsv(TODOS_CSV_HEADERS, rows.map(todoCsvCells)),
        CSV_MIME_TYPE,
        'crlf',
        true,
      ))
    }

    if (kind === 'bookmarksMarkdown') {
      return success(descriptor(
        createPortableExportFilename('bookmarks', 'md', data.generatedAt),
        createBookmarksMarkdown(data.locale, bookmarks, data.generatedAt),
        MARKDOWN_MIME_TYPE,
        'lf',
        false,
      ))
    }

    if (kind === 'bookmarksCsv') {
      const rows = bookmarks.map(mapBookmarkCsvRow)
      return success(descriptor(
        createPortableExportFilename('bookmarks', 'csv', data.generatedAt),
        createCsv(BOOKMARKS_CSV_HEADERS, rows.map(bookmarkCsvCells)),
        CSV_MIME_TYPE,
        'crlf',
        true,
      ))
    }

    return success(descriptor(
      createPortableExportFilename('summary', 'md', data.generatedAt),
      createSummaryMarkdown(data.locale, tasks, countdowns, bookmarks, data.generatedAt),
      MARKDOWN_MIME_TYPE,
      'lf',
      false,
    ))
  } catch {
    return failure('TEXT_EXPORT_SERIALIZATION_FAILED', exportModule, null, 'Text export serialization failed.', true)
  }
}

export function downloadPortableExport(
  exportResult: PortableExportResult,
): TextExportResult<undefined> {
  try {
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
    return success(undefined)
  } catch {
    return failure('TEXT_EXPORT_DOWNLOAD_FAILED', 'download', null, 'Browser download preparation failed.', true)
  }
}
