import {
  DAILY_FORECAST_LENGTH,
  HOURLY_FORECAST_LENGTH,
} from '@/modules/weather/constants/weather'
import { getWeatherProviderCapabilities } from '@/modules/weather/constants/weatherProviderCapabilities'
import type {
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResult,
} from '@/modules/weather/types/openMeteo'
import type {
  DailyForecastItem,
  HourlyForecastItem,
  WeatherLocation,
  WeatherLocationKind,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import { createWeatherAdvice } from '@/modules/weather/utils/weatherAdvice'
import { getWeatherCondition } from '@/modules/weather/utils/weatherCodes'

function normalizeVisibilityMeters(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null
  }

  return value / 1000
}

function valueAt<T>(values: T[], index: number, field: string): T {
  const value = values[index]

  if (value === undefined) {
    throw new Error(`Weather data is incomplete for ${field}.`)
  }

  return value
}

function getLocationKind(featureCode?: string): WeatherLocationKind {
  if (featureCode === 'PPLC') {
    return 'Capital city'
  }

  if (featureCode?.startsWith('PPLA')) {
    return 'Regional capital'
  }

  if (featureCode?.startsWith('PCL')) {
    return 'Country'
  }

  if (featureCode?.startsWith('ADM')) {
    return 'Administrative area'
  }

  if (featureCode?.startsWith('PPL')) {
    return 'Locality'
  }

  return 'Location'
}

export function normalizeLocation(result: OpenMeteoGeocodingResult): WeatherLocation {
  return {
    id: result.id,
    name: result.name,
    kind: getLocationKind(result.feature_code),
    admin1: result.admin1 ?? null,
    country: result.country ?? result.country_code,
    countryCode: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude,
    elevation: result.elevation ?? null,
    timezone: result.timezone,
    source: 'openMeteo',
  }
}

function normalizeHourly(response: OpenMeteoForecastResponse) {
  const startHour = `${response.current.time.slice(0, 13)}:00`
  const startIndex = Math.max(
    0,
    response.hourly.time.findIndex((time) => time >= startHour),
  )
  const endIndex = startIndex + HOURLY_FORECAST_LENGTH

  return response.hourly.time.slice(startIndex, endIndex).map<HourlyForecastItem>((time, offset) => {
    const index = startIndex + offset

    return {
      time,
      temperature: valueAt(response.hourly.temperature_2m, index, 'hourly temperature'),
      apparentTemperature: valueAt(
        response.hourly.apparent_temperature,
        index,
        'hourly apparent temperature',
      ),
      precipitationProbability: valueAt(
        response.hourly.precipitation_probability,
        index,
        'hourly precipitation probability',
      ),
      precipitation: valueAt(response.hourly.precipitation, index, 'hourly precipitation'),
      windSpeed: valueAt(response.hourly.wind_speed_10m, index, 'hourly wind speed'),
      windGusts: valueAt(response.hourly.wind_gusts_10m, index, 'hourly wind gusts'),
      uvIndex: valueAt(response.hourly.uv_index, index, 'hourly UV index'),
      isDay: valueAt(response.hourly.is_day, index, 'hourly day state') === 1,
      condition: getWeatherCondition(
        valueAt(response.hourly.weather_code, index, 'hourly weather code'),
      ),
    }
  })
}

function normalizeDaily(response: OpenMeteoForecastResponse) {
  return response.daily.time.slice(0, DAILY_FORECAST_LENGTH).map<DailyForecastItem>((date, index) => ({
    date,
    temperatureMax: valueAt(response.daily.temperature_2m_max, index, 'daily maximum temperature'),
    temperatureMin: valueAt(response.daily.temperature_2m_min, index, 'daily minimum temperature'),
    apparentTemperatureMax: valueAt(
      response.daily.apparent_temperature_max,
      index,
      'daily maximum apparent temperature',
    ),
    apparentTemperatureMin: valueAt(
      response.daily.apparent_temperature_min,
      index,
      'daily minimum apparent temperature',
    ),
    precipitationSum: valueAt(
      response.daily.precipitation_sum,
      index,
      'daily precipitation',
    ),
    precipitationProbabilityMax: valueAt(
      response.daily.precipitation_probability_max,
      index,
      'daily precipitation probability',
    ),
    windSpeedMax: valueAt(response.daily.wind_speed_10m_max, index, 'daily wind speed'),
    windDirectionDominant: valueAt(
      response.daily.wind_direction_10m_dominant,
      index,
      'daily wind direction',
    ),
    windGustsMax: valueAt(response.daily.wind_gusts_10m_max, index, 'daily wind gusts'),
    uvIndexMax: valueAt(response.daily.uv_index_max, index, 'daily UV index'),
    sunrise: valueAt(response.daily.sunrise, index, 'daily sunrise'),
    sunset: valueAt(response.daily.sunset, index, 'daily sunset'),
    condition: getWeatherCondition(
      valueAt(response.daily.weather_code, index, 'daily weather code'),
    ),
  }))
}

export function normalizeWeatherForecast(
  response: OpenMeteoForecastResponse,
  location: WeatherLocation,
): WeatherSnapshot {
  const hourly = normalizeHourly(response)
  const daily = normalizeDaily(response)
  const current = {
    time: response.current.time,
    temperature: response.current.temperature_2m,
    apparentTemperature: response.current.apparent_temperature,
    relativeHumidity: response.current.relative_humidity_2m,
    precipitation: response.current.precipitation,
    rain: response.current.rain,
    showers: response.current.showers,
    snowfall: response.current.snowfall,
    cloudCover: response.current.cloud_cover,
    windSpeed: response.current.wind_speed_10m,
    windDirection: response.current.wind_direction_10m,
    windGusts: response.current.wind_gusts_10m,
    uvIndex: hourly[0]?.uvIndex ?? null,
    pressure: response.current.surface_pressure,
    visibility: normalizeVisibilityMeters(response.current.visibility),
    isDay: response.current.is_day === 1,
    condition: getWeatherCondition(response.current.weather_code),
  }

  if (hourly.length < HOURLY_FORECAST_LENGTH || daily.length === 0) {
    throw new Error('The weather service returned an incomplete forecast.')
  }

  return {
    provider: 'openMeteo',
    location,
    timezone: response.timezone,
    timezoneAbbreviation: response.timezone_abbreviation,
    fetchedAt: new Date().toISOString(),
    current,
    hourly,
    daily,
    shortTermPrecipitation: null,
    alerts: [],
    providerCapabilities: getWeatherProviderCapabilities('openMeteo'),
    units: {
      temperature: response.current_units.temperature_2m,
      precipitation: response.current_units.precipitation,
      probability: response.hourly_units.precipitation_probability,
      windSpeed: response.current_units.wind_speed_10m,
      humidity: response.current_units.relative_humidity_2m,
      uvIndex: response.hourly_units.uv_index,
      pressure: response.current_units.surface_pressure,
      visibility: 'km',
    },
    advice: createWeatherAdvice({ current, hourly, daily }),
  }
}
