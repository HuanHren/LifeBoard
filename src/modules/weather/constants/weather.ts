export const WEATHER_STORAGE_KEY = 'lifeboard-weather-location'
export const WEATHER_FAVORITES_STORAGE_KEY = 'lifeboard-weather-favorite-cities'
export const WEATHER_FAVORITES_STORAGE_VERSION = 1
export const WEATHER_PROVIDER_STORAGE_KEY = 'lifeboard.weather.provider'
export const WEATHER_CAIYUN_TOKEN_STORAGE_KEY = 'lifeboard.weather.caiyunToken'
export const MIN_SEARCH_LENGTH = 2
export const SEARCH_RESULT_LIMIT = 8
export const HOURLY_FORECAST_LENGTH = 24
export const DAILY_FORECAST_LENGTH = 7

export const WEATHER_ENDPOINTS = {
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  forecast: 'https://api.open-meteo.com/v1/forecast',
} as const

export const CURRENT_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'is_day',
] as const

export const HOURLY_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'uv_index',
  'is_day',
] as const

export const DAILY_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'uv_index_max',
  'sunrise',
  'sunset',
] as const

export const ADVICE_THRESHOLDS = {
  umbrellaTakeProbability: 60,
  umbrellaConsiderProbability: 35,
  umbrellaTakePrecipitation: 1,
  umbrellaConsiderPrecipitation: 0.2,
  veryColdApparent: 0,
  coolApparent: 12,
  mildApparent: 20,
  warmApparent: 28,
  hotApparent: 34,
  largeTemperatureRange: 9,
  windy: 30,
  strongGusts: 45,
  outdoorStrongGusts: 60,
  outdoorHeavyHourlyPrecipitation: 5,
  outdoorColdExtreme: -15,
  outdoorHeatExtreme: 38,
  elevatedUv: 6,
} as const
