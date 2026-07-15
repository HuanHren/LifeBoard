import { describe, expect, it, vi } from 'vitest'
import {
  buildXiaomiCurrentLocationQueries,
  createConfirmedXiaomiCurrentLocation,
  haversineDistanceKm,
  normalizeChineseAdministrativeName,
  rankXiaomiCurrentLocationCandidates,
  resolveXiaomiCurrentLocation,
} from '@/modules/weather/services/xiaomiCurrentLocationResolver'
import type { ReverseGeocodedLocation } from '@/modules/weather/types/currentLocationResolution'
import type { WeatherLocation } from '@/modules/weather/types/weather'

const reverseLocation: ReverseGeocodedLocation = {
  latitude: 34.411,
  longitude: 114.193,
  countryCode: 'CN',
  countryName: '中国',
  principalSubdivision: '河南省',
  city: '开封市',
  locality: '尉氏县',
  administrativeNames: [
    { name: '河南省', level: 4 },
    { name: '开封市', level: 6 },
    { name: '尉氏县', level: 8 },
  ],
  lookupSource: 'bigdatacloud',
}

function candidate(overrides: Partial<WeatherLocation> = {}): WeatherLocation {
  return {
    id: 'xiaomi:sanitized-key',
    name: '尉氏县',
    kind: 'Location',
    admin1: '开封市, 河南, 中国',
    country: '中国',
    countryCode: 'CN',
    latitude: 34.41,
    longitude: 114.2,
    elevation: null,
    timezone: 'auto',
    providerLocationIds: { xiaomi: 'sanitized-key' },
    source: 'xiaomi',
    ...overrides,
  }
}

