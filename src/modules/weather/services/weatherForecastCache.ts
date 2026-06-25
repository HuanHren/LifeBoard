import {
  WEATHER_FORECAST_CACHE_STORAGE_KEY,
  WEATHER_FORECAST_CACHE_VERSION,
  WEATHER_FORECAST_FRESH_MS,
  WEATHER_FORECAST_STALE_MS,
} from '@/modules/weather/constants/weather'
import type {
  WeatherLocation,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'
import { parseWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'

export type WeatherCacheFreshness = 'fresh' | 'stale' | 'expired'

export interface PersistedWeatherSnapshot {
  version: typeof WEATHER_FORECAST_CACHE_VERSION
  locationKey: string
  location: WeatherLocation
  forecast: WeatherSnapshot
  fetchedAt: number
  expiresAt: number
}

export type WeatherForecastCacheResult =
  | { ok: true; data: PersistedWeatherSnapshot | null }
  | { ok: false; error: 'storageUnavailable' | 'invalidJson' | 'invalidFormat' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    window.localStorage.length
    return window.localStorage
  } catch {
    return null
  }
}

function stableCoordinate(value: number) {
  return value.toFixed(4)
}

export function createWeatherForecastCacheKey(
  provider: WeatherProviderId,
  location: WeatherLocation,
) {
  return [
    provider,
    location.source ?? 'unknown',
    location.countryCode,
    stableCoordinate(location.latitude),
    stableCoordinate(location.longitude),
  ].join('|')
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isWeatherSnapshot(value: unknown): value is WeatherSnapshot {
  if (!isRecord(value)) return false

  return (
    (value.provider === 'openMeteo' || value.provider === 'caiyun') &&
    parseWeatherLocation(value.location) !== null &&
    typeof value.timezone === 'string' &&
    typeof value.timezoneAbbreviation === 'string' &&
    typeof value.fetchedAt === 'string' &&
    Array.isArray(value.hourly) &&
    value.hourly.length > 0 &&
    Array.isArray(value.daily) &&
    value.daily.length > 0 &&
    isRecord(value.current) &&
    isRecord(value.units) &&
    isRecord(value.advice)
  )
}

function isPersistedWeatherSnapshot(
  value: unknown,
): value is PersistedWeatherSnapshot {
  if (!isRecord(value)) return false

  const location = parseWeatherLocation(value.location)

  return (
    value.version === WEATHER_FORECAST_CACHE_VERSION &&
    typeof value.locationKey === 'string' &&
    value.locationKey.length > 0 &&
    location !== null &&
    isWeatherSnapshot(value.forecast) &&
    isFiniteTimestamp(value.fetchedAt) &&
    isFiniteTimestamp(value.expiresAt) &&
    value.expiresAt >= value.fetchedAt
  )
}

export function classifyWeatherCacheFreshness(
  cached: PersistedWeatherSnapshot,
  now = Date.now(),
): WeatherCacheFreshness {
  if (now <= cached.expiresAt) {
    return 'fresh'
  }

  if (now - cached.fetchedAt <= WEATHER_FORECAST_STALE_MS) {
    return 'stale'
  }

  return 'expired'
}

export function readWeatherForecastCache(
  locationKey: string,
): WeatherForecastCacheResult {
  const storage = getStorage()
  if (!storage) return { ok: false, error: 'storageUnavailable' }

  let stored: string | null

  try {
    stored = storage.getItem(WEATHER_FORECAST_CACHE_STORAGE_KEY)
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
    clearWeatherForecastCache()
    return { ok: false, error: 'invalidJson' }
  }

  if (!isPersistedWeatherSnapshot(parsed)) {
    clearWeatherForecastCache()
    return { ok: false, error: 'invalidFormat' }
  }

  if (parsed.locationKey !== locationKey) {
    return { ok: true, data: null }
  }

  return { ok: true, data: parsed }
}

export function writeWeatherForecastCache(
  locationKey: string,
  forecast: WeatherSnapshot,
) {
  const storage = getStorage()
  if (!storage) return false

  const fetchedAt = Date.parse(forecast.fetchedAt)
  const normalizedFetchedAt = Number.isFinite(fetchedAt) ? fetchedAt : Date.now()
  const envelope: PersistedWeatherSnapshot = {
    version: WEATHER_FORECAST_CACHE_VERSION,
    locationKey,
    location: forecast.location,
    forecast,
    fetchedAt: normalizedFetchedAt,
    expiresAt: normalizedFetchedAt + WEATHER_FORECAST_FRESH_MS,
  }

  try {
    storage.setItem(WEATHER_FORECAST_CACHE_STORAGE_KEY, JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}

export function clearWeatherForecastCache() {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(WEATHER_FORECAST_CACHE_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
