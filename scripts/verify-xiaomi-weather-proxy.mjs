import process from 'node:process'

const DEFAULT_BASE_URL = 'http://localhost:3000'
const SEARCH_QUERY = '尉氏县'
const TARGET_NAME_PATTERN = /^尉氏(?:县)?$/u
const TARGET_REGION_PATTERN = /河南|开封/u

function readBaseUrl() {
  const argument = process.argv[2]
  const value = argument || process.env.XIAOMI_PROXY_BASE_URL || DEFAULT_BASE_URL
  const url = new URL(value)

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('The proxy base URL must be an HTTP(S) URL without credentials.')
  }

  return url
}

async function readProxyResponse(url) {
  const startedAt = performance.now()
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  const elapsedMs = Math.round(performance.now() - startedAt)
  let payload

  try {
    payload = await response.json()
  } catch {
    console.log(`proxy HTTP status: ${response.status}`)
    console.log(`elapsed time: ${elapsedMs} ms`)
    console.log('generic error code: unreadableProxyResponse')
    process.exitCode = 1
    return null
  }

  console.log(`proxy HTTP status: ${response.status}`)
  console.log(`ok: ${payload?.ok === true}`)
  console.log(`operation: ${typeof payload?.operation === 'string' ? payload.operation : 'none'}`)
  console.log(`elapsed time: ${elapsedMs} ms`)

  if (!response.ok || payload?.ok !== true) {
    console.log(`generic error code: ${payload?.error?.code || 'proxyRequestFailed'}`)
    process.exitCode = 1
    return null
  }

  return payload
}

function findIntendedCity(results) {
  return results.find((result) => {
    const name = typeof result?.name === 'string' ? result.name.trim() : ''
    const affiliation = typeof result?.affiliation === 'string' ? result.affiliation : ''
    return TARGET_NAME_PATTERN.test(name) && TARGET_REGION_PATTERN.test(affiliation)
  }) ?? null
}

async function main() {
  const baseUrl = readBaseUrl()
  const searchUrl = new URL('/api/weather/xiaomi/search', baseUrl)
  searchUrl.searchParams.set('q', SEARCH_QUERY)

  const search = await readProxyResponse(searchUrl)
  if (!search) return

  const results = Array.isArray(search.data?.results) ? search.data.results : []
  const intendedCity = findIntendedCity(results)
  const hasLocationKey = typeof intendedCity?.locationKey === 'string'
    && intendedCity.locationKey.trim().length > 0

  console.log(`search result count: ${results.length}`)
  console.log(`intended city match exists: ${intendedCity !== null}`)
  console.log(`locationKey exists: ${hasLocationKey}`)

  if (!intendedCity || !hasLocationKey) {
    console.log('generic error code: intendedCityNotFound')
    process.exitCode = 1
    return
  }

  const allUrl = new URL('/api/weather/xiaomi/all', baseUrl)
  allUrl.searchParams.set('locationKey', intendedCity.locationKey)
  allUrl.searchParams.set('latitude', String(intendedCity.latitude))
  allUrl.searchParams.set('longitude', String(intendedCity.longitude))
  allUrl.searchParams.set('locale', 'zh-CN')
  allUrl.searchParams.set('days', '15')

  const all = await readProxyResponse(allUrl)
  if (!all) return

  const keys = all.data && typeof all.data === 'object' && !Array.isArray(all.data)
    ? Object.keys(all.data).sort()
    : []

  console.log(`top-level sanitized key inventory: ${keys.join(', ')}`)
  for (const [capability, state] of Object.entries(all.meta?.capabilities ?? {})) {
    console.log(`capability ${capability}: ${state}`)
  }
}

main().catch((error) => {
  console.log('generic error code: verificationFailed')
  console.error(error instanceof Error ? error.message : 'Unknown verification failure.')
  process.exitCode = 1
})
