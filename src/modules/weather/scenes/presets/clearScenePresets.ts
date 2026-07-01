import { WEATHER_SCENE_ASSET_IDS } from '@/modules/weather/scenes/weatherSceneAssets'
import type { WeatherScenePreset } from '@/modules/weather/scenes/weatherSceneTypes'
import {
  WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  weatherSceneId,
} from '@/modules/weather/scenes/weatherSceneTypes'
import {
  defaultResponsiveSceneLayout,
  defaultSceneAccessibility,
  defaultSceneTransition,
  staticSceneQuality,
} from '@/modules/weather/scenes/presets/sharedScenePresetParts'

export const clearDayScenePreset = {
  schemaVersion: '1.0.0',
  cleanRoomNotice: WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  id: weatherSceneId('clear-day'),
  title: 'Clear day',
  match: {
    conditions: ['clear'],
    periods: ['day', 'late-day', 'golden-hour'],
  },
  assets: [
    {
      id: WEATHER_SCENE_ASSET_IDS.clearDayPoster,
      kind: 'poster',
      preload: true,
    },
  ],
  poster: {
    assetId: WEATHER_SCENE_ASSET_IDS.clearDayPoster,
    fit: 'cover',
    eager: true,
  },
  layers: [],
  responsive: defaultResponsiveSceneLayout,
  quality: staticSceneQuality,
  accessibility: defaultSceneAccessibility,
  transitions: defaultSceneTransition,
  fallback: {
    posterAssetId: WEATHER_SCENE_ASSET_IDS.clearDayPoster,
    staticClass: 'weather-scene--clear-day',
    reason: 'missing-assets',
  },
  legacyVisual: {
    atmosphereKey: 'clear-day',
    motionPreset: 'fallback-calm',
    contentTone: 'adaptive',
    fallbackKey: 'neutral',
    timeline: 'day',
  },
} satisfies WeatherScenePreset

export const clearNightScenePreset = {
  schemaVersion: '1.0.0',
  cleanRoomNotice: WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  id: weatherSceneId('clear-night'),
  title: 'Clear night',
  match: {
    conditions: ['clear'],
    periods: ['night', 'pre-dawn', 'dusk'],
  },
  assets: [
    {
      id: WEATHER_SCENE_ASSET_IDS.clearNightPoster,
      kind: 'poster',
      preload: true,
    },
  ],
  poster: {
    assetId: WEATHER_SCENE_ASSET_IDS.clearNightPoster,
    fit: 'cover',
    eager: true,
  },
  layers: [],
  responsive: defaultResponsiveSceneLayout,
  quality: staticSceneQuality,
  accessibility: defaultSceneAccessibility,
  transitions: defaultSceneTransition,
  fallback: {
    posterAssetId: WEATHER_SCENE_ASSET_IDS.clearNightPoster,
    staticClass: 'weather-scene--clear-night',
    reason: 'missing-assets',
  },
  legacyVisual: {
    atmosphereKey: 'clear-night',
    motionPreset: 'fallback-calm',
    contentTone: 'adaptive',
    fallbackKey: 'neutral',
    timeline: 'night',
  },
} satisfies WeatherScenePreset
