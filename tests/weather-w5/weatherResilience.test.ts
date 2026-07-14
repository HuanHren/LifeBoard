import { describe, expect, it, vi } from 'vitest'
import { WeatherProviderRuntimeError } from '@/modules/weather/providers/weatherProviderRuntime'
import { adaptLegacyWeatherSnapshot } from '@/modules/weather/providers/weatherSnapshotAdapters'
import {
  createWeatherResilienceRuntime,
  WeatherResilienceError,
} from '@/modules/weather/services/weatherResilience'
import type { PersistedWeatherSnapshot, WeatherCacheIdentity } from '@/modules/weather/services/weatherForecastCache'
import { createLegacySnapshot, createXiaomiProviderSnapshot, weatherLocation, xiaomiWeatherLocation } from '../weather-w3/fixtures'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

function createHarness(options: {
  online?: boolean | (() => boolean)
  entries?: Map<string, PersistedWeatherSnapshot>
} = {}) {
  let now = 1_800_000_000_000
  const entries = options.entries ?? new Map<string, PersistedWeatherSnapshot>()
  const fetchSnapshot = vi.fn()
  const wait = vi.fn().mockResolvedValue(undefined)
  const runtime = createWeatherResilienceRuntime({
    fetchSnapshot,
    now: () => now,
    random: () => 0,
    wait,
    isOnline: () => typeof options.online === 'function' ? options.online() : options.online ?? true,
    readCache: (key, readAt = now) => {
      const entry = key ? entries.get(key) ?? null : null
      if (entry && entry.staleUntil < readAt) entries.delete(key!)
      return { ok: true, data: entry && entry.staleUntil >= readAt ? entry : null }
    },
    writeCache: (identity, snapshot, storedAt = now) => {
      if (!identity) return false
      const key = keyFor(identity)
      entries.set(key, {
        schemaVersion: 1, cacheKey: key, identity, snapshot, storedAt,
        providerUpdatedAt: snapshot.updatedAt,
        freshUntil: storedAt + 15 * 60_000,
        staleUntil: storedAt + 2 * 60 * 60_000,
      })
      return true
    },
  })
  function keyFor(identity: WeatherCacheIdentity) {
    return [`v${identity.schemaVersion}`, identity.provider, encodeURIComponent(identity.locationIdentity), identity.latitude, identity.longitude, identity.locale, String(identity.days), identity.units].join('|')
  }
  return { runtime, fetchSnapshot, wait, entries, setNow: (value: number) => { now = value }, getNow: () => now }
}

const openSnapshot = () => adaptLegacyWeatherSnapshot(createLegacySnapshot('openMeteo'))
const request = { provider: 'xiaomi' as const, location: xiaomiWeatherLocation, locale: 'zh-CN' as const }

function runtimeError(
  category: ConstructorParameters<typeof WeatherProviderRuntimeError>[2],
  code: string,
  status?: number,
  retryAfterMs?: number,
) {
  return new WeatherProviderRuntimeError('xiaomi', 'forecast', category, code, 'sanitized', undefined, { status, retryAfterMs })
}

