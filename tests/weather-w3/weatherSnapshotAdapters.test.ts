import { describe, expect, it } from 'vitest'
import {
  adaptLegacyWeatherSnapshot,
  adaptProviderSnapshotForDisplay,
  providerLocationToWeatherLocation,
} from '@/modules/weather/providers/weatherSnapshotAdapters'
import { mapPortableWeatherLocation } from '@/shared/persistence/portableExportValidation'
import {
  createLegacySnapshot,
  createXiaomiProviderSnapshot,
  xiaomiWeatherLocation,
} from './fixtures'

describe('Weather W3 provider-neutral compatibility adapters', () => {
  it('round-trips representative Open-Meteo data without changing displayed values', () => {
    const legacy = createLegacySnapshot()
    const result = adaptProviderSnapshotForDisplay(adaptLegacyWeatherSnapshot(legacy))
    expect(result).toEqual(legacy)
  })

  it('preserves zero and negative values through the provider model', () => {
    const result = adaptProviderSnapshotForDisplay(
      adaptLegacyWeatherSnapshot(createLegacySnapshot()),
    )
    expect(result.current.temperature).toBe(0)
    expect(result.current.windSpeed).toBe(0)
    expect(result.daily[0]?.temperatureMin).toBe(-2)
  })

  it('maps Xiaomi common fields and leaves unsupported values null instead of zero', () => {
    const result = adaptProviderSnapshotForDisplay(createXiaomiProviderSnapshot())
    expect(result.provider).toBe('xiaomi')
    expect(result.current).toMatchObject({
      temperature: 0,
      apparentTemperature: -1,
      precipitation: null,
      cloudCover: null,
      windGusts: null,
    })
    expect(result.hourly[0]).toMatchObject({
      temperature: 0,
      precipitationProbability: null,
      precipitation: null,
      windSpeed: null,
    })
    expect(result.daily[0]).toMatchObject({
      temperatureMax: 5,
      temperatureMin: -2,
      precipitationSum: null,
      windSpeedMax: null,
    })
  })

  it('derives day state only from verified observation and astronomy timestamps', () => {
    const snapshot = createXiaomiProviderSnapshot()
    expect(adaptProviderSnapshotForDisplay(snapshot).current.isDay).toBe(true)
    snapshot.daily[0] = { ...snapshot.daily[0]!, sunrise: undefined, sunset: undefined }
    expect(adaptProviderSnapshotForDisplay(snapshot).current.isDay).toBeNull()
  })

  it('maps unknown conditions to unavailable rather than clear', () => {
    const snapshot = createXiaomiProviderSnapshot()
    snapshot.current.condition = { id: 'unknown', providerCode: 'unmapped' }
    const condition = adaptProviderSnapshotForDisplay(snapshot).current.condition
    expect(condition.code).toBe(-1)
    expect(condition.shortLabel).toBe('Unavailable')
  })

  it('keeps Xiaomi extensions out of the display snapshot', () => {
    const snapshot = createXiaomiProviderSnapshot()
    const result = adaptProviderSnapshotForDisplay(snapshot)
    expect(result.alerts).toEqual([])
    expect(result.shortTermPrecipitation).toBeNull()
    expect(JSON.stringify(result)).not.toContain('minutely')
  })

  it('creates an opaque Xiaomi location identity without choosing a result implicitly', () => {
    const location = providerLocationToWeatherLocation(
      createXiaomiProviderSnapshot().location,
    )
    expect(location).toEqual(xiaomiWeatherLocation)
    expect(location.providerLocationIds?.xiaomi).toBe('opaque-location')
  })

  it('keeps the runtime Xiaomi ID in existing location storage but strips it from portable v1', () => {
    const location = providerLocationToWeatherLocation(createXiaomiProviderSnapshot().location)
    const mapped = mapPortableWeatherLocation(location)
    expect(mapped.ok).toBe(true)
    if (!mapped.ok) return
    expect(mapped.data).not.toHaveProperty('providerLocationIds')
    expect(mapped.data.id).toBe('xiaomi:opaque-location')
  })

  it('does not mutate either legacy or provider snapshots', () => {
    const legacy = createLegacySnapshot()
    const legacyBefore = structuredClone(legacy)
    adaptLegacyWeatherSnapshot(legacy)
    expect(legacy).toEqual(legacyBefore)

    const provider = createXiaomiProviderSnapshot()
    const providerBefore = structuredClone(provider)
    adaptProviderSnapshotForDisplay(provider)
    expect(provider).toEqual(providerBefore)
  })

  it('keeps serialized display data free of Xiaomi credential field names', () => {
    const serialized = JSON.stringify(adaptProviderSnapshotForDisplay(createXiaomiProviderSnapshot()))
    for (const forbidden of [
      'appKey', 'sign', 'oaid', 'XIAOMI_WEATHER_', 'weatherapi.market.xiaomi.com',
    ]) {
      expect(serialized).not.toContain(forbidden)
    }
  })
})
