import { describe, expect, it } from 'vitest'
import { adaptXiaomiRecentChanges } from '@/modules/weather/extended/xiaomiExtendedWeatherAdapters'
import { createXiaomiSnapshot, loadExtendedFixture } from './fixtures'

function setup() {
  const snapshot = createXiaomiSnapshot()
  return {
    current: snapshot.current,
    previous: loadExtendedFixture().preHour,
  }
}

describe('Xiaomi W4 previous-hour comparisons', () => {
  it('compares every field whose unit is explicitly aligned', () => {
    const { current, previous } = setup()
    const model = adaptXiaomiRecentChanges(current, previous, 'available')
    expect(model?.metrics.map((metric) => metric.id)).toEqual([
      'temperature',
      'feelsLike',
      'humidity',
      'pressure',
      'visibility',
      'windSpeed',
    ])
  })

  it('preserves increase, decrease, and unchanged states', () => {
    const { current, previous } = setup()
    const model = adaptXiaomiRecentChanges(current, previous, 'available')
    expect(model?.metrics.find((metric) => metric.id === 'temperature')).toMatchObject({ delta: 1, direction: 'increase' })
    expect(model?.metrics.find((metric) => metric.id === 'humidity')).toMatchObject({ delta: -2, direction: 'decrease' })
    expect(model?.metrics.find((metric) => metric.id === 'windSpeed')).toMatchObject({ delta: 0, direction: 'unchanged' })
  })

  it('preserves zero and negative temperatures', () => {
    const { current, previous } = setup()
    current.temperatureC = -1
    const entries = structuredClone(previous) as Array<Record<string, unknown>>
    entries[0]!.temperature = { unit: 'C', value: '0' }
    expect(adaptXiaomiRecentChanges(current, entries, 'available')?.metrics[0]).toMatchObject({
      previousValue: 0,
      currentValue: -1,
      delta: -1,
    })
  })

  it('excludes a field whose unit is not verified', () => {
    const { current, previous } = setup()
    const entries = structuredClone(previous) as Array<Record<string, unknown>>
    entries[0]!.pressure = { unit: 'Pa', value: '99900' }
    expect(adaptXiaomiRecentChanges(current, entries, 'available')?.metrics.some((metric) => metric.id === 'pressure')).toBe(false)
  })

  it('excludes a malformed optional number without failing other metrics', () => {
    const { current, previous } = setup()
    const entries = structuredClone(previous) as Array<Record<string, unknown>>
    entries[0]!.humidity = { unit: '%', value: 'not-a-number' }
    const model = adaptXiaomiRecentChanges(current, entries, 'available')
    expect(model?.metrics.some((metric) => metric.id === 'humidity')).toBe(false)
    expect(model?.metrics.some((metric) => metric.id === 'temperature')).toBe(true)
  })

  it('chooses the latest valid observation instead of a blind array index', () => {
    const { current, previous } = setup()
    const older = structuredClone((previous as unknown[])[0]) as Record<string, unknown>
    older.pubTime = '2025-12-31T23:00:00Z'
    older.temperature = { unit: 'C', value: '10' }
    const model = adaptXiaomiRecentChanges(current, [older, ...(previous as unknown[])], 'available')
    expect(model?.observedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(model?.metrics[0]?.previousValue).toBe(19)
  })

  it('ignores future observations', () => {
    const { current, previous } = setup()
    const future = structuredClone((previous as unknown[])[0]) as Record<string, unknown>
    future.pubTime = '2026-01-01T02:00:00Z'
    expect(adaptXiaomiRecentChanges(current, [future, ...(previous as unknown[])], 'available')?.observedAt)
      .toBe('2026-01-01T00:00:00.000Z')
  })

  it.each(['missing', 'null', 'empty-array', 'empty-object'] as const)(
    'does not render the %s capability state',
    (state) => {
      const { current, previous } = setup()
      expect(adaptXiaomiRecentChanges(current, previous, state)).toBeUndefined()
    },
  )

  it('rejects a malformed root with a path-only diagnostic', () => {
    const diagnostics: { path: string; code: string }[] = []
    expect(adaptXiaomiRecentChanges(setup().current, {}, 'available', diagnostics)).toBeUndefined()
    expect(diagnostics).toEqual([{ path: '$.extensions.preHour', code: 'invalid-previous-hour' }])
  })

  it('does not mutate current or extension input', () => {
    const { current, previous } = setup()
    const currentBefore = structuredClone(current)
    const previousBefore = structuredClone(previous)
    adaptXiaomiRecentChanges(current, previous, 'available')
    expect(current).toEqual(currentBefore)
    expect(previous).toEqual(previousBefore)
  })
})
