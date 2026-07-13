import { describe, expect, it } from 'vitest'
import type { Countdown, Task } from '@/modules/todos/types/todos'
import { aggregateCalendarItems } from '@/modules/calendar/utils/calendarAggregation'

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Review plan',
    dueDate: '2026-07-13',
    label: null,
    completedAt: null,
    deletedAt: null,
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-01T08:00:00.000Z',
    ...overrides,
  }
}

function countdown(overrides: Partial<Countdown> = {}): Countdown {
  return {
    id: 'countdown-1',
    title: 'Launch day',
    targetDate: '2026-07-13',
    createdAt: '2026-07-02T08:00:00.000Z',
    updatedAt: '2026-07-02T08:00:00.000Z',
    ...overrides,
  }
}

describe('calendar aggregation', () => {
  it('aggregates active, completed, and countdown items in deterministic groups', () => {
    const result = aggregateCalendarItems(
      [
        task({ id: 'completed', completedAt: '2026-07-10T08:00:00.000Z' }),
        task({ id: 'active', createdAt: '2026-07-03T08:00:00.000Z' }),
      ],
      [countdown()],
      '2026-07-13',
    )

    expect(result.itemsByDate.get('2026-07-13')?.map((item) => item.id)).toEqual([
      'active',
      'completed',
      'countdown-1',
    ])
  })

  it('excludes deleted and undated todos without mutating source arrays', () => {
    const tasks = [
      task({ id: 'deleted', deletedAt: '2026-07-04T08:00:00.000Z' }),
      task({ id: 'undated', dueDate: null }),
      task({ id: 'included' }),
    ]
    const before = JSON.stringify(tasks)

    const result = aggregateCalendarItems(tasks, [], '2026-07-13')

    expect(result.itemsByDate.get('2026-07-13')?.map((item) => item.id)).toEqual(['included'])
    expect(JSON.stringify(tasks)).toBe(before)
  })

  it('isolates invalid source dates and reports source-specific counts', () => {
    const malformedTask = task({ id: 'invalid-todo' }) as Task & { dueDate: string }
    malformedTask.dueDate = '2026-02-31'
    const malformedCountdown = countdown({ id: 'invalid-countdown' }) as Countdown
    malformedCountdown.targetDate = 'not-a-date'

    const result = aggregateCalendarItems(
      [malformedTask, task({ id: 'valid-todo' })],
      [malformedCountdown, countdown({ id: 'valid-countdown' })],
      '2026-07-13',
    )

    expect(result.invalidTodoCount).toBe(1)
    expect(result.invalidCountdownCount).toBe(1)
    expect(result.itemsByDate.get('2026-07-13')).toHaveLength(2)
  })

  it('handles the required 10k todo and 2k countdown data set', () => {
    const tasks = Array.from({ length: 10_000 }, (_, index) =>
      task({ id: `task-${String(index).padStart(5, '0')}` }),
    )
    const countdowns = Array.from({ length: 2_000 }, (_, index) =>
      countdown({ id: `countdown-${String(index).padStart(5, '0')}` }),
    )

    const result = aggregateCalendarItems(tasks, countdowns, '2026-07-13')

    expect(result.itemsByDate.get('2026-07-13')).toHaveLength(12_000)
    expect(result.invalidTodoCount).toBe(0)
    expect(result.invalidCountdownCount).toBe(0)
  })
})
