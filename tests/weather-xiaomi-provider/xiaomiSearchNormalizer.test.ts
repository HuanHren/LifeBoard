import { describe, expect, it } from 'vitest'
import { normalizeXiaomiLocations } from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import { loadSearchFixture } from './fixtures'

describe('Xiaomi search normalization', () => {
  it('normalizes the W1 search fixture without parsing locationKey', () => {
    expect(normalizeXiaomiLocations(loadSearchFixture())).toEqual([{
      provider: 'xiaomi',
      providerLocationId: 'sanitized-location-key',
      name: 'Sanitized City',
      administrativeArea: 'Sanitized Region,Sanitized Country',
      latitude: 0,
      longitude: 0,
    }])
  })

  it('returns an empty list for the W1 empty search fixture', () => {
    expect(normalizeXiaomiLocations(loadSearchFixture('search.empty.json'))).toEqual([])
  })

  it.each([
    { name: 'City', latitude: '1', longitude: '2' },
    { locationKey: '', name: 'City', latitude: '1', longitude: '2' },
    { locationKey: 'key', name: 'City', latitude: '91', longitude: '2' },
    { locationKey: 'key', name: 'City', latitude: '1', longitude: '181' },
    { locationKey: 'key', name: 'City', latitude: 'NaN', longitude: '2' },
  ])('drops an invalid candidate: %j', (candidate) => {
    expect(normalizeXiaomiLocations([candidate])).toEqual([])
  })

  it('does not invent optional administrative, country, or timezone fields', () => {
    const [candidate] = normalizeXiaomiLocations([{
      locationKey: 'opaque', name: 'City', latitude: '10', longitude: '20',
    }])
    expect(candidate).toEqual({
      provider: 'xiaomi', providerLocationId: 'opaque', name: 'City', latitude: 10, longitude: 20,
    })
  })

  it('preserves valid result order while removing invalid entries', () => {
    const result = normalizeXiaomiLocations([
      { locationKey: 'two', name: 'Second', latitude: '2', longitude: '2' },
      { locationKey: '', name: 'Invalid', latitude: '0', longitude: '0' },
      { locationKey: 'one', name: 'First', latitude: '1', longitude: '1' },
    ])
    expect(result.map(({ providerLocationId }) => providerLocationId)).toEqual(['two', 'one'])
  })
})
