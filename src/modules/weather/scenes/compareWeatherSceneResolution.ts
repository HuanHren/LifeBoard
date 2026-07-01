import { adaptWeatherSceneToLegacyVisual } from '@/modules/weather/scenes/adapters/legacyWeatherVisualAdapter'
import { buildWeatherSceneContext } from '@/modules/weather/scenes/buildWeatherSceneContext'
import { resolveWeatherScene } from '@/modules/weather/scenes/resolveWeatherScene'
import type {
  WeatherSceneRenderQuality,
  WeatherSceneViewport,
} from '@/modules/weather/scenes/weatherSceneTypes'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import type { WeatherSolarPhaseResult } from '@/modules/weather/types/weatherSolarPhase'
import type { ResolvedWeatherVisual } from '@/modules/weather/visual/types'

interface CompareWeatherSceneResolutionInput {
  weather: WeatherSnapshot
  solarPhase: WeatherSolarPhaseResult
  currentVisual: ResolvedWeatherVisual
  viewport: WeatherSceneViewport
  quality: WeatherSceneRenderQuality
  reducedMotion: boolean
}

export interface WeatherSceneResolutionComparison {
  conditionMatches: boolean
  solarPeriodMatches: boolean
  sceneFamily: string
  hasDesktopVariant: boolean
  hasMobileVariant: boolean
  reducedMotionMatches: boolean
  fallbackMatches: boolean
  sceneId: string
}

export function compareWeatherSceneResolution({
  weather,
  solarPhase,
  currentVisual,
  viewport,
  quality,
  reducedMotion,
}: CompareWeatherSceneResolutionInput): WeatherSceneResolutionComparison {
  const context = buildWeatherSceneContext({
    weather,
    solarPhase,
    viewport,
    quality,
    reducedMotion,
  })
  const scene = resolveWeatherScene(context)
  const legacy = adaptWeatherSceneToLegacyVisual(scene, currentVisual)

  return {
    conditionMatches: context.condition === currentVisual.condition,
    solarPeriodMatches: context.period === solarPhase.phase,
    sceneFamily: legacy.atmosphereKey,
    hasDesktopVariant: Boolean(legacy.desktopAsset),
    hasMobileVariant: Boolean(legacy.mobileAsset),
    reducedMotionMatches: reducedMotion === legacy.usesStaticFallback,
    fallbackMatches: legacy.fallbackKey === currentVisual.fallbackKey,
    sceneId: legacy.sceneId,
  }
}
