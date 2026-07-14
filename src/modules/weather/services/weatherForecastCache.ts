import type { AppLocale } from '@/i18n/types'
import {
  WEATHER_FORECAST_CACHE_ENTRY_VERSION,
  WEATHER_FORECAST_CACHE_MAX_ENTRIES,
  WEATHER_FORECAST_CACHE_STORAGE_KEY,
  WEATHER_FORECAST_CACHE_VERSION,
  WEATHER_FORECAST_FRESH_MS,
  WEATHER_FORECAST_STALE_MS,
} from '@/modules/weather/constants/weather'
import type {
  ProviderWeatherSnapshot,
  WeatherCapabilityMap,
} from '@/modules/weather/providers/types'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'

export type WeatherCacheFreshness = 'fresh' | 'stale' | 'expired'
export type WeatherUnitContract = 'metric-v1'

export interface WeatherCacheIdentity {
  schemaVersion: typeof WEATHER_FORECAST_CACHE_ENTRY_VERSION
  provider: WeatherProviderId
  locationIdentity: string
  latitude: string
  longitude: string
  locale: AppLocale
  days: number
  units: WeatherUnitContract
}

export interface PersistedWeatherSnapshot {
  schemaVersion: typeof WEATHER_FORECAST_CACHE_ENTRY_VERSION
  cacheKey: string
  identity: WeatherCacheIdentity
  snapshot: ProviderWeatherSnapshot
  storedAt: number
  providerUpdatedAt?: string
  freshUntil: number
  staleUntil: number
}

interface WeatherForecastCacheEnvelope {
  version: typeof WEATHER_FORECAST_CACHE_VERSION
  entries: PersistedWeatherSnapshot[]
}

export type WeatherForecastCacheResult =
  | { ok: true; data: PersistedWeatherSnapshot | null }
  | { ok: false; error: 'storageUnavailable' | 'invalidJson' | 'invalidFormat' }

