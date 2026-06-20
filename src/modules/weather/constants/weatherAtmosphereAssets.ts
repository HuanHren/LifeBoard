import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'
import clearDayBaseDesktopPng from '@/assets/weather/atmosphere/clear-day/desktop/clear-day-base-desktop.png'
import clearDayBaseMobilePng from '@/assets/weather/atmosphere/clear-day/mobile/clear-day-base-mobile.png'

export interface WeatherAtmosphereAssetSource {
  avif?: string
  webp?: string
  png?: string
}

export type WeatherAtmosphereMotionPreset =
  | 'static'
  | 'clear-glow'
  | 'cloud-drift'
  | 'overcast-drift'
  | 'rain'
  | 'snow'
  | 'fog'
  | 'storm-shadow'

export interface WeatherAtmosphereResponsiveSource {
  desktop?: WeatherAtmosphereAssetSource
  mobile?: WeatherAtmosphereAssetSource
}

export interface WeatherAtmosphereObjectPosition {
  desktop: string
  mobile: string
  depth?: string
  foreground?: string
}

export interface WeatherAtmosphereAssetSet {
  state: WeatherAtmosphere
  fallbackClass: string
  motionPreset?: WeatherAtmosphereMotionPreset
  base?: WeatherAtmosphereResponsiveSource
  depth?: WeatherAtmosphereAssetSource
  foreground?: WeatherAtmosphereAssetSource
  objectPosition: WeatherAtmosphereObjectPosition
  shouldDriftDepth?: boolean
}

export const WEATHER_ATMOSPHERE_ASSETS = {
  'clear-day': {
    state: 'clear-day',
    fallbackClass: 'weather-atmosphere--clear-day',
    motionPreset: 'clear-glow',
    base: {
      desktop: {
        png: clearDayBaseDesktopPng,
      },
      mobile: {
        png: clearDayBaseMobilePng,
      },
    },
    objectPosition: {
      desktop: 'center center',
      mobile: '58% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
  },
  'clear-night': {
    state: 'clear-night',
    fallbackClass: 'weather-atmosphere--clear-night',
    motionPreset: 'static',
    objectPosition: {
      desktop: 'center center',
      mobile: '54% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
    shouldDriftDepth: true,
  },
  'partly-cloudy-day': {
    state: 'partly-cloudy-day',
    fallbackClass: 'weather-atmosphere--partly-cloudy-day',
    motionPreset: 'cloud-drift',
    objectPosition: {
      desktop: 'center center',
      mobile: '56% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
    shouldDriftDepth: true,
  },
  'partly-cloudy-night': {
    state: 'partly-cloudy-night',
    fallbackClass: 'weather-atmosphere--partly-cloudy-night',
    motionPreset: 'cloud-drift',
    objectPosition: {
      desktop: 'center center',
      mobile: '56% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
    shouldDriftDepth: true,
  },
  overcast: {
    state: 'overcast',
    fallbackClass: 'weather-atmosphere--overcast',
    motionPreset: 'overcast-drift',
    objectPosition: {
      desktop: 'center center',
      mobile: '52% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
  },
  'rain-day': {
    state: 'rain-day',
    fallbackClass: 'weather-atmosphere--rain-day',
    motionPreset: 'rain',
    objectPosition: {
      desktop: 'center center',
      mobile: '54% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
    shouldDriftDepth: true,
  },
  'rain-night': {
    state: 'rain-night',
    fallbackClass: 'weather-atmosphere--rain-night',
    motionPreset: 'rain',
    objectPosition: {
      desktop: 'center center',
      mobile: '54% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
    shouldDriftDepth: true,
  },
  thunderstorm: {
    state: 'thunderstorm',
    fallbackClass: 'weather-atmosphere--thunderstorm',
    motionPreset: 'storm-shadow',
    objectPosition: {
      desktop: 'center center',
      mobile: '52% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
  },
  'fog-haze': {
    state: 'fog-haze',
    fallbackClass: 'weather-atmosphere--fog-haze',
    motionPreset: 'fog',
    objectPosition: {
      desktop: 'center center',
      mobile: '50% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
  },
  snow: {
    state: 'snow',
    fallbackClass: 'weather-atmosphere--snow',
    motionPreset: 'snow',
    objectPosition: {
      desktop: 'center center',
      mobile: '52% center',
      depth: 'center center',
      foreground: 'center bottom',
    },
  },
  neutral: {
    state: 'neutral',
    fallbackClass: 'weather-atmosphere--neutral',
    motionPreset: 'static',
    objectPosition: {
      desktop: 'center center',
      mobile: 'center center',
      depth: 'center center',
      foreground: 'center bottom',
    },
  },
} satisfies Record<WeatherAtmosphere, WeatherAtmosphereAssetSet>

export function getWeatherAtmosphereAssets(
  state: WeatherAtmosphere,
): WeatherAtmosphereAssetSet {
  return WEATHER_ATMOSPHERE_ASSETS[state] ?? WEATHER_ATMOSPHERE_ASSETS.neutral
}
