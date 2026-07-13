import { describe, expect, it } from 'vitest'
import {
  getXiaomiSecretValues,
  loadXiaomiConfig,
  XiaomiConfigError,
} from '../../server/weather/xiaomi/config.js'
import { TEST_ENVIRONMENT } from './helpers.js'

describe('Xiaomi server-only environment configuration', () => {
  it('loads all required non-empty values and permits an empty OAID', () => {
    const config = loadXiaomiConfig(TEST_ENVIRONMENT)

    expect(config.baseUrl.href).toBe('https://weather.example.test/')
    expect(config.oaid).toBe('')
  })

  it('reports only the missing variable name', () => {
    const environment = { ...TEST_ENVIRONMENT }
    delete environment.XIAOMI_WEATHER_SIGN

    expect(() => loadXiaomiConfig(environment)).toThrowError(XiaomiConfigError)

    try {
      loadXiaomiConfig(environment)
    } catch (error) {
      expect(error.variableNames).toEqual(['XIAOMI_WEATHER_SIGN'])
      expect(error.message).not.toContain(TEST_ENVIRONMENT.XIAOMI_WEATHER_APP_KEY)
    }
  })

  it('rejects a malformed base URL', () => {
    expect(() => loadXiaomiConfig({
      ...TEST_ENVIRONMENT,
      XIAOMI_WEATHER_BASE_URL: 'not-a-url',
    })).toThrowError(XiaomiConfigError)
  })

  it('rejects a non-HTTPS base URL', () => {
    expect(() => loadXiaomiConfig({
      ...TEST_ENVIRONMENT,
      XIAOMI_WEATHER_BASE_URL: 'http://weather.example.test',
    })).toThrowError(XiaomiConfigError)
  })

  it('rejects a base URL containing credentials', () => {
    expect(() => loadXiaomiConfig({
      ...TEST_ENVIRONMENT,
      XIAOMI_WEATHER_BASE_URL: 'https://user:password@weather.example.test',
    })).toThrowError(XiaomiConfigError)
  })

  it('excludes empty values from recursive leakage matching', () => {
    const secrets = getXiaomiSecretValues(loadXiaomiConfig(TEST_ENVIRONMENT))

    expect(secrets).not.toContain('')
    expect(secrets).toContain(TEST_ENVIRONMENT.XIAOMI_WEATHER_SIGN)
  })
})
