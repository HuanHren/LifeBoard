import { describe, expect, it } from 'vitest'
import { mapXiaomiWeatherCode } from '@/modules/weather/providers/xiaomi/xiaomiWeatherCodes'

describe('Xiaomi V7 weather-code mapping', () => {
  it('maps the code present in the sanitized fixture', () => {
    expect(mapXiaomiWeatherCode('0')).toEqual({ id: 'clear', providerCode: '0' })
  })

  it.each([
    [2, 'overcast'],
    [4, 'thunderstorm'],
    [8, 'moderate-rain'],
    [16, 'heavy-snow'],
    [19, 'sleet-freezing'],
    [31, 'sand-dust'],
    [53, 'haze'],
  ] as const)('maps verified Xiaomi V7 code %s', (code, expected) => {
    expect(mapXiaomiWeatherCode(code).id).toBe(expected)
  })

  it('preserves unknown numeric codes without treating them as clear', () => {
    expect(mapXiaomiWeatherCode(777)).toEqual({ id: 'unknown', providerCode: '777' })
  })

  it.each([['bad'], [null], [{}]])('uses unknown for malformed code %j', (value) => {
    expect(mapXiaomiWeatherCode(value).id).toBe('unknown')
  })
})
