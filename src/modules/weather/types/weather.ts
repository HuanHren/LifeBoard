export type WeatherRequestStatus = 'idle' | 'loading' | 'success' | 'error'
export type WeatherDataProvider = 'openMeteo' | 'caiyun'
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
  id: number
  name: string
  kind: WeatherLocationKind
  admin1: string | null
  country: string
  countryCode: string
  latitude: number
  longitude: number
  elevation: number | null
  timezone: string
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
}

export interface CurrentConditions {
  time: string
  temperature: number
  apparentTemperature: number
  relativeHumidity: number
  precipitation: number
  rain: number
  showers: number
  snowfall: number
  cloudCover: number
  windSpeed: number
  windDirection: number
  windGusts: number | null
  uvIndex: number | null
  pressure: number | null
  isDay: boolean
  condition: WeatherCondition
}

export interface HourlyForecastItem {
  time: string
  temperature: number
  apparentTemperature: number
  precipitationProbability: number
  precipitation: number
  windSpeed: number
  windGusts: number | null
  uvIndex: number | null
  isDay: boolean
  condition: WeatherCondition
}

export interface DailyForecastItem {
  date: string
  temperatureMax: number
  temperatureMin: number
  apparentTemperatureMax: number
  apparentTemperatureMin: number
  precipitationSum: number
  precipitationProbabilityMax: number
  windSpeedMax: number
  windGustsMax: number | null
  uvIndexMax: number | null
  sunrise: string
  sunset: string
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
  units: WeatherUnits
  advice: WeatherAdvice
}