const capabilityStates = new Set(['missing', 'null', 'empty-array', 'empty-object', 'available'])
const providers = new Set<WeatherProviderId>(['openMeteo', 'caiyun', 'xiaomi'])
const forbiddenCacheKeys = new Set([
  'appkey',
  'sign',
  'oaid',
  'device',
  'appversion',
  'romversion',
  'clientinfo',
  'authorization',
  '_vercel_jwt',
  'x-vercel-protection-bypass',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStorage() {
  if (typeof window === 'undefined') return null
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

function providerLocationIdentity(provider: WeatherProviderId, location: WeatherLocation) {
  if (provider === 'xiaomi') {
    const locationId = location.providerLocationIds?.xiaomi?.trim()
    return locationId ? `xiaomi:${locationId}` : null
  }

  if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return null
  return `coordinates:${stableCoordinate(location.latitude)},${stableCoordinate(location.longitude)}`
}

export function createWeatherCacheIdentity(
  provider: WeatherProviderId,
  location: WeatherLocation,
  locale: AppLocale,
  days = 15,
  units: WeatherUnitContract = 'metric-v1',
): WeatherCacheIdentity | null {
  if (!providers.has(provider)) return null
  if (!Number.isFinite(location.latitude) || location.latitude < -90 || location.latitude > 90) return null
  if (!Number.isFinite(location.longitude) || location.longitude < -180 || location.longitude > 180) return null
  if (locale !== 'zh-CN' && locale !== 'en-US') return null
  if (!Number.isInteger(days) || days <= 0) return null

  const locationIdentity = providerLocationIdentity(provider, location)
  if (!locationIdentity) return null

  return {
    schemaVersion: WEATHER_FORECAST_CACHE_ENTRY_VERSION,
    provider,
    locationIdentity,
    latitude: stableCoordinate(location.latitude),
    longitude: stableCoordinate(location.longitude),
    locale,
    days,
    units,
  }
}

export function createWeatherForecastCacheKey(
  provider: WeatherProviderId,
  location: WeatherLocation,
  locale: AppLocale = 'en-US',
  days = 15,
  units: WeatherUnitContract = 'metric-v1',
) {
  const identity = createWeatherCacheIdentity(provider, location, locale, days, units)
  if (!identity) return null
  return [
    `v${identity.schemaVersion}`,
    identity.provider,
    encodeURIComponent(identity.locationIdentity),
    identity.latitude,
    identity.longitude,
    identity.locale,
    String(identity.days),
    identity.units,
  ].join('|')
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isSafeJsonValue(value: unknown, depth = 0): boolean {
  if (depth > 24) return false
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every((entry) => isSafeJsonValue(entry, depth + 1))
  if (!isRecord(value)) return false
  return Object.entries(value).every(([key, nested]) => (
    !forbiddenCacheKeys.has(key.toLowerCase()) && isSafeJsonValue(nested, depth + 1)
  ))
}

function isCapabilityMap(value: unknown): value is WeatherCapabilityMap {
  if (!isRecord(value)) return false
  const names = [
    'current', 'hourly', 'daily', 'aqi', 'minutely', 'alerts', 'indices',
    'typhoon', 'yesterday', 'preHour', 'sourceMaps', 'brandInfo', 'updateTime',
  ]
  return names.every((name) => capabilityStates.has(value[name] as string))
}

function isProviderSnapshot(value: unknown): value is ProviderWeatherSnapshot {
  if (!isRecord(value) || !providers.has(value.provider as WeatherProviderId)) return false
  if (!isRecord(value.location) || value.location.provider !== value.provider) return false
  if (typeof value.location.providerLocationId !== 'string' || value.location.providerLocationId.trim() === '') return false
  if (!isFiniteNumber(value.location.latitude) || value.location.latitude < -90 || value.location.latitude > 90) return false
  if (!isFiniteNumber(value.location.longitude) || value.location.longitude < -180 || value.location.longitude > 180) return false
  if (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) return false
  if (!isRecord(value.current) || typeof value.current.observedAt !== 'string') return false
  if (!isFiniteNumber(value.current.temperatureC) || !isRecord(value.current.condition)) return false
  if (typeof value.current.condition.id !== 'string' || typeof value.current.condition.providerCode !== 'string') return false
  if (!Array.isArray(value.hourly) || !Array.isArray(value.daily)) return false
  if (!isCapabilityMap(value.capabilities) || !isRecord(value.units)) return false
  if (value.units.temperature !== 'celsius' || value.units.windSpeed !== 'kilometres-per-hour') return false
  if (!Array.isArray(value.diagnostics)) return false
  return isSafeJsonValue(value)
}

function sanitizeSnapshotForCache(snapshot: ProviderWeatherSnapshot): ProviderWeatherSnapshot | null {
  let cloned: unknown
  try {
    cloned = JSON.parse(JSON.stringify(snapshot))
  } catch {
    return null
  }
  if (isRecord(cloned) && cloned.provider === 'xiaomi' && isRecord(cloned.extensions)) {
    const sourceMaps = cloned.extensions.sourceMaps
    if (isRecord(sourceMaps) && Object.prototype.hasOwnProperty.call(sourceMaps, 'clientInfo')) {
      delete sourceMaps.clientInfo
    }
  }
  return isProviderSnapshot(cloned) ? cloned : null
}

function isCacheIdentity(value: unknown): value is WeatherCacheIdentity {
  return isRecord(value) &&
    value.schemaVersion === WEATHER_FORECAST_CACHE_ENTRY_VERSION &&
    providers.has(value.provider as WeatherProviderId) &&
    typeof value.locationIdentity === 'string' && value.locationIdentity.length > 0 &&
    typeof value.latitude === 'string' && typeof value.longitude === 'string' &&
    (value.locale === 'zh-CN' || value.locale === 'en-US') &&
    Number.isInteger(value.days) && (value.days as number) > 0 &&
    value.units === 'metric-v1'
}

function isPersistedWeatherSnapshot(value: unknown): value is PersistedWeatherSnapshot {
  if (!isRecord(value) || !isCacheIdentity(value.identity) || !isProviderSnapshot(value.snapshot)) return false
  return value.schemaVersion === WEATHER_FORECAST_CACHE_ENTRY_VERSION &&
    typeof value.cacheKey === 'string' && value.cacheKey.length > 0 &&
    value.snapshot.provider === value.identity.provider &&
    isFiniteTimestamp(value.storedAt) &&
    isFiniteTimestamp(value.freshUntil) &&
    isFiniteTimestamp(value.staleUntil) &&
    value.freshUntil >= value.storedAt &&
    value.staleUntil >= value.freshUntil &&
    (value.providerUpdatedAt === undefined || (
      typeof value.providerUpdatedAt === 'string' && Number.isFinite(Date.parse(value.providerUpdatedAt))
    ))
}

function isCacheEnvelope(value: unknown): value is WeatherForecastCacheEnvelope {
  return isRecord(value) &&
    value.version === WEATHER_FORECAST_CACHE_VERSION &&
    Array.isArray(value.entries) &&
    value.entries.length <= WEATHER_FORECAST_CACHE_MAX_ENTRIES &&
    value.entries.every(isPersistedWeatherSnapshot)
}

function readEnvelope(storage: Storage): WeatherForecastCacheResult | WeatherForecastCacheEnvelope {
  let stored: string | null
  try {
    stored = storage.getItem(WEATHER_FORECAST_CACHE_STORAGE_KEY)
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
  if (stored === null) return { version: WEATHER_FORECAST_CACHE_VERSION, entries: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(stored)
  } catch {
    clearWeatherForecastCache()
    return { ok: false, error: 'invalidJson' }
  }
  if (!isCacheEnvelope(parsed)) {
    clearWeatherForecastCache()
    return { ok: false, error: 'invalidFormat' }
  }
  return parsed
}

function writeEnvelope(storage: Storage, envelope: WeatherForecastCacheEnvelope) {
  try {
    storage.setItem(WEATHER_FORECAST_CACHE_STORAGE_KEY, JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}

export function classifyWeatherCacheFreshness(
  cached: PersistedWeatherSnapshot,
  now = Date.now(),
): WeatherCacheFreshness {
  if (now <= cached.freshUntil) return 'fresh'
  if (now <= cached.staleUntil) return 'stale'
  return 'expired'
}

export function readWeatherForecastCache(
  cacheKey: string | null,
  now = Date.now(),
): WeatherForecastCacheResult {
  if (!cacheKey) return { ok: true, data: null }
  const storage = getStorage()
  if (!storage) return { ok: false, error: 'storageUnavailable' }
  const envelope = readEnvelope(storage)
  if ('ok' in envelope) return envelope

  const retained = envelope.entries.filter((entry) => entry.staleUntil >= now)
  if (retained.length !== envelope.entries.length) {
    writeEnvelope(storage, { version: WEATHER_FORECAST_CACHE_VERSION, entries: retained })
  }
  return { ok: true, data: retained.find((entry) => entry.cacheKey === cacheKey) ?? null }
}

export function writeWeatherForecastCache(
  identity: WeatherCacheIdentity | null,
  snapshot: ProviderWeatherSnapshot,
  now = Date.now(),
) {
  const sanitizedSnapshot = sanitizeSnapshotForCache(snapshot)
  if (!identity || !sanitizedSnapshot || sanitizedSnapshot.provider !== identity.provider) return false
  const cacheKey = createWeatherForecastCacheKey(
    identity.provider,
    {
      id: identity.locationIdentity,
      name: sanitizedSnapshot.location.name,
      kind: sanitizedSnapshot.location.kind ?? 'Location',
      admin1: sanitizedSnapshot.location.administrativeArea ?? null,
      country: sanitizedSnapshot.location.country ?? '',
      countryCode: sanitizedSnapshot.location.countryCode ?? '',
      latitude: sanitizedSnapshot.location.latitude,
      longitude: sanitizedSnapshot.location.longitude,
      elevation: sanitizedSnapshot.location.elevation ?? null,
      timezone: sanitizedSnapshot.location.timezone ?? 'auto',
      ...(identity.provider === 'xiaomi'
        ? { providerLocationIds: { xiaomi: sanitizedSnapshot.location.providerLocationId } }
        : {}),
    },
    identity.locale,
    identity.days,
    identity.units,
  )
  if (!cacheKey) return false

  const storage = getStorage()
  if (!storage) return false
  const current = readEnvelope(storage)
  const entries = 'ok' in current ? [] : current.entries.filter((entry) => (
    entry.cacheKey !== cacheKey && entry.staleUntil >= now
  ))
  const nextEntry: PersistedWeatherSnapshot = {
    schemaVersion: WEATHER_FORECAST_CACHE_ENTRY_VERSION,
    cacheKey,
    identity,
    snapshot: sanitizedSnapshot,
    storedAt: now,
    providerUpdatedAt: sanitizedSnapshot.updatedAt,
    freshUntil: now + WEATHER_FORECAST_FRESH_MS,
    staleUntil: now + WEATHER_FORECAST_STALE_MS,
  }
  const nextEntries = [nextEntry, ...entries]
    .sort((left, right) => right.storedAt - left.storedAt)
    .slice(0, WEATHER_FORECAST_CACHE_MAX_ENTRIES)
  return writeEnvelope(storage, { version: WEATHER_FORECAST_CACHE_VERSION, entries: nextEntries })
}

export function getWeatherForecastCacheStats() {
  const storage = getStorage()
  if (!storage) return { entries: 0, bytes: 0 }
  try {
    const value = storage.getItem(WEATHER_FORECAST_CACHE_STORAGE_KEY)
    if (!value) return { entries: 0, bytes: 0 }
    const parsed: unknown = JSON.parse(value)
    return {
      entries: isCacheEnvelope(parsed) ? parsed.entries.length : 0,
      bytes: new TextEncoder().encode(value).byteLength,
    }
  } catch {
    return { entries: 0, bytes: 0 }
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

export const weatherForecastCacheTestInternals = {
  isProviderSnapshot,
  isCacheEnvelope,
  isSafeJsonValue,
  sanitizeSnapshotForCache,
}
