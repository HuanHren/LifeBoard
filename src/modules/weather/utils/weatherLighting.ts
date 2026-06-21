import type { CurrentConditions } from '@/modules/weather/types/weather'
import type { WeatherLighting } from '@/modules/weather/types/weatherLighting'
import type { WeatherSolarPhase } from '@/modules/weather/types/weatherSolarPhase'
import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'

type WeatherLightingInput = {
  atmosphere: WeatherAtmosphere
  solarPhase: WeatherSolarPhase
  current?: Partial<Pick<
    CurrentConditions,
    'cloudCover' | 'precipitation' | 'rain' | 'showers' | 'snowfall'
  >>
  viewport?: 'desktop' | 'mobile'
}

type WeatherLightingPatch = Partial<
  Omit<WeatherLighting, 'foregroundMode'>
> & {
  foregroundMode?: WeatherLighting['foregroundMode']
}

const MIN_CONTRAST_STRENGTH = 0.34

const neutralLighting: WeatherLighting = {
  lightLevel: 0.62,
  lightWarmth: 0.48,
  lightX: 78,
  lightY: 28,
  ambientOpacity: 0.3,
  highlightOpacity: 0.24,
  hazeOpacity: 0.2,
  cloudShadowOpacity: 0.18,
  contrastStrength: 0.38,
  nightDepth: 0,
  precipitationOpacity: 0,
  snowLightOpacity: 0,
  stormShadowOpacity: 0,
  foregroundMode: 'dark',
}

const phaseLighting: Record<WeatherSolarPhase, WeatherLighting> = {
  'pre-dawn': {
    lightLevel: 0.28,
    lightWarmth: 0.24,
    lightX: 86,
    lightY: 26,
    ambientOpacity: 0.24,
    highlightOpacity: 0.12,
    hazeOpacity: 0.32,
    cloudShadowOpacity: 0.22,
    contrastStrength: 0.56,
    nightDepth: 0.44,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'light',
  },
  'sunrise-transition': {
    lightLevel: 0.5,
    lightWarmth: 0.68,
    lightX: 84,
    lightY: 34,
    ambientOpacity: 0.34,
    highlightOpacity: 0.26,
    hazeOpacity: 0.36,
    cloudShadowOpacity: 0.2,
    contrastStrength: 0.5,
    nightDepth: 0.18,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'dark',
  },
  day: {
    lightLevel: 0.84,
    lightWarmth: 0.52,
    lightX: 78,
    lightY: 22,
    ambientOpacity: 0.38,
    highlightOpacity: 0.34,
    hazeOpacity: 0.16,
    cloudShadowOpacity: 0.1,
    contrastStrength: 0.36,
    nightDepth: 0,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'dark',
  },
  'late-day': {
    lightLevel: 0.7,
    lightWarmth: 0.62,
    lightX: 82,
    lightY: 34,
    ambientOpacity: 0.34,
    highlightOpacity: 0.3,
    hazeOpacity: 0.26,
    cloudShadowOpacity: 0.14,
    contrastStrength: 0.42,
    nightDepth: 0.06,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'dark',
  },
  'golden-hour': {
    lightLevel: 0.58,
    lightWarmth: 0.78,
    lightX: 86,
    lightY: 44,
    ambientOpacity: 0.36,
    highlightOpacity: 0.28,
    hazeOpacity: 0.34,
    cloudShadowOpacity: 0.16,
    contrastStrength: 0.48,
    nightDepth: 0.1,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'dark',
  },
  dusk: {
    lightLevel: 0.42,
    lightWarmth: 0.5,
    lightX: 88,
    lightY: 52,
    ambientOpacity: 0.3,
    highlightOpacity: 0.16,
    hazeOpacity: 0.38,
    cloudShadowOpacity: 0.22,
    contrastStrength: 0.56,
    nightDepth: 0.3,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'light',
  },
  night: {
    lightLevel: 0.2,
    lightWarmth: 0.18,
    lightX: 88,
    lightY: 22,
    ambientOpacity: 0.2,
    highlightOpacity: 0.08,
    hazeOpacity: 0.2,
    cloudShadowOpacity: 0.22,
    contrastStrength: 0.6,
    nightDepth: 0.58,
    precipitationOpacity: 0,
    snowLightOpacity: 0,
    stormShadowOpacity: 0,
    foregroundMode: 'light',
  },
}

