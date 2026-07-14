import { describe, expect, it } from 'vitest'
import {
  getEffectiveWeatherProvider,
  getWeatherProviderAvailability,
} from '@/modules/weather/providers/weatherProviderEligibility'
import { isXiaomiWeatherFeatureEnabled } from '@/modules/weather/providers/weatherFeatureFlags'
import { weatherLocation, xiaomiWeatherLocation } from './fixtures'

describe('Weather W3 feature gate and provider eligibility', () => {
  it('keeps the Xiaomi flag disabled when absent or not exactly true', () => {
    expect(isXiaomiWeatherFeatureEnabled({})).toBe(false)
    expect(isXiaomiWeatherFeatureEnabled({ VITE_XIAOMI_WEATHER_ENABLED: 'TRUE' })).toBe(false)
    expect(isXiaomiWeatherFeatureEnabled({ VITE_XIAOMI_WEATHER_ENABLED: 'true' })).toBe(true)
  })

  it('keeps Open-Meteo available by default', () => {
    expect(getWeatherProviderAvailability({
      provider: 'openMeteo', locale: 'en-US', xiaomiEnabled: false,
    })).toEqual({ available: true })
  })

  it('reports a missing Caiyun credential without changing its preference', () => {
    const input = {
      provider: 'caiyun' as const,
      locale: 'zh-CN' as const,
      xiaomiEnabled: false,
      hasCaiyunToken: false,
    }
    expect(getWeatherProviderAvailability(input)).toEqual({
      available: false, reason: 'missing-credential',
    })
    expect(getEffectiveWeatherProvider(input)).toBe('caiyun')
  })

  it('reports Xiaomi feature, locale, and location eligibility separately', () => {
    expect(getWeatherProviderAvailability({
      provider: 'xiaomi', locale: 'zh-CN', location: xiaomiWeatherLocation, xiaomiEnabled: false,
    })).toEqual({ available: false, reason: 'feature-disabled' })
    expect(getWeatherProviderAvailability({
      provider: 'xiaomi', locale: 'en-US', location: xiaomiWeatherLocation, xiaomiEnabled: true,
    })).toEqual({ available: false, reason: 'unsupported-locale' })
    expect(getWeatherProviderAvailability({
      provider: 'xiaomi', locale: 'zh-CN', location: weatherLocation, xiaomiEnabled: true,
    })).toEqual({ available: false, reason: 'missing-provider-location' })
    expect(getWeatherProviderAvailability({
      provider: 'xiaomi', locale: 'zh-CN', location: xiaomiWeatherLocation, xiaomiEnabled: true,
    })).toEqual({ available: true })
  })

  it('allows Xiaomi search before a provider location identity exists', () => {
    expect(getWeatherProviderAvailability({
      provider: 'xiaomi', locale: 'zh-CN', xiaomiEnabled: true, requireLocation: false,
    })).toEqual({ available: true })
  })

  it('uses Open-Meteo effectively only for Xiaomi ineligibility', () => {
    expect(getEffectiveWeatherProvider({
      provider: 'xiaomi', locale: 'en-US', location: xiaomiWeatherLocation, xiaomiEnabled: true,
    })).toBe('openMeteo')
    expect(getEffectiveWeatherProvider({
      provider: 'xiaomi', locale: 'zh-CN', location: xiaomiWeatherLocation, xiaomiEnabled: true,
    })).toBe('xiaomi')
  })

  it('fails an unknown runtime provider safely', () => {
    const provider = 'unknown' as 'xiaomi'
    expect(getWeatherProviderAvailability({
      provider, locale: 'zh-CN', xiaomiEnabled: true, requireLocation: false,
    })).toEqual({ available: false, reason: 'unknown-provider' })
    expect(getEffectiveWeatherProvider({
      provider, locale: 'zh-CN', xiaomiEnabled: true, requireLocation: false,
    })).toBe('openMeteo')
  })
})
