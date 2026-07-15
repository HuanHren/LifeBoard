import { describe, expect, it, vi } from 'vitest'
import {
  BIG_DATA_CLOUD_REVERSE_GEOCODE_URL,
  CurrentLocationResolutionError,
  isValidCurrentCoordinates,
  normalizeBigDataCloudReverseResponse,
  reverseGeocodeCurrentCoordinates,
} from '@/modules/weather/services/bigDataCloudReverseGeocoder'

const coordinates = { latitude: 34.411, longitude: 114.193 }

function payload() {
  return {
    latitude: 0,
    longitude: 0,
    countryCode: ' cn ',
    countryName: ' 中国 ',
    principalSubdivision: ' 河南省 ',
    principalSubdivisionCode: 'CN-HA',
    city: ' 开封市 ',
    locality: ' 尉氏县 ',
    postcode: '475500',
    unknownTrackingField: 'ignored',
    localityInfo: {
      administrative: [
        { name: '河南省', adminLevel: 4, isoCode: 'CN-HA' },
        { name: '开封市', adminLevel: 6 },
        { name: '尉氏县', adminLevel: 8, chinaAdminCode: '410223' },
        { name: '尉氏县', adminLevel: 8 },
        { name: '   ' },
      ],
    },
  }
}

describe('BigDataCloud current-coordinate reverse geocoder', () => {
  it('normalizes a valid zh response into the provider-neutral model', () => {
    expect(normalizeBigDataCloudReverseResponse(payload(), coordinates)).toEqual({
      ...coordinates,
      countryCode: 'CN',
      countryName: '中国',
      principalSubdivision: '河南省',
      principalSubdivisionCode: 'CN-HA',
      city: '开封市',
      locality: '尉氏县',
      postcode: '475500',
      chinaAdminCode: '410223',
      administrativeNames: [
        { name: '河南省', level: 4, isoCode: 'CN-HA' },
        { name: '开封市', level: 6 },
        { name: '尉氏县', level: 8, chinaAdminCode: '410223' },
      ],
      lookupSource: 'bigdatacloud',
    })
  })

  it('preserves the browser GPS coordinates instead of response coordinates', () => {
    const normalized = normalizeBigDataCloudReverseResponse(payload(), coordinates)
    expect(normalized.latitude).toBe(coordinates.latitude)
    expect(normalized.longitude).toBe(coordinates.longitude)
  })

  it('keeps chinaAdminCode optional', () => {
    const value = payload()
    value.localityInfo.administrative = [{ name: '河南省', adminLevel: 4 }]
    expect(normalizeBigDataCloudReverseResponse(value, coordinates)).not.toHaveProperty('chinaAdminCode')
  })

  it.each([
    { latitude: Number.NaN, longitude: 0 },
    { latitude: 91, longitude: 0 },
    { latitude: -91, longitude: 0 },
    { latitude: 0, longitude: 181 },
    { latitude: 0, longitude: -181 },
  ])('rejects malformed coordinates: %j', (value) => {
    expect(isValidCurrentCoordinates(value)).toBe(false)
    expect(() => normalizeBigDataCloudReverseResponse(payload(), value)).toThrow(CurrentLocationResolutionError)
  })

  it('rejects a payload without a verified country code', () => {
    expect(() => normalizeBigDataCloudReverseResponse({ city: '开封市' }, coordinates))
      .toThrowError(expect.objectContaining({ code: 'reverse-contract' }))
  })

  it('makes one client request with only the documented parameters', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(Response.json(payload()))
    await reverseGeocodeCurrentCoordinates(coordinates, { fetchImpl })
    expect(fetchImpl).toHaveBeenCalledOnce()
    const [request] = fetchImpl.mock.calls[0] ?? []
    const url = new URL(String(request))
    expect(url.origin + url.pathname).toBe(BIG_DATA_CLOUD_REVERSE_GEOCODE_URL)
    expect([...url.searchParams.keys()].sort()).toEqual(['latitude', 'localityLanguage', 'longitude'])
    expect(url.searchParams.get('localityLanguage')).toBe('zh')
    expect(String(request)).not.toMatch(/api[_-]?key|token|authorization/i)
  })

  it('classifies HTTP errors without reading the response body', async () => {
    const text = vi.fn()
    const response = { ok: false, status: 429, text } as unknown as Response
    await expect(reverseGeocodeCurrentCoordinates(coordinates, {
      fetchImpl: vi.fn<typeof fetch>().mockResolvedValue(response),
    })).rejects.toMatchObject({ code: 'reverse-http', status: 429 })
    expect(text).not.toHaveBeenCalled()
  })

  it('classifies network errors without leaking the transport message', async () => {
    await expect(reverseGeocodeCurrentCoordinates(coordinates, {
      fetchImpl: vi.fn<typeof fetch>().mockRejectedValue(new Error('sensitive raw detail')),
    })).rejects.toMatchObject({
      code: 'reverse-network',
      message: 'The location name service is unavailable.',
    })
  })

  it('classifies AbortError as a silent cancellation category', async () => {
    await expect(reverseGeocodeCurrentCoordinates(coordinates, {
      fetchImpl: vi.fn<typeof fetch>().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
    })).rejects.toMatchObject({ code: 'aborted' })
  })

  it('does not mutate or retain the original response object', () => {
    const raw = payload()
    const before = structuredClone(raw)
    const normalized = normalizeBigDataCloudReverseResponse(raw, coordinates)
    expect(raw).toEqual(before)
    expect(normalized).not.toHaveProperty('unknownTrackingField')
    expect(JSON.stringify(normalized)).not.toContain('ignored')
  })
})
