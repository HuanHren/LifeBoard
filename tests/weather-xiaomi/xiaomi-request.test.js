import { describe, expect, it, vi } from 'vitest'
import { loadXiaomiConfig } from '../../server/weather/xiaomi/config.js'
import {
  createXiaomiAllUrl,
  createXiaomiSearchUrl,
  requestXiaomiJson,
  XiaomiRejectedError,
  XiaomiTimeoutError,
  XiaomiUnavailableError,
  XiaomiUnreadableError,
} from '../../server/weather/xiaomi/request.js'
import { TEST_ENVIRONMENT } from './helpers.js'

const config = loadXiaomiConfig(TEST_ENVIRONMENT)

describe('Xiaomi upstream URL construction', () => {
  it('encodes a Chinese query and preserves the fixed search path', () => {
    const url = createXiaomiSearchUrl(config, '尉氏县')

    expect(url.pathname).toBe('/wtr-v3/location/city/search')
    expect(url.searchParams.get('name')).toBe('尉氏县')
  })

  it('reproduces the two identical search appKey fields from the HAR', () => {
    const url = createXiaomiSearchUrl(config, '尉氏县')

    expect(url.searchParams.getAll('appKey')).toEqual([
      TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY,
      TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY,
    ])
  })

  it('uses the HAR-verified search query order and empty device fields', () => {
    const url = createXiaomiSearchUrl(config, '尉氏县')

    expect([...url.searchParams.keys()]).toEqual([
      'name', 'appKey', 'appKey', 'sign', 'romVersion', 'appVersion',
      'alpha', 'isGlobal', 'device', 'modDevice', 'locale', 'oaid',
    ])
    expect(url.searchParams.get('modDevice')).toBe('')
    expect(url.searchParams.get('oaid')).toBe('')
  })

  it('builds the fixed all-weather request with one appKey and days 15', () => {
    const url = createXiaomiAllUrl(config, {
      locationKey: 'opaque:key',
      latitude: '34.1000',
      longitude: '114.1000',
    })

    expect(url.pathname).toBe('/wtr-v3/weather/all')
    expect(url.searchParams.getAll('appKey')).toEqual([TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY])
    expect(url.searchParams.get('locationKey')).toBe('opaque:key')
    expect(url.searchParams.get('latitude')).toBe('34.1000')
    expect(url.searchParams.get('longitude')).toBe('114.1000')
    expect(url.searchParams.get('locale')).toBe('zh_cn')
    expect(url.searchParams.get('days')).toBe('15')
  })
})

describe('Xiaomi upstream transport', () => {
  it('sends only the explicit Accept header and returns JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"status":0}', { status: 200 }))
    const result = await requestXiaomiJson(new URL('https://weather.example.test/fixed'), { fetchImpl })
    const [, options] = fetchImpl.mock.calls[0]

    expect(options.headers).toEqual({ Accept: 'application/json' })
    expect(options.method).toBe('GET')
    expect(result).toEqual({ data: { status: 0 }, status: 200 })
  })

  it('maps upstream non-2xx without reading its body', async () => {
    const response = new Response('sensitive upstream body', { status: 403 })
    const jsonSpy = vi.spyOn(response, 'json')

    await expect(requestXiaomiJson(new URL('https://weather.example.test/fixed'), {
      fetchImpl: async () => response,
    })).rejects.toMatchObject({ name: XiaomiRejectedError.name, status: 403 })
    expect(jsonSpy).not.toHaveBeenCalled()
  })

  it('maps network exceptions deterministically', async () => {
    await expect(requestXiaomiJson(new URL('https://weather.example.test/fixed'), {
      fetchImpl: async () => { throw new TypeError('network details') },
    })).rejects.toBeInstanceOf(XiaomiUnavailableError)
  })

  it('maps explicit timeout aborts deterministically', async () => {
    const fetchImpl = (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })

    await expect(requestXiaomiJson(new URL('https://weather.example.test/fixed'), {
      fetchImpl,
      timeoutMs: 5,
    })).rejects.toBeInstanceOf(XiaomiTimeoutError)
  })

  it('maps non-JSON success responses deterministically', async () => {
    await expect(requestXiaomiJson(new URL('https://weather.example.test/fixed'), {
      fetchImpl: async () => new Response('not json', { status: 200 }),
    })).rejects.toBeInstanceOf(XiaomiUnreadableError)
  })
})
