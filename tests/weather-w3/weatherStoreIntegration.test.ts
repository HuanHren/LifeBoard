import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adaptLegacyWeatherSnapshot } from '@/modules/weather/providers/weatherSnapshotAdapters'
import { WeatherProviderRuntimeError } from '@/modules/weather/providers/weatherProviderRuntime'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type { ProviderWeatherSnapshot } from '@/modules/weather/providers/types'
import {
  createLegacySnapshot,
  createXiaomiProviderSnapshot,
  weatherLocation,
  xiaomiWeatherLocation,
} from './fixtures'

const runtime = vi.hoisted(() => ({
  fetchSnapshot: vi.fn(),
  searchXiaomi: vi.fn(),
}))

const openMeteoSearch = vi.hoisted(() => vi.fn())

vi.mock('@/modules/weather/providers/weatherFeatureFlags', () => ({
  xiaomiWeatherEnabled: true,
  isXiaomiWeatherFeatureEnabled: () => true,
}))

vi.mock('@/modules/weather/providers/weatherProviderRuntime', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/modules/weather/providers/weatherProviderRuntime')>()
  return { ...original, weatherProviderRuntime: runtime }
})

vi.mock('@/modules/weather/services/openMeteoService', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/modules/weather/services/openMeteoService')>()
  return { ...original, searchOpenMeteoLocations: openMeteoSearch }
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

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function snapshotFor(provider: 'openMeteo' | 'caiyun' | 'xiaomi'): ProviderWeatherSnapshot {
  return provider === 'xiaomi'
    ? createXiaomiProviderSnapshot()
    : adaptLegacyWeatherSnapshot(createLegacySnapshot(provider))
}

function configureProvider(provider: 'openMeteo' | 'caiyun' | 'xiaomi') {
  window.localStorage.setItem('lifeboard.weather.provider', provider)
}

describe('Weather W3 Store integration', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() })
    setActivePinia(createPinia())
    runtime.fetchSnapshot.mockReset()
    runtime.searchXiaomi.mockReset()
    openMeteoSearch.mockReset()
    runtime.fetchSnapshot.mockImplementation(
      ({ provider }: { provider: 'openMeteo' | 'caiyun' | 'xiaomi' }) =>
        Promise.resolve(snapshotFor(provider)),
    )
    runtime.searchXiaomi.mockResolvedValue([])
    openMeteoSearch.mockResolvedValue([])
  })

  afterEach(() => vi.unstubAllGlobals())

  it('defaults both preferred and effective provider to Open-Meteo', () => {
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    expect(store.preferredProvider).toBe('openMeteo')
    expect(store.effectiveProvider).toBe('openMeteo')
    expect(store.providerAvailability).toEqual({ available: true })
  })

  it('loads Xiaomi through the common provider snapshot and display snapshot lifecycle', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    store.synchronizeLocation(xiaomiWeatherLocation)

    await expect(store.loadForecast()).resolves.toBe(true)
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'xiaomi', locale: 'zh-CN', location: xiaomiWeatherLocation,
    }))
    expect(store.providerSnapshot?.provider).toBe('xiaomi')
    expect(store.weather?.provider).toBe('xiaomi')
    expect(store.weather?.current.temperature).toBe(0)
    expect(store.forecastStatus).toBe('success')
  })

  it('uses explicit Open-Meteo effectiveness when Xiaomi location identity is missing', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    store.synchronizeLocation(weatherLocation)

    expect(store.preferredProvider).toBe('xiaomi')
    expect(store.effectiveProvider).toBe('openMeteo')
    expect(store.locationResolutionState).toBe('required')
    await store.loadForecast()
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'openMeteo',
    }))
    expect(store.weather?.provider).toBe('openMeteo')
  })

  it('does not request Xiaomi for en-US and keeps the preference intact', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.synchronizeLocation(xiaomiWeatherLocation)

    expect(store.preferredProvider).toBe('xiaomi')
    expect(store.effectiveProvider).toBe('openMeteo')
    expect(store.providerAvailability).toEqual({
      available: false, reason: 'unsupported-locale',
    })
    await store.loadForecast()
    expect(runtime.fetchSnapshot).toHaveBeenCalledTimes(1)
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'openMeteo', locale: 'en-US',
    }))
  })

  it('preserves the Xiaomi preference while W5 transparently serves Open-Meteo after a recoverable timeout', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    store.synchronizeLocation(xiaomiWeatherLocation)
    runtime.fetchSnapshot
      .mockRejectedValueOnce(new WeatherProviderRuntimeError(
        'xiaomi', 'forecast', 'proxy', 'xiaomiTimeout', 'Timed out.',
      ))
      .mockRejectedValueOnce(new WeatherProviderRuntimeError(
        'xiaomi', 'forecast', 'proxy', 'xiaomiTimeout', 'Timed out.',
      ))
      .mockResolvedValueOnce(snapshotFor('openMeteo'))

    await expect(store.loadForecast()).resolves.toBe(true)
    expect(runtime.fetchSnapshot).toHaveBeenCalledTimes(3)
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({ provider: 'xiaomi' }))
    expect(runtime.fetchSnapshot).toHaveBeenLastCalledWith(expect.objectContaining({ provider: 'openMeteo' }))
    expect(store.preferredProvider).toBe('xiaomi')
    expect(store.servingProvider).toBe('openMeteo')
    expect(store.fallbackFromProvider).toBe('xiaomi')
    expect(store.refreshError).toMatchObject({ provider: 'xiaomi', code: 'xiaomiTimeout' })
    expect(store.weather?.provider).toBe('openMeteo')
    expect(store.forecastStatus).toBe('success')

    await expect(store.loadForecast()).resolves.toBe(true)
    expect(runtime.fetchSnapshot).toHaveBeenCalledTimes(3)
  })

  it('prevents an older Xiaomi response from replacing a newer Open-Meteo response', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    store.synchronizeLocation(xiaomiWeatherLocation)
    const oldRequest = deferred<ProviderWeatherSnapshot>()
    runtime.fetchSnapshot
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(snapshotFor('openMeteo'))

    const oldLoad = store.loadForecast()
    store.setProvider('openMeteo')
    await vi.waitFor(() => expect(store.weather?.provider).toBe('openMeteo'))
    oldRequest.resolve(snapshotFor('xiaomi'))
    await oldLoad
    expect(store.weather?.provider).toBe('openMeteo')
    expect(store.preferredProvider).toBe('openMeteo')
  })

  it('prevents an older city response from replacing the newer city selection', async () => {
    const store = useWeatherStore()
    store.synchronizeLocation(weatherLocation)
    const cityA = deferred<ProviderWeatherSnapshot>()
    const cityB = {
      ...weatherLocation,
      id: 202,
      name: 'New City',
      latitude: 35,
    }
    runtime.fetchSnapshot
      .mockReturnValueOnce(cityA.promise)
      .mockResolvedValueOnce({
        ...snapshotFor('openMeteo'),
        location: {
          ...snapshotFor('openMeteo').location,
          localId: cityB.id,
          name: cityB.name,
          latitude: cityB.latitude,
        },
      })

    const first = store.loadForecast(weatherLocation)
    await store.loadForecast(cityB)
    cityA.resolve(snapshotFor('openMeteo'))
    await first
    expect(store.weather?.location.name).toBe('New City')
  })

  it('changes from Xiaomi to Open-Meteo when locale becomes unsupported', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    store.synchronizeLocation(xiaomiWeatherLocation)
    await store.loadForecast()
    runtime.fetchSnapshot.mockClear()

    store.setLocale('en-US')
    await vi.waitFor(() => expect(store.weather?.provider).toBe('openMeteo'))
    expect(store.preferredProvider).toBe('xiaomi')
    expect(store.effectiveProvider).toBe('openMeteo')
    expect(runtime.fetchSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'openMeteo', locale: 'en-US',
    }))
  })

  it('deduplicates two quick refreshes for the same provider and location', async () => {
    const store = useWeatherStore()
    store.synchronizeLocation(weatherLocation)
    const request = deferred<ProviderWeatherSnapshot>()
    runtime.fetchSnapshot.mockReturnValue(request.promise)

    const first = store.loadForecast(null, { forceRefresh: true })
    const second = store.loadForecast(null, { forceRefresh: true })
    request.resolve(snapshotFor('openMeteo'))
    await Promise.all([first, second])
    expect(runtime.fetchSnapshot).toHaveBeenCalledTimes(1)
  })

  it('keeps only the latest Xiaomi search response', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    store.setLocale('zh-CN')
    const firstSearch = deferred<typeof xiaomiWeatherLocation[]>()
    runtime.searchXiaomi
      .mockReturnValueOnce(firstSearch.promise)
      .mockResolvedValueOnce([{ ...xiaomiWeatherLocation, id: 'xiaomi:new', name: 'New City' }])

    const first = store.searchCities('Old', 'zh-CN')
    await store.searchCities('New', 'zh-CN')
    firstSearch.resolve([{ ...xiaomiWeatherLocation, id: 'xiaomi:old', name: 'Old City' }])
    await first
    expect(store.searchResults.map((item) => item.name)).toEqual(['New City'])
  })

  it('does not call Xiaomi search when locale is unsupported', async () => {
    configureProvider('xiaomi')
    const store = useWeatherStore()
    store.initializeProviderPreferences()
    await store.searchCities('London', 'en-US')
    expect(runtime.searchXiaomi).not.toHaveBeenCalled()
    expect(openMeteoSearch).toHaveBeenCalledOnce()
    expect(store.searchNotice).toBe('xiaomiUnsupportedLocale')
  })
})
