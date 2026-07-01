import { WEATHER_SCENE_ASSET_IDS } from '@/modules/weather/scenes/weatherSceneAssets'
import type { WeatherScenePreset } from '@/modules/weather/scenes/weatherSceneTypes'
import {
  WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  weatherSceneId,
} from '@/modules/weather/scenes/weatherSceneTypes'
import {
  defaultResponsiveSceneLayout,
  defaultSceneAccessibility,
  immediateSceneTransition,
  staticSceneQuality,
} from '@/modules/weather/scenes/presets/sharedScenePresetParts'

export const staticFallbackScenePreset = {
  schemaVersion: '1.0.0',
  cleanRoomNotice: WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  id: weatherSceneId('static-fallback'),
  title: 'Static fallback',
  match: {
    conditions: ['unknown'],
    periods: [
      'pre-dawn',
      'sunrise-transition',
      'day',
      'late-day',
      'golden-hour',
      'dusk',
      'night',
    ],
  },
  assets: [
    {
      id: WEATHER_SCENE_ASSET_IDS.staticNeutralPoster,
      kind: 'poster',
      preload: false,
    },
  ],
  poster: {
    assetId: WEATHER_SCENE_ASSET_IDS.staticNeutralPoster,
    fit: 'cover',
    eager: false,
  },
  layers: [],
  responsive: defaultResponsiveSceneLayout,
  quality: staticSceneQuality,
  accessibility: {
    ...defaultSceneAccessibility,
    reducedMotion: {
      mode: 'static-poster',
      maxTransitionMs: 0,
    },
  },
  transitions: immediateSceneTransition,
  fallback: {
    posterAssetId: WEATHER_SCENE_ASSET_IDS.staticNeutralPoster,
    staticClass: 'weather-scene--neutral',
    reason: 'unknown-condition',
  },
  legacyVisual: {
    atmosphereKey: 'neutral',
    motionPreset: 'static',
    contentTone: 'adaptive',
    fallbackKey: 'neutral',
    timeline: 'day',
  },
} satisfies WeatherScenePreset
