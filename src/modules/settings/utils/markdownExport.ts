import { translate } from '@/i18n/catalog'
import type { TranslationKey } from '@/i18n/keys'
import type { AppLocale } from '@/i18n/types'
import type {
  BookmarkMarkdownEntry,
  CountdownMarkdownEntry,
  TodoMarkdownEntry,
} from '@/modules/settings/types/settingsExports'

function t(locale: AppLocale, key: TranslationKey) {
  return translate(locale, key)
}

function compareText(left: string, right: string) {
  if (left === right) return 0
  return left < right ? -1 : 1
}

function normalizedSortText(value: string | null) {
  return (value ?? '').normalize('NFKC').toLowerCase()
}

function formatDate(locale: AppLocale, value: Date) {
  if (Object.getPrototypeOf(value) !== Date.prototype || !Number.isFinite(value.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(value)
}

function formatDateOnly(locale: AppLocale, value: string | null) {
  if (!value) return t(locale, 'settings.exports.markdown.noDate')
  const date = new Date(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(date.getTime())) return t(locale, 'settings.exports.markdown.noDate')

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date)
}

export function escapeMarkdownText(value: string) {
  const inline = value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .join(' / ')
  const htmlSafe = inline
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  return htmlSafe.replace(/([\\`*_[\]{}()#+\-.!|])/g, '\\$1')
}

export function createSafeMarkdownUrl(value: string) {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return null
  }
  if (
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
    parsed.username ||
    parsed.password ||
    !parsed.hostname
  ) {
    return null
  }

  return parsed.toString().replace(/[()\\<>]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function taskLine(locale: AppLocale, task: TodoMarkdownEntry) {
  const parts = [
    `- ${task.completedAt ? '[x]' : '[ ]'} ${escapeMarkdownText(task.title)}`,
    `(${t(locale, 'settings.exports.markdown.due')}: ${formatDateOnly(locale, task.dueDate)})`,
  ]

  if (task.label) {
    parts.push(`${t(locale, 'settings.exports.markdown.label')}: ${escapeMarkdownText(task.label)}`)
  }

  return parts.join(' ')
}

function countdownLine(locale: AppLocale, countdown: CountdownMarkdownEntry) {
  return `- ${escapeMarkdownText(countdown.title)} (${t(locale, 'settings.exports.markdown.target')}: ${formatDateOnly(locale, countdown.targetDate)})`
}

function bookmarkLine(locale: AppLocale, bookmark: BookmarkMarkdownEntry) {
  const label = escapeMarkdownText(bookmark.title)
  const safeUrl = createSafeMarkdownUrl(bookmark.url)
  const parts = [safeUrl ? `- [${label}](${safeUrl})` : `- ${label}`]

  if (bookmark.pinned) parts.push(`(${t(locale, 'settings.exports.markdown.pinned')})`)
  if (bookmark.note) parts.push(`- ${escapeMarkdownText(bookmark.note)}`)

  return parts.join(' ')
}

function section(title: string, lines: readonly string[], emptyText: string) {
  return [`## ${title}`, '', ...(lines.length ? lines : [`_${emptyText}_`]), ''].join('\n')
}

function sortTasks(tasks: readonly TodoMarkdownEntry[]) {
  return [...tasks].sort(
    (left, right) =>
      compareText(left.dueDate ?? '9999-12-31', right.dueDate ?? '9999-12-31') ||
      compareText(left.createdAt, right.createdAt) ||
      compareText(left.id, right.id),
  )
}

function sortCountdowns(countdowns: readonly CountdownMarkdownEntry[]) {
  return [...countdowns].sort(
    (left, right) =>
      compareText(left.targetDate, right.targetDate) ||
      compareText(left.createdAt, right.createdAt) ||
      compareText(left.id, right.id),
  )
}

function sortBookmarks(bookmarks: readonly BookmarkMarkdownEntry[]) {
  return [...bookmarks].sort(
    (left, right) =>
      Number(right.pinned) - Number(left.pinned) ||
      compareText(normalizedSortText(left.category), normalizedSortText(right.category)) ||
      compareText(normalizedSortText(left.title), normalizedSortText(right.title)) ||
      compareText(left.id, right.id),
  )
}

const isDeleted = (task: TodoMarkdownEntry) => task.deletedAt != null

export function createTodosMarkdown(
  locale: AppLocale,
  tasks: readonly TodoMarkdownEntry[],
  countdowns: readonly CountdownMarkdownEntry[],
  generatedAt: Date,
) {
  const includedTasks = tasks.filter((task) => !isDeleted(task))
  const activeTasks = sortTasks(includedTasks.filter((task) => task.completedAt === null))
  const completedTasks = sortTasks(includedTasks.filter((task) => task.completedAt !== null))
  const sortedCountdowns = sortCountdowns(countdowns)

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
  bookmarks: readonly BookmarkMarkdownEntry[],
  generatedAt: Date,
) {
  const sortedBookmarks = sortBookmarks(bookmarks)
  const pinned = sortedBookmarks.filter((bookmark) => bookmark.pinned)
  const groups = new Map<string, BookmarkMarkdownEntry[]>()

  for (const bookmark of sortedBookmarks) {
    const category = bookmark.category ?? t(locale, 'settings.exports.markdown.uncategorized')
    groups.set(category, [...(groups.get(category) ?? []), bookmark])
  }

  const groupedSections = [...groups.entries()].flatMap(([category, items]) => [
    `### ${escapeMarkdownText(category)}`,
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
  tasks: readonly TodoMarkdownEntry[],
  countdowns: readonly CountdownMarkdownEntry[],
  bookmarks: readonly BookmarkMarkdownEntry[],
  generatedAt: Date,
) {
  const activeTasks = sortTasks(
    tasks.filter((task) => !isDeleted(task) && task.completedAt === null),
  ).slice(0, 10)
  const upcomingCountdowns = sortCountdowns(countdowns).slice(0, 10)
  const pinnedBookmarks = sortBookmarks(
    bookmarks.filter((bookmark) => bookmark.pinned),
  ).slice(0, 10)

  return [
    `# ${t(locale, 'settings.exports.markdown.summaryTitle')}`,
    '',
    `${t(locale, 'settings.exports.markdown.generatedAt')}: ${formatDate(locale, generatedAt)}`,
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
