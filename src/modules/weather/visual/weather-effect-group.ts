import type {
  LifeBoardCondition,
  WeatherEffectGroup,
} from '@/modules/weather/visual/types'

const conditionEffectGroupMap: Record<LifeBoardCondition, WeatherEffectGroup> = {
  clear: 'clear',
  'partly-cloudy': 'partly-cloudy',
  cloudy: 'cloudy',
  overcast: 'overcast',
  fog: 'fog',
  haze: 'haze',
  drizzle: 'light-rain',
  'light-rain': 'light-rain',
  'moderate-rain': 'moderate-rain',
  'heavy-rain': 'heavy-rain',
  thunderstorm: 'thunderstorm',
  'light-snow': 'light-snow',
  'moderate-snow': 'moderate-snow',
  'heavy-snow': 'heavy-snow',
  'sleet-freezing': 'sleet-freezing',
  'sand-dust': 'sand-dust',
  unknown: 'unknown',
}

export function getWeatherEffectGroup(
  condition: LifeBoardCondition,
): WeatherEffectGroup {
  return conditionEffectGroupMap[condition]
}

export const weatherEffectGroupTestInternals = {
  conditionEffectGroupMap,
}
