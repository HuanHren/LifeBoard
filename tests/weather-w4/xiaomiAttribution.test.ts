import { describe, expect, it } from 'vitest'
import { adaptXiaomiAttribution } from '@/modules/weather/extended/xiaomiExtendedWeatherAdapters'
import { loadExtendedFixture } from './fixtures'

function brands() {
  return loadExtendedFixture().brandInfo
}

describe('Xiaomi W4 attribution allowlist', () => {
  it('selects only the verified Simplified Chinese brand name', () => {
    expect(adaptXiaomiAttribution(brands(), 'available', 'zh-CN', '2026-01-01T01:00:00.000Z')).toEqual({
      sourceNames: ['已脱敏天气来源'],
      updatedAt: '2026-01-01T01:00:00.000Z',
    })
  })

  it('selects the verified English brand name for future-compatible localization', () => {
    expect(adaptXiaomiAttribution(brands(), 'available', 'en-US', '2026-01-01T01:00:00.000Z')?.sourceNames)
      .toEqual(['Sanitized Weather Source'])
  })

  it('does not return brand IDs, logos, or URLs', () => {
    const output = JSON.stringify(adaptXiaomiAttribution(brands(), 'available', 'zh-CN', '2026-01-01T01:00:00.000Z'))
    expect(output).not.toContain('brandId')
    expect(output).not.toContain('logo')
    expect(output).not.toContain('example.invalid')
  })

  it('deduplicates repeated safe source names', () => {
    const value = structuredClone(brands()) as { brands: unknown[] }
    value.brands.push(structuredClone(value.brands[0]))
    expect(adaptXiaomiAttribution(value, 'available', 'zh-CN', '2026-01-01T01:00:00.000Z')?.sourceNames)
      .toEqual(['已脱敏天气来源'])
  })

  it.each(['missing', 'null', 'empty-array', 'empty-object'] as const)(
    'does not render the %s capability state',
    (state) => expect(adaptXiaomiAttribution(brands(), state, 'zh-CN', '2026-01-01T01:00:00.000Z')).toBeUndefined(),
  )

  it('returns no attribution for missing locale names', () => {
    expect(adaptXiaomiAttribution({ brands: [{ names: {} }] }, 'available', 'zh-CN', '2026-01-01T01:00:00.000Z'))
      .toBeUndefined()
  })

  it('does not mutate the provider data', () => {
    const value = brands()
    const before = structuredClone(value)
    adaptXiaomiAttribution(value, 'available', 'zh-CN', '2026-01-01T01:00:00.000Z')
    expect(value).toEqual(before)
  })
})
