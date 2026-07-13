import type { Countdown, Task } from '@/modules/todos/types/todos'

export type LocalDateString = string
export type CalendarItemSource = 'todo' | 'countdown'
export type CalendarItemStatus =
  | 'active'
  | 'overdue'
  | 'completed'
  | 'upcoming'
  | 'today'
  | 'elapsed'

interface CalendarItemBase {
  readonly id: string
  readonly title: string
  readonly calendarDate: LocalDateString
  readonly createdAt: string
  readonly source: CalendarItemSource
  readonly status: CalendarItemStatus
}

export interface AggregatedTodoItem extends CalendarItemBase {
  readonly source: 'todo'
  readonly sourceItem: Readonly<Task>
}

export interface AggregatedCountdownItem extends CalendarItemBase {
  readonly source: 'countdown'
  readonly sourceItem: Readonly<Countdown>
}

export type AggregatedCalendarItem = AggregatedTodoItem | AggregatedCountdownItem

export interface CalendarAggregationResult {
  readonly itemsByDate: ReadonlyMap<LocalDateString, readonly AggregatedCalendarItem[]>
  readonly invalidTodoCount: number
  readonly invalidCountdownCount: number
}

export interface CalendarMonthDay {
  readonly date: LocalDateString
  readonly dayNumber: number
  readonly inCurrentMonth: boolean
  readonly isToday: boolean
  readonly itemCount: number
  readonly todoCount: number
  readonly countdownCount: number
}
