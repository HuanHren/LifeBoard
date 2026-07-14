import type { ProviderWeatherLocation, ProviderWeatherSnapshot } from '@/modules/weather/providers/types'
import {
  parseXiaomiAllSuccess,
  parseXiaomiProxyFailure,
  parseXiaomiSearchSuccess,
} from '@/modules/weather/providers/xiaomi/xiaomiGuards'
import {
  normalizeXiaomiLocations,
  normalizeXiaomiWeather,
} from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import type {
  XiaomiAllProxySuccess,
  XiaomiWeatherExtensions,
} from '@/modules/weather/providers/xiaomi/xiaomiRawTypes'

export const XIAOMI_PROXY_PATHS = {
  search: '/api/weather/xiaomi/search',
  all: '/api/weather/xiaomi/all',
} as const

export type XiaomiProxyErrorCode =
  | 'unsupportedLocale'
  | 'unsupportedDays'
  | 'xiaomiProxyMisconfigured'
  | 'xiaomiTimeout'
  | 'xiaomiUnavailable'
  | 'xiaomiRejected'
  | 'xiaomiUnreadable'
  | 'xiaomiContractInvalid'
  | 'xiaomiResponseSecretLeak'
  | string

export class XiaomiProviderError extends Error {
  readonly kind: 'input' | 'network' | 'http' | 'proxy' | 'contract' | 'unreadable' | 'aborted'
  readonly code: XiaomiProxyErrorCode
  readonly status?: number
  readonly upstreamStatus?: number
  readonly retryAfterMs?: number

  constructor(
    kind: 'input' | 'network' | 'http' | 'proxy' | 'contract' | 'unreadable' | 'aborted',
    code: XiaomiProxyErrorCode,
    status?: number,
    details: { upstreamStatus?: number; retryAfterMs?: number } = {},
  ) {
    super(`Xiaomi provider request failed (${code}).`)
    this.name = 'XiaomiProviderError'
    this.kind = kind
    this.code = code
    this.status = status
    this.upstreamStatus = details.upstreamStatus
    this.retryAfterMs = details.retryAfterMs
  }
}

export interface XiaomiProviderOptions {
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

export interface XiaomiWeatherRequest {
  location: ProviderWeatherLocation
  locale?: string
  days?: number
}

function requestFetch(options: XiaomiProviderOptions) {
  return options.fetchImpl ?? globalThis.fetch
}

async function fetchPayload(url: string, options: XiaomiProviderOptions) {
  let response: Response
  try {
    response = await requestFetch(options)(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new XiaomiProviderError('aborted', 'requestAborted')
    }
    throw new XiaomiProviderError('network', 'networkFailure')
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new XiaomiProviderError('unreadable', 'xiaomiUnreadable', response.status)
  }

  const failure = parseXiaomiProxyFailure(payload)
  if (failure) {
    throw new XiaomiProviderError('proxy', failure.error.code, response.status, {
      upstreamStatus: failure.error.upstreamStatus,
      retryAfterMs: failure.error.retryAfterSeconds === undefined
        ? undefined
        : failure.error.retryAfterSeconds * 1_000,
    })
  }
  if (!response.ok) {
    throw new XiaomiProviderError('http', 'httpError', response.status)
  }
  return payload
}

export async function searchXiaomiLocations(
  query: string,
  options: XiaomiProviderOptions = {},
): Promise<ProviderWeatherLocation[]> {
  if (query.trim() === '') throw new XiaomiProviderError('input', 'invalidQuery')
  const params = new URLSearchParams({ q: query.trim() })
  const payload = await fetchPayload(`${XIAOMI_PROXY_PATHS.search}?${params}`, options)
  const envelope = parseXiaomiSearchSuccess(payload)
  if (!envelope) throw new XiaomiProviderError('contract', 'xiaomiContractInvalid')
  return normalizeXiaomiLocations(envelope.data.results)
}

function validateWeatherRequest(input: XiaomiWeatherRequest) {
  const { location } = input
  if (
    location.provider !== 'xiaomi' ||
    location.providerLocationId.trim() === '' ||
    !Number.isFinite(location.latitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    !Number.isFinite(location.longitude) ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    throw new XiaomiProviderError('input', 'invalidWeatherRequest')
  }
  if (input.locale !== undefined && input.locale !== 'zh-CN') {
    throw new XiaomiProviderError('input', 'unsupportedLocale')
  }
  if (input.days !== undefined && input.days !== 15) {
    throw new XiaomiProviderError('input', 'unsupportedDays')
  }
}

export async function fetchXiaomiWeatherRaw(
  input: XiaomiWeatherRequest,
  options: XiaomiProviderOptions = {},
): Promise<XiaomiAllProxySuccess> {
  validateWeatherRequest(input)
  const params = new URLSearchParams({
    locationKey: input.location.providerLocationId,
    latitude: String(input.location.latitude),
    longitude: String(input.location.longitude),
    locale: input.locale ?? 'zh-CN',
    days: String(input.days ?? 15),
  })
  const payload = await fetchPayload(`${XIAOMI_PROXY_PATHS.all}?${params}`, options)
  const envelope = parseXiaomiAllSuccess(payload)
  if (!envelope) throw new XiaomiProviderError('contract', 'xiaomiContractInvalid')
  return envelope
}

export async function getXiaomiWeatherSnapshot(
  input: XiaomiWeatherRequest,
  options: XiaomiProviderOptions = {},
): Promise<ProviderWeatherSnapshot<XiaomiWeatherExtensions>> {
  const envelope = await fetchXiaomiWeatherRaw(input, options)
  return normalizeXiaomiWeather(envelope.data, input.location)
}
