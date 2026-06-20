import type { WeatherSnapshot } from '@/modules/weather/types/weather'

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

function isRainCode(code: number) {
  return (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)
  )
}

function isSnowCode(code: number) {
  return code >= 71 && code <= 77 || code === 85 || code === 86
}

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
  const { code } = weather.current.condition

  if (code === 95 || code === 96 || code === 99) {
    return 'thunderstorm'
  }

  if (isSnowCode(code)) {
    return 'snow'
  }

  if (isRainCode(code)) {
    return dayNightState(weather.current.isDay, 'rain-day', 'rain-night')
  }

  if (code === 45 || code === 48) {
    return 'fog-haze'
  }

  if (code === 3) {
    return 'overcast'
  }

  if (code === 2) {
    return dayNightState(
      weather.current.isDay,
      'partly-cloudy-day',
      'partly-cloudy-night',
      'neutral',
    )
  }

  if (code === 0 || code === 1) {
    return dayNightState(weather.current.isDay, 'clear-day', 'clear-night', 'neutral')
  }

  return 'neutral'
}
