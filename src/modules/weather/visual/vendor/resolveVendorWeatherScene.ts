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
  LifeBoardCondition,
  WeatherTimeline,
} from '@/modules/weather/visual/types'

function normalizeTimeline(
  timeline: WeatherTimeline,
): Extract<WeatherTimeline, 'day' | 'night'> {
  return timeline === 'night' ? 'night' : 'day'
}

function createSceneKey(
  effectGroup: WeatherEffectGroup,
  intensity: WeatherIntensity,
  timeline: WeatherTimeline,
  condition?: LifeBoardCondition,
  weatherCode?: number,
) {
  const normalizedTimeline = normalizeTimeline(timeline)

  if (weatherCode === 1) {
    return `mostly-clear-${normalizedTimeline}`
  }

  if (weatherCode === 2 || condition === 'partly-cloudy') {
    return `partly-cloudy-${normalizedTimeline}`
  }

  if (weatherCode === 48) {
    return `rime-fog-${normalizedTimeline}`
  }

  if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55 || condition === 'drizzle') {
    return `drizzle-${normalizedTimeline}`
  }

  if (weatherCode === 56 || weatherCode === 57) {
    return `freezing-drizzle-${normalizedTimeline}`
  }

  if (weatherCode === 66 || weatherCode === 67) {
    return `freezing-rain-${normalizedTimeline}`
  }

  if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) {
    return `rain-showers-${normalizedTimeline}`
  }

  if (weatherCode === 77) {
    return `snow-grains-${normalizedTimeline}`
  }

  if (weatherCode === 85 || weatherCode === 86) {
    return `snow-showers-${normalizedTimeline}`
  }

  if (weatherCode === 96 || weatherCode === 99) {
    return `thunderstorm-hail-${normalizedTimeline}`
  }

  if (effectGroup === 'thunderstorm' && intensity === 'heavy') {
    return `heavy-thunderstorm-${normalizedTimeline}`
  }

  return `${effectGroup}-${normalizedTimeline}`
}

function getMaxParticleCount(
  effectGroup: WeatherEffectGroup,
  intensity: WeatherIntensity,
) {
  if (effectGroup === 'thunderstorm') {
    return intensity === 'severe' ? 96 : 76
  }

  if (
    effectGroup === 'heavy-rain' ||
    effectGroup === 'heavy-snow' ||
    effectGroup === 'sleet-freezing'
  ) {
    return intensity === 'severe' ? 88 : 72
  }

  if (
    effectGroup === 'moderate-rain' ||
    effectGroup === 'moderate-snow' ||
    effectGroup === 'sand-dust'
  ) {
    return 54
  }

  if (effectGroup === 'light-rain' || effectGroup === 'light-snow') {
    return 36
  }

  return 16
}

function getLayerSpeedX(layer: VendorWeatherManifestLayer) {
  return layer.speedX ?? layer.speed.x
}

function getLayerSpeedY(layer: VendorWeatherManifestLayer) {
  return layer.speedY ?? layer.speed.y
}

export async function resolveVendorWeatherScene({
  condition,
  effectGroup,
  intensity,
  timeline,
  weatherCode,
}: {
  condition?: LifeBoardCondition
  effectGroup: WeatherEffectGroup
  intensity: WeatherIntensity
  timeline: WeatherTimeline
  weatherCode?: number
}): Promise<VendorWeatherScene | null> {
  if (effectGroup === 'unknown') {
    return null
  }

  const manifest = await loadVendorWeatherManifest()

  if (!manifest) {
    return null
  }

  const key = createSceneKey(effectGroup, intensity, timeline, condition, weatherCode)
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
    condition,
    effectGroup,
    intensity,
    intensityPreset,
    timeline: normalizeTimeline(timeline),
    isThunderstorm: effectGroup === 'thunderstorm',
    family: key.replace(/-(day|night)$/, ''),
    maxParticleCount: getMaxParticleCount(effectGroup, intensity),
    layers,
  }
}

export const vendorWeatherSceneTestInternals = {
  createSceneKey,
}
