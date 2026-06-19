import type { WeatherSnapshot } from '@/modules/weather/types/weather'

export type WeatherAtmosphere =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'overcast'
  | 'fog-haze'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
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

export function getWeatherAtmosphere(weather: WeatherSnapshot): WeatherAtmosphere {
  const { code } = weather.current.condition

  if (code === 95 || code === 96 || code === 99) {
    return 'thunderstorm'
  }

  if (isSnowCode(code)) {
    return 'snow'
  }

  if (isRainCode(code)) {
    return 'rain'
  }

  if (code === 45 || code === 48) {
    return 'fog-haze'
  }

  if (code === 3) {
    return 'overcast'
  }

  if (code === 2) {
    return weather.current.isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
  }

  if (code === 0 || code === 1) {
    return weather.current.isDay ? 'clear-day' : 'clear-night'
  }

  return 'neutral'
}
