import { describe, expect, it } from 'vitest'
import { adaptXiaomiMinutelySummary } from '@/modules/weather/extended/xiaomiExtendedWeatherAdapters'
import { loadExtendedFixture } from './fixtures'

function minutely() {
  return loadExtendedFixture().minutely
}

describe('Xiaomi W4 minutely precipitation view model', () => {
  it('returns only verified provider text and time', () => {
    expect(adaptXiaomiMinutelySummary(minutely(), 'available')).toEqual({
      summary: 'Sanitized precipitation summary',
      detail: 'Sanitized short summary',
      advice: 'Sanitized precipitation advice',
      observedAt: '2026-01-01T01:00:00.000Z',
    })
  })

  it.each(['missing', 'null', 'empty-array', 'empty-object'] as const)(
    'does not render the %s capability state',
    (state) => expect(adaptXiaomiMinutelySummary(minutely(), state)).toBeUndefined(),
  )

  it('does not render a provider-hidden precipitation summary', () => {
    const value = structuredClone(minutely()) as { precipitation: { isShow: boolean } }
    value.precipitation.isShow = false
    expect(adaptXiaomiMinutelySummary(value, 'available')).toBeUndefined()
  })

  it('does not interpret unverified numeric sequences', () => {
    const serialized = JSON.stringify(adaptXiaomiMinutelySummary(minutely(), 'available'))
    expect(serialized).not.toContain('probability')
    expect(serialized).not.toContain('value')
  })

  it('rejects malformed status with a path-only diagnostic', () => {
    const diagnostics: { path: string; code: string }[] = []
    expect(adaptXiaomiMinutelySummary({ status: 1 }, 'available', diagnostics)).toBeUndefined()
    expect(diagnostics).toEqual([{ path: '$.extensions.minutely', code: 'invalid-minutely' }])
  })

  it('rejects control characters and oversized provider text', () => {
    const value = structuredClone(minutely()) as { precipitation: Record<string, unknown> }
    value.precipitation.headDescription = 'unsafe\u0000text'
    value.precipitation.shortDescription = 'x'.repeat(241)
    value.precipitation.description = ''
    expect(adaptXiaomiMinutelySummary(value, 'available')).toBeUndefined()
  })

  it('does not mutate the extension input', () => {
    const value = minutely()
    const before = structuredClone(value)
    adaptXiaomiMinutelySummary(value, 'available')
    expect(value).toEqual(before)
  })
})
