import type { AppLocale } from '@/i18n/types'
import type { LocalDateString } from '@/modules/calendar/types/calendar'

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export interface LocalDateParts {
  readonly year: number
  readonly month: number
  readonly day: number
}

export function parseLocalDate(value: unknown): LocalDateParts | null {
  if (typeof value !== 'string') return null

  const match = LOCAL_DATE_PATTERN.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const candidate = new Date(Date.UTC(year, month - 1, day))

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

export function isLocalDate(value: unknown): value is LocalDateString {
  return parseLocalDate(value) !== null
}

export function createLocalDate(year: number, month: number, day: number): LocalDateString {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-')
}

export function getLocalToday(date = new Date()): LocalDateString {
  return createLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function calendarMonthStart(value: LocalDateString): LocalDateString {
  const parts = parseLocalDate(value)
  if (!parts) throw new Error(`Invalid local date: ${value}`)
  return createLocalDate(parts.year, parts.month, 1)
}

export function daysInCalendarMonth(value: LocalDateString) {
  const parts = parseLocalDate(value)
  if (!parts) throw new Error(`Invalid local date: ${value}`)
  return new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate()
}

export function addCalendarDays(value: LocalDateString, amount: number): LocalDateString {
  const parts = parseLocalDate(value)
  if (!parts) throw new Error(`Invalid local date: ${value}`)

  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + amount))
  return createLocalDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())
}

export function addCalendarMonths(value: LocalDateString, amount: number): LocalDateString {
  const parts = parseLocalDate(value)
  if (!parts) throw new Error(`Invalid local date: ${value}`)

  const targetMonth = new Date(Date.UTC(parts.year, parts.month - 1 + amount, 1))
  const targetYear = targetMonth.getUTCFullYear()
  const targetMonthNumber = targetMonth.getUTCMonth() + 1
  const targetMonthStart = createLocalDate(targetYear, targetMonthNumber, 1)
  const targetDay = Math.min(parts.day, daysInCalendarMonth(targetMonthStart))
  return createLocalDate(targetYear, targetMonthNumber, targetDay)
}

export function localDateWeekday(value: LocalDateString) {
  const parts = parseLocalDate(value)
  if (!parts) throw new Error(`Invalid local date: ${value}`)
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
}

export function weekStartsOn(locale: AppLocale) {
  return locale === 'zh-CN' ? 1 : 0
}

export function startOfCalendarWeek(value: LocalDateString, locale: AppLocale) {
  const offset = (localDateWeekday(value) - weekStartsOn(locale) + 7) % 7
  return addCalendarDays(value, -offset)
}

export function endOfCalendarWeek(value: LocalDateString, locale: AppLocale) {
  return addCalendarDays(startOfCalendarWeek(value, locale), 6)
}

export function localDateToDisplayDate(value: LocalDateString) {
  const parts = parseLocalDate(value)
  if (!parts) throw new Error(`Invalid local date: ${value}`)
  return new Date(parts.year, parts.month - 1, parts.day, 12)
}
