import type { WeatherCondition } from '@/modules/weather/types/weather'
import { WEATHER_CONDITION_CODES } from '@/modules/weather/constants/weatherConditionCodes'

const weatherConditions: Record<number, Omit<WeatherCondition, 'code'>> = {
  0: { label: 'Clear sky', shortLabel: 'Clear' },
  1: { label: 'Mainly clear', shortLabel: 'Mostly clear' },
  2: { label: 'Partly cloudy', shortLabel: 'Partly cloudy' },
  3: { label: 'Overcast', shortLabel: 'Overcast' },
  45: { label: 'Fog', shortLabel: 'Fog' },
  48: { label: 'Depositing rime fog', shortLabel: 'Rime fog' },
  51: { label: 'Light drizzle', shortLabel: 'Drizzle' },
  53: { label: 'Moderate drizzle', shortLabel: 'Drizzle' },
  55: { label: 'Dense drizzle', shortLabel: 'Heavy drizzle' },
  56: { label: 'Light freezing drizzle', shortLabel: 'Freezing drizzle' },
  57: { label: 'Dense freezing drizzle', shortLabel: 'Freezing drizzle' },
  61: { label: 'Slight rain', shortLabel: 'Light rain' },
  63: { label: 'Moderate rain', shortLabel: 'Rain' },
  65: { label: 'Heavy rain', shortLabel: 'Heavy rain' },
  66: { label: 'Light freezing rain', shortLabel: 'Freezing rain' },
  67: { label: 'Heavy freezing rain', shortLabel: 'Freezing rain' },
  71: { label: 'Slight snowfall', shortLabel: 'Light snow' },
  73: { label: 'Moderate snowfall', shortLabel: 'Snow' },
  75: { label: 'Heavy snowfall', shortLabel: 'Heavy snow' },
  77: { label: 'Snow grains', shortLabel: 'Snow grains' },
  80: { label: 'Slight rain showers', shortLabel: 'Light showers' },
  81: { label: 'Moderate rain showers', shortLabel: 'Showers' },
  82: { label: 'Violent rain showers', shortLabel: 'Heavy showers' },
  85: { label: 'Slight snow showers', shortLabel: 'Snow showers' },
  86: { label: 'Heavy snow showers', shortLabel: 'Heavy snow showers' },
  95: { label: 'Thunderstorm', shortLabel: 'Thunderstorm' },
  96: { label: 'Thunderstorm with slight hail', shortLabel: 'Storm and hail' },
  99: { label: 'Thunderstorm with heavy hail', shortLabel: 'Storm and hail' },
  [WEATHER_CONDITION_CODES.cloudy]: { label: 'Cloudy', shortLabel: 'Cloudy' },
  [WEATHER_CONDITION_CODES.haze]: { label: 'Haze', shortLabel: 'Haze' },
  [WEATHER_CONDITION_CODES.sandDust]: { label: 'Sand and dust', shortLabel: 'Dust' },
}

export function getWeatherCondition(code: number): WeatherCondition {
  const condition = weatherConditions[code] ?? {
    label: 'Conditions unavailable',
    shortLabel: 'Unavailable',
  }

  return {
    code,
    ...condition,
  }
}

export function isThunderstormCode(code: number) {
  return code >= 95
}

export function isFreezingPrecipitationCode(code: number) {
  return code === 56 || code === 57 || code === 66 || code === 67
}

export function isHeavyPrecipitationCode(code: number) {
  return code === 65 || code === 67 || code === 75 || code === 82 || code === 86
}
