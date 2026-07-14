import { describe, expect, it, vi } from 'vitest'
import { createXiaomiHandlers } from '../../server/weather/xiaomi/handlers.js'
import handleUnknownXiaomiRoute from '../../api/xiaomi-weather-not-found.js'
import {
  createRequest,
  createResponse,
  jsonFetch,
  loadFixture,
  TEST_ENVIRONMENT,
} from './helpers.js'

const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z')

function handlers(options = {}) {
  return createXiaomiHandlers({
    environment: TEST_ENVIRONMENT,
    now: () => FIXED_DATE,
    ...options,
  })
}

async function run(handler, url, method = 'GET') {
  const response = createResponse()
  await handler(createRequest(url, method), response)
  return response
}

function validAllUrl(extra = '') {
  return `/api/weather/xiaomi/all?locationKey=opaque%3Akey&latitude=34.1&longitude=114.1&locale=zh-CN${extra}`
}

describe('GET /api/weather/xiaomi/search', () => {
  it('returns a stable success envelope and preserves Unicode upstream', async () => {
    const fixture = await loadFixture('search.success.json')
    const fetchImpl = vi.fn(jsonFetch(fixture))
    const response = await run(handlers({ fetchImpl }).search, '/api/weather/xiaomi/search?q=尉氏县')
    const upstreamUrl = fetchImpl.mock.calls[0][0]

    expect(upstreamUrl.searchParams.get('name')).toBe('尉氏县')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      ok: true,
      provider: 'xiaomi',
      operation: 'search',
      data: { results: fixture },
      meta: {
        receivedAt: '2026-01-01T00:00:00.000Z',
        upstreamStatus: 200,
      },
    })
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('normalizes an empty null fixture to results []', async () => {
    const fixture = await loadFixture('search.empty.json')
    const response = await run(
      handlers({ fetchImpl: jsonFetch(fixture) }).search,
      '/api/weather/xiaomi/search?q=NoResult',
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.data.results).toEqual([])
  })

  it('normalizes a single object result to an array', async () => {
    const [result] = await loadFixture('search.success.json')
    const response = await run(
      handlers({ fetchImpl: jsonFetch(result) }).search,
      '/api/weather/xiaomi/search?q=Single',
    )

    expect(response.body.data.results).toEqual([result])
  })

  it.each([
    ['/api/weather/xiaomi/search', 'missing'],
    ['/api/weather/xiaomi/search?q=%20%20%20', 'whitespace'],
    [`/api/weather/xiaomi/search?q=${'a'.repeat(121)}`, 'long'],
    ['/api/weather/xiaomi/search?q=one&q=two', 'duplicate'],
  ])('rejects %s as invalid query input (%s)', async (url) => {
    const response = await run(handlers({ fetchImpl: vi.fn() }).search, url)

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({ ok: false, error: { code: 'invalidQuery' } })
  })

  it('returns 405 and Allow GET for other methods', async () => {
    const response = await run(
      handlers({ fetchImpl: vi.fn() }).search,
      '/api/weather/xiaomi/search?q=City',
      'POST',
    )

    expect(response.statusCode).toBe(405)
    expect(response.headers.get('allow')).toBe('GET')
    expect(response.body.error.code).toBe('methodNotAllowed')
  })

  it('maps upstream rejection without exposing its body', async () => {
    const response = await run(
      handlers({ fetchImpl: async () => new Response('private upstream details', { status: 429 }) }).search,
      '/api/weather/xiaomi/search?q=City',
    )

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({
      ok: false,
      error: { code: 'xiaomiRejected', upstreamStatus: 429 },
    })
    expect(JSON.stringify(response.body)).not.toContain('private upstream details')
  })

  it('maps network failure, timeout, and unreadable JSON', async () => {
    const network = await run(
      handlers({ fetchImpl: async () => { throw new TypeError('network secret') } }).search,
      '/api/weather/xiaomi/search?q=City',
    )
    const timeout = await run(
      handlers({
        fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
        timeoutMs: 5,
      }).search,
      '/api/weather/xiaomi/search?q=City',
    )
    const unreadable = await run(
      handlers({ fetchImpl: async () => new Response('not-json', { status: 200 }) }).search,
      '/api/weather/xiaomi/search?q=City',
    )

    expect(network.body.error.code).toBe('xiaomiUnavailable')
    expect(timeout.body.error.code).toBe('xiaomiTimeout')
    expect(timeout.statusCode).toBe(504)
    expect(unreadable.body.error.code).toBe('xiaomiUnreadable')
  })

  it('rejects an unexpected search root type', async () => {
    const response = await run(
      handlers({ fetchImpl: jsonFetch('invalid-root') }).search,
      '/api/weather/xiaomi/search?q=City',
    )

    expect(response.statusCode).toBe(502)
    expect(response.body.error.code).toBe('xiaomiContractInvalid')
  })
})

