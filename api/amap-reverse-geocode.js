const AMAP_API_ORIGIN = 'https://restapi.amap.com'

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

function normalizeLocale(value) {
  if (value === 'zh-CN') return 'zh_cn'
  if (value === 'en-US') return 'en'
  return null
}

function isFiniteCoordinate(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

function stringOrNull(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function addressPart(value) {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim().length > 0)?.trim() ?? null
  }
  return null
}

function createAmapUrl({ key, longitude, latitude, locale }) {
  const url = new URL('/v3/geocode/regeo', AMAP_API_ORIGIN)
  url.search = new URLSearchParams({
    key,
    location: `${longitude},${latitude}`,
    output: 'JSON',
    language: locale,
    extensions: 'base',
  }).toString()
  return url
}

function normalizeReverseLocation({ payload, longitude, latitude }) {
  const regeocode = payload?.regeocode
  if (!regeocode || typeof regeocode !== 'object') return null

  const component = regeocode.addressComponent ?? {}
  const city = addressPart(component.city)
  const district = addressPart(component.district)
  const province = addressPart(component.province)
  const name = city ?? district ?? province ?? stringOrNull(regeocode.formatted_address)
  const displayLabel =
    stringOrNull(regeocode.formatted_address) ??
    [name, province, 'China'].filter(Boolean).join(', ')

  if (!name) return null

  return {
    id: `amap-geolocation-${longitude.toFixed(5)}-${latitude.toFixed(5)}`,
    name,
    kind: 'Location',
    admin1: province,
    country: 'China',
    countryCode: 'CN',
    latitude,
    longitude,
    elevation: null,
    timezone: 'auto',
    displayLabel,
    source: 'amap-geolocation',
  }
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

  const key = typeof body.key === 'string' ? body.key.trim() : ''
  const longitude = body.longitude
  const latitude = body.latitude
  const locale = normalizeLocale(body.locale)

  if (key.length === 0) {
    sendJson(response, 400, { error: 'missingKey' })
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

  let upstreamResponse

  try {
    upstreamResponse = await fetch(createAmapUrl({ key, longitude, latitude, locale }), {
      headers: {
        Accept: 'application/json',
      },
    })
  } catch {
    sendJson(response, 502, { error: 'amapUnavailable' })
    return
  }

  let payload

  try {
    payload = await upstreamResponse.json()
  } catch {
    sendJson(response, 502, { error: 'amapUnreadable' })
    return
  }

  if (!upstreamResponse.ok || payload?.status !== '1') {
    sendJson(response, 502, { error: 'amapRejected' })
    return
  }

  const location = normalizeReverseLocation({ payload, longitude, latitude })

  if (!location) {
    sendJson(response, 502, { error: 'amapNoLocation' })
    return
  }

  sendJson(response, 200, { location })
}
