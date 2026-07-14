import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { AppLocale } from '@/i18n/types'
import type { ProviderWeatherSnapshot, WeatherCapabilityMap } from '@/modules/weather/providers/types'

export function loadExtendedFixture(): Record<string, unknown> {
  const path = fileURLToPath(new URL('./fixtures/extended.success.json', import.meta.url))
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
}

export const availableCapabilities: WeatherCapabilityMap = {
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
}

export function createXiaomiSnapshot(
  overrides: Partial<ProviderWeatherSnapshot> = {},
): ProviderWeatherSnapshot {
  return {
    provider: 'xiaomi',
    location: {
      provider: 'xiaomi',
      providerLocationId: 'sanitized-location',
      name: 'Sanitized City',
      latitude: 0,
      longitude: 0,
    },
    updatedAt: '2026-01-01T01:00:00.000Z',
    current: {
      observedAt: '2026-01-01T01:00:00.000Z',
      temperatureC: 20,
      apparentTemperatureC: 20,
      humidityPercent: 50,
      pressureHpa: 1000,
      visibilityKm: 10,
      windSpeedKmh: 2,
      condition: { id: 'clear', providerCode: '0' },
    },
    hourly: [],
    daily: [],
    capabilities: { ...availableCapabilities },
    units: {
      temperature: 'celsius',
      windSpeed: 'kilometres-per-hour',
      windDirection: 'degrees',
      humidity: 'percent',
      pressure: 'hectopascals',
      visibility: 'kilometres',
    },
    extensions: loadExtendedFixture(),
    diagnostics: [],
    ...overrides,
  }
}

export const locales: readonly AppLocale[] = ['zh-CN', 'en-US']
