import { describe, expect, it } from 'vitest'
import {
  inspectXiaomiAllPayload,
  normalizeXiaomiSearchPayload,
  sanitizeXiaomiPayload,
  XiaomiContractError,
  XiaomiResponseSecretLeakError,
} from '../../server/weather/xiaomi/contract.js'
import { loadFixture } from './helpers.js'

describe('Xiaomi search response contract', () => {
  it('preserves the observed empty result array', async () => {
    expect(normalizeXiaomiSearchPayload(await loadFixture('search.empty.json'))).toEqual([])
  })

  it('defensively converts a null root to an empty result list', () => {
    expect(normalizeXiaomiSearchPayload(null)).toEqual([])
  })

  it('preserves an observed result array', async () => {
    const fixture = await loadFixture('search.success.json')
    expect(normalizeXiaomiSearchPayload(fixture)).toEqual(fixture)
  })

  it('wraps a contract-supported single result object', async () => {
    const [result] = await loadFixture('search.success.json')
    expect(normalizeXiaomiSearchPayload(result)).toEqual([result])
  })

  it('rejects other root types and location records without locationKey', () => {
    expect(() => normalizeXiaomiSearchPayload('invalid')).toThrowError(XiaomiContractError)
    expect(() => normalizeXiaomiSearchPayload([{ name: 'missing key' }])).toThrowError(XiaomiContractError)
  })
})

describe('Xiaomi all-weather response contract', () => {
  it('detects every HAR-verified capability path and its availability state', async () => {
    const fixture = await loadFixture('all.success.json')

    expect(inspectXiaomiAllPayload(fixture)).toEqual({
      current: 'available',
      hourly: 'available',
      daily: 'available',
      aqi: 'available',
      minutely: 'available',
      alerts: 'empty-array',
      indices: 'available',
      typhoon: 'available',
      yesterday: 'available',
      preHour: 'available',
      sourceMaps: 'available',
      brandInfo: 'available',
      updateTime: 'available',
    })
  })

  it('distinguishes missing, null, empty object, and empty array', () => {
    const states = inspectXiaomiAllPayload({
      current: null,
      forecastHourly: {},
      alerts: [],
    })

    expect(states.current).toBe('null')
    expect(states.hourly).toBe('empty-object')
    expect(states.alerts).toBe('empty-array')
    expect(states.daily).toBe('missing')
  })

  it('rejects a wrong capability type clearly', () => {
    expect(() => inspectXiaomiAllPayload({ current: [] })).toThrowError(XiaomiContractError)
  })

  it('removes known sourceMaps credential echoes without changing the input', () => {
    const input = {
      sourceMaps: {
        clientInfo: {
          appKey: 'real-secret',
          appVersion: 'real-version-secret',
          locale: 'zh_cn',
        },
      },
    }
    const sanitized = sanitizeXiaomiPayload(input, ['real-secret', 'real-version-secret'])

    expect(sanitized.sourceMaps.clientInfo).toEqual({ locale: 'zh_cn' })
    expect(input.sourceMaps.clientInfo.appKey).toBe('real-secret')
    expect(input.sourceMaps.clientInfo.appVersion).toBe('real-version-secret')
  })

  it('rejects any remaining recursive server credential value', () => {
    expect(() => sanitizeXiaomiPayload({ nested: ['real-secret'] }, ['real-secret']))
      .toThrowError(XiaomiResponseSecretLeakError)
  })

  it('rejects a server credential embedded inside a longer response string', () => {
    expect(() => sanitizeXiaomiPayload(
      { nested: 'https://example.invalid/path?credential=real-secret&safe=true' },
      ['real-secret'],
    )).toThrowError(XiaomiResponseSecretLeakError)
  })

  it('does not treat the permitted empty OAID as a leaking value', () => {
    expect(sanitizeXiaomiPayload({ value: '' }, [''])).toEqual({ value: '' })
  })
})
