import type { WeatherAlert } from '@/modules/weather/types/weatherAlert'
import type {
  WeatherProviderCapabilities,
  WeatherProviderId,
} from '@/modules/weather/types/weatherProvider'
import type { ProviderLocationIds } from '@/modules/weather/providers/types'

export type WeatherRequestStatus = 'idle' | 'loading' | 'success' | 'error'
export type WeatherDataProvider = WeatherProviderId
export type WeatherLocationSource = 'openMeteo' | 'amap' | 'amap-geolocation' | 'xiaomi'
export type AdviceLevel = 'clear' | 'consider' | 'caution'
export type AdviceKind = 'umbrella' | 'clothing' | 'outdoor'
export type WeatherLocationKind =
  | 'Capital city'
  | 'Regional capital'
  | 'Country'
  | 'Administrative area'
  | 'Locality'
  | 'Location'

export interface WeatherLocation {
  id: number | string
  name: string
  kind: WeatherLocationKind
  admin1: string | null
  country: string
  countryCode: string
  latitude: number
  longitude: number
  elevation: number | null
  timezone: string
  displayLabel?: string
  source?: WeatherLocationSource
  providerLocationIds?: ProviderLocationIds
}

export interface WeatherCondition {
  code: number
  label: string
  shortLabel: string
}

export interface WeatherUnits {
  temperature: string
  precipitation: string
  probability: string
  windSpeed: string
  humidity: string
  uvIndex: string
  pressure: string
  visibility: string
}

export interface CurrentConditions {
  time: string
  temperature: number
  apparentTemperature: number | null
  relativeHumidity: number | null
  precipitation: number | null
  rain: number | null
  showers: number | null
  snowfall: number | null
  cloudCover: number | null
  windSpeed: number | null
  windDirection: number | null
  windGusts: number | null
  uvIndex: number | null
  pressure: number | null
  visibility: number | null
  isDay: boolean | null
  condition: WeatherCondition
}

export interface HourlyForecastItem {
  time: string
  temperature: number
  apparentTemperature: number | null
  precipitationProbability: number | null
  precipitation: number | null
  windSpeed: number | null
  windGusts: number | null
  uvIndex: number | null
  isDay: boolean | null
  condition: WeatherCondition
}

export interface DailyForecastItem {
  date: string
  temperatureMax: number
  temperatureMin: number
  apparentTemperatureMax: number | null
  apparentTemperatureMin: number | null
  precipitationSum: number | null
  precipitationProbabilityMax: number | null
  windSpeedMax: number | null
  windDirectionDominant: number | null
  windGustsMax: number | null
  uvIndexMax: number | null
  sunrise: string | null
  sunset: string | null
  condition: WeatherCondition
}

export interface AdviceItem {
  kind: AdviceKind
  title: string
  summary: string
  detail: string
  level: AdviceLevel
}

export interface WeatherAdvice {
  items: AdviceItem[]
  notes: string[]
}

export interface ShortTermPrecipitationItem {
  time: string
  precipitation: number
}

export interface ShortTermPrecipitation {
  provider: WeatherDataProvider
  summary: string | null
  items: ShortTermPrecipitationItem[]
}

export interface WeatherSnapshot {
  provider: WeatherDataProvider
  location: WeatherLocation
  timezone: string
  timezoneAbbreviation: string
  fetchedAt: string
  current: CurrentConditions
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
  shortTermPrecipitation: ShortTermPrecipitation | null
  alerts: WeatherAlert[]
  providerCapabilities?: WeatherProviderCapabilities
  units: WeatherUnits
  advice: WeatherAdvice
}