describe('Xiaomi current-location query and candidate resolver', () => {
  it('builds district then city queries and removes duplicates', () => {
    expect(buildXiaomiCurrentLocationQueries(reverseLocation)).toEqual(['尉氏县', '开封市'])
    expect(buildXiaomiCurrentLocationQueries({
      ...reverseLocation,
      locality: '开封市',
      administrativeNames: [{ name: '开封市', level: 6 }],
    })).toEqual(['开封市'])
  })

  it('does not use a street, road, coordinate string, or long address as a query', () => {
    expect(buildXiaomiCurrentLocationQueries({
      ...reverseLocation,
      locality: '人民路',
      administrativeNames: [{ name: '城关镇', level: 10 }, { name: '尉氏县', level: 8 }],
    })).toEqual(['尉氏县', '开封市'])
  })

  it.each([
    ['河南省', '河南'], ['开封市', '开封'], ['尉氏县', '尉氏'], ['海淀区', '海淀'],
    ['内蒙古自治区', '内蒙古'], ['恩施自治州', '恩施'], ['香港特别行政区', '香港'],
  ])('normalizes only a trailing Chinese administrative suffix', (input, expected) => {
    expect(normalizeChineseAdministrativeName(input)).toBe(expected)
  })

  it('stops after the district query when a trustworthy candidate exists', async () => {
    const searchXiaomi = vi.fn().mockResolvedValue([candidate()])
    const result = await resolveXiaomiCurrentLocation(
      reverseLocation,
      { reverseGeocode: vi.fn().mockResolvedValue(reverseLocation), searchXiaomi },
    )
    expect(searchXiaomi).toHaveBeenCalledOnce()
    expect(searchXiaomi).toHaveBeenCalledWith('尉氏县', undefined)
    expect(result.searchCount).toBe(1)
    expect(result.candidates).toHaveLength(1)
  })

  it('uses the city query once when the district query has no acceptable result', async () => {
    const searchXiaomi = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([candidate({ name: '开封市' })])
    const result = await resolveXiaomiCurrentLocation(
      reverseLocation,
      { reverseGeocode: vi.fn().mockResolvedValue(reverseLocation), searchXiaomi },
    )
    expect(searchXiaomi.mock.calls.map(([query]) => query)).toEqual(['尉氏县', '开封市'])
    expect(result.searchCount).toBe(2)
  })

  it('never exceeds two Xiaomi search calls', async () => {
    const searchXiaomi = vi.fn().mockResolvedValue([])
    await expect(resolveXiaomiCurrentLocation(
      reverseLocation,
      { reverseGeocode: vi.fn().mockResolvedValue(reverseLocation), searchXiaomi },
    )).rejects.toMatchObject({ code: 'xiaomi-no-candidate' })
    expect(searchXiaomi).toHaveBeenCalledTimes(2)
  })

  it('does not call Xiaomi search for a foreign location', async () => {
    const searchXiaomi = vi.fn()
    await expect(resolveXiaomiCurrentLocation(
      reverseLocation,
      {
        reverseGeocode: vi.fn().mockResolvedValue({ ...reverseLocation, countryCode: 'US' }),
        searchXiaomi,
      },
    )).rejects.toMatchObject({ code: 'outside-xiaomi-region' })
    expect(searchXiaomi).not.toHaveBeenCalled()
  })

  it('deduplicates candidates by the real Xiaomi locationKey', () => {
    const ranked = rankXiaomiCurrentLocationCandidates([
      candidate(),
      candidate({ id: 'duplicate', name: 'Duplicate' }),
      candidate({
        id: 'second',
        providerLocationIds: { xiaomi: 'second-key' },
        name: '开封市',
      }),
    ], reverseLocation, '尉氏县')
    expect(ranked).toHaveLength(2)
  })

  it('prefers the matching province over the same name in another province', () => {
    const ranked = rankXiaomiCurrentLocationCandidates([
      candidate({
        id: 'other',
        admin1: '昆明市, 云南, 中国',
        providerLocationIds: { xiaomi: 'other-key' },
        latitude: 25,
        longitude: 102,
      }),
      candidate(),
    ], reverseLocation, '尉氏县')
    expect(ranked[0]?.location.providerLocationIds?.xiaomi).toBe('sanitized-key')
    expect(ranked[0]?.recommended).toBe(true)
  })

  it('uses distance only as an ordering signal after semantic scores tie', () => {
    const ranked = rankXiaomiCurrentLocationCandidates([
      candidate({ id: 'far', providerLocationIds: { xiaomi: 'far' }, latitude: 35, longitude: 115 }),
      candidate({ id: 'near', providerLocationIds: { xiaomi: 'near' }, latitude: 34.412, longitude: 114.194 }),
    ], reverseLocation, '尉氏县')
    expect(ranked.map((item) => item.location.id)).toEqual(['near', 'far'])
    expect(haversineDistanceKm(reverseLocation, ranked[0]!.location)).toBeLessThan(1)
  })

  it('returns ranked candidates without selecting or persisting the first result', async () => {
    const result = await resolveXiaomiCurrentLocation(
      reverseLocation,
      { reverseGeocode: vi.fn().mockResolvedValue(reverseLocation), searchXiaomi: vi.fn().mockResolvedValue([candidate()]) },
    )
    expect(result.candidates[0]?.recommended).toBe(true)
    expect(result).not.toHaveProperty('selectedLocation')
    expect(result).not.toHaveProperty('confirmedLocation')
  })

  it('creates a confirmed location with GPS coordinates and the real candidate key', () => {
    const confirmed = createConfirmedXiaomiCurrentLocation(candidate({
      latitude: 1,
      longitude: 2,
    }), reverseLocation)
    expect(confirmed.latitude).toBe(reverseLocation.latitude)
    expect(confirmed.longitude).toBe(reverseLocation.longitude)
    expect(confirmed.providerLocationIds).toEqual({ xiaomi: 'sanitized-key' })
    expect(confirmed.name).toBe('尉氏县')
    expect(confirmed.admin1).toBe('开封市, 河南, 中国')
  })

  it('rejects confirmation when the candidate has no Xiaomi locationKey', () => {
    expect(() => createConfirmedXiaomiCurrentLocation(
      candidate({ providerLocationIds: undefined }),
      reverseLocation,
    )).toThrowError(expect.objectContaining({ code: 'xiaomi-no-candidate' }))
  })

  it('keeps zero-distance coordinates valid', () => {
    expect(haversineDistanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }))
      .toBe(0)
  })
})
