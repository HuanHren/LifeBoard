import { WEATHER_ENDPOINTS } from '@/modules/weather/constants/weather'
import { readAmapKeyForRequest } from '@/modules/weather/services/weatherAmapStorage'
import type { AppLocale } from '@/i18n/types'
import type { WeatherLocation } from '@/modules/weather/types/weather'

export class AmapGeocodingServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AmapGeocodingServiceError'
  }
}

interface AmapGeocodeResponse {
  results?: WeatherLocation[]
}

interface AmapReverseGeocodeResponse {
  location?: WeatherLocation
}

async function fetchJson<T>(
  endpoint: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(endpoint, {
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new AmapGeocodingServiceError(
      'LifeBoard could not reach the AMap geocoding proxy.',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new AmapGeocodingServiceError('AMap geocoding returned an unreadable response.')
  }

  if (!response.ok) {
    throw new AmapGeocodingServiceError(
      `LifeBoard's AMap geocoding proxy returned status ${response.status}.`,
    )
  }

  return payload as T
}

export async function searchAmapLocations(
  query: string,
  locale: AppLocale,
  signal?: AbortSignal,
) {
  const keyResult = readAmapKeyForRequest()

  if (!keyResult.ok) {
    throw new AmapGeocodingServiceError('AMap key is not saved in this browser.')
  }

  const response = await fetchJson<AmapGeocodeResponse>(
    WEATHER_ENDPOINTS.amapGeocode,
    {
      key: keyResult.data,
      query,
      locale,
    },
    signal,
  )

  return response.results ?? []
}

export async function reverseGeocodeAmapLocation(
  longitude: number,
  latitude: number,
  locale: AppLocale,
  signal?: AbortSignal,
) {
  const keyResult = readAmapKeyForRequest()

  if (!keyResult.ok) {
    throw new AmapGeocodingServiceError('AMap key is not saved in this browser.')
  }

  const response = await fetchJson<AmapReverseGeocodeResponse>(
    WEATHER_ENDPOINTS.amapReverseGeocode,
    {
      key: keyResult.data,
      longitude,
      latitude,
      locale,
    },
    signal,
  )

  if (!response.location) {
    throw new AmapGeocodingServiceError('AMap reverse geocoding returned no location.')
  }

  return response.location
}
