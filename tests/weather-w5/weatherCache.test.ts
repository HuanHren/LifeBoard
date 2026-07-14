import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adaptLegacyWeatherSnapshot } from '@/modules/weather/providers/weatherSnapshotAdapters'
import {
  classifyWeatherCacheFreshness,
  createWeatherCacheIdentity,
  createWeatherForecastCacheKey,
  getWeatherForecastCacheStats,
  readWeatherForecastCache,
  weatherForecastCacheTestInternals,
  writeWeatherForecastCache,
} from '@/modules/weather/services/weatherForecastCache'
import { createLegacySnapshot, createXiaomiProviderSnapshot, weatherLocation, xiaomiWeatherLocation } from '../weather-w3/fixtures'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

describe('Weather W5 provider-aware cache', () => {
  beforeEach(() => vi.stubGlobal('window', { localStorage: new MemoryStorage() }))
  afterEach(() => vi.unstubAllGlobals())

  it('separates providers, locales, days, units, locations and opaque Xiaomi identity', () => {
    const xiaomi = createWeatherForecastCacheKey('xiaomi', xiaomiWeatherLocation, 'zh-CN')
    expect(xiaomi).toContain(encodeURIComponent(`xiaomi:${xiaomiWeatherLocation.providerLocationIds?.xiaomi}`))
    expect(new Set([
      xiaomi,
      createWeatherForecastCacheKey('openMeteo', xiaomiWeatherLocation, 'zh-CN'),
      createWeatherForecastCacheKey('xiaomi', { ...xiaomiWeatherLocation, providerLocationIds: { xiaomi: 'other' } }, 'zh-CN'),
      createWeatherForecastCacheKey('xiaomi', xiaomiWeatherLocation, 'en-US'),
      createWeatherForecastCacheKey('xiaomi', xiaomiWeatherLocation, 'zh-CN', 7),
      createWeatherForecastCacheKey('xiaomi', xiaomiWeatherLocation, 'zh-CN', 15, 'metric-v1'),
    ]).size).toBe(5)
  })

  it('rejects invalid identities without reading or writing cache', () => {
    expect(createWeatherCacheIdentity('xiaomi', weatherLocation, 'zh-CN')).toBeNull()
    expect(createWeatherForecastCacheKey('openMeteo', { ...weatherLocation, latitude: Number.NaN }, 'en-US')).toBeNull()
    expect(readWeatherForecastCache(null)).toEqual({ ok: true, data: null })
  })

  it('writes validated provider snapshots and classifies fresh, stale and expired windows', () => {
    const now = 1_800_000_000_000
    const identity = createWeatherCacheIdentity('openMeteo', weatherLocation, 'en-US')
    const snapshot = adaptLegacyWeatherSnapshot(createLegacySnapshot('openMeteo'))
    expect(writeWeatherForecastCache(identity, snapshot, now)).toBe(true)
    const key = createWeatherForecastCacheKey('openMeteo', weatherLocation, 'en-US')
    const entry = readWeatherForecastCache(key, now).data
    expect(entry).not.toBeNull()
    expect(classifyWeatherCacheFreshness(entry!, now)).toBe('fresh')
    expect(classifyWeatherCacheFreshness(entry!, now + 16 * 60_000)).toBe('stale')
    expect(classifyWeatherCacheFreshness(entry!, now + 2 * 60 * 60_000 + 1)).toBe('expired')
  })

  it('prunes hard-expired entries instead of displaying them', () => {
    const now = 1_800_000_000_000
    const identity = createWeatherCacheIdentity('openMeteo', weatherLocation, 'en-US')
    expect(writeWeatherForecastCache(identity, adaptLegacyWeatherSnapshot(createLegacySnapshot('openMeteo')), now)).toBe(true)
    const key = createWeatherForecastCacheKey('openMeteo', weatherLocation, 'en-US')
    expect(readWeatherForecastCache(key, now + 2 * 60 * 60_000 + 1)).toEqual({ ok: true, data: null })
  })

  it('discards malformed and legacy single-entry cache payloads safely', () => {
    window.localStorage.setItem('lifeboard.weather.forecastCache.v1', '{')
    expect(readWeatherForecastCache('key')).toEqual({ ok: false, error: 'invalidJson' })
    window.localStorage.setItem('lifeboard.weather.forecastCache.v1', JSON.stringify({ version: 1, forecast: {} }))
    expect(readWeatherForecastCache('key')).toEqual({ ok: false, error: 'invalidFormat' })
  })

  it('rejects a wrong envelope version or mismatched identity', () => {
    window.localStorage.setItem('lifeboard.weather.forecastCache.v1', JSON.stringify({ version: 999, entries: [] }))
    expect(readWeatherForecastCache('key')).toEqual({ ok: false, error: 'invalidFormat' })

    const now = 1_800_000_000_000
    const identity = createWeatherCacheIdentity('openMeteo', weatherLocation, 'en-US')
    expect(writeWeatherForecastCache(identity, adaptLegacyWeatherSnapshot(createLegacySnapshot('openMeteo')), now)).toBe(true)
    expect(readWeatherForecastCache('a-different-key', now)).toEqual({ ok: true, data: null })
  })

  it('bounds retained entries to four', () => {
    const snapshot = adaptLegacyWeatherSnapshot(createLegacySnapshot('openMeteo'))
    for (let index = 0; index < 6; index += 1) {
      const location = { ...weatherLocation, latitude: index, longitude: index }
      expect(writeWeatherForecastCache(createWeatherCacheIdentity('openMeteo', location, 'en-US'), {
        ...snapshot,
        location: { ...snapshot.location, latitude: index, longitude: index },
      }, 1_800_000_000_000 + index)).toBe(true)
    }
    expect(getWeatherForecastCacheStats().entries).toBe(4)
  })

  it('removes clientInfo before caching Xiaomi extensions', () => {
    const snapshot = createXiaomiProviderSnapshot()
    snapshot.extensions = {
      ...snapshot.extensions,
      sourceMaps: { safeSource: true, clientInfo: { harmless: 'still-internal' } },
    }
    const sanitized = weatherForecastCacheTestInternals.sanitizeSnapshotForCache(snapshot)
    expect(sanitized).not.toBeNull()
    expect(JSON.stringify(sanitized)).not.toContain('clientInfo')
  })

  it('rejects secret-shaped cache fields and non-finite numeric values', () => {
    const snapshot = createXiaomiProviderSnapshot()
    expect(weatherForecastCacheTestInternals.isSafeJsonValue({ appKey: 'placeholder' })).toBe(false)
    expect(weatherForecastCacheTestInternals.isSafeJsonValue({ value: Number.NaN })).toBe(false)
    expect(weatherForecastCacheTestInternals.isProviderSnapshot({ ...snapshot, extensions: { sign: 'placeholder' } })).toBe(false)
  })

  it('does not mutate the source snapshot while sanitizing or writing', () => {
    const snapshot = createXiaomiProviderSnapshot()
    snapshot.extensions = { ...snapshot.extensions, sourceMaps: { clientInfo: { value: 'internal' } } }
    const before = structuredClone(snapshot)
    writeWeatherForecastCache(createWeatherCacheIdentity('xiaomi', xiaomiWeatherLocation, 'zh-CN'), snapshot, 1_800_000_000_000)
    expect(snapshot).toEqual(before)
  })
})