const atmosphereModifiers: Record<WeatherAtmosphere, WeatherLightingPatch> = {
  'clear-day': {
    hazeOpacity: -0.04,
    cloudShadowOpacity: -0.04,
    highlightOpacity: 0.02,
  },
  'clear-night': {
    lightLevel: -0.06,
    contrastStrength: 0.06,
    nightDepth: 0.12,
    foregroundMode: 'light',
  },
  'partly-cloudy-day': {
    ambientOpacity: 0.06,
    highlightOpacity: -0.06,
    hazeOpacity: 0.08,
    cloudShadowOpacity: 0.14,
  },
  'partly-cloudy-night': {
    ambientOpacity: 0.04,
    highlightOpacity: -0.06,
    hazeOpacity: 0.08,
    cloudShadowOpacity: 0.16,
    contrastStrength: 0.06,
    foregroundMode: 'light',
  },
  overcast: {
    lightLevel: -0.08,
    ambientOpacity: 0.14,
    highlightOpacity: -0.2,
    hazeOpacity: 0.18,
    cloudShadowOpacity: 0.28,
    contrastStrength: 0.1,
  },
  'rain-day': {
    lightLevel: -0.18,
    highlightOpacity: -0.18,
    hazeOpacity: 0.12,
    cloudShadowOpacity: 0.24,
    contrastStrength: 0.16,
    precipitationOpacity: 0.18,
  },
  'rain-night': {
    lightLevel: -0.1,
    highlightOpacity: -0.12,
    hazeOpacity: 0.1,
    cloudShadowOpacity: 0.24,
    contrastStrength: 0.16,
    nightDepth: 0.12,
    precipitationOpacity: 0.14,
    foregroundMode: 'light',
  },
  thunderstorm: {
    lightLevel: -0.2,
    ambientOpacity: 0.04,
    highlightOpacity: -0.24,
    hazeOpacity: 0.08,
    cloudShadowOpacity: 0.32,
    contrastStrength: 0.2,
    nightDepth: 0.18,
    precipitationOpacity: 0.14,
    stormShadowOpacity: 0.42,
    foregroundMode: 'light',
  },
  'fog-haze': {
    lightLevel: -0.06,
    ambientOpacity: 0.1,
    highlightOpacity: -0.18,
    hazeOpacity: 0.28,
    cloudShadowOpacity: 0.12,
    contrastStrength: 0.16,
  },
  snow: {
    lightLevel: 0.04,
    ambientOpacity: 0.1,
    highlightOpacity: -0.04,
    hazeOpacity: 0.08,
    cloudShadowOpacity: 0.1,
    contrastStrength: 0.12,
    snowLightOpacity: 0.32,
  },
  neutral: {
    ambientOpacity: 0.02,
    highlightOpacity: -0.04,
    contrastStrength: 0.06,
  },
}

function clamp(value: number, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

function addClamped(base: number, delta: number | undefined, min = 0, max = 1) {
  return clamp(base + (delta ?? 0), min, max)
}

function normalizedPrecipitation(current: WeatherLightingInput['current']) {
  const precipitation = current?.precipitation ?? 0
  const rain = current?.rain ?? 0
  const showers = current?.showers ?? 0
  const snowfall = current?.snowfall ?? 0
  return clamp(Math.max(precipitation, rain, showers, snowfall) / 5)
}

function normalizedCloudCover(current: WeatherLightingInput['current']) {
  return clamp((current?.cloudCover ?? 0) / 100)
}

export function deriveWeatherLighting({
  atmosphere,
  solarPhase,
  current,
  viewport = 'desktop',
}: WeatherLightingInput): WeatherLighting {
  const base = phaseLighting[solarPhase] ?? neutralLighting
  const modifier = atmosphereModifiers[atmosphere] ?? atmosphereModifiers.neutral
  const precipitation = normalizedPrecipitation(current)
  const cloudCover = normalizedCloudCover(current)
  const mobileHighlightReduction = viewport === 'mobile' ? 0.08 : 0
  const mobileHazeReduction = viewport === 'mobile' ? 0.04 : 0
  const minLightX = viewport === 'mobile' ? 62 : 68
  const maxLightX = viewport === 'mobile' ? 90 : 92
  const contrastFloor =
    base.foregroundMode === 'light' || modifier.foregroundMode === 'light'
      ? 0.48
      : MIN_CONTRAST_STRENGTH

  return {
    lightLevel: addClamped(base.lightLevel, modifier.lightLevel),
    lightWarmth: addClamped(base.lightWarmth, modifier.lightWarmth),
    lightX: addClamped(base.lightX, modifier.lightX, minLightX, maxLightX),
    lightY: addClamped(base.lightY, modifier.lightY, 12, 74),
    ambientOpacity: addClamped(
      base.ambientOpacity,
      (modifier.ambientOpacity ?? 0) + cloudCover * 0.08,
    ),
    highlightOpacity: addClamped(
      base.highlightOpacity,
      (modifier.highlightOpacity ?? 0) - mobileHighlightReduction - cloudCover * 0.08,
    ),
    hazeOpacity: addClamped(
      base.hazeOpacity,
      (modifier.hazeOpacity ?? 0) - mobileHazeReduction + cloudCover * 0.06,
    ),
    cloudShadowOpacity: addClamped(
      base.cloudShadowOpacity,
      (modifier.cloudShadowOpacity ?? 0) + cloudCover * 0.08,
    ),
    contrastStrength: Math.max(
      addClamped(
        base.contrastStrength,
        (modifier.contrastStrength ?? 0) + precipitation * 0.1,
      ),
      contrastFloor,
    ),
    nightDepth: addClamped(base.nightDepth, modifier.nightDepth),
    precipitationOpacity: addClamped(
      base.precipitationOpacity,
      (modifier.precipitationOpacity ?? 0) + precipitation * 0.08,
    ),
    snowLightOpacity: addClamped(base.snowLightOpacity, modifier.snowLightOpacity),
    stormShadowOpacity: addClamped(
      base.stormShadowOpacity,
      modifier.stormShadowOpacity,
    ),
    foregroundMode: modifier.foregroundMode ?? base.foregroundMode,
  }
}

export const weatherLightingTestInternals = {
  atmosphereModifiers,
  clamp,
  neutralLighting,
  phaseLighting,
}
