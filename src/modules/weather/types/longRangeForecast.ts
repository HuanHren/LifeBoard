import type {
  DailyForecastItem,
  WeatherDataProvider,
  WeatherLocation,
  WeatherUnits,
} from '@/modules/weather/types/weather'

export type LongRangeForecastStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'unsupported'

export interface NormalizedLongRangeForecast {
  provider: WeatherDataProvider
  location: WeatherLocation
  timezone: string
  timezoneAbbreviation: string
  fetchedAt: string
  daily: DailyForecastItem[]
  units: WeatherUnits
}

export type LongRangeForecastProviderResult =
  | {
      supported: true
      forecast: NormalizedLongRangeForecast
    }
  | {
      supported: false
      reason: 'unsupported'
    }
