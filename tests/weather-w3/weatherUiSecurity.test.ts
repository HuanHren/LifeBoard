import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function filesUnder(relativePath: string): string[] {
  const directory = resolve(root, relativePath)
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name)
    return statSync(path).isDirectory()
      ? filesUnder(`${relativePath}/${name}`)
      : [path]
  })
}

describe('Weather W3 selector accessibility and client security boundary', () => {
  it('uses one native labelled radio group for provider selection', () => {
    const selector = read('src/modules/settings/components/WeatherProviderPreferences.vue')
    expect(selector).toContain('<fieldset')
    expect(selector).toContain('<legend')
    expect(selector).toContain('type="radio"')
    expect(selector).toContain('name="weather-provider"')
    expect(selector).toContain('focus-visible:outline-2')
  })

  it('disables unsupported Xiaomi locale selection and explains effective-provider differences', () => {
    const selector = read('src/modules/settings/components/WeatherProviderPreferences.vue')
    expect(selector).toContain(':disabled="option.disabled"')
    expect(selector).toContain('xiaomiUnsupportedLocale')
    expect(selector).toContain("provider === 'xiaomi' && effectiveProvider !== 'xiaomi'")
    expect(selector).toContain('xiaomiLocationRequired')
  })

  it('shows the Xiaomi option only behind the centralized non-secret feature flag', () => {
    const selector = read('src/modules/settings/components/WeatherProviderPreferences.vue')
    const settings = read('src/modules/settings/components/SettingsWorkspace.vue')
    const flags = read('src/modules/weather/providers/weatherFeatureFlags.ts')
    expect(selector).toContain('props.xiaomiEnabled')
    expect(settings).toContain(':xiaomi-enabled="xiaomiWeatherEnabled"')
    expect(flags).toContain("VITE_XIAOMI_WEATHER_ENABLED === 'true'")
  })

  it('does not duplicate the selector in Weather or Home', () => {
    const settings = read('src/modules/settings/components/SettingsWorkspace.vue')
    const weather = read('src/modules/weather/components/WeatherWorkspace.vue')
    const home = read('src/modules/home/HomeWeatherSummary.vue')
    expect(settings.match(/<WeatherProviderPreferences/g)).toHaveLength(1)
    expect(weather).not.toContain('WeatherProviderPreferences')
    expect(home).not.toContain('WeatherProviderPreferences')
  })

  it('keeps raw Xiaomi types and extensions out of rendering components', () => {
    const componentSource = [
      ...filesUnder('src/modules/weather/components'),
      ...filesUnder('src/modules/home'),
    ].filter((path) => path.endsWith('.vue') || path.endsWith('.ts'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    expect(componentSource).not.toContain('xiaomiRawTypes')
    expect(componentSource).not.toContain('XiaomiWeatherExtensions')
    for (const field of ['sourceMaps', 'brandInfo', 'preHour', 'typhoon', 'yesterday']) {
      expect(componentSource).not.toContain(field)
    }
    const workspace = read('src/modules/weather/components/WeatherWorkspace.vue')
    expect(workspace).not.toContain("provider !== 'xiaomi'")
    expect(workspace).not.toContain("provider === 'xiaomi'")
  })

  it('contains no Xiaomi upstream hostname or server credential names in client source', () => {
    const source = filesUnder('src')
      .filter((path) => /\.(ts|vue)$/.test(path))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    for (const forbidden of [
      'weatherapi.market.xiaomi.com',
      'XIAOMI_WEATHER_BASE_URL',
      'XIAOMI_WEATHER_APP_KEY',
      'XIAOMI_WEATHER_SIGN',
      'XIAOMI_WEATHER_APP_VERSION',
      'XIAOMI_WEATHER_ROM_VERSION',
      'XIAOMI_WEATHER_DEVICE',
      'XIAOMI_WEATHER_OAID',
      'sourceMaps.clientInfo.appKey',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('keeps Xiaomi transport limited to the two LifeBoard proxy routes', () => {
    const client = read('src/modules/weather/providers/xiaomi/xiaomiProvider.ts')
    expect(client).toContain("search: '/api/weather/xiaomi/search'")
    expect(client).toContain("all: '/api/weather/xiaomi/all'")
    expect(client).not.toContain('weatherapi.market.xiaomi.com')
  })
})
