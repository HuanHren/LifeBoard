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
    ((typeof value.id === 'number' && Number.isFinite(value.id)) ||
      (typeof value.id === 'string' && value.id.trim().length > 0)) &&
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
    typeof value.timezone === 'string' &&
    (!('displayLabel' in value) || typeof value.displayLabel === 'string') &&
    (!('source' in value) ||
      value.source === 'openMeteo' ||
      value.source === 'amap' ||
      value.source === 'amap-geolocation' ||
      value.source === 'xiaomi') &&
    (!('providerLocationIds' in value) || isProviderLocationIds(value.providerLocationIds))
  )
}

function isProviderLocationIds(value: unknown) {
  if (!isRecord(value)) return false

  const keys = Object.keys(value)
  return keys.every((key) => key === 'xiaomi' || key === 'openMeteo') &&
    keys.every((key) => typeof value[key] === 'string' && value[key].trim().length > 0)
}

export function parseWeatherLocation(value: unknown): WeatherLocation | null {
  return isWeatherLocation(value) ? value : null
}
