import { describe, expect, it, vi } from 'vitest'
import {
  fetchXiaomiWeatherRaw,
  getXiaomiWeatherSnapshot,
  searchXiaomiLocations,
  XiaomiProviderError,
} from '@/modules/weather/providers/xiaomi/xiaomiProvider'
import { allEnvelope, searchEnvelope, xiaomiLocation } from './fixtures'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('Xiaomi frontend provider', () => {
  it('calls only the relative search proxy and encodes Unicode', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(searchEnvelope()))
    await searchXiaomiLocations(' 尉氏县 ', { fetchImpl })
    const [url, init] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe('/api/weather/xiaomi/search?q=%E5%B0%89%E6%B0%8F%E5%8E%BF')
    expect(init).toMatchObject({ method: 'GET', headers: { Accept: 'application/json' } })
  })

  it('calls only the relative all proxy with the bounded W1 contract', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(allEnvelope()))
    await fetchXiaomiWeatherRaw({ location: xiaomiLocation }, { fetchImpl })
    const [url] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe('/api/weather/xiaomi/all?locationKey=sanitized-location-key&latitude=0&longitude=0&locale=zh-CN&days=15')
    expect(String(url)).not.toMatch(/weatherapi|appKey|sign|oaid|device/i)
  })

  it('accepts explicit zh-CN and days=15', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(allEnvelope()))
    await expect(fetchXiaomiWeatherRaw({ location: xiaomiLocation, locale: 'zh-CN', days: 15 }, { fetchImpl })).resolves.toMatchObject({ operation: 'all' })
  })

  it('composes transport and pure normalization without Store state', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(allEnvelope()))
    await expect(getXiaomiWeatherSnapshot({ location: xiaomiLocation }, { fetchImpl })).resolves.toMatchObject({
      provider: 'xiaomi', location: xiaomiLocation, current: { temperatureC: 20 },
    })
  })

  it('normalizes a successful search envelope', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(searchEnvelope()))
    await expect(searchXiaomiLocations('City', { fetchImpl })).resolves.toEqual([
      expect.objectContaining({ provider: 'xiaomi', providerLocationId: 'sanitized-location-key' }),
    ])
  })

  it('preserves a proxy error code', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      ok: false, error: { code: 'xiaomiTimeout' },
    }, 504))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({
      kind: 'proxy', code: 'xiaomiTimeout', status: 504,
    })
  })

  it.each([
    ['unsupportedLocale'],
    ['unsupportedDays'],
    ['xiaomiProxyMisconfigured'],
    ['xiaomiUnavailable'],
    ['xiaomiRejected'],
    ['xiaomiUnreadable'],
    ['xiaomiContractInvalid'],
    ['xiaomiResponseSecretLeak'],
  ])('preserves W1 proxy code %s', async (code) => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: false, error: { code } }, 502))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({ kind: 'proxy', code })
  })

  it('rejects a malformed success envelope', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      ok: true, provider: 'other', operation: 'search', data: { results: [] }, meta: {},
    }))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({
      kind: 'contract', code: 'xiaomiContractInvalid',
    })
  })

  it('distinguishes an unreadable response', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response('not json', { status: 200 }))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({
      kind: 'unreadable', code: 'xiaomiUnreadable',
    })
  })

  it('distinguishes an HTTP error without a proxy envelope', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ message: 'hidden' }, 503))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({
      kind: 'http', code: 'httpError', status: 503,
    })
  })

  it('distinguishes a network failure', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({
      kind: 'network', code: 'networkFailure',
    })
  })

  it('distinguishes caller abort', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new DOMException('aborted', 'AbortError'))
    await expect(searchXiaomiLocations('City', { fetchImpl })).rejects.toMatchObject({
      kind: 'aborted', code: 'requestAborted',
    })
  })

  it('rejects empty search input before fetch', async () => {
    const fetchImpl = vi.fn<typeof fetch>()
    await expect(searchXiaomiLocations('   ', { fetchImpl })).rejects.toBeInstanceOf(XiaomiProviderError)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('rejects invalid coordinates before fetch', async () => {
    const fetchImpl = vi.fn<typeof fetch>()
    await expect(fetchXiaomiWeatherRaw({ location: { ...xiaomiLocation, longitude: 181 } }, { fetchImpl })).rejects.toMatchObject({ kind: 'input' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it.each([
    [{ locale: 'en-US' }, 'unsupportedLocale'],
    [{ days: 14 }, 'unsupportedDays'],
  ])('rejects an unverified bounded-contract extension %j', async (extra, code) => {
    const fetchImpl = vi.fn<typeof fetch>()
    await expect(fetchXiaomiWeatherRaw({ location: xiaomiLocation, ...extra }, { fetchImpl })).rejects.toMatchObject({ kind: 'input', code })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('forwards an AbortSignal without adding a second timeout', async () => {
    const controller = new AbortController()
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(searchEnvelope()))
    await searchXiaomiLocations('City', { fetchImpl, signal: controller.signal })
    expect(fetchImpl.mock.calls[0]?.[1]?.signal).toBe(controller.signal)
  })
})
