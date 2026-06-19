const AMAP_API_ORIGIN = 'https://restapi.amap.com'
const MAX_QUERY_LENGTH = 120

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

function parseLocation(value) {
  if (typeof value !== 'string') return null
  const [longitudeText, latitudeText] = value.split(',')
  const longitude = Number(longitudeText)
  const latitude = Number(latitudeText)

  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    return null
  }

  return { longitude, latitude }
}

function stringOrNull(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function firstString(value) {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim().length > 0)?.trim() ?? null
  }
  return null
}

function normalizeGeocode(geocode, index) {
  if (!geocode || typeof geocode !== 'object') return null

  const coordinates = parseLocation(geocode.location)
  if (!coordinates) return null

  const name =
    firstString(geocode.district) ??
    firstString(geocode.city) ??
    firstString(geocode.formatted_address) ??
    null
  const region = firstString(geocode.province)
  const displayLabel =
    stringOrNull(geocode.formatted_address) ??
    [name, region, 'China'].filter(Boolean).join(', ')

  if (!name) return null

  return {
    id: `amap-${coordinates.longitude.toFixed(5)}-${coordinates.latitude.toFixed(5)}-${index}`,
    name,
    kind: 'Location',
    admin1: region,
    country: 'China',
    countryCode: 'CN',
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    elevation: null,
    timezone: 'auto',
    displayLabel,
    source: 'amap',
  }
}

function createAmapUrl({ key, query, locale }) {
  const url = new URL('/v3/geocode/geo', AMAP_API_ORIGIN)
  url.search = new URLSearchParams({
    key,
    address: query,
    output: 'JSON',
    language: locale,
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

  const key = typeof body.key === 'string' ? body.key.trim() : ''
  const query = typeof body.query === 'string' ? body.query.trim() : ''
  const locale = normalizeLocale(body.locale)

  if (key.length === 0) {
    sendJson(response, 400, { error: 'missingKey' })
    return
  }

  if (query.length === 0 || query.length > MAX_QUERY_LENGTH) {
    sendJson(response, 400, { error: 'invalidQuery' })
    return
  }

  if (!locale) {
    sendJson(response, 400, { error: 'invalidLocale' })
    return
  }

  let upstreamResponse

  try {
    upstreamResponse = await fetch(createAmapUrl({ key, query, locale }), {
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

  const geocodes = Array.isArray(payload.geocodes) ? payload.geocodes : []
  const results = geocodes
    .map((geocode, index) => normalizeGeocode(geocode, index))
    .filter(Boolean)

  sendJson(response, 200, { results })
}
