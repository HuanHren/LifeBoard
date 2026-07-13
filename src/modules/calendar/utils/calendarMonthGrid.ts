import type {
  AggregatedCalendarItem,
  CalendarMonthDay,
  LocalDateString,
} from '@/modules/calendar/types/calendar'
import type { AppLocale } from '@/i18n/types'
import {
  addCalendarDays,
  calendarMonthStart,
  daysInCalendarMonth,
  localDateWeekday,
  parseLocalDate,
  weekStartsOn,
} from '@/modules/calendar/utils/localCalendarDate'

export function buildCalendarMonthGrid(
  visibleMonth: LocalDateString,
  locale: AppLocale,
  today: LocalDateString,
  itemsByDate: ReadonlyMap<LocalDateString, readonly AggregatedCalendarItem[]>,
): readonly CalendarMonthDay[] {
  const monthStart = calendarMonthStart(visibleMonth)
  const monthParts = parseLocalDate(monthStart)
  if (!monthParts) return []

  const leadingDays = (localDateWeekday(monthStart) - weekStartsOn(locale) + 7) % 7
  const requiredDays = leadingDays + daysInCalendarMonth(monthStart)
  const cellCount = Math.max(35, Math.ceil(requiredDays / 7) * 7)
  const gridStart = addCalendarDays(monthStart, -leadingDays)

  return Array.from({ length: cellCount }, (_, index) => {
    const date = addCalendarDays(gridStart, index)
    const dateParts = parseLocalDate(date)
    const items = itemsByDate.get(date) ?? []

    return {
      date,
      dayNumber: dateParts?.day ?? 0,
      inCurrentMonth:
        dateParts?.year === monthParts.year && dateParts.month === monthParts.month,
      isToday: date === today,
      itemCount: items.length,
      todoCount: items.filter((item) => item.source === 'todo').length,
      countdownCount: items.filter((item) => item.source === 'countdown').length,
    }
  })
}
