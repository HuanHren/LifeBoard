import {
  WEATHER_FAVORITES_STORAGE_KEY,
  WEATHER_FAVORITES_STORAGE_VERSION,
} from '@/modules/weather/constants/weather'
import type {
  WeatherFavoriteCity,
  WeatherFavoritesStorageEnvelope,
} from '@/modules/weather/types/weatherFavorites'

export type WeatherFavoritesStorageResult<T = WeatherFavoritesStorageEnvelope | null> =
  | { ok: true; data: T }
  | { ok: false; error: 'storageUnavailable' | 'invalidJson' | 'invalidFormat' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(record: Record<string, unknown>, keys: string[]) {
  const recordKeys = Object.keys(record)
  return recordKeys.length === keys.length && keys.every((key) => key in record)
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

export function isWeatherFavoriteCity(value: unknown): value is WeatherFavoriteCity {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      'id',
      'name',
      'region',
      'country',
      'latitude',
      'longitude',
      'displayLabel',
      'createdAt',
      'updatedAt',
    ]) &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    (typeof value.region === 'string' || value.region === null) &&
    typeof value.country === 'string' &&
    value.country.trim().length > 0 &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    typeof value.displayLabel === 'string' &&
    value.displayLabel.trim().length > 0 &&
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt)
  )
}

export function isWeatherFavoritesStorageEnvelope(
  value: unknown,
): value is WeatherFavoritesStorageEnvelope {
  return (
    isRecord(value) &&
    hasExactKeys(value, ['version', 'favoriteCities']) &&
    value.version === WEATHER_FAVORITES_STORAGE_VERSION &&
    Array.isArray(value.favoriteCities) &&
    value.favoriteCities.every(isWeatherFavoriteCity)
  )
}

export function loadWeatherFavoritesStorage(): WeatherFavoritesStorageResult {
  if (typeof window === 'undefined') {
    return { ok: true, data: null }
  }

  let stored: string | null = null

  try {
    stored = window.localStorage.getItem(WEATHER_FAVORITES_STORAGE_KEY)
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }

  if (stored === null) {
    return { ok: true, data: null }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(stored)
  } catch {
    return { ok: false, error: 'invalidJson' }
  }

  if (!isWeatherFavoritesStorageEnvelope(parsed)) {
    return { ok: false, error: 'invalidFormat' }
  }

  return { ok: true, data: parsed }
}

export function saveWeatherFavoritesStorage(
  favoriteCities: WeatherFavoriteCity[],
): WeatherFavoritesStorageResult<undefined> {
  if (typeof window === 'undefined') {
    return { ok: true, data: undefined }
  }

  try {
    window.localStorage.setItem(
      WEATHER_FAVORITES_STORAGE_KEY,
      JSON.stringify({
        version: WEATHER_FAVORITES_STORAGE_VERSION,
        favoriteCities,
      }),
    )
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}
