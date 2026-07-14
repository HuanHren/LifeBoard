import type { AppLocale } from '@/i18n/types'
import { weatherProviderRuntime } from '@/modules/weather/providers/weatherProviderRuntime'
import type { ProviderWeatherSnapshot } from '@/modules/weather/providers/types'
import {
  classifyWeatherCacheFreshness,
  createWeatherCacheIdentity,
  createWeatherForecastCacheKey,
  readWeatherForecastCache,
  writeWeatherForecastCache,
  type PersistedWeatherSnapshot,
  type WeatherCacheFreshness,
  type WeatherCacheIdentity,
} from '@/modules/weather/services/weatherForecastCache'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'
import { WeatherProviderRuntimeError } from '@/modules/weather/providers/weatherProviderRuntime'

export type WeatherDataFreshness = 'live' | 'fresh-cache' | 'stale-cache'
export type WeatherRecoveryState =
  | 'idle'
  | 'retrying'
  | 'fallback'
  | 'offline'
  | 'rate-limited'
  | 'failed'

export type WeatherFailureCategory =
  | 'eligibility'
  | 'location-resolution'
  | 'offline'
  | 'network'
  | 'timeout'
  | 'http-recoverable'
  | 'rate-limited'
  | 'proxy'
  | 'contract'
  | 'normalization'
  | 'secret-boundary'
  | 'aborted'
  | 'unknown'

export interface WeatherFailureDecision {
  category: WeatherFailureCategory
  code: string
  provider: WeatherProviderId
  status?: number
  retryable: boolean
  staleCacheEligible: boolean
  fallbackEligible: boolean
  retryAfterMs?: number
}

export class WeatherResilienceError extends Error {
  readonly decision: WeatherFailureDecision
  override readonly cause?: unknown

  constructor(decision: WeatherFailureDecision, cause?: unknown) {
    super(`Weather recovery stopped (${decision.code}).`)
    this.name = 'WeatherResilienceError'
    this.decision = decision
    this.cause = cause
  }
}

export interface WeatherResilienceRequest {
  provider: WeatherProviderId
  location: WeatherLocation
  locale: AppLocale
  signal?: AbortSignal
  forceRefresh?: boolean
  onRetrying?: (decision: WeatherFailureDecision) => void
}

export interface WeatherCacheInspection {
  identity: WeatherCacheIdentity | null
  cacheKey: string | null
  entry: PersistedWeatherSnapshot | null
  freshness: WeatherCacheFreshness | null
}

export interface WeatherResilienceResult {
  snapshot: ProviderWeatherSnapshot
  dataFreshness: WeatherDataFreshness
  recoveryState: WeatherRecoveryState
  servingProvider: WeatherProviderId
  fallbackFromProvider: WeatherProviderId | null
  storedAt: number
  retryAvailableAt: number | null
  primaryFailure?: WeatherFailureDecision
}

interface WeatherResilienceDependencies {
  fetchSnapshot: typeof weatherProviderRuntime.fetchSnapshot
  now: () => number
  random: () => number
  wait: (milliseconds: number, signal?: AbortSignal) => Promise<void>
  isOnline: () => boolean
  readCache: typeof readWeatherForecastCache
  writeCache: typeof writeWeatherForecastCache
}

const CLIENT_FORECAST_TIMEOUT_MS = 13_000
const RETRY_BASE_DELAY_MS = 250
const RETRY_JITTER_MS = 250
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60_000
const MAX_RATE_LIMIT_COOLDOWN_MS = 15 * 60_000

function abortError() {
  return new DOMException('The request was aborted.', 'AbortError')
}

function defaultWait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const onAbort = () => {
      globalThis.clearTimeout(timeout)
      reject(abortError())
    }
    const timeout = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, milliseconds)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

const defaultDependencies: WeatherResilienceDependencies = {
  fetchSnapshot: (request) => weatherProviderRuntime.fetchSnapshot(request),
  now: () => Date.now(),
  random: () => Math.random(),
  wait: defaultWait,
  isOnline: () => typeof navigator === 'undefined' || navigator.onLine !== false,
  readCache: readWeatherForecastCache,
  writeCache: writeWeatherForecastCache,
}

function runtimeCategory(error: WeatherProviderRuntimeError): WeatherFailureCategory {
  if (error.code === 'xiaomiTimeout') return 'timeout'
  if (error.code === 'xiaomiUnavailable') return 'http-recoverable'
  if (error.code === 'xiaomiRejected' && error.status === 429) return 'rate-limited'
  if (
    error.code === 'xiaomiRejected' && error.status !== undefined &&
    (error.status === 408 || error.status === 425 || error.status >= 500)
  ) return 'http-recoverable'
  if (error.category === 'location-resolution') return 'location-resolution'
  if (error.category === 'network') return 'network'
  if (error.category === 'timeout') return 'timeout'
  if (error.category === 'http-recoverable') return 'http-recoverable'
  if (error.category === 'rate-limited') return 'rate-limited'
  if (error.category === 'proxy') return 'proxy'
  if (error.category === 'contract') return 'contract'
  if (error.category === 'normalization') return 'normalization'
  if (error.category === 'secret-boundary') return 'secret-boundary'
  if (error.category === 'aborted') return 'aborted'
  if (error.category === 'eligibility' || error.category === 'configuration' || error.category === 'input') return 'eligibility'
  return 'unknown'
}

