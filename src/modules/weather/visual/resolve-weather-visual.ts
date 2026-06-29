import { getLifeBoardConditionFromWmo } from '@/modules/weather/visual/weather-condition'
import { getWeatherEffectGroup } from '@/modules/weather/visual/weather-effect-group'
import { getWeatherIntensityFromWmo } from '@/modules/weather/visual/weather-intensity'
import { getWeatherTimeline } from '@/modules/weather/visual/weather-timeline'
import type {
  ResolveWeatherVisualInput,
  ResolvedWeatherVisual,
} from '@/modules/weather/visual/types'

export function resolveWeatherVisual({
  weatherCode,
  isDay,
  sunrise,
  sunset,
  currentTime,
}: ResolveWeatherVisualInput): ResolvedWeatherVisual {
  const condition = getLifeBoardConditionFromWmo(weatherCode)
  const effectGroup = getWeatherEffectGroup(condition)
  const intensity = getWeatherIntensityFromWmo(weatherCode)
  const timeline = getWeatherTimeline({ currentTime, isDay, sunrise, sunset })

  return {
    weatherCode,
    condition,
    effectGroup,
    intensity,
    timeline,
    motionPreset: 'fallback-calm',
    contentTone: 'adaptive',
    fallbackKey: 'neutral',
    fallbackReason: condition === 'unknown' ? 'unknown-condition' : 'unregistered-visual',
    hasRegisteredVisual: false,
  }
}
