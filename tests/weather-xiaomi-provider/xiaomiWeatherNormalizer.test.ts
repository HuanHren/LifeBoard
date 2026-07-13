import { describe, expect, it } from 'vitest'
import {
  normalizeXiaomiWeather,
} from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import { loadAllFixture, xiaomiLocation } from './fixtures'

describe('Xiaomi weather normalization', () => {
  it('normalizes current weather and preserves zero values', () => {
    const snapshot = normalizeXiaomiWeather(loadAllFixture(), xiaomiLocation)
    expect(snapshot.current).toMatchObject({
      observedAt: '2026-01-01T00:00:00.000Z',
      temperatureC: 20,
      apparentTemperatureC: 20,
      humidityPercent: 50,
      windSpeedKmh: 0,
      windDirectionDegrees: 0,
      pressureHpa: 1000,
      visibilityKm: 10,
      uvIndex: 1,
      condition: { id: 'clear', providerCode: '0' },
    })
  })

  it('normalizes updateTime as verified Unix milliseconds', () => {
    expect(normalizeXiaomiWeather(loadAllFixture(), xiaomiLocation).updatedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('normalizes aligned hourly values using wind datetime as the time anchor', () => {
    expect(normalizeXiaomiWeather(loadAllFixture(), xiaomiLocation).hourly).toEqual([{
      time: '2026-01-01T00:00:00.000Z',
      temperatureC: 20,
      condition: { id: 'clear', providerCode: '0' },
    }])
  })

  it('maps daily from/to to verified high/low and day/night semantics', () => {
    const fixture = loadAllFixture()
    const temperature = fixture.forecastDaily?.temperature?.value
    if (!Array.isArray(temperature)) throw new Error('Fixture daily temperature is missing.')
    temperature[0] = { from: '-1', to: '-8' }
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).daily).toEqual([{
      date: '2026-01-01',
      temperatureMaxC: -1,
      temperatureMinC: -8,
      dayCondition: { id: 'clear', providerCode: '0' },
      nightCondition: { id: 'clear', providerCode: '0' },
      sunrise: '2026-01-01T06:00:00.000Z',
      sunset: '2026-01-01T18:00:00.000Z',
    }])
  })

  it('keeps the local forecast date when astronomy is missing', () => {
    const fixture = loadAllFixture()
    if (!fixture.forecastDaily) throw new Error('Fixture daily forecast is missing.')
    fixture.forecastDaily.sunRiseSet = undefined
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).daily[0]).toMatchObject({
      date: '2026-01-01',
    })
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).daily[0]).not.toHaveProperty('sunrise')
  })

  it('rejects a malformed daily publication date at entry level', () => {
    const fixture = loadAllFixture()
    if (!fixture.forecastDaily) throw new Error('Fixture daily forecast is missing.')
    fixture.forecastDaily.pubTime = '2026-02-31T00:00:00Z'
    const snapshot = normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(snapshot.daily).toEqual([])
    expect(snapshot.diagnostics).toContainEqual({ path: '$.forecastDaily[0]', code: 'invalid-entry' })
  })

  it('accepts an empty verified daily collection without fabricating entries', () => {
    const fixture = loadAllFixture()
    const temperature = fixture.forecastDaily?.temperature
    const weather = fixture.forecastDaily?.weather
    if (!temperature || !weather) throw new Error('Fixture daily forecast is missing.')
    temperature.value = []
    weather.value = []
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).daily).toEqual([])
  })

  it('maps an unknown daily weather code to unknown', () => {
    const fixture = loadAllFixture()
    const weather = fixture.forecastDaily?.weather?.value
    if (!Array.isArray(weather)) throw new Error('Fixture daily weather is missing.')
    weather[0] = { from: '777', to: 'bad' }
    const [day] = normalizeXiaomiWeather(fixture, xiaomiLocation).daily
    expect(day?.dayCondition.id).toBe('unknown')
    expect(day?.nightCondition.id).toBe('unknown')
  })

  it('omits a missing optional current field', () => {
    const fixture = loadAllFixture()
    if (!fixture.current) throw new Error('Fixture current weather is missing.')
    fixture.current.feelsLike = undefined
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).current.apparentTemperatureC).toBeUndefined()
  })

  it('keeps AQI scale explicit when the provider scale is unverified', () => {
    expect(normalizeXiaomiWeather(loadAllFixture(), xiaomiLocation).airQuality).toEqual({
      value: 42,
      scale: 'unknown',
      observedAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('keeps Xiaomi extensions separate from common current/hourly/daily data', () => {
    const snapshot = normalizeXiaomiWeather(loadAllFixture(), xiaomiLocation)
    expect(snapshot.extensions).toHaveProperty('minutely')
    expect(snapshot.extensions).toHaveProperty('alerts')
    expect(snapshot.extensions).toHaveProperty('sourceMaps')
    expect(snapshot.current).not.toHaveProperty('minutely')
  })

  it('preserves optional capability states without failing the snapshot', () => {
    const fixture = loadAllFixture()
    delete fixture.minutely
    fixture.alerts = []
    fixture.typhoon = null
    const states = normalizeXiaomiWeather(fixture, xiaomiLocation).capabilities
    expect(states).toMatchObject({ minutely: 'missing', alerts: 'empty-array', typhoon: 'null' })
  })

  it('does not fail when the optional hourly capability is an empty object', () => {
    const fixture = loadAllFixture()
    fixture.forecastHourly = {}
    const snapshot = normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(snapshot.hourly).toEqual([])
    expect(snapshot.capabilities.hourly).toBe('empty-object')
  })

  it('records malformed optional values rather than inventing zero', () => {
    const fixture = loadAllFixture()
    if (!fixture.current) throw new Error('Fixture current weather is missing.')
    fixture.current.visibility = { unit: 'km', value: 'bad' }
    fixture.aqi = { aqi: 'bad' }
    const snapshot = normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(snapshot.current.visibilityKm).toBeUndefined()
    expect(snapshot.airQuality).toBeUndefined()
    expect(snapshot.diagnostics).toEqual(expect.arrayContaining([
      { path: '$.current.visibility.value', code: 'invalid-optional-field' },
      { path: '$.aqi.aqi', code: 'invalid-optional-field' },
    ]))
  })

  it('skips one malformed hourly entry and diagnoses it', () => {
    const fixture = loadAllFixture()
    const values = fixture.forecastHourly?.temperature?.value
    if (!Array.isArray(values)) throw new Error('Fixture hourly temperature is missing.')
    values[0] = 'bad'
    const snapshot = normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(snapshot.hourly).toEqual([])
    expect(snapshot.diagnostics).toContainEqual({ path: '$.forecastHourly[0]', code: 'invalid-entry' })
  })

  it('fails an irreconcilable hourly parallel-array contract', () => {
    const fixture = loadAllFixture()
    const values = fixture.forecastHourly?.weather?.value
    if (!Array.isArray(values)) throw new Error('Fixture hourly weather is missing.')
    values.push(1)
    expect(() => normalizeXiaomiWeather(fixture, xiaomiLocation)).toThrowError(
      expect.objectContaining({ code: 'invalid-hourly-contract' }),
    )
  })

  it.each([
    ['current', (fixture: ReturnType<typeof loadAllFixture>) => { fixture.current = null }, 'invalid-current'],
    ['update time', (fixture: ReturnType<typeof loadAllFixture>) => { fixture.updateTime = 'seconds?' }, 'invalid-update-time'],
  ])('fails invalid required %s', (_label, mutate, code) => {
    const fixture = loadAllFixture()
    mutate(fixture)
    expect(() => normalizeXiaomiWeather(fixture, xiaomiLocation)).toThrowError(
      expect.objectContaining({ code }),
    )
  })

  it('fails invalid location identity and coordinates', () => {
    expect(() => normalizeXiaomiWeather(loadAllFixture(), { ...xiaomiLocation, latitude: 91 })).toThrowError(
      expect.objectContaining({ code: 'invalid-location' }),
    )
  })

  it.each(['appKey', 'sign', 'oaid', 'device', 'appVersion', 'romVersion'])('rejects secret-shaped property %s anywhere in raw data', (key) => {
    const fixture = loadAllFixture()
    fixture.sourceMaps = { clientInfo: { [key]: 'safe-placeholder' } }
    expect(() => normalizeXiaomiWeather(fixture, xiaomiLocation)).toThrowError(
      expect.objectContaining({ code: 'secret-detected' }),
    )
  })

  it('does not mutate the provider response or input location', () => {
    const fixture = loadAllFixture()
    const fixtureBefore = structuredClone(fixture)
    const locationBefore = structuredClone(xiaomiLocation)
    normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(fixture).toEqual(fixtureBefore)
    expect(xiaomiLocation).toEqual(locationBefore)
  })

  it('does not expose credential-shaped fields in serialized output', () => {
    const serialized = JSON.stringify(normalizeXiaomiWeather(loadAllFixture(), xiaomiLocation))
    expect(serialized).not.toMatch(/appKey|sign|oaid|XIAOMI_WEATHER_|weatherapi\.market\.xiaomi\.com/i)
  })
})
