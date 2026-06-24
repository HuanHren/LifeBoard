import type {
  WeatherEffectGroup,
  WeatherIntensity,
  WeatherIntensityPreset,
} from '@/modules/weather/visual/types'

const wmoIntensityMap: Record<number, WeatherIntensity> = {
  51: 'light',
  53: 'moderate',
  55: 'heavy',
  56: 'light',
  57: 'heavy',
  61: 'light',
  63: 'moderate',
  65: 'heavy',
  66: 'light',
  67: 'heavy',
  71: 'light',
  73: 'moderate',
  75: 'heavy',
  77: 'light',
  80: 'light',
  81: 'moderate',
  82: 'heavy',
  85: 'light',
  86: 'heavy',
  95: 'moderate',
  96: 'heavy',
  99: 'severe',
}

export const WEATHER_INTENSITY_PRESETS: Record<
  WeatherIntensity,
  WeatherIntensityPreset
> = {
  none: {
    density: 0,
    speed: 0,
    opacity: 0,
    cloudDarkness: 0,
    atmosphereOpacity: 0,
  },
  light: {
    density: 0.45,
    speed: 0.72,
    opacity: 0.62,
    cloudDarkness: 0.22,
    atmosphereOpacity: 0.52,
  },
  moderate: {
    density: 0.68,
    speed: 0.92,
    opacity: 0.78,
    cloudDarkness: 0.42,
    atmosphereOpacity: 0.68,
  },
  heavy: {
    density: 0.86,
    speed: 1.12,
    opacity: 0.92,
    cloudDarkness: 0.62,
    atmosphereOpacity: 0.82,
  },
  severe: {
    density: 0.94,
    speed: 1.18,
    opacity: 0.96,
    cloudDarkness: 0.72,
    atmosphereOpacity: 0.88,
  },
}

const precipitationEffectGroups = new Set<WeatherEffectGroup>([
  'light-rain',
  'moderate-rain',
  'heavy-rain',
  'light-snow',
  'moderate-snow',
  'heavy-snow',
  'sleet-freezing',
  'thunderstorm',
])

export function getWeatherIntensityFromWmo(code: number): WeatherIntensity {
  return wmoIntensityMap[code] ?? 'none'
}

export function getWeatherIntensityPreset(
  intensity: WeatherIntensity,
): WeatherIntensityPreset {
  return WEATHER_INTENSITY_PRESETS[intensity]
}

export function shouldApplyWeatherIntensity(
  effectGroup: WeatherEffectGroup,
) {
  return precipitationEffectGroups.has(effectGroup)
}

export const weatherIntensityTestInternals = {
  precipitationEffectGroups,
  wmoIntensityMap,
}
