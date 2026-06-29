import type {
  PixiWeatherSceneOptions,
  PixiWeatherVisualKey,
} from '@/modules/weather/renderers/pixi/types'

const DAY_PRESET: PixiWeatherSceneOptions = {
  driftX: 5,
  driftY: -2,
  scale: 1.008,
  ambientOpacity: 0.2,
  maxFps: 30,
  performanceTier: 'high',
  viewportProfile: 'desktop',
}

const NIGHT_PRESET: PixiWeatherSceneOptions = {
  driftX: 3,
  driftY: -1.5,
  scale: 1.006,
  ambientOpacity: 0.16,
  maxFps: 30,
  performanceTier: 'high',
  viewportProfile: 'desktop',
}

export function getPartlyCloudyPixiPreset(
  visualKey: PixiWeatherVisualKey,
  isMobile: boolean,
): PixiWeatherSceneOptions {
  const basePreset = visualKey === 'partly-cloudy-night' ? NIGHT_PRESET : DAY_PRESET

  return {
    ...basePreset,
    maxFps: isMobile ? 24 : basePreset.maxFps,
    performanceTier: isMobile ? 'low' : 'high',
    viewportProfile: isMobile ? 'mobile' : 'desktop',
  }
}
