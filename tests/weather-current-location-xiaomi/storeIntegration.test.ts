import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adaptLegacyWeatherSnapshot } from '@/modules/weather/providers/weatherSnapshotAdapters'
import { createConfirmedXiaomiCurrentLocation } from '@/modules/weather/services/xiaomiCurrentLocationResolver'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import { createLegacySnapshot, createXiaomiProviderSnapshot } from '../weather-w3/fixtures'

const runtime = vi.hoisted(() => ({ fetchSnapshot: vi.fn(), searchXiaomi: vi.fn() }))

vi.mock('@/modules/weather/providers/weatherFeatureFlags', () => ({
  xiaomiWeatherEnabled: true,
  isXiaomiWeatherFeatureEnabled: () => true,
}))

vi.mock('@/modules/weather/providers/weatherProviderRuntime', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/modules/weather/providers/weatherProviderRuntime')>()
  return { ...original, weatherProviderRuntime: runtime }
})

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, String(value)) }
}

const candidate: WeatherLocation = {
  id: 'xiaomi:candidate-key',
  name: '尉氏县',
  kind: 'Location',
  admin1: '开封市, 河南, 中国',
  country: '中国',
  countryCode: 'CN',
  latitude: 34.5,
  longitude: 114.4,
  elevation: null,
  timezone: 'auto',
  providerLocationIds: { xiaomi: 'candidate-key' },
  source: 'xiaomi',
}

describe('Xiaomi current-location Store integration', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() })
    setActivePinia(createPinia())
    runtime.fetchSnapshot.mockReset()
    runtime.searchXiaomi.mockReset()
    runtime.fetchSnapshot.mockImplementation(({ provider, location }) => {
      const snapshot = provider === 'xiaomi'
        ? createXiaomiProviderSnapshot()
        : adaptLegacyWeatherSnapshot(createLegacySnapshot('openMeteo'))
      return Promise.resolve({
        ...snapshot,
        location: {
          ...snapshot.location,
          provider,
          providerLocationId: location.providerLocationIds?.xiaomi ?? String(location.id),
          localId: location.id,
          name: location.name,
          administrativeArea: location.admin1 ?? undefined,
          country: location.country,
          countryCode: location.countryCode,
          latitude: location.latitude,
          longitude: location.longitude,
          providerLocationIds: location.providerLocationIds,
          source: location.source,
        },
      })
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  function configureXiaomiStore() {
    window.localStorage.setItem('lifeboard.weather.provider', 'xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    return store
  }

  it('commits unresolved GPS coordinates without reusing a stale Xiaomi ID', async () => {
    const store = configureXiaomiStore()
    store.synchronizeLocation(candidate)
    await store.selectUnresolvedCurrentCoordinates({
      latitude: 31.2,
      longitude: 121.5,
      fallbackName: '当前位置',
    })
    expect(store.selectedLocation?.latitude).toBe(31.2)
    expect(store.selectedLocation?.longitude).toBe(121.5)
    expect(store.selectedLocation?.providerLocationIds?.xiaomi).toBeUndefined()
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({ provider: 'openMeteo' }))
  })

  it('loads Xiaomi only after an explicitly confirmed location is selected', async () => {
    const store = configureXiaomiStore()
    expect(runtime.fetchSnapshot).not.toHaveBeenCalled()
    const confirmed = createConfirmedXiaomiCurrentLocation(candidate, {
      latitude: 34.411,
      longitude: 114.193,
    })
    await store.selectLocation(confirmed)
    expect(runtime.fetchSnapshot).toHaveBeenCalledOnce()
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'xiaomi',
      location: expect.objectContaining({
        latitude: 34.411,
        longitude: 114.193,
        providerLocationIds: { xiaomi: 'candidate-key' },
      }),
    }))
  })

  it('persists the confirmed GPS snapshot in the existing location key', async () => {
    const store = configureXiaomiStore()
    await store.selectLocation(createConfirmedXiaomiCurrentLocation(candidate, {
      latitude: 34.411,
      longitude: 114.193,
    }))
    const persisted = JSON.parse(window.localStorage.getItem('lifeboard-weather-location') ?? '{}')
    expect(persisted).toMatchObject({
      name: '尉氏县',
      latitude: 34.411,
      longitude: 114.193,
      providerLocationIds: { xiaomi: 'candidate-key' },
    })
    expect(window.localStorage.length).toBeGreaterThan(0)
  })

  it('Home and Weather reuse the same committed Store snapshot', async () => {
    const store = configureXiaomiStore()
    const confirmed = createConfirmedXiaomiCurrentLocation(candidate, {
      latitude: 34.411,
      longitude: 114.193,
    })
    await store.selectLocation(confirmed)
    const firstSnapshot = store.weather
    await store.loadForecast()
    expect(store.weather).toEqual(firstSnapshot)
    expect(runtime.fetchSnapshot).toHaveBeenCalledTimes(1)
  })
})
