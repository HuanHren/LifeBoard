import { describe, expect, it } from 'vitest'
import { normalizeXiaomiWeather } from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import { loadAllFixture, xiaomiLocation } from '../weather-xiaomi-provider/fixtures'

function hourlyValues() {
  const fixture = loadAllFixture()
  const probability = fixture.forecastHourly?.precipitationProbability
  const wind = fixture.forecastHourly?.wind
  if (!probability || !wind || !Array.isArray(wind.value)) throw new Error('Hourly fixture is incomplete.')
  return { fixture, probability, wind: wind.value }
}

describe('Xiaomi hourly probability contract', () => {
  it.each([0, 70, 100])('preserves valid probability %s', (value) => {
    const { fixture, probability } = hourlyValues()
    probability.value = [value]
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).hourly[0]?.precipitationProbabilityPercent).toBe(value)
  })

  it.each([-1, 101, '70'])('rejects out-of-contract value %s per item', (value) => {
    const { fixture, probability } = hourlyValues()
    probability.value = [value]
    const snapshot = normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(snapshot.hourly[0]).not.toHaveProperty('precipitationProbabilityPercent')
    expect(snapshot.diagnostics).toContainEqual({
      path: '$.forecastHourly.precipitationProbability.value[0]',
      code: 'invalid-optional-field',
    })
  })

  it('does not misalign or fail when the optional probability array is shorter', () => {
    const { fixture, probability } = hourlyValues()
    probability.value = []
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).hourly).toHaveLength(1)
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).hourly[0]).not.toHaveProperty('precipitationProbabilityPercent')
  })
})

describe('Xiaomi hourly wind contract', () => {
  it('maps verified km/h speed and degree direction without inventing gusts', () => {
    const { fixture, wind } = hourlyValues()
    wind[0] = { datetime: '2026-01-01T00:00:00Z', speed: '5.4', direction: '90' }
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).hourly[0]).toMatchObject({
      windSpeedKmh: 5.4,
      windDirectionDegrees: 90,
    })
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).hourly[0]).not.toHaveProperty('windGustKmh')
  })

  it('preserves calm wind and normalizes direction into 0–360', () => {
    const { fixture, wind } = hourlyValues()
    wind[0] = { datetime: '2026-01-01T00:00:00Z', speed: '0', direction: '450' }
    expect(normalizeXiaomiWeather(fixture, xiaomiLocation).hourly[0]).toMatchObject({
      windSpeedKmh: 0,
      windDirectionDegrees: 90,
    })
  })

  it('omits only malformed optional wind values', () => {
    const { fixture, wind } = hourlyValues()
    wind[0] = { datetime: '2026-01-01T00:00:00Z', speed: '-1', direction: 'bad' }
    const item = normalizeXiaomiWeather(fixture, xiaomiLocation).hourly[0]
    expect(item).not.toHaveProperty('windSpeedKmh')
    expect(item).not.toHaveProperty('windDirectionDegrees')
    expect(item?.temperatureC).toBe(20)
  })
})

describe('Xiaomi partial daily probability contract', () => {
  it('accepts verified numeric strings, preserves zero, and leaves later missing dates unset', () => {
    const fixture = loadAllFixture()
    const temperatures = fixture.forecastDaily?.temperature?.value
    const weather = fixture.forecastDaily?.weather?.value
    const probability = fixture.forecastDaily?.precipitationProbability
    if (!Array.isArray(temperatures) || !Array.isArray(weather) || !probability) throw new Error('Daily fixture is incomplete.')
    temperatures.push({ from: '21', to: '11' })
    weather.push({ from: '1', to: '1' })
    probability.value = ['0']
    const daily = normalizeXiaomiWeather(fixture, xiaomiLocation).daily
    expect(daily[0]?.precipitationProbabilityMaxPercent).toBe(0)
    expect(daily[1]).not.toHaveProperty('precipitationProbabilityMaxPercent')
    expect(daily[0]).not.toHaveProperty('windGustMaxKmh')
  })

  it('rejects one malformed daily probability without filling zero', () => {
    const fixture = loadAllFixture()
    const probability = fixture.forecastDaily?.precipitationProbability
    if (!probability) throw new Error('Daily probability fixture is missing.')
    probability.value = ['101']
    const snapshot = normalizeXiaomiWeather(fixture, xiaomiLocation)
    expect(snapshot.daily[0]).not.toHaveProperty('precipitationProbabilityMaxPercent')
    expect(snapshot.diagnostics).toContainEqual({
      path: '$.forecastDaily.precipitationProbability.value[0]',
      code: 'invalid-optional-field',
    })
  })
})
