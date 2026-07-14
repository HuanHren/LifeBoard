import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isWeatherProviderId,
  loadWeatherProviderPreferences,
  saveWeatherProviderPreference,
} from '@/modules/weather/services/weatherProviderStorage'
import { isWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'
import { weatherLocation, xiaomiWeatherLocation } from './fixtures'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

describe('Weather W3 persistence compatibility', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('keeps Open-Meteo as the default for old browsers with no preference', () => {
    expect(loadWeatherProviderPreferences()).toEqual({
      ok: true, data: { provider: 'openMeteo', hasCaiyunToken: false },
    })
  })

  it('stores Xiaomi in the existing provider key without creating a new key', () => {
    expect(saveWeatherProviderPreference('xiaomi')).toEqual({ ok: true, data: undefined })
    expect(window.localStorage.length).toBe(1)
    expect(window.localStorage.getItem('lifeboard.weather.provider')).toBe('xiaomi')
    expect(loadWeatherProviderPreferences()).toMatchObject({
      ok: true, data: { provider: 'xiaomi' },
    })
  })

  it('continues accepting the two historical provider values', () => {
    expect(isWeatherProviderId('openMeteo')).toBe(true)
    expect(isWeatherProviderId('caiyun')).toBe(true)
    expect(isWeatherProviderId('xiaomi')).toBe(true)
    expect(isWeatherProviderId('unknown')).toBe(false)
  })

  it('keeps old saved locations valid', () => {
    expect(isWeatherLocation(weatherLocation)).toBe(true)
  })

  it('accepts a bounded optional Xiaomi location identity', () => {
    expect(isWeatherLocation(xiaomiWeatherLocation)).toBe(true)
    expect(isWeatherLocation({
      ...weatherLocation,
      providerLocationIds: { xiaomi: '' },
    })).toBe(false)
    expect(isWeatherLocation({
      ...weatherLocation,
      providerLocationIds: { xiaomi: 'opaque', unexpected: 'value' },
    })).toBe(false)
  })
})
