import { validateWeatherScenePreset } from '@/modules/weather/scenes/validateWeatherScene'
import type {
  CloudLayer,
  LightLayer,
  ResolvedWeatherScene,
  WeatherSceneLayer,
} from '@/modules/weather/scenes/weatherSceneTypes'
import {
  isConfigDrivenPartlyCloudyScene,
  isPartlyCloudyNightScene,
  shouldUseConfigDrivenRenderer,
} from '@/modules/weather/scenes/runtime/weatherSceneCapabilities'
import { resolveWeatherSceneAsset } from '@/modules/weather/scenes/runtime/resolveWeatherSceneAsset'
import type {
  ConfigDrivenWeatherScenePlan,
  WeatherSceneRenderPlanResult,
  WeatherSceneRuntimeIssue,
} from '@/modules/weather/scenes/runtime/weatherSceneRuntimeTypes'
import type {
  PixiWeatherPerformanceTier,
  PixiWeatherViewportProfile,
} from '@/modules/weather/renderers/pixi/types'

function toRuntimeIssues(
  issues: ReturnType<typeof validateWeatherScenePreset>,
): WeatherSceneRuntimeIssue[] {
  return issues.map((issue) => ({
    code: 'SCENE_VALIDATION_FAILED',
    message: issue.message,
    path: issue.path,
  }))
}

function findRequiredCloudLayer(
  layers: readonly WeatherSceneLayer[],
): CloudLayer | null {
  return layers.find((layer): layer is CloudLayer => layer.kind === 'cloud') ?? null
}

function findRequiredLightLayer(
  layers: readonly WeatherSceneLayer[],
): LightLayer | null {
  return layers.find((layer): layer is LightLayer => layer.kind === 'light') ?? null
}

function findUnsupportedLayer(layers: readonly WeatherSceneLayer[]) {
  return layers.find((layer) => layer.kind !== 'cloud' && layer.kind !== 'light') ?? null
}

function getViewportProfile(scene: ResolvedWeatherScene): PixiWeatherViewportProfile {
  if (scene.selectedViewport === 'mobile') {
    return 'mobile'
  }

  if (scene.selectedViewport === 'tablet') {
    return 'tablet-portrait'
  }

  return 'desktop'
}

function getPerformanceTier(scene: ResolvedWeatherScene): PixiWeatherPerformanceTier {
  if (scene.selectedQuality === 'low' || scene.selectedViewport === 'mobile') {
    return 'low'
  }

  if (scene.selectedQuality === 'balanced' || scene.selectedViewport === 'tablet') {
    return 'balanced'
  }

  return 'high'
}

export function buildWeatherSceneRenderPlan(
  scene: ResolvedWeatherScene,
): WeatherSceneRenderPlanResult {
  if (!isConfigDrivenPartlyCloudyScene(scene)) {
    return {
      ok: false,
      issues: [
        {
          code: 'SCENE_BUILD_FAILED',
          message: 'Only partly-cloudy-day and partly-cloudy-night are enabled for config-driven rendering.',
          path: 'id',
        },
      ],
    }
  }

  if (!shouldUseConfigDrivenRenderer(scene)) {
    return {
      ok: false,
      issues: [
        {
          code: 'SCENE_BUILD_FAILED',
          message: 'Scene quality or motion settings require static fallback.',
          path: 'quality',
        },
      ],
    }
  }

  const validationIssues = validateWeatherScenePreset(scene.preset)

  if (validationIssues.length > 0) {
    return {
      ok: false,
      issues: toRuntimeIssues(validationIssues),
    }
  }

  const unsupportedLayer = findUnsupportedLayer(scene.activeLayers)

  if (unsupportedLayer) {
    return {
      ok: false,
      issues: [
        {
          code: 'UNSUPPORTED_LAYER',
          message: `Layer kind ${unsupportedLayer.kind} is not supported by the partly cloudy config renderer.`,
          path: `layers.${unsupportedLayer.id}`,
        },
      ],
    }
  }

  const cloudLayer = findRequiredCloudLayer(scene.activeLayers)
  const lightLayer = findRequiredLightLayer(scene.activeLayers)

  if (!cloudLayer || !lightLayer) {
    return {
      ok: false,
      issues: [
        {
          code: 'SCENE_BUILD_FAILED',
          message: 'The partly cloudy config renderer requires one cloud layer and one light layer.',
          path: 'layers',
        },
      ],
    }
  }

  const posterResult = resolveWeatherSceneAsset(scene.preset.poster.assetId)
  const fallbackResult = resolveWeatherSceneAsset(scene.preset.fallback.posterAssetId)
  const issues = [...posterResult.issues, ...fallbackResult.issues]

  if (!posterResult.asset || !fallbackResult.asset || issues.length > 0) {
    return {
      ok: false,
      issues,
    }
  }

  const quality = scene.preset.quality[scene.selectedQuality]
  const visualKey = isPartlyCloudyNightScene(scene)
    ? 'partly-cloudy-night'
    : 'partly-cloudy-day'
  const performanceTier = getPerformanceTier(scene)
  const maxFps = scene.selectedViewport === 'mobile'
    ? 24
    : quality.maxFps

  return {
    ok: true,
    plan: {
      id: scene.preset.id,
      asset: posterResult.asset,
      fallbackAsset: fallbackResult.asset,
      visualKey,
      options: {
        driftX: cloudLayer.drift.x,
        driftY: cloudLayer.drift.y,
        scale: cloudLayer.scale,
        ambientOpacity: lightLayer.opacity,
        maxFps,
        performanceTier,
        viewportProfile: getViewportProfile(scene),
      },
      viewport: scene.selectedViewport,
      quality: scene.selectedQuality,
      performanceTier,
      layerCount: scene.activeLayers.length,
      loadedLayerCount: scene.activeLayers.length,
      layerIds: scene.activeLayers.map((layer) => layer.id),
    } satisfies ConfigDrivenWeatherScenePlan,
  }
}
