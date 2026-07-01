import { WEATHER_ATMOSPHERE_ASSETS } from '@/modules/weather/constants/weatherAtmosphereAssets'
import type { AssetReference, WeatherSceneAssetId } from '@/modules/weather/scenes/weatherSceneTypes'
import { weatherSceneAssetId } from '@/modules/weather/scenes/weatherSceneTypes'

export const WEATHER_SCENE_ASSET_IDS = {
  clearDayPoster: weatherSceneAssetId('clear-day-poster'),
  clearNightPoster: weatherSceneAssetId('clear-night-poster'),
  partlyCloudyDayPoster: weatherSceneAssetId('partly-cloudy-day-poster'),
  partlyCloudyNightPoster: weatherSceneAssetId('partly-cloudy-night-poster'),
  staticNeutralPoster: weatherSceneAssetId('static-neutral-poster'),
} as const

const clearDayAssets = WEATHER_ATMOSPHERE_ASSETS['clear-day'].base
const clearNightAssets = WEATHER_ATMOSPHERE_ASSETS['clear-night'].base
const partlyCloudyDayAssets = WEATHER_ATMOSPHERE_ASSETS['partly-cloudy-day'].base

export const WEATHER_SCENE_ASSETS = [
  {
    id: WEATHER_SCENE_ASSET_IDS.clearDayPoster,
    kind: 'poster',
    desktop: clearDayAssets?.desktop,
    mobile: clearDayAssets?.mobile,
    fallback: clearDayAssets?.desktop,
    preload: true,
  },
  {
    id: WEATHER_SCENE_ASSET_IDS.clearNightPoster,
    kind: 'poster',
    desktop: clearNightAssets?.desktop,
    mobile: clearNightAssets?.mobile,
    fallback: clearNightAssets?.desktop,
    preload: true,
  },
  {
    id: WEATHER_SCENE_ASSET_IDS.partlyCloudyDayPoster,
    kind: 'poster',
    desktop: partlyCloudyDayAssets?.desktop,
    mobile: partlyCloudyDayAssets?.mobile,
    fallback: partlyCloudyDayAssets?.desktop,
    preload: true,
  },
  {
    id: WEATHER_SCENE_ASSET_IDS.partlyCloudyNightPoster,
    kind: 'poster',
    preload: true,
  },
  {
    id: WEATHER_SCENE_ASSET_IDS.staticNeutralPoster,
    kind: 'poster',
    preload: false,
  },
] as const satisfies readonly AssetReference[]

export function getWeatherSceneAsset(assetId: WeatherSceneAssetId) {
  return WEATHER_SCENE_ASSETS.find((asset) => asset.id === assetId) ?? null
}
