import type { AirQualitySnapshot } from '@/modules/weather/types/airQuality'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import type { WeatherVisualSnapshot } from '@/modules/weather/types/weatherVisualSnapshot'
import { createAirQualityLocationId } from '@/modules/weather/utils/airQualityNormalizer'
import { getWeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'
import { deriveWeatherLighting } from '@/modules/weather/utils/weatherLighting'
import { deriveWeatherSolarPhase } from '@/modules/weather/utils/weatherSolarPhase'
import { resolveWeatherVisual } from '@/modules/weather/visual/resolve-weather-visual'

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
  const today = weather.daily[0] ?? null
  const visual = resolveWeatherVisual({
    weatherCode: weather.current.condition.code,
    isDay: weather.current.isDay,
    sunrise: today?.sunrise ?? null,
    sunset: today?.sunset ?? null,
    currentTime: weather.current.time,
  })
  const lighting = deriveWeatherLighting({
    atmosphere,
    current: weather.current,
    solarPhase: solarPhase.phase,
  })
  const visualIdentity = [
    atmosphere,
    visual.condition,
    visual.effectGroup,
    visual.timeline,
    String(visual.weatherCode),
    visual.desktopAsset?.avif ?? '',
    visual.desktopAsset?.webp ?? '',
    visual.desktopAsset?.png ?? '',
    visual.mobileAsset?.avif ?? '',
    visual.mobileAsset?.webp ?? '',
    visual.mobileAsset?.png ?? '',
  ].join('|')

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
      visual.condition,
      visual.effectGroup,
      visual.timeline,
      visual.weatherCode,
      weather.fetchedAt,
    ].join('|'),
    visualIdentity,
    weather,
    locationId,
    atmosphere,
    visual,
    solarPhase,
    lighting,
    airQuality: matchingAirQuality,
    alerts: weather.alerts,
  }
}
