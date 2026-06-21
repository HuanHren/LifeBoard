import type { AirQualitySnapshot } from '@/modules/weather/types/airQuality'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import type { WeatherVisualSnapshot } from '@/modules/weather/types/weatherVisualSnapshot'
import { createAirQualityLocationId } from '@/modules/weather/utils/airQualityNormalizer'
import { getWeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'
import { deriveWeatherLighting } from '@/modules/weather/utils/weatherLighting'
import { deriveWeatherSolarPhase } from '@/modules/weather/utils/weatherSolarPhase'

export function createWeatherVisualSnapshot(
  weather: WeatherSnapshot,
  airQuality: AirQualitySnapshot | null,
  nowMs = Date.now(),
): WeatherVisualSnapshot {
  const atmosphere = getWeatherAtmosphere(weather)
  const locationId = createAirQualityLocationId(weather.location)
  const matchingAirQuality =
    airQuality?.locationId === locationId ? airQuality : null
  const solarPhase = deriveWeatherSolarPhase(weather, nowMs)
  const lighting = deriveWeatherLighting({
    atmosphere,
    current: weather.current,
    solarPhase: solarPhase.phase,
  })

  return {
    identity: [
      weather.provider,
      weather.location.id,
      weather.location.latitude,
      weather.location.longitude,
      weather.current.time,
      weather.current.condition.code,
      weather.current.isDay ? 'day' : 'night',
      atmosphere,
      weather.fetchedAt,
    ].join('|'),
    weather,
    locationId,
    atmosphere,
    solarPhase,
    lighting,
    airQuality: matchingAirQuality,
    alerts: weather.alerts,
  }
}
