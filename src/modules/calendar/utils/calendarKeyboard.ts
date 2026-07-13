import type { AppLocale } from '@/i18n/types'
import type { LocalDateString } from '@/modules/calendar/types/calendar'
import {
  addCalendarDays,
  addCalendarMonths,
  endOfCalendarWeek,
  startOfCalendarWeek,
} from '@/modules/calendar/utils/localCalendarDate'

export function resolveCalendarKeyboardDate(
  date: LocalDateString,
  key: string,
  locale: AppLocale,
): LocalDateString | null {
  if (key === 'ArrowLeft') return addCalendarDays(date, -1)
  if (key === 'ArrowRight') return addCalendarDays(date, 1)
  if (key === 'ArrowUp') return addCalendarDays(date, -7)
  if (key === 'ArrowDown') return addCalendarDays(date, 7)
  if (key === 'Home') return startOfCalendarWeek(date, locale)
  if (key === 'End') return endOfCalendarWeek(date, locale)
  if (key === 'PageUp') return addCalendarMonths(date, -1)
  if (key === 'PageDown') return addCalendarMonths(date, 1)
  return null
}
