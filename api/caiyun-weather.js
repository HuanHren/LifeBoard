const DAILY_FORECAST_LENGTH = 15
const HOURLY_FORECAST_LENGTH = 24
const CAIYUN_API_ORIGIN = 'https://api.caiyunapp.com'

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
}

function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') {
    return Promise.resolve(request.body)
  }

  if (typeof request.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(request.body))
    } catch {
      return Promise.resolve(null)
    }
  }

  return new Promise((resolve) => {
    let rawBody = ''

    request.on('data', (chunk) => {
      rawBody += chunk
    })

    request.on('end', () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : null)
      } catch {
        resolve(null)
      }
    })

    request.on('error', () => {
      resolve(null)
    })
  })
}

function isFiniteCoordinate(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

function normalizeLocale(value) {
  if (value === 'zh-CN') return 'zh_CN'
  if (value === 'en-US') return 'en_US'
  return null
}

function errorStatusForUpstream(statusCode) {
  if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 429) {
    return 401
  }

  if (statusCode === 422) {
    return 422
  }

  return 502
}

function errorCodeForUpstream(statusCode) {
  if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 429) {
    return 'caiyunAuth'
  }

  if (statusCode === 422) {
    return 'caiyunCoordinates'
  }

  return 'caiyunUpstream'
}

function createCaiyunUrl({ token, longitude, latitude, locale }) {
  const url = new URL(
    `/v2.6/${encodeURIComponent(token)}/${encodeURIComponent(String(longitude))},${encodeURIComponent(String(latitude))}/weather`,
    CAIYUN_API_ORIGIN,
  )

  url.search = new URLSearchParams({
    alert: 'true',
    dailysteps: String(DAILY_FORECAST_LENGTH),
    hourlysteps: String(HOURLY_FORECAST_LENGTH),
    lang: locale,
    unit: 'metric',
  }).toString()

  return url
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'methodNotAllowed' })
    return
  }

  const body = await readJsonBody(request)

  if (!body || typeof body !== 'object') {
    sendJson(response, 400, { error: 'invalidBody' })
    return
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const longitude = body.longitude
  const latitude = body.latitude
  const locale = normalizeLocale(body.locale)

  if (token.length === 0) {
    sendJson(response, 400, { error: 'missingToken' })
    return
  }

  if (!isFiniteCoordinate(longitude, -180, 180) || !isFiniteCoordinate(latitude, -90, 90)) {
    sendJson(response, 400, { error: 'invalidCoordinates' })
    return
  }

  if (!locale) {
    sendJson(response, 400, { error: 'invalidLocale' })
    return
  }

  const upstreamUrl = createCaiyunUrl({ token, longitude, latitude, locale })
  let upstreamResponse

  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
      },
    })
  } catch {
    sendJson(response, 502, { error: 'caiyunProxyUnavailable' })
    return
  }

  let payload

  try {
    payload = await upstreamResponse.json()
  } catch {
    sendJson(response, 502, { error: 'caiyunUnreadable' })
    return
  }

  if (!upstreamResponse.ok) {
    sendJson(response, errorStatusForUpstream(upstreamResponse.status), {
      error: errorCodeForUpstream(upstreamResponse.status),
      status: upstreamResponse.status,
    })
    return
  }

  if (payload && typeof payload === 'object' && payload.status === 'failed') {
    sendJson(response, 401, { error: 'caiyunAuth' })
    return
  }

  sendJson(response, 200, payload)
}
