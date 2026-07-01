import type {
  WeatherSceneAssetId,
  WeatherSceneAssetSource,
  WeatherSceneId,
  WeatherSceneLayerId,
  WeatherSceneRenderQuality,
  WeatherSceneViewport,
} from '@/modules/weather/scenes/weatherSceneTypes'
import type {
  PixiWeatherPerformanceTier,
  PixiWeatherSceneOptions,
  PixiWeatherVisualKey,
} from '@/modules/weather/renderers/pixi/types'

export type WeatherSceneRuntimeErrorCode =
  | 'SCENE_VALIDATION_FAILED'
  | 'ASSET_RESOLUTION_FAILED'
  | 'SCENE_BUILD_FAILED'
  | 'UNSUPPORTED_LAYER'

export interface WeatherSceneRuntimeIssue {
  code: WeatherSceneRuntimeErrorCode
  message: string
  path?: string
}

export interface ResolvedWeatherSceneAsset {
  id: WeatherSceneAssetId
  desktop?: WeatherSceneAssetSource
  mobile?: WeatherSceneAssetSource
  fallback?: WeatherSceneAssetSource
}

export interface ConfigDrivenWeatherScenePlan {
  id: WeatherSceneId
  asset: ResolvedWeatherSceneAsset
  fallbackAsset: ResolvedWeatherSceneAsset
  visualKey: PixiWeatherVisualKey
  options: PixiWeatherSceneOptions
  viewport: WeatherSceneViewport
  quality: WeatherSceneRenderQuality
  performanceTier: PixiWeatherPerformanceTier
  layerCount: number
  loadedLayerCount: number
  layerIds: readonly WeatherSceneLayerId[]
}

export type WeatherSceneRenderPlanResult =
  | {
      ok: true
      plan: ConfigDrivenWeatherScenePlan
    }
  | {
      ok: false
      issues: readonly WeatherSceneRuntimeIssue[]
    }
