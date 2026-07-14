import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function source(relativePath: string) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8')
}

describe('Weather W5 recovery UI and accessibility contract', () => {
  const notice = source('src/modules/weather/components/WeatherRecoveryNotice.vue')
  const workspace = source('src/modules/weather/components/WeatherWorkspace.vue')
  const home = source('src/modules/home/HomeWeatherSummary.vue')

  it('uses one polite status surface with a keyboard-native retry button', () => {
    expect(notice).toContain('role="status"')
    expect(notice).toContain('aria-live="polite"')
    expect(notice).toContain('<BaseButton')
    expect(notice).toContain('@click="emit(\'retry\')"')
    expect(notice).toContain("import BaseButton from '@/components/base/BaseButton.vue'")
  })

  it('distinguishes fresh, stale, offline, fallback and rate-limited copy', () => {
    for (const key of [
      'weather.recovery.freshCache',
      'weather.recovery.staleCache',
      'weather.recovery.offline',
      'weather.recovery.fallback',
      'weather.recovery.rateLimited',
    ]) expect(notice).toContain(key)
  })

  it('integrates one notice without changing the Weather Hero or duplicating provider lifecycles', () => {
    expect(workspace.match(/<WeatherRecoveryNotice/g)).toHaveLength(1)
    expect(workspace.match(/<WeatherHero/g)).toHaveLength(1)
    expect(workspace).toContain('@retry="retryForecast"')
  })

  it('keeps Home weather visible and honestly labels non-live data', () => {
    expect(home).toContain('recoveryState')
    expect(home).toContain('dataFreshness')
    expect(home).toContain('home.weather.fallback')
    expect(home).toContain('home.weather.offline')
    expect(home).toContain('home.weather.rateLimited')
  })

  it('does not render raw error bodies or Xiaomi internal metadata', () => {
    const combined = `${notice}\n${workspace}\n${home}`
    expect(combined).not.toContain('clientInfo')
    expect(combined).not.toContain('upstream raw response')
    expect(combined).not.toContain('weatherapi.market.xiaomi.com')
  })
})
