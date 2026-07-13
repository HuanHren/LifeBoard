import { describe, expect, it } from 'vitest'
import {
  addCalendarDays,
  addCalendarMonths,
  endOfCalendarWeek,
  getLocalToday,
  isLocalDate,
  startOfCalendarWeek,
} from '@/modules/calendar/utils/localCalendarDate'

describe('local calendar date helpers', () => {
  it('validates real date-only values', () => {
    expect(isLocalDate('2028-02-29')).toBe(true)
    expect(isLocalDate('2027-02-29')).toBe(false)
    expect(isLocalDate('2026-7-03')).toBe(false)
  })

  it('moves across month and year boundaries without timestamp conversion', () => {
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addCalendarDays('2028-03-01', -1)).toBe('2028-02-29')
    expect(addCalendarMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addCalendarMonths('2028-01-31', 1)).toBe('2028-02-29')
  })

  it('uses locale-specific week boundaries', () => {
    expect(startOfCalendarWeek('2026-07-15', 'zh-CN')).toBe('2026-07-13')
    expect(endOfCalendarWeek('2026-07-15', 'zh-CN')).toBe('2026-07-19')
    expect(startOfCalendarWeek('2026-07-15', 'en-US')).toBe('2026-07-12')
    expect(endOfCalendarWeek('2026-07-15', 'en-US')).toBe('2026-07-18')
  })

  it('derives today from local date parts', () => {
    expect(getLocalToday(new Date(2026, 6, 13, 23, 30))).toBe('2026-07-13')
  })
})