export function classifyWeatherFailure(
  error: unknown,
  provider: WeatherProviderId,
): WeatherFailureDecision {
  if (error instanceof WeatherResilienceError) return error.decision
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      category: 'aborted', code: 'requestAborted', provider,
      retryable: false, staleCacheEligible: false, fallbackEligible: false,
    }
  }

  const category = error instanceof WeatherProviderRuntimeError
    ? runtimeCategory(error)
    : 'unknown'
  const retryable = category === 'network' || category === 'timeout' || category === 'http-recoverable'
  const staleCacheEligible = retryable || category === 'rate-limited' || category === 'offline'
  const fallbackEligible = staleCacheEligible
  return {
    category,
    code: error instanceof WeatherProviderRuntimeError ? error.code : 'weatherUnknownFailure',
    provider,
    ...(error instanceof WeatherProviderRuntimeError && error.status !== undefined
      ? { status: error.status }
      : {}),
    retryable,
    staleCacheEligible,
    fallbackEligible,
    ...(error instanceof WeatherProviderRuntimeError && error.retryAfterMs !== undefined
      ? { retryAfterMs: error.retryAfterMs }
      : {}),
  }
}

function cachedResult(
  entry: PersistedWeatherSnapshot,
  freshness: WeatherCacheFreshness,
  recoveryState: WeatherRecoveryState,
  retryAvailableAt: number | null,
  primaryFailure?: WeatherFailureDecision,
): WeatherResilienceResult {
  return {
    snapshot: entry.snapshot,
    dataFreshness: freshness === 'fresh' ? 'fresh-cache' : 'stale-cache',
    recoveryState,
    servingProvider: entry.snapshot.provider,
    fallbackFromProvider: null,
    storedAt: entry.storedAt,
    retryAvailableAt,
    ...(primaryFailure ? { primaryFailure } : {}),
  }
}

