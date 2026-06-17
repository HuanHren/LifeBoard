import {
  DAILY_FORECAST_LENGTH,
  HOURLY_FORECAST_LENGTH,
} from '@/modules/weather/constants/weather'
import type {
  CaiyunSeries,
  CaiyunDailyRange,
  CaiyunDailyWind,
  CaiyunHourlyValue,
  CaiyunWeatherResponse,
  CaiyunSkycon,
} from '@/modules/weather/types/caiyun'
import type {
  DailyForecastItem,
  HourlyForecastItem,
  WeatherLocation,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import { createWeatherAdvice } from '@/modules/weather/utils/weatherAdvice'
import { getWeatherCondition } from '@/modules/weather/utils/weatherCodes'

function requireValue<T>(value: T | undefined | null, field: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Caiyun Weather returned an incomplete forecast for ${field}.`)
  }

  return value
}

function seriesValues<T>(series: CaiyunSeries<T> | undefined, field: string): T[] {
  if (Array.isArray(series)) {
    return series
  }

  if (Array.isArray(series?.value)) {
    return series.value
  }

  throw new Error(`Caiyun Weather returned an incomplete forecast for ${field}.`)
}

function optionalSeriesValues<T>(series: CaiyunSeries<T> | undefined): T[] | undefined {
  if (!series) {
    return undefined
  }

  return Array.isArray(series) ? series : series.value
}

function valueAt<T>(values: T[] | undefined, index: number, field: string): T {
  return requireValue(values?.[index], field)
}

function isoDateTime(value: string) {
  return value
}

function combineLocalTime(dateTime: string, time?: string) {
  if (!time) {
    return dateTime
  }

  const date = dateTime.slice(0, 10)
  const zone = dateTime.match(/([+-]\d{2}:\d{2}|Z)$/)?.[1] ?? ''
  return `${date}T${time}${zone}`
}

function probability(value?: number) {
  return typeof value === 'number' ? value : 0
}

function skyconToWeatherCode(skycon: CaiyunSkycon) {
  const mapping: Record<CaiyunSkycon, number> = {
    CLEAR_DAY: 0,
    CLEAR_NIGHT: 0,
    PARTLY_CLOUDY_DAY: 2,
    PARTLY_CLOUDY_NIGHT: 2,
    CLOUDY: 3,
    LIGHT_HAZE: 45,
    MODERATE_HAZE: 45,
    HEAVY_HAZE: 45,
    LIGHT_RAIN: 61,
    MODERATE_RAIN: 63,
    HEAVY_RAIN: 65,
    STORM_RAIN: 82,
    FOG: 45,
    LIGHT_SNOW: 71,
    MODERATE_SNOW: 73,
    HEAVY_SNOW: 75,
    STORM_SNOW: 86,
    DUST: 45,
    SAND: 45,
    WIND: 3,
  }

  return mapping[skycon] ?? 3
}

function isDayFromSkycon(skycon: CaiyunSkycon) {
  return !skycon.endsWith('_NIGHT')
}

function firstNumber(values: CaiyunHourlyValue[] | undefined, index: number, fallback: number) {
  const value = values?.[index]?.value
  return typeof value === 'number' ? value : fallback
}

function normalizeHourly(response: CaiyunWeatherResponse) {
  const hourly = response.result.hourly
  const temperatureValues = seriesValues(hourly.temperature, 'hourly temperature')
  const apparentTemperatureValues = optionalSeriesValues(hourly.apparent_temperature)
  const precipitationValues = seriesValues(hourly.precipitation, 'hourly precipitation')
  const windValues = seriesValues(hourly.wind, 'hourly wind')
  const skyconValues = seriesValues(hourly.skycon, 'hourly condition')

  return temperatureValues
    .slice(0, HOURLY_FORECAST_LENGTH)
    .map<HourlyForecastItem>((temperature, index) => {
      const skycon = valueAt(skyconValues, index, 'hourly condition')
      const precipitation = valueAt(precipitationValues, index, 'hourly precipitation')
      const wind = valueAt(windValues, index, 'hourly wind')
      const apparentTemperature = firstNumber(
        apparentTemperatureValues,
        index,
        temperature.value,
      )

      return {
        time: isoDateTime(temperature.datetime),
        temperature: temperature.value,
        apparentTemperature,
        precipitationProbability: probability(precipitation.probability),
        precipitation: precipitation.value,
        windSpeed: wind.speed,
        windGusts: null,
        uvIndex: null,
        isDay: isDayFromSkycon(skycon.value),
        condition: getWeatherCondition(skyconToWeatherCode(skycon.value)),
      }
    })
}

function dailyApparentRange(
  values: CaiyunDailyRange[] | undefined,
  index: number,
  fallback: CaiyunDailyRange,
) {
  return values?.[index] ?? fallback
}

function dailyWindAt(values: CaiyunDailyWind[] | undefined, index: number) {
  return valueAt(values, index, 'daily wind')
}

function dailyUv(response: CaiyunWeatherResponse, index: number) {
  const ultravioletValues = optionalSeriesValues(
    response.result.daily.life_index?.ultraviolet,
  )
  const value = ultravioletValues?.[index]?.index
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeDaily(response: CaiyunWeatherResponse) {
  const daily = response.result.daily
  const temperatureValues = seriesValues(daily.temperature, 'daily temperature')
  const apparentTemperatureValues = optionalSeriesValues(daily.apparent_temperature)
  const precipitationValues = seriesValues(daily.precipitation, 'daily precipitation')
  const windValues = seriesValues(daily.wind, 'daily wind')
  const skyconValues = seriesValues(daily.skycon, 'daily condition')
  const astroValues = optionalSeriesValues(daily.astro)

  return temperatureValues
    .slice(0, DAILY_FORECAST_LENGTH)
    .map<DailyForecastItem>((temperature, index) => {
      const skycon = valueAt(skyconValues, index, 'daily condition')
      const precipitation = valueAt(precipitationValues, index, 'daily precipitation')
      const wind = dailyWindAt(windValues, index)
      const apparentTemperature = dailyApparentRange(
        apparentTemperatureValues,
        index,
        temperature,
      )
      const astro = astroValues?.[index]

      return {
        date: temperature.date,
        temperatureMax: temperature.max,
        temperatureMin: temperature.min,
        apparentTemperatureMax: apparentTemperature.max,
        apparentTemperatureMin: apparentTemperature.min,
        precipitationSum: precipitation.avg,
        precipitationProbabilityMax: probability(precipitation.probability),
        windSpeedMax: wind.max.speed,
        windGustsMax: null,
        uvIndexMax: dailyUv(response, index),
        sunrise: combineLocalTime(temperature.date, astro?.sunrise?.time),
        sunset: combineLocalTime(temperature.date, astro?.sunset?.time),
        condition: getWeatherCondition(skyconToWeatherCode(skycon.value)),
      }
    })
}

export function normalizeCaiyunWeatherForecast(
  response: CaiyunWeatherResponse,
  location: WeatherLocation,
): WeatherSnapshot {
  const hourly = normalizeHourly(response)
  const daily = normalizeDaily(response)
  const realtime = response.result.realtime
  const currentWind = realtime.wind ?? { speed: 0, direction: 0 }
  const currentPrecipitation = realtime.precipitation?.local?.intensity ?? 0
  const currentSkycon = realtime.skycon
  const current = {
    time: new Date(response.server_time * 1000).toISOString(),
    temperature: realtime.temperature,
    apparentTemperature: realtime.apparent_temperature ?? realtime.temperature,
    relativeHumidity: Math.round(realtime.humidity * 100),
    precipitation: currentPrecipitation,
    rain: currentPrecipitation,
    showers: 0,
    snowfall: 0,
    cloudCover: Math.round((realtime.cloudrate ?? 0) * 100),
    windSpeed: currentWind.speed,
    windDirection: currentWind.direction,
    windGusts: null,
    isDay: isDayFromSkycon(currentSkycon),
    condition: getWeatherCondition(skyconToWeatherCode(currentSkycon)),
  }

  if (hourly.length === 0 || daily.length === 0) {
    throw new Error('Caiyun Weather returned an incomplete forecast.')
  }

  return {
    provider: 'caiyun',
    location,
    timezone: response.timezone,
    timezoneAbbreviation: response.timezone,
    fetchedAt: new Date().toISOString(),
    current,
    hourly,
    daily,
    units: {
      temperature: '°C',
      precipitation: 'mm',
      probability: '%',
      windSpeed: 'km/h',
      humidity: '%',
      uvIndex: '',
    },
    advice: createWeatherAdvice({ current, hourly, daily }),
  }
}
