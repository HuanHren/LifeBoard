import {
  WEATHER_FORECAST_TIMEOUT_MS,
  WEATHER_ENDPOINTS,
} from '@/modules/weather/constants/weather'
import {
  fetchWithTimeout,
  parseRetryAfterMs,
  WeatherRequestTimeoutError,
} from '@/modules/weather/services/weatherRequest'
import type {
  CaiyunFailureResponse,
  CaiyunWeatherResponse,
} from '@/modules/weather/types/caiyun'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type { AppLocale } from '@/i18n/types'

export class CaiyunWeatherServiceError extends Error {
  readonly kind: 'network' | 'timeout' | 'http' | 'contract' | 'configuration'
  readonly status?: number
  readonly retryAfterMs?: number

  constructor(
    message: string,
    kind: 'network' | 'timeout' | 'http' | 'contract' | 'configuration' = 'network',
    details: { status?: number; retryAfterMs?: number } = {},
  ) {
    super(message)
    this.name = 'CaiyunWeatherServiceError'
    this.kind = kind
    this.status = details.status
    this.retryAfterMs = details.retryAfterMs
  }
}

function isCaiyunFailureResponse(value: unknown): value is CaiyunFailureResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    value.status === 'failed'
  )
}

interface CaiyunProxyErrorResponse {
  error?: string
  status?: number
}

function getRequestLocale(): AppLocale {
  if (typeof document !== 'undefined') {
    return document.documentElement.lang === 'zh-CN' ? 'zh-CN' : 'en-US'
  }

  return 'en-US'
}

function isCaiyunProxyErrorResponse(value: unknown): value is CaiyunProxyErrorResponse {
  return typeof value === 'object' && value !== null && 'error' in value
}

function errorForProxyResponse(response: Response, payload: unknown) {
  const errorCode = isCaiyunProxyErrorResponse(payload) ? payload.error : null

  if (errorCode === 'missingToken') {
    return 'Caiyun Weather is selected, but no token is saved. Add one in Settings before loading Caiyun forecasts.'
  }

  if (errorCode === 'caiyunAuth') {
    return 'Caiyun Weather rejected the request. Check the saved token or switch back to Open-Meteo.'
  }

  if (errorCode === 'invalidCoordinates' || errorCode === 'caiyunCoordinates') {
    return 'Caiyun Weather could not use the selected city coordinates.'
  }

  if (errorCode === 'caiyunUnreadable') {
    return 'Caiyun Weather returned an unreadable response.'
  }

  if (errorCode === 'caiyunProxyUnavailable') {
    return 'LifeBoard could not reach the Caiyun Weather proxy. Check the deployment or switch back to Open-Meteo.'
  }

  if (errorCode === 'invalidBody' || errorCode === 'invalidLocale') {
    return 'LifeBoard could not prepare the Caiyun Weather request.'
  }

  if (errorCode === 'caiyunUpstream') {
    return `Caiyun Weather returned status ${response.status}.`
  }

  return `LifeBoard's Caiyun Weather proxy returned status ${response.status}.`
}

export async function fetchCaiyunWeatherForecast(
  location: WeatherLocation,
  token: string,
  signal?: AbortSignal,
) {
  let response: Response

  try {
    response = await fetchWithTimeout(WEATHER_ENDPOINTS.caiyunForecast, {
      body: JSON.stringify({
        token,
        longitude: location.longitude,
        latitude: location.latitude,
        locale: getRequestLocale(),
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal,
    }, WEATHER_FORECAST_TIMEOUT_MS)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    if (error instanceof WeatherRequestTimeoutError) {
      throw new CaiyunWeatherServiceError(error.message, 'timeout')
    }

    throw new CaiyunWeatherServiceError(
      'LifeBoard could not reach the Caiyun Weather proxy. Check the deployment or switch back to Open-Meteo.',
      'network',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new CaiyunWeatherServiceError('Caiyun Weather returned an unreadable response.', 'contract', {
      status: response.status,
    })
  }

  if (!response.ok) {
    throw new CaiyunWeatherServiceError(errorForProxyResponse(response, payload), 'http', {
      status: response.status,
      retryAfterMs: parseRetryAfterMs(response.headers.get('retry-after')),
    })
  }

  if (isCaiyunFailureResponse(payload)) {
    throw new CaiyunWeatherServiceError(
      'Caiyun Weather rejected the request. Check the saved token or switch back to Open-Meteo.',
      'contract',
    )
  }

  return payload as CaiyunWeatherResponse
}
