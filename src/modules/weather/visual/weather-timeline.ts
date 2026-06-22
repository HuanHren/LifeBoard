import type { WeatherTimeline } from '@/modules/weather/visual/types'

const SUNRISE_WINDOW_MS = 45 * 60 * 1000
const SUNSET_WINDOW_MS = 60 * 60 * 1000

function parseWeatherTime(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

export function getWeatherTimeline({
  currentTime,
  isDay,
  sunrise,
  sunset,
}: {
  currentTime?: string | null
  isDay?: boolean | null
  sunrise?: string | null
  sunset?: string | null
}): WeatherTimeline {
  const now = parseWeatherTime(currentTime)
  const sunriseTime = parseWeatherTime(sunrise)
  const sunsetTime = parseWeatherTime(sunset)

  if (now !== null && sunriseTime !== null && sunsetTime !== null) {
    if (
      now >= sunriseTime - SUNRISE_WINDOW_MS &&
      now < sunriseTime + SUNRISE_WINDOW_MS
    ) {
      return 'sunrise'
    }

    if (
      now >= sunsetTime - SUNSET_WINDOW_MS &&
      now < sunsetTime + SUNSET_WINDOW_MS
    ) {
      return 'sunset'
    }

    return now >= sunriseTime && now < sunsetTime ? 'day' : 'night'
  }

  if (isDay === true) {
    return 'day'
  }

  if (isDay === false) {
    return 'night'
  }

  return 'day'
}
