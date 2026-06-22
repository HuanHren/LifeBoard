import partlyCloudyDayBaseDesktopAvif from '@/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.avif'
import partlyCloudyDayBaseDesktopWebp from '@/assets/weather/atmosphere/partly-cloudy-day/desktop/partly-cloudy-day-base-desktop.webp'
import partlyCloudyDayBaseMobileAvif from '@/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.avif'
import partlyCloudyDayBaseMobileWebp from '@/assets/weather/atmosphere/partly-cloudy-day/mobile/partly-cloudy-day-base-mobile.webp'
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
} satisfies Record<string, WeatherVisualAssetPair>
