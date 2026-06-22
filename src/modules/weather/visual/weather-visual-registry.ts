import { WEATHER_VISUAL_ASSET_MANIFEST } from '@/modules/weather/visual/weather-asset-manifest'
import type {
  LifeBoardCondition,
  WeatherTimeline,
  WeatherVisualDefinition,
} from '@/modules/weather/visual/types'

type RegistryKey = `${LifeBoardCondition}:${WeatherTimeline}`

function createRegistryKey(
  condition: LifeBoardCondition,
  timeline: WeatherTimeline,
): RegistryKey {
  return `${condition}:${timeline}`
}

const partlyCloudyDayAssets = WEATHER_VISUAL_ASSET_MANIFEST['partly-cloudy-day']

export const WEATHER_VISUAL_REGISTRY: Partial<
  Record<RegistryKey, WeatherVisualDefinition>
> = {
  [createRegistryKey('partly-cloudy', 'day')]: {
    condition: 'partly-cloudy',
    effectGroup: 'partly-cloudy',
    timeline: 'day',
    desktopAsset: partlyCloudyDayAssets.desktop,
    mobileAsset: partlyCloudyDayAssets.mobile,
    motionPreset: 'partly-cloudy-gentle',
    contentTone: 'dark',
    fallbackKey: 'neutral',
  },
}

export function getWeatherVisualDefinition(
  condition: LifeBoardCondition,
  timeline: WeatherTimeline,
) {
  return WEATHER_VISUAL_REGISTRY[createRegistryKey(condition, timeline)] ?? null
}

export const weatherVisualRegistryTestInternals = {
  createRegistryKey,
}
