import { loadVendorWeatherManifest } from './loadVendorWeatherManifest'
import type {
  VendorWeatherManifestLayer,
  VendorWeatherScene,
} from './vendorWeatherTypes'
import {
  getWeatherIntensityPreset,
  shouldApplyWeatherIntensity,
} from '@/modules/weather/visual/weather-intensity'
import type {
  WeatherEffectGroup,
  WeatherIntensity,
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

function getLayerSpeedX(layer: VendorWeatherManifestLayer) {
  return layer.speedX ?? layer.speed.x
}

function getLayerSpeedY(layer: VendorWeatherManifestLayer) {
  return layer.speedY ?? layer.speed.y
}

export async function resolveVendorWeatherScene({
  effectGroup,
  intensity,
  timeline,
}: {
  effectGroup: WeatherEffectGroup
  intensity: WeatherIntensity
  timeline: WeatherTimeline
}): Promise<VendorWeatherScene | null> {
  if (effectGroup === 'partly-cloudy' || effectGroup === 'unknown') {
    return null
  }

  const manifest = await loadVendorWeatherManifest()

  if (!manifest) {
    return null
  }

  const key = createSceneKey(effectGroup, timeline)
  const scene = manifest.scenes[key]

  if (!scene || scene.layers.length === 0) {
    return null
  }

  const intensityPreset = getWeatherIntensityPreset(intensity)
  const shouldApplyIntensity = shouldApplyWeatherIntensity(effectGroup)
  const layers = scene.layers.map((layer) => {
    const speedX = getLayerSpeedX(layer)
    const speedY = getLayerSpeedY(layer)

    if (!shouldApplyIntensity) {
      return {
        ...layer,
        speedX,
        speedY,
      }
    }

    const isPrecipitationLayer =
      layer.role.includes('rain') ||
      layer.role.includes('snow') ||
      layer.role.includes('sleet')
    const isCloudLayer = layer.role.includes('cloud')
    const opacity = isCloudLayer
      ? Math.min(0.96, layer.opacity + intensityPreset.cloudDarkness * 0.12)
      : Math.min(
          0.96,
          layer.opacity * (isPrecipitationLayer ? intensityPreset.opacity : 1),
        )

    return {
      ...layer,
      opacity,
      speedX: speedX * (isPrecipitationLayer ? intensityPreset.speed : 1),
      speedY: speedY * (isPrecipitationLayer ? intensityPreset.speed : 1),
      scale: Math.min(
        1.24,
        layer.scale + (isPrecipitationLayer ? intensityPreset.density * 0.04 : 0),
      ),
    }
  })

  return {
    key,
    source: 'authorized-vendor',
    effectGroup,
    intensity,
    intensityPreset,
    timeline: normalizeTimeline(timeline),
    isThunderstorm: effectGroup === 'thunderstorm',
    layers,
  }
}

export const vendorWeatherSceneTestInternals = {
  createSceneKey,
}
