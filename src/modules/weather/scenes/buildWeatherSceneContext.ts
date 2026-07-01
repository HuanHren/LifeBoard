import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import type { WeatherSolarPhaseResult } from '@/modules/weather/types/weatherSolarPhase'
import type {
  WeatherSceneContext,
  WeatherSceneRenderQuality,
  WeatherSceneViewport,
} from '@/modules/weather/scenes/weatherSceneTypes'
import { getLifeBoardConditionFromWmo } from '@/modules/weather/visual/weather-condition'
import { getWeatherEffectGroup } from '@/modules/weather/visual/weather-effect-group'
import { getWeatherIntensityFromWmo } from '@/modules/weather/visual/weather-intensity'
import { getWeatherTimeline } from '@/modules/weather/visual/weather-timeline'

interface BuildWeatherSceneContextInput {
  weather: WeatherSnapshot
  solarPhase: WeatherSolarPhaseResult
  viewport: WeatherSceneViewport
  quality: WeatherSceneRenderQuality
  reducedMotion: boolean
}

function optionalFinite(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function buildWeatherSceneContext({
  weather,
  solarPhase,
  viewport,
  quality,
  reducedMotion,
}: BuildWeatherSceneContextInput): WeatherSceneContext {
  const weatherCode = weather.current.condition.code
  const condition = getLifeBoardConditionFromWmo(weatherCode)
  const effectGroup = getWeatherEffectGroup(condition)
  const today = weather.daily[0] ?? null
  const precipitationIntensity = [
    weather.current.precipitation,
    weather.current.rain,
    weather.current.showers,
    weather.current.snowfall,
  ].reduce((total, value) => total + value, 0)

  return {
    condition,
    effectGroup,
    intensity: getWeatherIntensityFromWmo(weatherCode),
    period: solarPhase.phase,
    timeline: getWeatherTimeline({
      currentTime: weather.current.time,
      isDay: weather.current.isDay,
      sunrise: today?.sunrise ?? null,
      sunset: today?.sunset ?? null,
    }),
    viewport,
    quality,
    reducedMotion,
    weatherCode,
    precipitationIntensity: optionalFinite(precipitationIntensity),
    cloudCover: optionalFinite(weather.current.cloudCover),
    windSpeed: optionalFinite(weather.current.windSpeed),
  }
}
