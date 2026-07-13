import { describe, expect, it } from 'vitest'
import type { AggregatedCalendarItem } from '@/modules/calendar/types/calendar'
import { resolveCalendarKeyboardDate } from '@/modules/calendar/utils/calendarKeyboard'
import { buildCalendarMonthGrid } from '@/modules/calendar/utils/calendarMonthGrid'

describe('calendar month grid', () => {
  it('builds five or six complete weeks with locale-specific starts', () => {
    const empty = new Map()
    const chinese = buildCalendarMonthGrid('2026-07-01', 'zh-CN', '2026-07-13', empty)
    const english = buildCalendarMonthGrid('2026-07-01', 'en-US', '2026-07-13', empty)

    expect(chinese).toHaveLength(35)
    expect(chinese[0]?.date).toBe('2026-06-29')
    expect(english).toHaveLength(35)
    expect(english[0]?.date).toBe('2026-06-28')
  })

  it('projects aggregate counts without changing the source index', () => {
    const items = [
      { source: 'todo' },
      { source: 'countdown' },
    ] as AggregatedCalendarItem[]
    const index = new Map([['2026-07-13', items]])

    const grid = buildCalendarMonthGrid('2026-07-01', 'zh-CN', '2026-07-13', index)
    const day = grid.find((candidate) => candidate.date === '2026-07-13')

    expect(day).toMatchObject({
      isToday: true,
      itemCount: 2,
      todoCount: 1,
      countdownCount: 1,
    })
    expect(index.get('2026-07-13')).toBe(items)
  })
})

describe('calendar keyboard navigation', () => {
  it('moves by day, week, and clamped month', () => {
    expect(resolveCalendarKeyboardDate('2026-07-13', 'ArrowRight', 'en-US')).toBe('2026-07-14')
    expect(resolveCalendarKeyboardDate('2026-07-13', 'ArrowDown', 'en-US')).toBe('2026-07-20')
    expect(resolveCalendarKeyboardDate('2026-01-31', 'PageDown', 'en-US')).toBe('2026-02-28')
  })

  it('uses locale-aware Home and End boundaries', () => {
    expect(resolveCalendarKeyboardDate('2026-07-15', 'Home', 'zh-CN')).toBe('2026-07-13')
    expect(resolveCalendarKeyboardDate('2026-07-15', 'End', 'en-US')).toBe('2026-07-18')
  })
})
