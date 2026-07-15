import { describe, expect, it } from 'vitest'
import { zhCNModules } from '@/i18n/locales/zh-CN-modules'
import type { Translator } from '@/i18n/types'
import { WEATHER_CONDITION_CODES } from '@/modules/weather/constants/weatherConditionCodes'
import { adaptProviderSnapshotForDisplay } from '@/modules/weather/providers/weatherSnapshotAdapters'
import { normalizeXiaomiWeather } from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import { formatFullLocalTime, formatHour } from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherCondition } from '@/modules/weather/utils/weatherI18n'
import { createXiaomiProviderSnapshot } from '../weather-w3/fixtures'
import { loadAllFixture, xiaomiLocation } from '../weather-xiaomi-provider/fixtures'

const zhTranslator: Translator = (key) => zhCNModules[key as keyof typeof zhCNModules] ?? key

function displayConditionForXiaomiCode(code: unknown) {
  const fixture = loadAllFixture()
  if (!fixture.current) throw new Error('Fixture current weather is missing.')
  fixture.current.weather = code
  return adaptProviderSnapshotForDisplay(normalizeXiaomiWeather(fixture, xiaomiLocation)).current.condition
}

describe('post-freeze Xiaomi condition compatibility', () => {
  it.each([
    [1, WEATHER_CONDITION_CODES.cloudy],
    [53, WEATHER_CONDITION_CODES.haze],
    [20, WEATHER_CONDITION_CODES.sandDust],
  ])('maps Xiaomi code %s through a registered legacy code', (xiaomiCode, legacyCode) => {
    expect(displayConditionForXiaomiCode(xiaomiCode).code).toBe(legacyCode)
  })

  it('localizes Xiaomi cloudy as the existing Chinese 多云 label', () => {
    expect(localizeWeatherCondition(displayConditionForXiaomiCode(1), zhTranslator)).toBe('多云')
  })

  it('keeps unknown Xiaomi conditions unavailable', () => {
    expect(displayConditionForXiaomiCode(999)).toMatchObject({ code: -1, shortLabel: 'Unavailable' })
  })

  it('round-trips the shared special condition constants', () => {
    const snapshot = createXiaomiProviderSnapshot()
    snapshot.current.condition = { id: 'haze', providerCode: '53' }
    expect(adaptProviderSnapshotForDisplay(snapshot).current.condition.code).toBe(WEATHER_CONDITION_CODES.haze)
  })
})

describe('absolute updated-time and local wall-clock formatting', () => {
  it('formats a UTC instant in Asia/Shanghai for zh-CN', () => {
    expect(formatFullLocalTime('2026-07-14T10:29:00Z', 'zh-CN', 'Asia/Shanghai')).toContain('18:29')
  })

  it('formats the same instant for en-US without changing the instant', () => {
    const value = formatFullLocalTime('2026-07-14T10:29:00Z', 'en-US', 'Asia/Shanghai')
    expect(value).toMatch(/6:29\s*PM/i)
  })

  it('keeps date and time synchronized across a timezone day boundary', () => {
    const value = formatFullLocalTime('2026-07-14T18:29:00Z', 'zh-CN', 'Asia/Shanghai')
    expect(value).toContain('7月15日')
    expect(value).toMatch(/(?:0?2):29/)
  })

  it('falls back safely for invalid values and invalid timezone names', () => {
    expect(formatFullLocalTime('not-a-time', 'zh-CN', 'Asia/Shanghai')).toBe('not-a-time')
    expect(formatFullLocalTime('2026-07-14T10:29:00Z', 'zh-CN', 'Invalid/Zone')).toBe('2026-07-14T10:29:00Z')
  })

  it('preserves provider local wall-clock forecast semantics', () => {
    expect(formatHour('2026-07-14T10:29', 'zh-CN')).toBe('10时')
    expect(formatFullLocalTime('2026-07-14T10:29', 'zh-CN', 'America/New_York')).toContain('10时')
  })
})
