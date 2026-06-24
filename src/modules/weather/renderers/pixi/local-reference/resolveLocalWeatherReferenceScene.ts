import { loadLocalWeatherReferenceManifest } from './loadLocalWeatherReferenceManifest'
import type {
  LocalWeatherReferenceScene,
} from './types'
import type {
  WeatherEffectGroup,
  WeatherTimeline,
} from '@/modules/weather/visual/types'

function normalizeTimeline(
  timeline: WeatherTimeline,
): Extract<WeatherTimeline, 'day' | 'night'> {
  return timeline === 'night' ? 'night' : 'day'
}

function createSceneKey(
  effectGroup: WeatherEffectGroup,
  timeline: WeatherTimeline,
) {
  return `${effectGroup}-${normalizeTimeline(timeline)}`
}

export async function resolveLocalWeatherReferenceScene({
  effectGroup,
  timeline,
}: {
  effectGroup: WeatherEffectGroup
  timeline: WeatherTimeline
}): Promise<LocalWeatherReferenceScene | null> {
  if (effectGroup === 'partly-cloudy' || effectGroup === 'unknown') {
    return null
  }

  const manifest = await loadLocalWeatherReferenceManifest()

  if (!manifest) {
    return null
  }

  const key = createSceneKey(effectGroup, timeline)
  const scene = manifest.scenes[key]

  if (!scene || scene.layers.length === 0) {
    return null
  }

  return {
    key,
    source: 'local-reference',
    effectGroup,
    timeline: normalizeTimeline(timeline),
    layers: scene.layers,
  }
}

export const localWeatherReferenceSceneTestInternals = {
  createSceneKey,
}
