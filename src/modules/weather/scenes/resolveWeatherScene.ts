import type {
  ResolvedWeatherScene,
  WeatherSceneContext,
  WeatherScenePreset,
} from '@/modules/weather/scenes/weatherSceneTypes'
import {
  WEATHER_SCENE_FALLBACK_PRESET,
  WEATHER_SCENE_PRESETS,
} from '@/modules/weather/scenes/weatherSceneRegistry'

function matchesScene(
  context: WeatherSceneContext,
  preset: WeatherScenePreset,
) {
  const matchesCondition = preset.match.conditions.includes(context.condition)
  const matchesPeriod = preset.match.periods.includes(context.period)
  const matchesIntensity =
    !preset.match.intensities ||
    preset.match.intensities.includes(context.intensity)

  return matchesCondition && matchesPeriod && matchesIntensity
}

function chooseWeatherScenePreset(
  context: WeatherSceneContext,
): WeatherScenePreset {
  if (context.reducedMotion || context.quality === 'static') {
    return WEATHER_SCENE_FALLBACK_PRESET
  }

  return (
    WEATHER_SCENE_PRESETS.find((preset) => matchesScene(context, preset)) ??
    WEATHER_SCENE_FALLBACK_PRESET
  )
}

export function resolveWeatherScene(
  context: WeatherSceneContext,
): ResolvedWeatherScene {
  const preset = chooseWeatherScenePreset(context)
  const selectedQuality = context.reducedMotion ? 'static' : context.quality
  const quality = preset.quality[selectedQuality]
  const layers: readonly WeatherScenePreset['layers'][number][] = preset.layers
  const activeLayers = layers
    .filter((layer) => layer.enabled !== false)
    .slice(0, quality.maxLayers)

  return {
    preset,
    context,
    selectedQuality,
    selectedViewport: context.viewport,
    activeLayers,
  }
}
