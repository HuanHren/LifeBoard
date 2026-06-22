import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import { getLifeBoardConditionFromWmo } from '@/modules/weather/visual/weather-condition'
import { getWeatherEffectGroup } from '@/modules/weather/visual/weather-effect-group'

export type WeatherAtmosphere =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'overcast'
  | 'rain-day'
  | 'rain-night'
  | 'thunderstorm'
  | 'fog-haze'
  | 'snow'
  | 'neutral'

function dayNightState<TDay extends WeatherAtmosphere, TNight extends WeatherAtmosphere>(
  isDay: boolean | null | undefined,
  dayState: TDay,
  nightState: TNight,
  fallbackState: TDay | 'neutral' = dayState,
) {
  if (isDay === true) {
    return dayState
  }

  if (isDay === false) {
    return nightState
  }

  return fallbackState
}

export function getWeatherAtmosphere(weather: WeatherSnapshot): WeatherAtmosphere {
  const condition = getLifeBoardConditionFromWmo(weather.current.condition.code)
  const effectGroup = getWeatherEffectGroup(condition)

  if (effectGroup === 'thunderstorm') {
    return 'thunderstorm'
  }

  if (
    effectGroup === 'light-snow' ||
    effectGroup === 'moderate-snow' ||
    effectGroup === 'heavy-snow'
  ) {
    return 'snow'
  }

  if (
    effectGroup === 'light-rain' ||
    effectGroup === 'moderate-rain' ||
    effectGroup === 'heavy-rain' ||
    effectGroup === 'sleet-freezing'
  ) {
    return dayNightState(weather.current.isDay, 'rain-day', 'rain-night')
  }

  if (effectGroup === 'fog' || effectGroup === 'haze') {
    return 'fog-haze'
  }

  if (effectGroup === 'overcast' || effectGroup === 'cloudy') {
    return 'overcast'
  }

  if (effectGroup === 'partly-cloudy') {
    return dayNightState(
      weather.current.isDay,
      'partly-cloudy-day',
      'partly-cloudy-night',
      'neutral',
    )
  }

  if (effectGroup === 'clear') {
    return dayNightState(weather.current.isDay, 'clear-day', 'clear-night', 'neutral')
  }

  return 'neutral'
}
