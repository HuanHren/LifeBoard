import { WEATHER_SCENE_ASSET_IDS } from '@/modules/weather/scenes/weatherSceneAssets'
import type { WeatherScenePreset } from '@/modules/weather/scenes/weatherSceneTypes'
import {
  WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  weatherSceneId,
  weatherSceneLayerId,
} from '@/modules/weather/scenes/weatherSceneTypes'
import {
  defaultResponsiveSceneLayout,
  defaultSceneAccessibility,
  defaultSceneTransition,
  staticSceneQuality,
} from '@/modules/weather/scenes/presets/sharedScenePresetParts'

const partlyCloudyDaySceneQuality = {
  high: {
    ...staticSceneQuality.high,
    maxLayers: 2,
    maxFps: 30,
    enableClouds: true,
    renderMode: 'animated',
  },
  balanced: {
    ...staticSceneQuality.balanced,
    maxLayers: 2,
    maxFps: 30,
    enableClouds: true,
    renderMode: 'animated',
  },
  low: {
    ...staticSceneQuality.low,
    maxLayers: 2,
    maxFps: 24,
    enableClouds: true,
    renderMode: 'animated',
  },
  static: staticSceneQuality.static,
} satisfies WeatherScenePreset['quality']

export const partlyCloudyDayScenePreset = {
  schemaVersion: '1.0.0',
  cleanRoomNotice: WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  id: weatherSceneId('partly-cloudy-day'),
  title: 'Partly cloudy day',
  match: {
    conditions: ['partly-cloudy'],
    periods: ['day', 'late-day', 'golden-hour'],
  },
  assets: [
    {
      id: WEATHER_SCENE_ASSET_IDS.partlyCloudyDayPoster,
      kind: 'poster',
      preload: true,
    },
  ],
  poster: {
    assetId: WEATHER_SCENE_ASSET_IDS.partlyCloudyDayPoster,
    fit: 'cover',
    eager: true,
  },
  layers: [
    {
      id: weatherSceneLayerId('partly-cloudy-day-base'),
      kind: 'cloud',
      assetId: WEATHER_SCENE_ASSET_IDS.partlyCloudyDayPoster,
      role: 'mid',
      zIndex: 1,
      opacity: 1,
      drift: {
        x: 5,
        y: -2,
      },
      scale: 1.008,
    },
    {
      id: weatherSceneLayerId('partly-cloudy-day-ambient'),
      kind: 'light',
      lightKind: 'ambient',
      zIndex: 2,
      opacity: 0.2,
      position: {
        x: 0.72,
        y: 0.27,
      },
    },
  ],
  responsive: {
    ...defaultResponsiveSceneLayout,
    mobile: {
      ...defaultResponsiveSceneLayout.mobile,
      objectPosition: '56% center',
    },
  },
  quality: partlyCloudyDaySceneQuality,
  accessibility: defaultSceneAccessibility,
  transitions: defaultSceneTransition,
  fallback: {
    posterAssetId: WEATHER_SCENE_ASSET_IDS.partlyCloudyDayPoster,
    staticClass: 'weather-scene--partly-cloudy-day',
    reason: 'missing-assets',
  },
  legacyVisual: {
    atmosphereKey: 'partly-cloudy-day',
    motionPreset: 'partly-cloudy-gentle',
    contentTone: 'dark',
    fallbackKey: 'neutral',
    timeline: 'day',
  },
} satisfies WeatherScenePreset

export const partlyCloudyNightScenePreset = {
  schemaVersion: '1.0.0',
  cleanRoomNotice: WEATHER_SCENE_CLEAN_ROOM_NOTICE,
  id: weatherSceneId('partly-cloudy-night'),
  title: 'Partly cloudy night',
  match: {
    conditions: ['partly-cloudy'],
    periods: ['night', 'pre-dawn', 'dusk'],
  },
  assets: [
    {
      id: WEATHER_SCENE_ASSET_IDS.partlyCloudyNightPoster,
      kind: 'poster',
      preload: true,
    },
  ],
  poster: {
    assetId: WEATHER_SCENE_ASSET_IDS.partlyCloudyNightPoster,
    fit: 'cover',
    eager: true,
  },
  layers: [],
  responsive: defaultResponsiveSceneLayout,
  quality: staticSceneQuality,
  accessibility: defaultSceneAccessibility,
  transitions: defaultSceneTransition,
  fallback: {
    posterAssetId: WEATHER_SCENE_ASSET_IDS.partlyCloudyNightPoster,
    staticClass: 'weather-scene--partly-cloudy-night',
    reason: 'missing-assets',
  },
  legacyVisual: {
    atmosphereKey: 'partly-cloudy-night',
    motionPreset: 'partly-cloudy-night-gentle',
    contentTone: 'light',
    fallbackKey: 'neutral',
    timeline: 'night',
  },
} satisfies WeatherScenePreset
