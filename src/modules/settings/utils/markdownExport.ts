import { translate } from '@/i18n/catalog'
import type { TranslationKey } from '@/i18n/keys'
import type { AppLocale } from '@/i18n/types'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import type { Countdown, Task } from '@/modules/todos/types/todos'
import type { WeatherLocation } from '@/modules/weather/types/weather'

function t(locale: AppLocale, key: TranslationKey) {
  return translate(locale, key)
}

function formatDate(locale: AppLocale, value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : ''

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: typeof value === 'string' && value.length <= 10 ? undefined : 'short',
  }).format(date)
}

function formatDateOnly(locale: AppLocale, value: string | null) {
  if (!value) return t(locale, 'settings.exports.markdown.noDate')
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

function escapeInline(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]')
}

function taskLine(locale: AppLocale, task: Task) {
  const parts = [
    `- ${task.completedAt ? '[x]' : '[ ]'} ${task.title}`,
    `(${t(locale, 'settings.exports.markdown.due')}: ${formatDateOnly(locale, task.dueDate)})`,
  ]

  if (task.label) {
    parts.push(`${t(locale, 'settings.exports.markdown.label')}: ${task.label}`)
  }

  return parts.join(' ')
}

function countdownLine(locale: AppLocale, countdown: Countdown) {
  return `- ${countdown.title} (${t(locale, 'settings.exports.markdown.target')}: ${formatDateOnly(locale, countdown.targetDate)})`
}

function bookmarkLine(locale: AppLocale, bookmark: Bookmark) {
  const label = escapeInline(bookmark.title)
  const parts = [`- [${label}](${bookmark.url})`]

  if (bookmark.pinned) parts.push(`(${t(locale, 'settings.exports.markdown.pinned')})`)
  if (bookmark.note) parts.push(`- ${bookmark.note}`)

  return parts.join(' ')
}

function section(title: string, lines: string[], emptyText: string) {
  return [`## ${title}`, '', ...(lines.length ? lines : [`_${emptyText}_`]), ''].join('\n')
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort(
    (left, right) =>
      (left.dueDate ?? '9999-12-31').localeCompare(right.dueDate ?? '9999-12-31') ||
      left.createdAt.localeCompare(right.createdAt),
  )
}

function sortBookmarks(bookmarks: Bookmark[]) {
  return [...bookmarks].sort(
    (left, right) =>
      Number(right.pinned) - Number(left.pinned) ||
      (left.category ?? '').localeCompare(right.category ?? '', undefined, {
        sensitivity: 'base',
      }) ||
      left.title.localeCompare(right.title, undefined, { sensitivity: 'base' }),
  )
}

export function createTodosMarkdown(
  locale: AppLocale,
  tasks: Task[],
  countdowns: Countdown[],
  generatedAt: Date,
) {
  const activeTasks = sortTasks(tasks.filter((task) => task.completedAt === null))
  const completedTasks = sortTasks(tasks.filter((task) => task.completedAt !== null))
  const sortedCountdowns = [...countdowns].sort((left, right) =>
    left.targetDate.localeCompare(right.targetDate),
  )

  return [
    `# ${t(locale, 'settings.exports.markdown.todosTitle')}`,
    '',
    `${t(locale, 'settings.exports.markdown.generatedAt')}: ${formatDate(locale, generatedAt)}`,
    '',
    section(
      t(locale, 'settings.exports.markdown.activeTasks'),
      activeTasks.map((task) => taskLine(locale, task)),
      t(locale, 'settings.exports.markdown.emptyActiveTasks'),
    ),
    section(
      t(locale, 'settings.exports.markdown.completedTasks'),
      completedTasks.map((task) => taskLine(locale, task)),
      t(locale, 'settings.exports.markdown.emptyCompletedTasks'),
    ),
    section(
      t(locale, 'settings.exports.markdown.countdowns'),
      sortedCountdowns.map((countdown) => countdownLine(locale, countdown)),
      t(locale, 'settings.exports.markdown.emptyCountdowns'),
    ),
  ].join('\n')
}

