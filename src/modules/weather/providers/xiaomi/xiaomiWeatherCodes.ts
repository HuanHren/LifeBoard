import type { CanonicalWeatherCondition, ProviderWeatherCondition } from '@/modules/weather/providers/types'

const xiaomiV7ConditionMap: Readonly<Record<number, CanonicalWeatherCondition>> = {
  0: 'clear',
  1: 'cloudy',
  2: 'overcast',
  3: 'light-rain',
  4: 'thunderstorm',
  5: 'sleet-freezing',
  6: 'sleet-freezing',
  7: 'light-rain',
  8: 'moderate-rain',
  9: 'heavy-rain',
  10: 'thunderstorm',
  11: 'heavy-rain',
  12: 'heavy-rain',
  13: 'light-snow',
  14: 'light-snow',
  15: 'moderate-snow',
  16: 'heavy-snow',
  17: 'heavy-snow',
  18: 'fog',
  19: 'sleet-freezing',
  20: 'sand-dust',
  21: 'moderate-rain',
  22: 'heavy-rain',
  23: 'heavy-rain',
  24: 'heavy-rain',
  25: 'heavy-rain',
  26: 'moderate-snow',
  27: 'heavy-snow',
  28: 'heavy-snow',
  29: 'sand-dust',
  30: 'sand-dust',
  31: 'sand-dust',
  32: 'fog',
  33: 'light-snow',
  49: 'fog',
  53: 'haze',
  54: 'haze',
  55: 'haze',
  56: 'haze',
  57: 'fog',
  58: 'fog',
  99: 'unknown',
  301: 'moderate-rain',
  302: 'moderate-snow',
}

export function mapXiaomiWeatherCode(value: unknown): ProviderWeatherCondition {
  const providerCode = typeof value === 'number' || typeof value === 'string' ? String(value) : 'invalid'
  const code = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^-?\d+$/.test(value.trim())
      ? Number(value)
      : Number.NaN

  return {
    id: Number.isInteger(code) ? (xiaomiV7ConditionMap[code] ?? 'unknown') : 'unknown',
    providerCode,
  }
}

export const xiaomiWeatherCodeTestInternals = { xiaomiV7ConditionMap }
