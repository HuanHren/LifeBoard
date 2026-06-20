import { OpenMeteoAirQualityServiceError } from '@/modules/weather/services/openMeteoAirQualityService'
import type {
  AirQualitySnapshot,
  OpenMeteoAirQualityResponse,
} from '@/modules/weather/types/airQuality'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import { isValidAirQualityNumber } from '@/modules/weather/utils/airQuality'

function optionalNumber(value: unknown) {
  return isValidAirQualityNumber(value) ? value : null
}

function optionalUnit(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function requireNumber(value: unknown, field: string) {
  if (!isValidAirQualityNumber(value)) {
    throw new OpenMeteoAirQualityServiceError(
      'incomplete',
      `Open-Meteo Air Quality returned an invalid ${field}.`,
    )
  }

  return value
}

function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new OpenMeteoAirQualityServiceError(
      'incomplete',
      `Open-Meteo Air Quality returned an invalid ${field}.`,
    )
  }

  return value
}

export function createAirQualityLocationId(location: WeatherLocation) {
  return [
    location.id,
    location.latitude.toFixed(5),
    location.longitude.toFixed(5),
  ].join('|')
}

export function normalizeOpenMeteoAirQuality(
  response: OpenMeteoAirQualityResponse,
  location: WeatherLocation,
): AirQualitySnapshot {
  if (!response.current || !response.current_units) {
    throw new OpenMeteoAirQualityServiceError(
      'incomplete',
      'Open-Meteo Air Quality returned no current conditions.',
    )
  }

  return {
    locationId: createAirQualityLocationId(location),
    latitude: requireNumber(response.latitude, 'latitude'),
    longitude: requireNumber(response.longitude, 'longitude'),
    observedAt: requireString(response.current.time, 'observation time'),
    fetchedAt: new Date().toISOString(),
    timezone: requireString(response.timezone, 'timezone'),
    sourceId: 'open-meteo',
    modelSourceId: 'cams',
    usAqi: optionalNumber(response.current.us_aqi),
    europeanAqi: optionalNumber(response.current.european_aqi),
    pm25: optionalNumber(response.current.pm2_5),
    pm10: optionalNumber(response.current.pm10),
    ozone: optionalNumber(response.current.ozone),
    nitrogenDioxide: optionalNumber(response.current.nitrogen_dioxide),
    sulphurDioxide: optionalNumber(response.current.sulphur_dioxide),
    carbonMonoxide: optionalNumber(response.current.carbon_monoxide),
    units: {
      pm25: optionalUnit(response.current_units.pm2_5),
      pm10: optionalUnit(response.current_units.pm10),
      ozone: optionalUnit(response.current_units.ozone),
      nitrogenDioxide: optionalUnit(response.current_units.nitrogen_dioxide),
      sulphurDioxide: optionalUnit(response.current_units.sulphur_dioxide),
      carbonMonoxide: optionalUnit(response.current_units.carbon_monoxide),
    },
  }
}