describe('GET /api/weather/xiaomi/all', () => {
  it('returns sanitized provider data and stateful capabilities', async () => {
    const fixture = await loadFixture('all.success.json')
    const upstream = structuredClone(fixture)
    upstream.sourceMaps.clientInfo.appKey = TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY
    upstream.sourceMaps.clientInfo.appVersion = TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_VERSION
    const response = await run(
      handlers({ fetchImpl: jsonFetch(upstream) }).all,
      validAllUrl('&days=15'),
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.operation).toBe('all')
    expect(response.body.data.sourceMaps).not.toHaveProperty('clientInfo')
    expect(response.body.meta.capabilities).toMatchObject({
      current: 'available',
      hourly: 'available',
      daily: 'available',
      alerts: 'empty-array',
      typhoon: 'available',
    })
  })

  it('defaults omitted days to the HAR-verified value 15', async () => {
    const fixture = await loadFixture('all.success.json')
    const fetchImpl = vi.fn(jsonFetch(fixture))
    const response = await run(handlers({ fetchImpl }).all, validAllUrl())

    expect(response.statusCode).toBe(200)
    expect(fetchImpl.mock.calls[0][0].searchParams.get('days')).toBe('15')
  })

  it.each([
    ['/api/weather/xiaomi/all?latitude=34&longitude=114&locale=zh-CN', 'invalidLocationKey'],
    ['/api/weather/xiaomi/all?locationKey=key&latitude=91&longitude=114&locale=zh-CN', 'invalidCoordinates'],
    ['/api/weather/xiaomi/all?locationKey=key&latitude=34&longitude=181&locale=zh-CN', 'invalidCoordinates'],
    ['/api/weather/xiaomi/all?locationKey=key&latitude=NaN&longitude=114&locale=zh-CN', 'invalidCoordinates'],
    ['/api/weather/xiaomi/all?locationKey=key&latitude=34&longitude=114&locale=fr-FR', 'invalidLocale'],
  ])('rejects invalid public input with %s', async (url, code) => {
    const response = await run(handlers({ fetchImpl: vi.fn() }).all, url)

    expect(response.statusCode).toBe(400)
    expect(response.body.error.code).toBe(code)
  })

  it('rejects en-US without guessing the upstream mapping', async () => {
    const response = await run(
      handlers({ fetchImpl: vi.fn() }).all,
      '/api/weather/xiaomi/all?locationKey=key&latitude=34&longitude=114&locale=en-US',
    )

    expect(response.statusCode).toBe(400)
    expect(response.body.error.code).toBe('unsupportedLocale')
  })

  it.each(['1', '7', '16', 'abc'])('rejects unsupported days=%s', async (days) => {
    const response = await run(
      handlers({ fetchImpl: vi.fn() }).all,
      validAllUrl(`&days=${days}`),
    )

    expect(response.statusCode).toBe(400)
    expect(response.body.error.code).toBe('unsupportedDays')
  })

  it('returns 405 and Allow GET for other methods', async () => {
    const response = await run(handlers({ fetchImpl: vi.fn() }).all, validAllUrl(), 'POST')

    expect(response.statusCode).toBe(405)
    expect(response.headers.get('allow')).toBe('GET')
  })

  it('reports missing optional sections without crashing', async () => {
    const response = await run(
      handlers({ fetchImpl: jsonFetch({ current: {}, alerts: [], typhoon: null }) }).all,
      validAllUrl(),
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.meta.capabilities).toMatchObject({
      current: 'empty-object',
      hourly: 'missing',
      alerts: 'empty-array',
      typhoon: 'null',
    })
  })

  it('maps upstream rejection, network failure, timeout, and unreadable JSON', async () => {
    const rejected = await run(
      handlers({ fetchImpl: async () => new Response('private', { status: 500 }) }).all,
      validAllUrl(),
    )
    const network = await run(
      handlers({ fetchImpl: async () => { throw new TypeError('network') } }).all,
      validAllUrl(),
    )
    const timeout = await run(
      handlers({
        fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        }),
        timeoutMs: 5,
      }).all,
      validAllUrl(),
    )
    const unreadable = await run(
      handlers({ fetchImpl: async () => new Response('not-json', { status: 200 }) }).all,
      validAllUrl(),
    )

    expect(rejected.body.error).toEqual({ code: 'xiaomiRejected', upstreamStatus: 500 })
    expect(network.body.error.code).toBe('xiaomiUnavailable')
    expect(timeout.body.error.code).toBe('xiaomiTimeout')
    expect(unreadable.body.error.code).toBe('xiaomiUnreadable')
  })

  it('returns xiaomiResponseSecretLeak instead of contaminated data', async () => {
    const contaminated = {
      current: { nested: TEST_ENVIRONMENT.XIAOMI_WEATHER_SIGN },
      sourceMaps: { clientInfo: { appKey: TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY } },
    }
    const response = await run(
      handlers({ fetchImpl: jsonFetch(contaminated) }).all,
      validAllUrl(),
    )
    const serialized = JSON.stringify(response.body)

    expect(response.statusCode).toBe(502)
    expect(response.body.error.code).toBe('xiaomiResponseSecretLeak')
    expect(serialized).not.toContain(TEST_ENVIRONMENT.XIAOMI_WEATHER_SIGN)
    expect(serialized).not.toContain(TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY)
  })

  it('rejects wrong all-weather root and capability types', async () => {
    const root = await run(handlers({ fetchImpl: jsonFetch([]) }).all, validAllUrl())
    const type = await run(handlers({ fetchImpl: jsonFetch({ current: [] }) }).all, validAllUrl())

    expect(root.body.error.code).toBe('xiaomiContractInvalid')
    expect(type.body.error.code).toBe('xiaomiContractInvalid')
  })
})

describe('proxy configuration safety', () => {
  it('returns a generic configuration error without secret values', async () => {
    const environment = { ...TEST_ENVIRONMENT }
    delete environment.XIAOMI_WEATHER_SIGN
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await run(
      handlers({ environment, fetchImpl: vi.fn() }).search,
      '/api/weather/xiaomi/search?q=City',
    )
    log.mockRestore()

    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({ ok: false, error: { code: 'xiaomiProxyMisconfigured' } })
    expect(JSON.stringify(response.body)).not.toContain(TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY)
  })
})

describe('unknown Xiaomi API paths', () => {
  it('return a stable JSON 404 instead of the SPA', () => {
    const response = createResponse()
    handleUnknownXiaomiRoute(createRequest('/api/weather/xiaomi/unknown'), response)

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({ ok: false, error: { code: 'xiaomiRouteNotFound' } })
  })
})
