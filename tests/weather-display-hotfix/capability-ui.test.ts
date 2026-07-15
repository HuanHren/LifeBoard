import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { adaptLegacyWeatherSnapshot, adaptProviderSnapshotForDisplay } from '@/modules/weather/providers/weatherSnapshotAdapters'
import { createLegacySnapshot } from '../weather-w3/fixtures'

const hourlySource = readFileSync(new URL('../../src/modules/weather/components/HourlyForecastStrip.vue', import.meta.url), 'utf8')
const dailySource = readFileSync(new URL('../../src/modules/weather/components/DailyForecastStrip.vue', import.meta.url), 'utf8')

describe('capability-aware forecast rendering', () => {
  it('renders hourly metrics by data presence and suppresses an empty metric shell', () => {
    expect(hourlySource).toContain('v-if="hasExtraMetrics(item)"')
    expect(hourlySource).toContain('v-if="item.precipitationProbability !== null"')
    expect(hourlySource).toContain('v-if="item.precipitation !== null"')
    expect(hourlySource).toContain('v-if="item.windSpeed !== null"')
    expect(hourlySource).not.toMatch(/provider\s*===\s*['"]xiaomi/)
  })

  it('hides unsupported daily probability and gust rows independently', () => {
    expect(dailySource).toContain('item.precipitationProbabilityMax !== null || item.windGustsMax !== null')
    expect(dailySource).toContain('v-if="item.precipitationProbabilityMax !== null"')
    expect(dailySource).toContain('v-if="item.windGustsMax !== null"')
    expect(dailySource).not.toMatch(/provider\s*===\s*['"]xiaomi/)
  })

  it('keeps representative Open-Meteo display data unchanged', () => {
    const legacy = createLegacySnapshot()
    expect(adaptProviderSnapshotForDisplay(adaptLegacyWeatherSnapshot(legacy))).toEqual(legacy)
  })
})
