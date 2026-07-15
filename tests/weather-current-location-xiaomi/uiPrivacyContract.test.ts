import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PERSISTENCE_REGISTRY } from '@/shared/persistence/registry'

const dialogSource = readFileSync(
  new URL('../../src/modules/weather/components/XiaomiCurrentLocationDialog.vue', import.meta.url),
  'utf8',
)
const composableSource = readFileSync(
  new URL('../../src/modules/weather/composables/useCurrentLocationWeather.ts', import.meta.url),
  'utf8',
)
const homeSource = readFileSync(
  new URL('../../src/modules/home/HomeWeatherSummary.vue', import.meta.url),
  'utf8',
)
const citySource = readFileSync(
  new URL('../../src/modules/weather/pages/WeatherCityManagementPage.vue', import.meta.url),
  'utf8',
)
const reverseSource = readFileSync(
  new URL('../../src/modules/weather/services/bigDataCloudReverseGeocoder.ts', import.meta.url),
  'utf8',
)

describe('Xiaomi current-location UI, privacy, and persistence contracts', () => {
  it('uses a modal native dialog with Escape cancellation and focus restoration', () => {
    expect(dialogSource).toContain('<dialog')
    expect(dialogSource).toContain('showModal()')
    expect(dialogSource).toContain('@cancel.prevent="handleCancel"')
    expect(dialogSource).toContain('returnFocus.focus()')
  })

  it('uses a labelled radio group and explicit confirmation', () => {
    expect(dialogSource).toContain('<fieldset')
    expect(dialogSource).toContain('<legend')
    expect(dialogSource).toContain('type="radio"')
    expect(dialogSource).toContain(':disabled="selectedIndex === null"')
    expect(dialogSource).toContain("emit('confirm')")
  })

  it('does not auto-select even a single recommended candidate', () => {
    expect(composableSource).toContain('selectedCandidateIndex.value = null')
    expect(composableSource).not.toMatch(/selectedCandidateIndex\.value\s*=\s*0/)
    expect(dialogSource).toContain('candidate.recommended')
  })

  it('does not call reverse geocoding before explicit consent', () => {
    const consentIndex = composableSource.indexOf("dialogMode.value = 'consent'")
    const reverseIndex = composableSource.indexOf('dependencies.resolve(')
    expect(consentIndex).toBeGreaterThan(0)
    expect(reverseIndex).toBeGreaterThan(consentIndex)
    expect(composableSource).toContain('continueResolution')
  })

  it('cancels previous work and ignores late responses with a request token', () => {
    expect(composableSource).toContain('resolutionController?.abort()')
    expect(composableSource).toContain('token !== activeToken')
    expect(composableSource).toContain('onBeforeUnmount(cancel)')
    expect(composableSource).toContain("weatherStore.provider !== 'xiaomi'")
    expect(composableSource).toContain("options.locale.value !== 'zh-CN'")
  })

  it('prevents Home auto-location from running the Xiaomi third-party flow', () => {
    expect(homeSource).toContain("provider.value !== 'xiaomi'")
    expect(homeSource).toContain('autoLocationOnHome.value')
  })

  it('provides the existing manual-search route from both UI entry points', () => {
    expect(homeSource).toContain("name: 'weather-cities'")
    expect(citySource).toContain("querySelector<HTMLInputElement>('#weather-city-search')")
  })

  it('exposes loading and errors through accessible live semantics', () => {
    expect(dialogSource).toContain('aria-live="polite"')
    expect(dialogSource).toContain('role="alert"')
    expect(dialogSource).toContain(':aria-busy=')
  })

  it('uses a 390px-safe responsive width without a fixed content table', () => {
    expect(dialogSource).toContain('w-[min(36rem,calc(100%-2rem))]')
    expect(dialogSource).not.toContain('<table')
  })

  it('keeps the reverse service client-side, keyless, and free of logging', () => {
    expect(reverseSource).toContain('https://api.bigdatacloud.net/data/reverse-geocode-client')
    expect(reverseSource).not.toMatch(/console\.(?:log|info|warn|error)/)
    expect(reverseSource).not.toMatch(/api[_-]?key|authorization/i)
  })

  it('does not add a persistence registry entry', () => {
    expect(PERSISTENCE_REGISTRY).toHaveLength(11)
    expect(PERSISTENCE_REGISTRY.map((entry) => entry.storageKey))
      .not.toContain('lifeboard.weather.current-location-resolution')
  })

  it('contains no server credential or raw-provider metadata marker', () => {
    const combined = [dialogSource, composableSource, reverseSource].join('\n')
    expect(combined).not.toMatch(/weatherapi\.market\.xiaomi\.com/i)
    expect(combined).not.toMatch(/sourceMaps\.clientInfo|appKey|XIAOMI_WEATHER_SIGN|OAID/i)
  })
})
