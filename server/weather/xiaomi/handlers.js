import { getXiaomiSecretValues, loadXiaomiConfig, XiaomiConfigError } from './config.js'
import {
  inspectXiaomiAllPayload,
  normalizeXiaomiSearchPayload,
  sanitizeXiaomiPayload,
  XiaomiContractError,
  XiaomiResponseSecretLeakError,
} from './contract.js'
import {
  createXiaomiAllUrl,
  createXiaomiSearchUrl,
  requestXiaomiJson,
  XiaomiRejectedError,
  XiaomiTimeoutError,
  XiaomiUnavailableError,
  XiaomiUnreadableError,
} from './request.js'
import { sendError, sendSuccess } from './response.js'

const MAX_SEARCH_QUERY_LENGTH = 120
const MAX_LOCATION_KEY_LENGTH = 256
const DECIMAL_NUMBER_PATTERN = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/

function requestSearchParams(request) {
  return new URL(request.url || '/', 'http://localhost').searchParams
}

function isWellFormedText(value) {
  if (typeof value.isWellFormed === 'function') return value.isWellFormed()

  try {
    encodeURIComponent(value)
    return true
  } catch {
    return false
  }
}

function isSafeText(value, maxLength) {
  return value.length > 0
    && value.length <= maxLength
    && !CONTROL_CHARACTER_PATTERN.test(value)
    && isWellFormedText(value)
}

function readSingleParameter(searchParams, name) {
  const values = searchParams.getAll(name)
  return values.length === 1 ? values[0] : null
}

function parseCoordinate(value, min, max) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!DECIMAL_NUMBER_PATTERN.test(trimmed)) return null
  const number = Number(trimmed)
  return Number.isFinite(number) && number >= min && number <= max ? trimmed : null
}

function handleKnownError(response, error) {
  if (error instanceof XiaomiConfigError) {
    console.error(`Xiaomi Weather configuration error: ${error.variableNames.join(', ')}`)
    sendError(response, 500, 'xiaomiProxyMisconfigured')
    return true
  }

  if (error instanceof XiaomiTimeoutError) {
    sendError(response, 504, 'xiaomiTimeout')
    return true
  }

  if (error instanceof XiaomiUnavailableError) {
    sendError(response, 502, 'xiaomiUnavailable')
    return true
  }

  if (error instanceof XiaomiRejectedError) {
    sendError(response, 502, 'xiaomiRejected', {
      upstreamStatus: error.status,
      ...(error.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: error.retryAfterSeconds }
        : {}),
    })
    return true
  }

  if (error instanceof XiaomiUnreadableError) {
    sendError(response, 502, 'xiaomiUnreadable')
    return true
  }

  if (error instanceof XiaomiContractError) {
    sendError(response, 502, 'xiaomiContractInvalid')
    return true
  }

  if (error instanceof XiaomiResponseSecretLeakError) {
    sendError(response, 502, 'xiaomiResponseSecretLeak')
    return true
  }

  return false
}

function rejectUnsupportedMethod(request, response) {
  if (request.method === 'GET') return false
  response.setHeader('Allow', 'GET')
  sendError(response, 405, 'methodNotAllowed')
  return true
}

export function createXiaomiHandlers({
  environment = process.env,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
  timeoutMs,
} = {}) {
  async function search(request, response) {
    if (rejectUnsupportedMethod(request, response)) return

    const searchParams = requestSearchParams(request)
    const rawQuery = readSingleParameter(searchParams, 'q')
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : ''

    if (!isSafeText(query, MAX_SEARCH_QUERY_LENGTH)) {
      sendError(response, 400, 'invalidQuery')
      return
    }

    try {
      const config = loadXiaomiConfig(environment)
      const upstream = await requestXiaomiJson(createXiaomiSearchUrl(config, query), {
        fetchImpl,
        timeoutMs,
      })
      const sanitized = sanitizeXiaomiPayload(upstream.data, getXiaomiSecretValues(config))
      const results = normalizeXiaomiSearchPayload(sanitized)

      sendSuccess(response, {
        operation: 'search',
        data: { results },
        upstreamStatus: upstream.status,
        now: now(),
      })
    } catch (error) {
      if (!handleKnownError(response, error)) throw error
    }
  }

  async function all(request, response) {
    if (rejectUnsupportedMethod(request, response)) return

    const searchParams = requestSearchParams(request)
    const rawLocationKey = readSingleParameter(searchParams, 'locationKey')
    const locationKey = typeof rawLocationKey === 'string' ? rawLocationKey.trim() : ''

    if (!isSafeText(locationKey, MAX_LOCATION_KEY_LENGTH)) {
      sendError(response, 400, 'invalidLocationKey')
      return
    }

    const latitude = parseCoordinate(readSingleParameter(searchParams, 'latitude'), -90, 90)
    const longitude = parseCoordinate(readSingleParameter(searchParams, 'longitude'), -180, 180)

    if (latitude === null || longitude === null) {
      sendError(response, 400, 'invalidCoordinates')
      return
    }

    const locale = readSingleParameter(searchParams, 'locale')
    if (locale === 'en-US') {
      sendError(response, 400, 'unsupportedLocale')
      return
    }
    if (locale !== 'zh-CN') {
      sendError(response, 400, 'invalidLocale')
      return
    }

    const daysValues = searchParams.getAll('days')
    const days = daysValues.length === 0 ? '15' : daysValues.length === 1 ? daysValues[0].trim() : null
    if (days !== '15') {
      sendError(response, 400, 'unsupportedDays')
      return
    }

    try {
      const config = loadXiaomiConfig(environment)
      const upstream = await requestXiaomiJson(createXiaomiAllUrl(config, {
        locationKey,
        latitude,
        longitude,
      }), {
        fetchImpl,
        timeoutMs,
      })
      const sanitized = sanitizeXiaomiPayload(upstream.data, getXiaomiSecretValues(config))
      const capabilities = inspectXiaomiAllPayload(sanitized)

      sendSuccess(response, {
        operation: 'all',
        data: sanitized,
        upstreamStatus: upstream.status,
        capabilities,
        now: now(),
      })
    } catch (error) {
      if (!handleKnownError(response, error)) throw error
    }
  }

  return { search, all }
}

const defaultHandlers = createXiaomiHandlers()

export const handleXiaomiSearch = defaultHandlers.search
export const handleXiaomiAll = defaultHandlers.all
