import { WEATHER_ENDPOINTS } from '@/modules/weather/constants/weather'
import type {
  AirQualityErrorKind,
  OpenMeteoAirQualityErrorResponse,
  OpenMeteoAirQualityResponse,
} from '@/modules/weather/types/airQuality'
import type { WeatherLocation } from '@/modules/weather/types/weather'

const AIR_QUALITY_CURRENT_VARIABLES = [
  'us_aqi',
  'european_aqi',
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
] as const

export class OpenMeteoAirQualityServiceError extends Error {
  readonly kind: AirQualityErrorKind
  readonly status?: number

  constructor(
    kind: AirQualityErrorKind,
    message: string,
    status?: number,
  ) {
    super(message)
    this.name = 'OpenMeteoAirQualityServiceError'
    this.kind = kind
    this.status = status
  }
}

function isOpenMeteoAirQualityError(
  value: unknown,
): value is OpenMeteoAirQualityErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === true &&
    'reason' in value &&
    typeof value.reason === 'string'
  )
}

export async function fetchOpenMeteoAirQuality(
  location: WeatherLocation,
  signal?: AbortSignal,
) {
  const url = new URL(WEATHER_ENDPOINTS.airQuality)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone || 'auto',
    forecast_days: '1',
    current: AIR_QUALITY_CURRENT_VARIABLES.join(','),
  }).toString()

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

    throw new OpenMeteoAirQualityServiceError(
      'network',
      'Unable to reach Open-Meteo Air Quality.',
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new OpenMeteoAirQualityServiceError(
      'unreadable',
      'Open-Meteo Air Quality returned an unreadable response.',
      response.status,
    )
  }

  if (isOpenMeteoAirQualityError(payload)) {
    throw new OpenMeteoAirQualityServiceError(
      'serviceRejected',
      payload.reason,
      response.status,
    )
  }

  if (!response.ok) {
    throw new OpenMeteoAirQualityServiceError(
      'status',
      `Open-Meteo Air Quality returned status ${response.status}.`,
      response.status,
    )
  }

  return payload as OpenMeteoAirQualityResponse
}
