import type { AppLocale } from '@/i18n/types'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import type { Countdown, Task } from '@/modules/todos/types/todos'
import type { WeatherLocation } from '@/modules/weather/types/weather'

export interface PortableExportData {
  tasks: Task[]
  countdowns: Countdown[]
  bookmarks: Bookmark[]
  weatherLocation: WeatherLocation | null
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
  filename: string
  content: string
  mimeType: string
}
