import type {
  WeatherSceneId,
  WeatherScenePreset,
} from '@/modules/weather/scenes/weatherSceneTypes'
import {
  clearDayScenePreset,
  clearNightScenePreset,
} from '@/modules/weather/scenes/presets/clearScenePresets'
import {
  partlyCloudyDayScenePreset,
  partlyCloudyNightScenePreset,
} from '@/modules/weather/scenes/presets/partlyCloudyScenePresets'
import { staticFallbackScenePreset } from '@/modules/weather/scenes/presets/staticFallbackScenePreset'

export const WEATHER_SCENE_PRESETS = [
  clearDayScenePreset,
  clearNightScenePreset,
  partlyCloudyDayScenePreset,
  partlyCloudyNightScenePreset,
  staticFallbackScenePreset,
] as const satisfies readonly WeatherScenePreset[]

export const WEATHER_SCENE_FALLBACK_PRESET = staticFallbackScenePreset

export function getWeatherScenePreset(id: WeatherSceneId) {
  return WEATHER_SCENE_PRESETS.find((preset) => preset.id === id) ?? null
}
