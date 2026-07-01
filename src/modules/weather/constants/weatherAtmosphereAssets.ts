import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'
import clearDayBaseDesktopAvif from '@/assets/weather/atmosphere/clear-day/desktop/clear-day-base-desktop.avif'
import clearDayBaseDesktopWebp from '@/assets/weather/atmosphere/clear-day/desktop/clear-day-base-desktop.webp'
import clearDayBaseMobileAvif from '@/assets/weather/atmosphere/clear-day/mobile/clear-day-base-mobile.avif'
import clearDayBaseMobileWebp from '@/assets/weather/atmosphere/clear-day/mobile/clear-day-base-mobile.webp'
import clearNightBaseDesktopAvif from '@/assets/weather/atmosphere/clear-night/desktop/clear-night-base-desktop.avif'
import clearNightBaseDesktopWebp from '@/assets/weather/atmosphere/clear-night/desktop/clear-night-base-desktop.webp'
import clearNightBaseMobileAvif from '@/assets/weather/atmosphere/clear-night/mobile/clear-night-base-mobile.avif'
import clearNightBaseMobileWebp from '@/assets/weather/atmosphere/clear-night/mobile/clear-night-base-mobile.webp'
import partlyCloudyDayBaseDesktopAvif from '@/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif'
import partlyCloudyDayBaseDesktopWebp from '@/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.webp'
import partlyCloudyDayBaseMobileAvif from '@/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif'
import partlyCloudyDayBaseMobileWebp from '@/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.webp'
import partlyCloudyNightBaseDesktopAvif from '@/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.avif'
import partlyCloudyNightBaseDesktopWebp from '@/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.webp'
import partlyCloudyNightBaseMobileAvif from '@/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.avif'
import partlyCloudyNightBaseMobileWebp from '@/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.webp'

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
        avif: clearDayBaseDesktopAvif,
        webp: clearDayBaseDesktopWebp,
      },
      mobile: {
        avif: clearDayBaseMobileAvif,
        webp: clearDayBaseMobileWebp,
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
    base: {
      desktop: {
        avif: clearNightBaseDesktopAvif,
        webp: clearNightBaseDesktopWebp,
      },
      mobile: {
        avif: clearNightBaseMobileAvif,
        webp: clearNightBaseMobileWebp,
      },
    },
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
    base: {
      desktop: {
        avif: partlyCloudyDayBaseDesktopAvif,
        webp: partlyCloudyDayBaseDesktopWebp,
      },
      mobile: {
        avif: partlyCloudyDayBaseMobileAvif,
        webp: partlyCloudyDayBaseMobileWebp,
      },
    },
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
    base: {
      desktop: {
        avif: partlyCloudyNightBaseDesktopAvif,
        webp: partlyCloudyNightBaseDesktopWebp,
      },
      mobile: {
        avif: partlyCloudyNightBaseMobileAvif,
        webp: partlyCloudyNightBaseMobileWebp,
      },
    },
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
