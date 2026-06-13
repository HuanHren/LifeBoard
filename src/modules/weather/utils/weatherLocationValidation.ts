import type {
  WeatherLocation,
  WeatherLocationKind,
} from '@/modules/weather/types/weather'

const locationKinds: WeatherLocationKind[] = [
  'Capital city',
  'Regional capital',
  'Country',
  'Administrative area',
  'Locality',
  'Location',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isWeatherLocation(value: unknown): value is WeatherLocation {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    locationKinds.includes(value.kind as WeatherLocationKind) &&
    (typeof value.admin1 === 'string' || value.admin1 === null) &&
    typeof value.country === 'string' &&
    typeof value.countryCode === 'string' &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    (typeof value.elevation === 'number' || value.elevation === null) &&
    typeof value.timezone === 'string'
  )
}

export function parseWeatherLocation(value: unknown): WeatherLocation | null {
  return isWeatherLocation(value) ? value : null
}
