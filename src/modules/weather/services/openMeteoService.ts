import {
  CURRENT_VARIABLES,
  DAILY_FORECAST_LENGTH,
  DAILY_VARIABLES,
  HOURLY_VARIABLES,
  SEARCH_RESULT_LIMIT,
  WEATHER_ENDPOINTS,
} from '@/modules/weather/constants/weather'
import type {
  OpenMeteoErrorResponse,
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
} from '@/modules/weather/types/openMeteo'
import type { WeatherLocation } from '@/modules/weather/types/weather'

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeatherServiceError'
  }
}

function isOpenMeteoError(value: unknown): value is OpenMeteoErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true &&
    'reason' in value &&
    typeof value.reason === 'string'
  )
}

async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new WeatherServiceError(
      'Unable to reach Open-Meteo. The browser received no response; check your connection or network policy.',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new WeatherServiceError('The weather service returned an unreadable response.')
  }

  if (isOpenMeteoError(payload)) {
    throw new WeatherServiceError(payload.reason)
  }

  if (!response.ok) {
    throw new WeatherServiceError(`The weather service returned status ${response.status}.`)
  }

  return payload as T
}

export async function searchOpenMeteoLocations(query: string, signal?: AbortSignal) {
  const url = new URL(WEATHER_ENDPOINTS.geocoding)
  url.search = new URLSearchParams({
    name: query,
    count: String(SEARCH_RESULT_LIMIT),
    language: 'en',
    format: 'json',
  }).toString()

  const response = await fetchJson<OpenMeteoGeocodingResponse>(url, signal)
  return response.results ?? []
}

export async function fetchOpenMeteoForecast(
  location: WeatherLocation,
  signal?: AbortSignal,
) {
  const url = new URL(WEATHER_ENDPOINTS.forecast)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: 'auto',
    forecast_days: String(DAILY_FORECAST_LENGTH),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    current: CURRENT_VARIABLES.join(','),
    hourly: HOURLY_VARIABLES.join(','),
    daily: DAILY_VARIABLES.join(','),
  }).toString()

  return fetchJson<OpenMeteoForecastResponse>(url, signal)
}