export function createWeatherResilienceRuntime(
  dependencies: Partial<WeatherResilienceDependencies> = {},
) {
  const deps = { ...defaultDependencies, ...dependencies }
  const inFlight = new Map<string, Promise<WeatherResilienceResult>>()
  const cooldowns = new Map<string, number>()

  function inspectCache(request: Pick<WeatherResilienceRequest, 'provider' | 'location' | 'locale'>): WeatherCacheInspection {
    const identity = createWeatherCacheIdentity(request.provider, request.location, request.locale)
    const cacheKey = createWeatherForecastCacheKey(request.provider, request.location, request.locale)
    const result = deps.readCache(cacheKey, deps.now())
    const entry = result.ok ? result.data : null
    return {
      identity,
      cacheKey,
      entry,
      freshness: entry ? classifyWeatherCacheFreshness(entry, deps.now()) : null,
    }
  }

  function cooldownKey(provider: WeatherProviderId) {
    return `${provider}|forecast`
  }

  function currentCooldown(provider: WeatherProviderId) {
    const key = cooldownKey(provider)
    const until = cooldowns.get(key)
    if (!until) return null
    if (until <= deps.now()) {
      cooldowns.delete(key)
      return null
    }
    return until
  }

  function enterCooldown(provider: WeatherProviderId, retryAfterMs?: number) {
    const duration = Math.min(
      MAX_RATE_LIMIT_COOLDOWN_MS,
      Math.max(1_000, retryAfterMs ?? DEFAULT_RATE_LIMIT_COOLDOWN_MS),
    )
    const until = deps.now() + duration
    cooldowns.set(cooldownKey(provider), until)
    return until
  }

  async function withTimeout(
    request: WeatherResilienceRequest,
    provider: WeatherProviderId,
  ) {
    const controller = new AbortController()
    let timedOut = false
    const timeout = globalThis.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, CLIENT_FORECAST_TIMEOUT_MS)
    const abort = () => controller.abort()
    request.signal?.addEventListener('abort', abort, { once: true })
    try {
      return await deps.fetchSnapshot({
        provider,
        location: request.location,
        locale: request.locale,
        signal: controller.signal,
      })
    } catch (error) {
      if (request.signal?.aborted) throw abortError()
      if (timedOut) {
        throw new WeatherProviderRuntimeError(
          provider, 'forecast', 'timeout', 'weatherClientTimeout',
          'The weather request exceeded the client timeout.', error,
        )
      }
      throw error
    } finally {
      globalThis.clearTimeout(timeout)
      request.signal?.removeEventListener('abort', abort)
    }
  }

  async function fetchProvider(
    request: WeatherResilienceRequest,
    provider: WeatherProviderId,
    inspection: WeatherCacheInspection,
  ): Promise<WeatherResilienceResult> {
    const cooldownUntil = currentCooldown(provider)
    if (cooldownUntil) {
      const decision: WeatherFailureDecision = {
        category: 'rate-limited', code: 'weatherRateLimited', provider,
        retryable: false, staleCacheEligible: true, fallbackEligible: true,
        retryAfterMs: cooldownUntil - deps.now(),
      }
      throw new WeatherResilienceError(decision)
    }

    let lastDecision: WeatherFailureDecision | null = null
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const snapshot = await withTimeout(request, provider)
        if (inspection.identity) deps.writeCache(inspection.identity, snapshot, deps.now())
        return {
          snapshot,
          dataFreshness: 'live',
          recoveryState: 'idle',
          servingProvider: provider,
          fallbackFromProvider: null,
          storedAt: deps.now(),
          retryAvailableAt: null,
        }
      } catch (error) {
        const decision = classifyWeatherFailure(error, provider)
        lastDecision = decision
        if (decision.category === 'rate-limited') {
          const until = enterCooldown(provider, decision.retryAfterMs)
          throw new WeatherResilienceError({
            ...decision,
            retryAfterMs: until - deps.now(),
          }, error)
        }
        if (!decision.retryable || attempt === 1) {
          throw new WeatherResilienceError(decision, error)
        }
        request.onRetrying?.(decision)
        const delay = RETRY_BASE_DELAY_MS + Math.round(deps.random() * RETRY_JITTER_MS)
        await deps.wait(delay, request.signal)
      }
    }
    throw new WeatherResilienceError(lastDecision ?? classifyWeatherFailure(null, provider))
  }

  async function loadProvider(
    request: WeatherResilienceRequest,
    provider: WeatherProviderId,
  ): Promise<WeatherResilienceResult> {
    const providerRequest = { ...request, provider }
    const inspection = inspectCache(providerRequest)
    if (!deps.isOnline()) {
      if (inspection.entry && inspection.freshness !== 'expired') {
        return cachedResult(inspection.entry, inspection.freshness ?? 'stale', 'offline', null, {
          category: 'offline', code: 'weatherOffline', provider,
          retryable: false, staleCacheEligible: true, fallbackEligible: false,
        })
      }
      throw new WeatherResilienceError({
        category: 'offline', code: 'weatherOffline', provider,
        retryable: false, staleCacheEligible: false, fallbackEligible: false,
      })
    }
    if (!request.forceRefresh && inspection.entry && inspection.freshness === 'fresh') {
      return cachedResult(inspection.entry, 'fresh', 'idle', null)
    }
    return fetchProvider(providerRequest, provider, inspection)
  }

  function load(request: WeatherResilienceRequest): Promise<WeatherResilienceResult> {
    const inspection = inspectCache(request)
    if (!inspection.cacheKey) {
      return Promise.reject(new WeatherResilienceError({
        category: 'location-resolution', code: 'invalidCacheIdentity', provider: request.provider,
        retryable: false, staleCacheEligible: false, fallbackEligible: false,
      }))
    }
    const existing = inFlight.get(inspection.cacheKey)
    if (existing) return existing

    let promise: Promise<WeatherResilienceResult>
    promise = (async (): Promise<WeatherResilienceResult> => {
      try {
        return await loadProvider(request, request.provider)
      } catch (error) {
        const failure = error instanceof WeatherResilienceError
          ? error.decision
          : classifyWeatherFailure(error, request.provider)
        const retryAvailableAt = failure.category === 'rate-limited'
          ? currentCooldown(request.provider)
          : null

        if (
          inspection.entry &&
          inspection.freshness !== 'expired' &&
          failure.staleCacheEligible
        ) {
          return cachedResult(
            inspection.entry,
            inspection.freshness ?? 'stale',
            failure.category === 'rate-limited' ? 'rate-limited' : 'failed',
            retryAvailableAt,
            failure,
          )
        }

        if (request.provider === 'xiaomi' && failure.fallbackEligible) {
          try {
            const fallback = await loadProvider({ ...request, forceRefresh: false }, 'openMeteo')
            return {
              ...fallback,
              recoveryState: 'fallback',
              fallbackFromProvider: 'xiaomi',
              primaryFailure: failure,
              retryAvailableAt,
            }
          } catch {
            // The original Xiaomi failure remains the user-facing diagnostic.
          }
        }
        throw error
      }
    })().finally(() => {
      if (inFlight.get(inspection.cacheKey!) === promise) inFlight.delete(inspection.cacheKey!)
    })
    inFlight.set(inspection.cacheKey, promise)
    return promise
  }

  return {
    inspectCache,
    load,
    getInFlightCount: () => inFlight.size,
    getCooldownUntil: (provider: WeatherProviderId) => currentCooldown(provider),
    clearRuntimeState() {
      inFlight.clear()
      cooldowns.clear()
    },
  }
}

export const weatherResilienceRuntime = createWeatherResilienceRuntime()

export const weatherResiliencePolicy = {
  clientTimeoutMs: CLIENT_FORECAST_TIMEOUT_MS,
  maximumAutomaticRetries: 1,
  retryBaseDelayMs: RETRY_BASE_DELAY_MS,
  retryJitterMs: RETRY_JITTER_MS,
  defaultRateLimitCooldownMs: DEFAULT_RATE_LIMIT_COOLDOWN_MS,
  maximumRateLimitCooldownMs: MAX_RATE_LIMIT_COOLDOWN_MS,
}
