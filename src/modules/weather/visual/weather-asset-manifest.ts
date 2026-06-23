import partlyCloudyDayBaseDesktopAvif from '@/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif'
import partlyCloudyDayBaseDesktopWebp from '@/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.webp'
import partlyCloudyDayBaseMobileAvif from '@/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif'
import partlyCloudyDayBaseMobileWebp from '@/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.webp'
import partlyCloudyNightBaseDesktopAvif from '@/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.avif'
import partlyCloudyNightBaseDesktopWebp from '@/assets/weather/atmosphere/partly-cloudy-night/desktop/partly-cloudy-night-base-desktop.webp'
import partlyCloudyNightBaseMobileAvif from '@/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.avif'
import partlyCloudyNightBaseMobileWebp from '@/assets/weather/atmosphere/partly-cloudy-night/mobile/partly-cloudy-night-base-mobile.webp'
import type { WeatherVisualAssetPair } from '@/modules/weather/visual/types'

export const WEATHER_VISUAL_ASSET_MANIFEST = {
  'partly-cloudy-day': {
    desktop: {
      avif: partlyCloudyDayBaseDesktopAvif,
      webp: partlyCloudyDayBaseDesktopWebp,
      width: 1896,
      height: 829,
    },
    mobile: {
      avif: partlyCloudyDayBaseMobileAvif,
      webp: partlyCloudyDayBaseMobileWebp,
      width: 941,
      height: 1672,
    },
  },
  'partly-cloudy-night': {
    desktop: {
      avif: partlyCloudyNightBaseDesktopAvif,
      webp: partlyCloudyNightBaseDesktopWebp,
      width: 1896,
      height: 829,
    },
    mobile: {
      avif: partlyCloudyNightBaseMobileAvif,
      webp: partlyCloudyNightBaseMobileWebp,
      width: 941,
      height: 1672,
    },
  },
} satisfies Record<string, WeatherVisualAssetPair>