export function createBookmarksMarkdown(
  locale: AppLocale,
  bookmarks: Bookmark[],
  generatedAt: Date,
) {
  const pinned = sortBookmarks(bookmarks.filter((bookmark) => bookmark.pinned))
  const groups = new Map<string, Bookmark[]>()

  for (const bookmark of sortBookmarks(bookmarks)) {
    const category = bookmark.category ?? t(locale, 'settings.exports.markdown.uncategorized')
    groups.set(category, [...(groups.get(category) ?? []), bookmark])
  }

  const groupedSections = [...groups.entries()].flatMap(([category, items]) => [
    `### ${category}`,
    '',
    ...items.map((bookmark) => bookmarkLine(locale, bookmark)),
    '',
  ])

  return [
    `# ${t(locale, 'settings.exports.markdown.bookmarksTitle')}`,
    '',
    `${t(locale, 'settings.exports.markdown.generatedAt')}: ${formatDate(locale, generatedAt)}`,
    '',
    section(
      t(locale, 'settings.exports.markdown.pinnedBookmarks'),
      pinned.map((bookmark) => bookmarkLine(locale, bookmark)),
      t(locale, 'settings.exports.markdown.emptyPinnedBookmarks'),
    ),
    `## ${t(locale, 'settings.exports.markdown.bookmarksByCategory')}`,
    '',
    ...(groupedSections.length
      ? groupedSections
      : [`_${t(locale, 'settings.exports.markdown.emptyBookmarks')}_`, '']),
  ].join('\n')
}

export function createSummaryMarkdown(
  locale: AppLocale,
  tasks: Task[],
  countdowns: Countdown[],
  bookmarks: Bookmark[],
  weatherLocation: WeatherLocation | null,
  generatedAt: Date,
) {
  const activeTasks = sortTasks(tasks.filter((task) => task.completedAt === null)).slice(0, 10)
  const upcomingCountdowns = [...countdowns]
    .sort((left, right) => left.targetDate.localeCompare(right.targetDate))
    .slice(0, 10)
  const pinnedBookmarks = sortBookmarks(bookmarks.filter((bookmark) => bookmark.pinned)).slice(0, 10)

  return [
    `# ${t(locale, 'settings.exports.markdown.summaryTitle')}`,
    '',
    `${t(locale, 'settings.exports.markdown.generatedAt')}: ${formatDate(locale, generatedAt)}`,
    '',
    `## ${t(locale, 'settings.exports.markdown.weatherCity')}`,
    '',
    weatherLocation?.name ?? `_${t(locale, 'settings.exports.markdown.noWeatherCity')}_`,
    '',
    section(
      t(locale, 'settings.exports.markdown.activeTasks'),
      activeTasks.map((task) => taskLine(locale, task)),
      t(locale, 'settings.exports.markdown.emptyActiveTasks'),
    ),
    section(
      t(locale, 'settings.exports.markdown.upcomingCountdowns'),
      upcomingCountdowns.map((countdown) => countdownLine(locale, countdown)),
      t(locale, 'settings.exports.markdown.emptyCountdowns'),
    ),
    section(
      t(locale, 'settings.exports.markdown.pinnedBookmarks'),
      pinnedBookmarks.map((bookmark) => bookmarkLine(locale, bookmark)),
      t(locale, 'settings.exports.markdown.emptyPinnedBookmarks'),
    ),
    `## ${t(locale, 'settings.exports.markdown.privacyTitle')}`,
    '',
    `- ${t(locale, 'settings.exports.markdown.privacyLocal')}`,
    `- ${t(locale, 'settings.exports.markdown.privacyNoTools')}`,
    `- ${t(locale, 'settings.exports.markdown.privacyNoForecast')}`,
    '',
  ].join('\n')
}
