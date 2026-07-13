export type WeatherProviderId = 'openMeteo' | 'caiyun' | 'xiaomi'

export type WeatherCapabilityState =
  | 'missing'
  | 'null'
  | 'empty-array'
  | 'empty-object'
  | 'available'

export type WeatherCapabilityName =
  | 'current'
  | 'hourly'
  | 'daily'
  | 'aqi'
  | 'minutely'
  | 'alerts'
  | 'indices'
  | 'typhoon'
  | 'yesterday'
  | 'preHour'
  | 'sourceMaps'
  | 'brandInfo'
  | 'updateTime'

export type WeatherCapabilityMap = Record<WeatherCapabilityName, WeatherCapabilityState>

export interface ProviderWeatherLocation {
  provider: WeatherProviderId
  providerLocationId: string
  name: string
  administrativeArea?: string
  country?: string
  latitude: number
  longitude: number
  timezone?: string
}

export type CanonicalWeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'haze'
  | 'drizzle'
  | 'light-rain'
  | 'moderate-rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'light-snow'
  | 'moderate-snow'
  | 'heavy-snow'
  | 'sleet-freezing'
  | 'sand-dust'
  | 'unknown'

export interface ProviderWeatherCondition {
  id: CanonicalWeatherCondition
  providerCode: string
}

export interface NormalizedCurrentWeather {
  observedAt: string
  temperatureC: number
  apparentTemperatureC?: number
  humidityPercent?: number
  windSpeedKmh?: number
  windDirectionDegrees?: number
  pressureHpa?: number
  visibilityKm?: number
  uvIndex?: number
  condition: ProviderWeatherCondition
}

export interface NormalizedHourlyWeather {
  time: string
  temperatureC: number
  condition: ProviderWeatherCondition
}

export interface NormalizedDailyWeather {
  date: string
  temperatureMaxC: number
  temperatureMinC: number
  dayCondition: ProviderWeatherCondition
  nightCondition: ProviderWeatherCondition
  sunrise?: string
  sunset?: string
}

export interface NormalizedAirQuality {
  value: number
  scale: 'unknown'
  observedAt?: string
}

export interface NormalizedWeatherUnits {
  temperature: 'celsius'
  windSpeed: 'kilometres-per-hour'
  windDirection: 'degrees'
  humidity: 'percent'
  pressure: 'hectopascals'
  visibility: 'kilometres'
}

export interface WeatherNormalizationDiagnostic {
  path: string
  code: 'invalid-optional-field' | 'unmapped-unit' | 'invalid-entry' | 'capability-invalid'
}

export interface ProviderWeatherSnapshot<TExtensions = unknown> {
  provider: WeatherProviderId
  location: ProviderWeatherLocation
  updatedAt: string
  current: NormalizedCurrentWeather
  hourly: NormalizedHourlyWeather[]
  daily: NormalizedDailyWeather[]
  airQuality?: NormalizedAirQuality
  capabilities: WeatherCapabilityMap
  units: NormalizedWeatherUnits
  extensions?: TExtensions
  diagnostics: WeatherNormalizationDiagnostic[]
}
