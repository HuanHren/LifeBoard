import type { ResolvedWeatherScene } from '@/modules/weather/scenes/weatherSceneTypes'
import type { WeatherSceneAssetSource } from '@/modules/weather/scenes/weatherSceneTypes'
import type {
  ResolvedWeatherVisual,
} from '@/modules/weather/visual/types'

export interface LegacyWeatherVisualSceneAdapter {
  sceneId: string
  atmosphereKey: string
  condition: ResolvedWeatherVisual['condition']
  effectGroup: ResolvedWeatherVisual['effectGroup']
  intensity: ResolvedWeatherVisual['intensity']
  timeline: ResolvedWeatherVisual['timeline']
  desktopAsset?: WeatherSceneAssetSource
  mobileAsset?: WeatherSceneAssetSource
  motionPreset: ResolvedWeatherVisual['motionPreset']
  contentTone: ResolvedWeatherVisual['contentTone']
  fallbackKey: string
  fallbackClass: string
  usesStaticFallback: boolean
}

export function adaptWeatherSceneToLegacyVisual(
  scene: ResolvedWeatherScene,
  visual: ResolvedWeatherVisual,
): LegacyWeatherVisualSceneAdapter {
  const posterAsset = scene.preset.assets.find(
    (asset) => asset.id === scene.preset.poster.assetId,
  )

  return {
    sceneId: scene.preset.id,
    atmosphereKey: scene.preset.legacyVisual.atmosphereKey,
    condition: visual.condition,
    effectGroup: visual.effectGroup,
    intensity: visual.intensity,
    timeline: visual.timeline,
    desktopAsset: posterAsset?.desktop,
    mobileAsset: posterAsset?.mobile,
    motionPreset: scene.preset.legacyVisual.motionPreset,
    contentTone: scene.preset.legacyVisual.contentTone,
    fallbackKey: scene.preset.legacyVisual.fallbackKey,
    fallbackClass: scene.preset.fallback.staticClass,
    usesStaticFallback: scene.selectedQuality === 'static',
  }
}
