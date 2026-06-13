export interface OpenMeteoErrorResponse {
  error: true
  reason: string
}

export interface OpenMeteoGeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  feature_code?: string
  country_code: string
  timezone: string
  country?: string
  admin1?: string
  admin2?: string
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[]
  generationtime_ms?: number
}

export interface OpenMeteoCurrentUnits {
  time: string
  interval: string
  temperature_2m: string
  apparent_temperature: string
  relative_humidity_2m: string
  precipitation: string
  rain: string
  showers: string
  snowfall: string
  weather_code: string
  cloud_cover: string
  wind_speed_10m: string
  wind_direction_10m: string
  wind_gusts_10m: string
  is_day: string
}

export interface OpenMeteoCurrent {
  time: string
  interval: number
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  precipitation: number
  rain: number
  showers: number
  snowfall: number
  weather_code: number
  cloud_cover: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
  is_day: number
}

export interface OpenMeteoHourlyUnits {
  time: string
  temperature_2m: string
  apparent_temperature: string
  precipitation_probability: string
  precipitation: string
  weather_code: string
  wind_speed_10m: string
  wind_gusts_10m: string
  uv_index: string
  is_day: string
}

export interface OpenMeteoHourly {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  precipitation_probability: number[]
  precipitation: number[]
  weather_code: number[]
  wind_speed_10m: number[]
  wind_gusts_10m: number[]
  uv_index: number[]
  is_day: number[]
}

export interface OpenMeteoDailyUnits {
  time: string
  weather_code: string
  temperature_2m_max: string
  temperature_2m_min: string
  apparent_temperature_max: string
  apparent_temperature_min: string
  precipitation_sum: string
  precipitation_probability_max: string
  wind_speed_10m_max: string
  wind_gusts_10m_max: string
  uv_index_max: string
  sunrise: string
  sunset: string
}

export interface OpenMeteoDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  apparent_temperature_max: number[]
  apparent_temperature_min: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
  wind_gusts_10m_max: number[]
  uv_index_max: number[]
  sunrise: string[]
  sunset: string[]
}

export interface OpenMeteoForecastResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units: OpenMeteoCurrentUnits
  current: OpenMeteoCurrent
  hourly_units: OpenMeteoHourlyUnits
  hourly: OpenMeteoHourly
  daily_units: OpenMeteoDailyUnits
  daily: OpenMeteoDaily
}