describe('Weather W5 shared resilience runtime', () => {
  it('coalesces identical requests and removes the in-flight entry after settlement', async () => {
    const harness = createHarness()
    const pending = deferred<ReturnType<typeof createXiaomiProviderSnapshot>>()
    harness.fetchSnapshot.mockReturnValue(pending.promise)
    const first = harness.runtime.load(request)
    const second = harness.runtime.load(request)
    expect(first).toBe(second)
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(1)
    pending.resolve(createXiaomiProviderSnapshot())
    await first
    expect(harness.runtime.getInFlightCount()).toBe(0)
  })

  it('does not coalesce different providers or locations', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockImplementation(({ provider }) => Promise.resolve(
      provider === 'xiaomi' ? createXiaomiProviderSnapshot() : openSnapshot(),
    ))
    await Promise.all([
      harness.runtime.load(request),
      harness.runtime.load({ provider: 'openMeteo', location: weatherLocation, locale: 'en-US' }),
    ])
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(2)
  })

  it('does not coalesce different locations or locales within one provider', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockResolvedValue(openSnapshot())
    await Promise.all([
      harness.runtime.load({ provider: 'openMeteo', location: weatherLocation, locale: 'en-US' }),
      harness.runtime.load({ provider: 'openMeteo', location: { ...weatherLocation, latitude: 35 }, locale: 'en-US' }),
      harness.runtime.load({ provider: 'openMeteo', location: weatherLocation, locale: 'zh-CN' }),
    ])
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(3)
  })

  it('retries a recoverable network failure once with injected delay', async () => {
    const harness = createHarness()
    harness.fetchSnapshot
      .mockRejectedValueOnce(runtimeError('network', 'networkFailure'))
      .mockResolvedValueOnce(createXiaomiProviderSnapshot())
    const result = await harness.runtime.load(request)
    expect(result.dataFreshness).toBe('live')
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(2)
    expect(harness.wait).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['timeout', 'xiaomiTimeout'],
    ['http-recoverable', 'http408'],
    ['http-recoverable', 'http425'],
    ['http-recoverable', 'http500'],
  ] as const)('retries %s once', async (category, code) => {
    const harness = createHarness()
    harness.fetchSnapshot.mockRejectedValueOnce(runtimeError(category, code)).mockResolvedValueOnce(createXiaomiProviderSnapshot())
    await harness.runtime.load(request)
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['contract', 'xiaomiContractInvalid'],
    ['normalization', 'invalid-current'],
    ['secret-boundary', 'xiaomiResponseSecretLeak'],
    ['aborted', 'requestAborted'],
  ] as const)('does not retry or fallback on %s', async (category, code) => {
    const harness = createHarness()
    harness.fetchSnapshot.mockRejectedValue(runtimeError(category, code))
    await expect(harness.runtime.load(request)).rejects.toBeInstanceOf(WeatherResilienceError)
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(1)
    expect(harness.wait).not.toHaveBeenCalled()
  })

  it('enters cooldown on 429 and blocks a repeated provider call', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockRejectedValue(runtimeError('rate-limited', 'weatherRateLimited', 429))
    await expect(harness.runtime.load({ provider: 'openMeteo', location: weatherLocation, locale: 'en-US' })).rejects.toBeInstanceOf(WeatherResilienceError)
    await expect(harness.runtime.load({ provider: 'openMeteo', location: weatherLocation, locale: 'en-US' })).rejects.toMatchObject({ decision: { category: 'rate-limited' } })
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(1)
    expect(harness.runtime.getCooldownUntil('openMeteo')).toBeGreaterThan(harness.getNow())
  })

  it('honors bounded Retry-After metadata and allows a request after cooldown', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockRejectedValueOnce(runtimeError('rate-limited', 'weatherRateLimited', 429, 90_000))
      .mockResolvedValueOnce(openSnapshot())
    const openRequest = { provider: 'openMeteo' as const, location: weatherLocation, locale: 'en-US' as const }
    await expect(harness.runtime.load(openRequest)).rejects.toMatchObject({ decision: { category: 'rate-limited' } })
    expect(harness.runtime.getCooldownUntil('openMeteo')).toBe(harness.getNow() + 90_000)
    harness.setNow(harness.getNow() + 90_001)
    await expect(harness.runtime.load(openRequest)).resolves.toMatchObject({ servingProvider: 'openMeteo' })
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(2)
  })

  it('uses stale Xiaomi cache before attempting fallback', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockResolvedValueOnce(createXiaomiProviderSnapshot())
    await harness.runtime.load(request)
    harness.setNow(harness.getNow() + 16 * 60_000)
    harness.fetchSnapshot.mockReset()
    harness.fetchSnapshot.mockRejectedValue(runtimeError('network', 'networkFailure'))
    const result = await harness.runtime.load(request)
    expect(result.dataFreshness).toBe('stale-cache')
    expect(result.servingProvider).toBe('xiaomi')
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(2)
  })

  it('falls back from recoverable Xiaomi failure without rewriting provider identity', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockImplementation(({ provider }) => {
      if (provider === 'xiaomi') return Promise.reject(runtimeError('network', 'networkFailure'))
      return Promise.resolve(openSnapshot())
    })
    const result = await harness.runtime.load(request)
    expect(result.recoveryState).toBe('fallback')
    expect(result.servingProvider).toBe('openMeteo')
    expect(result.fallbackFromProvider).toBe('xiaomi')
    expect(result.primaryFailure?.provider).toBe('xiaomi')
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(3)
  })

  it.each([
    ['timeout', 'xiaomiTimeout', undefined],
    ['rate-limited', 'xiaomiRejected', 429],
    ['http-recoverable', 'xiaomiRejected', 500],
  ] as const)('falls back after recoverable %s exhaustion', async (category, code, status) => {
    const harness = createHarness()
    harness.fetchSnapshot.mockImplementation(({ provider }) => provider === 'xiaomi'
      ? Promise.reject(runtimeError(category, code, status))
      : Promise.resolve(openSnapshot()))
    const result = await harness.runtime.load(request)
    expect(result).toMatchObject({ recoveryState: 'fallback', servingProvider: 'openMeteo', fallbackFromProvider: 'xiaomi' })
  })

  it('does not fabricate a cache identity or fallback when Xiaomi identity is missing', async () => {
    const harness = createHarness()
    await expect(harness.runtime.load({ provider: 'xiaomi', location: weatherLocation, locale: 'zh-CN' }))
      .rejects.toMatchObject({ decision: { category: 'location-resolution' } })
    expect(harness.fetchSnapshot).not.toHaveBeenCalled()
  })

  it('uses fresh cache without a provider request', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockResolvedValue(createXiaomiProviderSnapshot())
    await harness.runtime.load(request)
    harness.fetchSnapshot.mockClear()
    const result = await harness.runtime.load(request)
    expect(result.dataFreshness).toBe('fresh-cache')
    expect(harness.fetchSnapshot).not.toHaveBeenCalled()
  })

  it('uses valid cache offline and rejects hard-expired cache', async () => {
    const online = createHarness()
    online.fetchSnapshot.mockResolvedValue(createXiaomiProviderSnapshot())
    await online.runtime.load(request)

    const offline = createHarness({ online: false, entries: online.entries })
    const cached = await offline.runtime.load(request)
    expect(cached).toMatchObject({ dataFreshness: 'fresh-cache', recoveryState: 'offline' })
    expect(offline.fetchSnapshot).not.toHaveBeenCalled()

    offline.setNow(offline.getNow() + 2 * 60 * 60_000 + 1)
    await expect(offline.runtime.load(request)).rejects.toMatchObject({ decision: { category: 'offline' } })
  })

  it('treats explicit abort as fatal without retry, cache substitution or fallback', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockRejectedValue(new DOMException('aborted', 'AbortError'))
    await expect(harness.runtime.load(request)).rejects.toMatchObject({ decision: { category: 'aborted' } })
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(1)
    expect(harness.wait).not.toHaveBeenCalled()
  })

  it('cleans a rejected coalesced request so a later request can run', async () => {
    const harness = createHarness()
    harness.fetchSnapshot.mockRejectedValueOnce(runtimeError('contract', 'bad')).mockResolvedValueOnce(createXiaomiProviderSnapshot())
    await expect(harness.runtime.load(request)).rejects.toBeInstanceOf(WeatherResilienceError)
    await expect(harness.runtime.load(request)).resolves.toMatchObject({ servingProvider: 'xiaomi' })
    expect(harness.fetchSnapshot).toHaveBeenCalledTimes(2)
  })
})
