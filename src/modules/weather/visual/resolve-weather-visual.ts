import { getLifeBoardConditionFromWmo } from '@/modules/weather/visual/weather-condition'
import { getWeatherEffectGroup } from '@/modules/weather/visual/weather-effect-group'
import { getWeatherTimeline } from '@/modules/weather/visual/weather-timeline'
import { getWeatherVisualDefinition } from '@/modules/weather/visual/weather-visual-registry'
import type {
  ResolveWeatherVisualInput,
  ResolvedWeatherVisual,
  WeatherVisualAssetSource,
} from '@/modules/weather/visual/types'

function hasAsset(asset: WeatherVisualAssetSource | undefined) {
  return Boolean(asset?.webp || asset?.avif || asset?.png)
}

export function resolveWeatherVisual({
  weatherCode,
  isDay,
  sunrise,
  sunset,
  currentTime,
}: ResolveWeatherVisualInput): ResolvedWeatherVisual {
  const condition = getLifeBoardConditionFromWmo(weatherCode)
  const effectGroup = getWeatherEffectGroup(condition)
  const timeline = getWeatherTimeline({ currentTime, isDay, sunrise, sunset })
  const definition = getWeatherVisualDefinition(condition, timeline)
  const hasRegisteredAsset =
    hasAsset(definition?.desktopAsset) || hasAsset(definition?.mobileAsset)

  if (!definition) {
    return {
      condition,
      effectGroup,
      timeline,
      motionPreset: 'fallback-calm',
      contentTone: 'adaptive',
      fallbackKey: 'neutral',
      fallbackReason: condition === 'unknown' ? 'unknown-condition' : 'unregistered-visual',
      hasRegisteredVisual: false,
    }
  }

  return {
    condition,
    effectGroup,
    timeline,
    desktopAsset: definition.desktopAsset,
    mobileAsset: definition.mobileAsset,
    motionPreset: definition.motionPreset,
    contentTone: definition.contentTone,
    fallbackKey: definition.fallbackKey,
    fallbackReason: hasRegisteredAsset ? 'registered' : 'missing-asset',
    hasRegisteredVisual: hasRegisteredAsset,
  }
}
