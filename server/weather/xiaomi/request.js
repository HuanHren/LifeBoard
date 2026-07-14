export const XIAOMI_SEARCH_PATH = '/wtr-v3/location/city/search'
export const XIAOMI_ALL_PATH = '/wtr-v3/weather/all'
export const XIAOMI_UPSTREAM_TIMEOUT_MS = 8_000

export class XiaomiTimeoutError extends Error {
  constructor() {
    super('Xiaomi Weather upstream request timed out.')
    this.name = 'XiaomiTimeoutError'
  }
}

export class XiaomiUnavailableError extends Error {
  constructor() {
    super('Xiaomi Weather upstream is unavailable.')
    this.name = 'XiaomiUnavailableError'
  }
}

export class XiaomiRejectedError extends Error {
  constructor(status, retryAfterSeconds) {
    super('Xiaomi Weather upstream rejected the request.')
    this.name = 'XiaomiRejectedError'
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function parseRetryAfterSeconds(value, now = Date.now()) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed)
    return Number.isFinite(seconds) && seconds <= 3_600 ? seconds : undefined
  }
  const date = Date.parse(trimmed)
  if (!Number.isFinite(date)) return undefined
  const seconds = Math.max(0, Math.ceil((date - now) / 1_000))
  return seconds <= 3_600 ? seconds : undefined
}

export class XiaomiUnreadableError extends Error {
  constructor() {
    super('Xiaomi Weather upstream returned unreadable JSON.')
    this.name = 'XiaomiUnreadableError'
  }
}

function createUpstreamUrl(baseUrl, path) {
  return new URL(path, baseUrl)
}

function appendSharedParameters(searchParams, config) {
  searchParams.append('sign', config.sign)
  searchParams.append('romVersion', config.romVersion)
  searchParams.append('appVersion', config.appVersion)
  searchParams.append('alpha', 'false')
  searchParams.append('isGlobal', 'false')
  searchParams.append('device', config.device)
  searchParams.append('modDevice', '')
  searchParams.append('locale', 'zh_cn')
  searchParams.append('oaid', config.oaid)
}

export function createXiaomiSearchUrl(config, query) {
  const url = createUpstreamUrl(config.baseUrl, XIAOMI_SEARCH_PATH)
  const searchParams = new URLSearchParams()

  searchParams.append('name', query)
  // The authorized HAR contains two identical appKey fields on every successful search.
  searchParams.append('appKey', config.appKey)
  searchParams.append('appKey', config.appKey)
  appendSharedParameters(searchParams, config)
  url.search = searchParams.toString()

  return url
}

export function createXiaomiAllUrl(config, parameters) {
  const url = createUpstreamUrl(config.baseUrl, XIAOMI_ALL_PATH)
  const searchParams = new URLSearchParams()

  searchParams.append('latitude', parameters.latitude)
  searchParams.append('longitude', parameters.longitude)
  searchParams.append('isLocated', 'false')
  searchParams.append('locationKey', parameters.locationKey)
  searchParams.append('days', '15')
  searchParams.append('appKey', config.appKey)
  appendSharedParameters(searchParams, config)
  url.search = searchParams.toString()

  return url
}

export async function requestXiaomiJson(
  url,
  { fetchImpl = globalThis.fetch, timeoutMs = XIAOMI_UPSTREAM_TIMEOUT_MS } = {},
) {
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    let upstreamResponse

    try {
      upstreamResponse = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      })
    } catch (error) {
      if (timedOut || error?.name === 'AbortError') {
        throw new XiaomiTimeoutError()
      }

      throw new XiaomiUnavailableError()
    }

    if (!upstreamResponse.ok) {
      throw new XiaomiRejectedError(
        upstreamResponse.status,
        parseRetryAfterSeconds(upstreamResponse.headers.get('retry-after')),
      )
    }

    try {
      return {
        data: await upstreamResponse.json(),
        status: upstreamResponse.status,
      }
    } catch (error) {
      if (timedOut || error?.name === 'AbortError') {
        throw new XiaomiTimeoutError()
      }

      throw new XiaomiUnreadableError()
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export const xiaomiRequestTestInternals = { parseRetryAfterSeconds }
