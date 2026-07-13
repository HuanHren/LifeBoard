import type { Countdown, Task } from '@/modules/todos/types/todos'
import type {
  AggregatedCalendarItem,
  CalendarAggregationResult,
  CalendarItemStatus,
  LocalDateString,
} from '@/modules/calendar/types/calendar'
import { isLocalDate } from '@/modules/calendar/utils/localCalendarDate'

function todoStatus(task: Readonly<Task>, today: LocalDateString): CalendarItemStatus {
  if (task.completedAt !== null) return 'completed'
  return task.dueDate !== null && task.dueDate < today ? 'overdue' : 'active'
}

function countdownStatus(targetDate: LocalDateString, today: LocalDateString): CalendarItemStatus {
  if (targetDate === today) return 'today'
  return targetDate < today ? 'elapsed' : 'upcoming'
}

function groupRank(item: AggregatedCalendarItem) {
  if (item.source === 'todo') return item.status === 'completed' ? 1 : 0
  return 2
}

function compareText(left: string, right: string) {
  if (left === right) return 0
  return left < right ? -1 : 1
}

function compareItems(left: AggregatedCalendarItem, right: AggregatedCalendarItem) {
  return (
    groupRank(left) - groupRank(right) ||
    compareText(left.calendarDate, right.calendarDate) ||
    compareText(left.createdAt, right.createdAt) ||
    compareText(left.id, right.id)
  )
}

export function aggregateCalendarItems(
  tasks: readonly Readonly<Task>[],
  countdowns: readonly Readonly<Countdown>[],
  today: LocalDateString,
): CalendarAggregationResult {
  const buckets = new Map<LocalDateString, AggregatedCalendarItem[]>()
  let invalidTodoCount = 0
  let invalidCountdownCount = 0

  function append(item: AggregatedCalendarItem) {
    const bucket = buckets.get(item.calendarDate)
    if (bucket) bucket.push(item)
    else buckets.set(item.calendarDate, [item])
  }

  for (const task of tasks) {
    if (task.deletedAt !== undefined && task.deletedAt !== null) continue
    if (task.dueDate === null) continue

    if (!isLocalDate(task.dueDate)) {
      invalidTodoCount += 1
      continue
    }

    append({
      id: task.id,
      title: task.title,
      calendarDate: task.dueDate,
      createdAt: task.createdAt,
      source: 'todo',
      status: todoStatus(task, today),
      sourceItem: task,
    })
  }

  for (const countdown of countdowns) {
    if (!isLocalDate(countdown.targetDate)) {
      invalidCountdownCount += 1
      continue
    }

    append({
      id: countdown.id,
      title: countdown.title,
      calendarDate: countdown.targetDate,
      createdAt: countdown.createdAt,
      source: 'countdown',
      status: countdownStatus(countdown.targetDate, today),
      sourceItem: countdown,
    })
  }

  for (const bucket of buckets.values()) bucket.sort(compareItems)

  return {
    itemsByDate: buckets,
    invalidTodoCount,
    invalidCountdownCount,
  }
}
