import type { AppLocale } from '@/i18n/types'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import type { Countdown, Task } from '@/modules/todos/types/todos'

export interface PortableExportData {
  tasks: readonly Task[]
  countdowns: readonly Countdown[]
  bookmarks: readonly Bookmark[]
  locale: AppLocale
  generatedAt: Date
}

export type PortableExportKind =
  | 'todosMarkdown'
  | 'todosCsv'
  | 'bookmarksMarkdown'
  | 'bookmarksCsv'
  | 'summaryMarkdown'

export interface PortableExportResult {
  readonly filename: string
  readonly content: string
  readonly mimeType: string
  readonly encoding: 'utf-8'
  readonly lineEnding: 'crlf' | 'lf'
  readonly hasBom: boolean
  readonly byteLength: number
}

export interface TodoCsvRow {
  readonly type: 'task'
  readonly id: string
  readonly title: string
  readonly status: 'active' | 'completed'
  readonly dueDate: string | null
  readonly targetDate: null
  readonly label: string | null
  readonly completed: boolean
  readonly completedAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CountdownCsvRow {
  readonly type: 'countdown'
  readonly id: string
  readonly title: string
  readonly status: 'countdown'
  readonly dueDate: null
  readonly targetDate: string
  readonly label: null
  readonly completed: false
  readonly completedAt: null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface BookmarkCsvRow {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly category: string | null
  readonly note: string | null
  readonly pinned: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export type TodoMarkdownEntry = Readonly<Task>
export type CountdownMarkdownEntry = Readonly<Countdown>
export type BookmarkMarkdownEntry = Readonly<Bookmark>

export type TextExportErrorCode =
  | 'TEXT_EXPORT_INVALID_DATA'
  | 'TEXT_EXPORT_SERIALIZATION_FAILED'
  | 'TEXT_EXPORT_TOO_LARGE'
  | 'TEXT_EXPORT_DOWNLOAD_FAILED'
  | 'TEXT_EXPORT_UNSUPPORTED_FORMAT'

export type TextExportModule = 'todos' | 'bookmarks' | 'summary' | 'download'

export interface TextExportError {
  readonly code: TextExportErrorCode
  readonly severity: 'error' | 'fatal'
  readonly module: TextExportModule
  readonly path: string | null
  readonly message: string
  readonly userMessageKey:
    | 'settings.exports.errorInvalidData'
    | 'settings.exports.errorSerialization'
    | 'settings.exports.errorTooLarge'
    | 'settings.exports.errorDownload'
    | 'settings.exports.errorUnsupported'
  readonly recoverable: boolean
  readonly details?: Readonly<Record<string, string | number | boolean | null>>
}

export type TextExportResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: TextExportError }
