import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import {
  WEATHER_SEARCH_CACHE_MS,
  WEATHER_STORAGE_KEY,
} from '@/modules/weather/constants/weather'
import type { AppLocale } from '@/i18n/types'
import {
  reverseGeocodeAmapLocation,
  searchAmapLocations,
} from '@/modules/weather/services/amapGeocodingService'
import {
  clearAmapKey as clearStoredAmapKey,
  loadWeatherAmapPreferences,
  saveAmapKey as saveStoredAmapKey,
  saveAutoLocationOnHome,
  type WeatherAmapMessage,
  type WeatherAmapStorageError,
} from '@/modules/weather/services/weatherAmapStorage'
import {
  loadWeatherFavoritesStorage,
  saveWeatherFavoritesStorage,
} from '@/modules/weather/services/weatherFavoritesStorage'
import {
  clearCaiyunToken as clearStoredCaiyunToken,
  loadWeatherProviderPreferences,
  saveCaiyunToken as saveStoredCaiyunToken,
  saveWeatherProviderPreference,
} from '@/modules/weather/services/weatherProviderStorage'
import {
  searchOpenMeteoLocations,
  WeatherServiceError,
} from '@/modules/weather/services/openMeteoService'
import {
  fetchOpenMeteoAirQuality,
  OpenMeteoAirQualityServiceError,
} from '@/modules/weather/services/openMeteoAirQualityService'
import {
  classifyWeatherCacheFreshness,
  clearWeatherForecastCache,
  createWeatherForecastCacheKey,
  readWeatherForecastCache,
  writeWeatherForecastCache,
  type PersistedWeatherSnapshot,
  type WeatherCacheFreshness,
} from '@/modules/weather/services/weatherForecastCache'
import {
  createLongRangeForecastFromSnapshot,
  fetchLongRangeForecastForProvider,
} from '@/modules/weather/services/weatherForecastProvider'
import type { ProviderWeatherSnapshot } from '@/modules/weather/providers/types'
import { xiaomiWeatherEnabled } from '@/modules/weather/providers/weatherFeatureFlags'
import {
  getEffectiveWeatherProvider,
  getWeatherProviderAvailability,
  isWeatherProviderCacheEnabled,
} from '@/modules/weather/providers/weatherProviderEligibility'
import {
  WeatherProviderRuntimeError,
  weatherProviderRuntime,
} from '@/modules/weather/providers/weatherProviderRuntime'
import { adaptProviderSnapshotForDisplay } from '@/modules/weather/providers/weatherSnapshotAdapters'
import type {
  AirQualityErrorKind,
  AirQualitySnapshot,
} from '@/modules/weather/types/airQuality'
import type {
  LongRangeForecastStatus,
  NormalizedLongRangeForecast,
} from '@/modules/weather/types/longRangeForecast'
import type {
  WeatherFavoriteCity,
  WeatherFavoriteMessage,
} from '@/modules/weather/types/weatherFavorites'
import type {
  WeatherProviderId,
  WeatherProviderAvailability,
  WeatherLocationResolutionState,
  WeatherProviderMessage,
  WeatherProviderStorageError,
} from '@/modules/weather/types/weatherProvider'
import type { OpenMeteoGeocodingResult } from '@/modules/weather/types/openMeteo'
import type {
  WeatherLocation,
  WeatherRequestStatus,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import {
  createWeatherFavoriteCity,
  favoriteCityToWeatherLocation,
  getWeatherFavoriteIdentity,
} from '@/modules/weather/utils/weatherFavoriteIdentity'
import {
  createAirQualityLocationId,
  normalizeOpenMeteoAirQuality,
} from '@/modules/weather/utils/airQualityNormalizer'
import {
  normalizeLocation,
} from '@/modules/weather/utils/weatherNormalizer'
import { parseWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'

const AIR_QUALITY_FRESHNESS_MS = 30 * 60 * 1000
const LONG_RANGE_SESSION_CACHE_MS = 10 * 60 * 1000
const SEARCH_CACHE_LIMIT = 8

type ForecastCacheUiState =
  | 'live'
  | 'refreshing'
  | 'stale'
  | 'offline-stale'
  | 'error-no-data'

interface SearchCacheEntry {
  expiresAt: number
  notice: SearchNotice
  results: WeatherLocation[]
}

type SearchNotice =
  | 'amapMissing'
  | 'amapUnavailable'
  | 'xiaomiUnsupportedLocale'
  | 'xiaomiFeatureDisabled'
  | null

interface LongRangeCacheEntry {
  expiresAt: number
  forecast: NormalizedLongRangeForecast
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof WeatherServiceError || error instanceof Error) {
    return error.message
  }

  return fallback
}

function getAirQualityErrorKind(error: unknown): AirQualityErrorKind {
  if (error instanceof OpenMeteoAirQualityServiceError) {
    return error.kind
  }

  return 'network'
}

function createCurrentLocation({
  latitude,
  longitude,
  fallbackName,
}: {
  latitude: number
  longitude: number
  fallbackName: string
}): WeatherLocation {
  return {
    id: `current-location-${longitude.toFixed(5)}-${latitude.toFixed(5)}`,
    name: fallbackName,
    kind: 'Location',
    admin1: null,
    country: '',
    countryCode: '',
    latitude,
    longitude,
    elevation: null,
    timezone: 'auto',
    displayLabel: fallbackName,
    source: 'amap-geolocation',
  }
}

export const useWeatherStore = defineStore('weather', () => {
  const selectedLocation = shallowRef<WeatherLocation | null>(null)
  const pendingForecastLocation = shallowRef<WeatherLocation | null>(null)
  const searchQuery = shallowRef('')
  const searchResults = shallowRef<WeatherLocation[]>([])
  const weather = shallowRef<WeatherSnapshot | null>(null)
  const providerSnapshot = shallowRef<ProviderWeatherSnapshot | null>(null)
  const searchStatus = shallowRef<WeatherRequestStatus>('idle')
  const forecastStatus = shallowRef<WeatherRequestStatus>('idle')
  const searchError = shallowRef<string | null>(null)
  const forecastError = shallowRef<string | null>(null)
  const airQuality = shallowRef<AirQualitySnapshot | null>(null)
  const airQualityStatus = shallowRef<WeatherRequestStatus>('idle')
  const airQualityError = shallowRef<AirQualityErrorKind | null>(null)
  const airQualityLocationId = shallowRef<string | null>(null)
  const airQualityRequestLocationId = shallowRef<string | null>(null)
  const airQualityFetchedAt = shallowRef<string | null>(null)
  const favoriteCities = shallowRef<WeatherFavoriteCity[]>([])
  const favoriteMessage = shallowRef<WeatherFavoriteMessage | null>(null)
  const provider = shallowRef<WeatherProviderId>('openMeteo')
  const activeLocale = shallowRef<AppLocale>('en-US')
  const providerError = shallowRef<WeatherProviderRuntimeError | null>(null)
  const hasCaiyunToken = shallowRef(false)
  const providerMessage = shallowRef<WeatherProviderMessage | null>(null)
  const providerPersistenceError = shallowRef<WeatherProviderStorageError | null>(null)
  const hasAmapKey = shallowRef(false)
  const autoLocationOnHome = shallowRef(false)
  const amapMessage = shallowRef<WeatherAmapMessage | null>(null)
  const amapPersistenceError = shallowRef<WeatherAmapStorageError | null>(null)
  const searchNotice = shallowRef<SearchNotice>(null)
  const lastUpdatedAt = shallowRef<string | null>(null)
  const forecastCacheState = shallowRef<ForecastCacheUiState>('error-no-data')
  const forecastCacheUpdatedAt = shallowRef<string | null>(null)
  const forecastCacheExpiresAt = shallowRef<string | null>(null)
  const longRangeForecast = shallowRef<NormalizedLongRangeForecast | null>(null)
  const longRangeStatus = shallowRef<LongRangeForecastStatus>('idle')
  const longRangeError = shallowRef<string | null>(null)
  const isInitialized = shallowRef(false)

  let searchController: AbortController | null = null
  let forecastController: AbortController | null = null
  let airQualityController: AbortController | null = null
  let longRangeController: AbortController | null = null
  let forecastRequestId = 0
  let searchRequestId = 0
  let airQualityRequestId = 0
  let longRangeRequestId = 0
  let activeForecastKey: string | null = null
  let activeForecastPromise: Promise<boolean> | null = null
  let activeLongRangeKey: string | null = null
  let activeLongRangePromise: Promise<boolean> | null = null
  const searchCache = new Map<string, SearchCacheEntry>()
  const longRangeSessionCache = new Map<string, LongRangeCacheEntry>()

  const hasLocation = computed(() => selectedLocation.value !== null)
  const hasWeather = computed(() => weather.value !== null)
  const hasSelectedFavorite = computed(() => {
    if (!selectedLocation.value) return false

    const selectedIdentity = getWeatherFavoriteIdentity(selectedLocation.value)
    return favoriteCities.value.some(
      (favorite) => getWeatherFavoriteIdentity(favorite) === selectedIdentity,
    )
  })
  const isInitialLoading = computed(
    () => forecastStatus.value === 'loading' && weather.value === null,
  )
  const needsCaiyunToken = computed(
    () => provider.value === 'caiyun' && !hasCaiyunToken.value,
  )
  const providerAvailability = computed<WeatherProviderAvailability>(() =>
    getWeatherProviderAvailability({
      provider: provider.value,
      locale: activeLocale.value,
      location: selectedLocation.value ?? pendingForecastLocation.value,
      xiaomiEnabled: xiaomiWeatherEnabled,
      hasCaiyunToken: hasCaiyunToken.value,
    }),
  )
  const effectiveProvider = computed<WeatherProviderId>(() =>
    getEffectiveWeatherProvider({
      provider: provider.value,
      locale: activeLocale.value,
      location: selectedLocation.value ?? pendingForecastLocation.value,
      xiaomiEnabled: xiaomiWeatherEnabled,
      hasCaiyunToken: hasCaiyunToken.value,
    }),
  )
  const locationResolutionState = computed<WeatherLocationResolutionState>(() =>
    provider.value === 'xiaomi' &&
    !providerAvailability.value.available &&
    providerAvailability.value.reason === 'missing-provider-location'
      ? 'required'
      : 'ready',
  )
  const displayWeatherLocationId = computed(() =>
    weather.value ? createAirQualityLocationId(weather.value.location) : null,
  )
  const displayAirQuality = computed(() => {
    if (!displayWeatherLocationId.value || !airQuality.value) {
      return null
    }

    return airQuality.value.locationId === displayWeatherLocationId.value
      ? airQuality.value
      : null
  })
  const displayAirQualityStatus = computed<WeatherRequestStatus>(() => {
    if (!displayWeatherLocationId.value) {
      return 'idle'
    }

    if (displayAirQuality.value) {
      return 'success'
    }

    if (
      airQualityStatus.value === 'loading' &&
      airQualityRequestLocationId.value === displayWeatherLocationId.value
    ) {
      return 'loading'
    }

    if (
      airQualityStatus.value === 'error' &&
      airQualityRequestLocationId.value === displayWeatherLocationId.value
    ) {
      return 'error'
    }

    return 'idle'
  })
  const displayAirQualityError = computed(() =>
    displayAirQualityStatus.value === 'error' ? airQualityError.value : null,
  )
  const hasUsableCachedWeather = computed(() =>
    forecastCacheState.value === 'stale' ||
    forecastCacheState.value === 'offline-stale' ||
    forecastCacheState.value === 'refreshing',
  )
  const longRangeLocationKey = computed(() =>
    longRangeForecast.value
      ? createWeatherForecastCacheKey(
        longRangeForecast.value.provider,
        longRangeForecast.value.location,
      )
      : null,
  )

  function hasFreshAirQuality(location: WeatherLocation) {
    const locationId = createAirQualityLocationId(location)

    if (
      !airQuality.value ||
      airQualityStatus.value !== 'success' ||
      airQualityLocationId.value !== locationId ||
      !airQualityFetchedAt.value
    ) {
      return false
    }

    const fetchedTime = Date.parse(airQualityFetchedAt.value)
    return Number.isFinite(fetchedTime) && Date.now() - fetchedTime < AIR_QUALITY_FRESHNESS_MS
  }

  function persistLocation(location: WeatherLocation) {
    if (typeof window === 'undefined') {
      return true
    }

    try {
      window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(location))
      return true
    } catch {
      searchError.value =
        'The selected city could not be saved in this browser. Check local storage access and try again.'
      return false
    }
  }

  function commitForecastCacheState(
    state: ForecastCacheUiState,
    cached?: PersistedWeatherSnapshot | null,
  ) {
    forecastCacheState.value = state
    forecastCacheUpdatedAt.value = cached
      ? new Date(cached.fetchedAt).toISOString()
      : null
    forecastCacheExpiresAt.value = cached
      ? new Date(cached.expiresAt).toISOString()
      : null
  }

  function commitSnapshot(
    snapshot: WeatherSnapshot,
    {
      cacheState = 'live',
      commitSelectedLocation = true,
      cached = null,
      normalizedSnapshot = null,
    }: {
      cacheState?: ForecastCacheUiState
      commitSelectedLocation?: boolean
      cached?: PersistedWeatherSnapshot | null
      normalizedSnapshot?: ProviderWeatherSnapshot | null
    } = {},
  ) {
    if (commitSelectedLocation) {
      selectedLocation.value = snapshot.location
    }

    weather.value = snapshot
    providerSnapshot.value = normalizedSnapshot ?? null
    lastUpdatedAt.value = snapshot.fetchedAt
    forecastStatus.value = 'success'
    pendingForecastLocation.value = null
    commitForecastCacheState(cacheState, cached)
  }

  function restoreCachedForecast(
    cached: PersistedWeatherSnapshot,
    freshness: WeatherCacheFreshness,
    commitSelectedLocation: boolean,
  ) {
    const cacheState: ForecastCacheUiState =
      freshness === 'fresh'
        ? 'live'
        : freshness === 'stale'
          ? 'stale'
          : 'offline-stale'

    commitSnapshot(cached.forecast, {
      cacheState,
      commitSelectedLocation,
      cached,
    })
  }

  function removePersistedLocation() {
    if (typeof window === 'undefined') {
      return true
    }

    try {
      window.localStorage.removeItem(WEATHER_STORAGE_KEY)
      return true
    } catch {
      searchError.value =
        'The selected city could not be cleared from this browser. Check local storage access and try again.'
      return false
    }
  }

  function readStoredLocation() {
    if (typeof window === 'undefined') {
      return null
    }

    let stored: string | null = null

    try {
      stored = window.localStorage.getItem(WEATHER_STORAGE_KEY)
    } catch {
      forecastError.value =
        'The saved city could not be read from this browser. Check local storage access and reload.'
      forecastStatus.value = 'error'
      return null
    }

    if (!stored) {
      return null
    }

    try {
      const parsed: unknown = JSON.parse(stored)

      const location = parseWeatherLocation(parsed)

      if (location) {
        return location
      }
    } catch {
      removePersistedLocation()
      return null
    }

    removePersistedLocation()
    return null
  }

  function initializeFavorites() {
    const result = loadWeatherFavoritesStorage()

    if (result.ok) {
      favoriteCities.value = result.data?.favoriteCities ?? []
      favoriteMessage.value = null
      return
    }

    favoriteCities.value = []
    favoriteMessage.value =
      result.error === 'storageUnavailable' ? 'storageError' : 'invalidStorage'
  }

  function initializeProviderPreferences() {
    const result = loadWeatherProviderPreferences()

    if (result.ok) {
      provider.value = result.data.provider
      hasCaiyunToken.value = result.data.hasCaiyunToken
      providerPersistenceError.value = null
      return
    }

    provider.value = 'openMeteo'
    hasCaiyunToken.value = false
    providerPersistenceError.value = result.error
  }

  function initializeAmapPreferences() {
    const result = loadWeatherAmapPreferences()

    if (result.ok) {
      hasAmapKey.value = result.data.hasAmapKey
      autoLocationOnHome.value = result.data.autoLocationOnHome
      amapPersistenceError.value = null
      return
    }

    hasAmapKey.value = false
    autoLocationOnHome.value = false
    amapPersistenceError.value = result.error
  }

  function commitFavoriteCities(nextFavorites: WeatherFavoriteCity[]) {
    const result = saveWeatherFavoritesStorage(nextFavorites)

    if (!result.ok) {
      favoriteMessage.value = 'storageError'
      return false
    }

    favoriteCities.value = nextFavorites
    return true
  }

  async function loadForecast(
    location: WeatherLocation | null = null,
    options: {
      commitSelectedLocation?: boolean
      forceRefresh?: boolean
      persistLocationOnSuccess?: boolean
    } = {},
  ) {
    const targetLocation =
      location ?? selectedLocation.value ?? pendingForecastLocation.value

    if (!targetLocation) {
      return false
    }

    const commitSelectedLocation = options.commitSelectedLocation ?? true
    const runtimeProvider = getEffectiveWeatherProvider({
      provider: provider.value,
      locale: activeLocale.value,
      location: targetLocation,
      xiaomiEnabled: xiaomiWeatherEnabled,
      hasCaiyunToken: hasCaiyunToken.value,
    })
    const cacheKey = createWeatherForecastCacheKey(runtimeProvider, targetLocation)
    const cacheEnabled = isWeatherProviderCacheEnabled(runtimeProvider)

    if (activeForecastKey === cacheKey && activeForecastPromise) {
      return activeForecastPromise
    }

    const cachedResult = cacheEnabled
      ? readWeatherForecastCache(cacheKey)
      : { ok: true as const, data: null }
    const cached = cachedResult.ok ? cachedResult.data : null
    const cacheFreshness = cached ? classifyWeatherCacheFreshness(cached) : null

    if (!options.forceRefresh && cached && cacheFreshness === 'fresh') {
      restoreCachedForecast(cached, 'fresh', commitSelectedLocation)
      return true
    }

    if (!options.forceRefresh && cached && cacheFreshness === 'stale') {
      restoreCachedForecast(cached, 'stale', commitSelectedLocation)
      forecastStatus.value = 'loading'
      forecastError.value = null
      forecastCacheState.value = 'refreshing'
    }

    const requestId = ++forecastRequestId
    pendingForecastLocation.value = targetLocation
    forecastController?.abort()

    if (needsCaiyunToken.value) {
      forecastStatus.value = weather.value ? 'error' : 'idle'
      forecastError.value = weather.value
        ? 'Caiyun Weather is selected, but no token is saved. Add one in Settings before loading Caiyun forecasts.'
        : null

      if (!weather.value && commitSelectedLocation) {
        selectedLocation.value = targetLocation
      }

      return false
    }

    forecastController = new AbortController()
    const signal = forecastController.signal
    if (!weather.value || cacheFreshness !== 'stale') {
      forecastStatus.value = 'loading'
    }
    forecastError.value = null
    providerError.value = null

    activeForecastKey = cacheKey
    activeForecastPromise = (async () => {
      try {
        const normalizedSnapshot = await weatherProviderRuntime.fetchSnapshot({
          provider: runtimeProvider,
          location: targetLocation,
          locale: activeLocale.value,
          signal,
        })
        const snapshot = adaptProviderSnapshotForDisplay(normalizedSnapshot)

        if (requestId !== forecastRequestId) {
          return false
        }

        if (options.persistLocationOnSuccess && !persistLocation(snapshot.location)) {
          forecastStatus.value = 'error'
          return false
        }

        if (cacheEnabled) {
          const nextCacheKey = createWeatherForecastCacheKey(runtimeProvider, snapshot.location)
          writeWeatherForecastCache(nextCacheKey, snapshot)
        }
        commitSnapshot(snapshot, { commitSelectedLocation, normalizedSnapshot })
        return true
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false
        }

        if (requestId !== forecastRequestId) {
          return false
        }

        if (error instanceof WeatherProviderRuntimeError) {
          providerError.value = error
        }

        if (cached && cacheFreshness === 'expired' && !weather.value) {
          restoreCachedForecast(cached, 'expired', commitSelectedLocation)
        }

        forecastError.value = getErrorMessage(
          error,
          'The forecast could not be loaded. Please try again.',
        )
        forecastStatus.value = 'error'
        forecastCacheState.value = weather.value ? 'offline-stale' : 'error-no-data'
        return false
      } finally {
        if (activeForecastKey === cacheKey) {
          activeForecastKey = null
          activeForecastPromise = null
        }
      }
    })()

    return activeForecastPromise
  }

  async function loadAirQuality(
    location = selectedLocation.value,
    options: { force?: boolean } = {},
  ) {
    if (!location) {
      return
    }

    const requestLocationId = createAirQualityLocationId(location)

    if (!options.force && hasFreshAirQuality(location)) {
      return
    }

    const requestId = ++airQualityRequestId
    airQualityController?.abort()
    airQualityController = new AbortController()
    const signal = airQualityController.signal
    airQualityRequestLocationId.value = requestLocationId
    airQualityStatus.value = 'loading'
    airQualityError.value = null

    try {
      const response = await fetchOpenMeteoAirQuality(
        location,
        signal,
      )
      const snapshot = normalizeOpenMeteoAirQuality(response, location)

      if (
        requestId !== airQualityRequestId ||
        !weather.value ||
        createAirQualityLocationId(weather.value.location) !== requestLocationId
      ) {
        return
      }

      airQuality.value = snapshot
      airQualityLocationId.value = requestLocationId
      airQualityFetchedAt.value = snapshot.fetchedAt
      airQualityStatus.value = 'success'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      if (
        requestId !== airQualityRequestId ||
        !weather.value ||
        createAirQualityLocationId(weather.value.location) !== requestLocationId
      ) {
        return
      }

      airQualityError.value = getAirQualityErrorKind(error)
      airQualityStatus.value = 'error'
    }
  }

  function retryAirQuality() {
    return loadAirQuality(weather.value?.location ?? selectedLocation.value, { force: true })
  }

  function clearAirQuality() {
    airQualityController?.abort()
    airQuality.value = null
    airQualityStatus.value = 'idle'
    airQualityError.value = null
    airQualityLocationId.value = null
    airQualityRequestLocationId.value = null
    airQualityFetchedAt.value = null
  }

  function commitLongRangeForecast(forecast: NormalizedLongRangeForecast) {
    longRangeForecast.value = forecast
    longRangeStatus.value = forecast.daily.length > 0 ? 'success' : 'empty'
    longRangeError.value = null
  }

  function clearLongRangeForecast(options: { keepForecast?: boolean } = {}) {
    longRangeController?.abort()
    longRangeRequestId += 1
    activeLongRangeKey = null
    activeLongRangePromise = null
    longRangeStatus.value = options.keepForecast && longRangeForecast.value ? 'success' : 'idle'
    longRangeError.value = null

    if (!options.keepForecast) {
      longRangeForecast.value = null
    }
  }

  function getActiveLongRangeLocation(location: WeatherLocation | null = null) {
    return location ?? weather.value?.location ?? selectedLocation.value
  }

  async function loadLongRangeForecast(
    location: WeatherLocation | null = null,
    options: { forceRefresh?: boolean } = {},
  ) {
    const targetLocation = getActiveLongRangeLocation(location)

    if (!targetLocation) {
      clearLongRangeForecast()
      return false
    }

    const runtimeProvider = getEffectiveWeatherProvider({
      provider: provider.value,
      locale: activeLocale.value,
      location: targetLocation,
      xiaomiEnabled: xiaomiWeatherEnabled,
      hasCaiyunToken: hasCaiyunToken.value,
    })
    const cacheKey = createWeatherForecastCacheKey(runtimeProvider, targetLocation)
    const cacheEnabled = isWeatherProviderCacheEnabled(runtimeProvider)

    if (activeLongRangeKey === cacheKey && activeLongRangePromise) {
      return activeLongRangePromise
    }

    if (
      !options.forceRefresh &&
      weather.value?.provider === runtimeProvider &&
      createWeatherForecastCacheKey(weather.value.provider, weather.value.location) === cacheKey &&
      weather.value.daily.length > 0
    ) {
      const forecast = createLongRangeForecastFromSnapshot(weather.value)
      if (cacheEnabled) {
        longRangeSessionCache.set(cacheKey, {
          expiresAt: Date.now() + LONG_RANGE_SESSION_CACHE_MS,
          forecast,
        })
      }
      commitLongRangeForecast(forecast)
      return true
    }

    const cached = cacheEnabled ? longRangeSessionCache.get(cacheKey) : undefined

    if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) {
      commitLongRangeForecast(cached.forecast)
      return true
    }

    const requestId = ++longRangeRequestId
    longRangeController?.abort()
    longRangeController = new AbortController()
    const signal = longRangeController.signal
    longRangeStatus.value = 'loading'
    longRangeError.value = null
    activeLongRangeKey = cacheKey

    activeLongRangePromise = (async () => {
      try {
        const result = await fetchLongRangeForecastForProvider({
          provider: runtimeProvider,
          location: targetLocation,
          locale: activeLocale.value,
          signal,
        })

        if (
          requestId !== longRangeRequestId ||
          createWeatherForecastCacheKey(runtimeProvider, targetLocation) !== cacheKey
        ) {
          return false
        }

        if (!result.supported) {
          longRangeStatus.value = 'unsupported'
          longRangeError.value = null
          return false
        }

        if (cacheEnabled) {
          longRangeSessionCache.set(cacheKey, {
            expiresAt: Date.now() + LONG_RANGE_SESSION_CACHE_MS,
            forecast: result.forecast,
          })
        }
        commitLongRangeForecast(result.forecast)
        return true
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false
        }

        if (
          requestId !== longRangeRequestId ||
          createWeatherForecastCacheKey(runtimeProvider, targetLocation) !== cacheKey
        ) {
          return false
        }

        longRangeError.value = getErrorMessage(
          error,
          'The forecast could not be loaded. Please try again.',
        )
        longRangeStatus.value = 'error'
        return false
      } finally {
        if (activeLongRangeKey === cacheKey) {
          activeLongRangeKey = null
          activeLongRangePromise = null
        }
      }
    })()

    return activeLongRangePromise
  }

  async function initializeWeather() {
    if (isInitialized.value) {
      return
    }

    isInitialized.value = true
    initializeFavorites()
    initializeProviderPreferences()
    initializeAmapPreferences()
    const storedLocation = readStoredLocation()

    if (!storedLocation) {
      return
    }

    const loaded = await loadForecast(storedLocation, {
      commitSelectedLocation: true,
    })

    if (loaded) {
      void loadAirQuality(weather.value?.location ?? storedLocation)
    }
  }

  async function searchCities(query: string, locale: AppLocale = 'en-US') {
    activeLocale.value = locale
    searchController?.abort()
    searchController = new AbortController()
    const requestId = ++searchRequestId
    searchQuery.value = query.trim()
    const xiaomiSearchAvailability = getWeatherProviderAvailability({
      provider: 'xiaomi',
      locale,
      xiaomiEnabled: xiaomiWeatherEnabled,
      requireLocation: false,
    })
    const searchProvider = provider.value === 'xiaomi' && xiaomiSearchAvailability.available
      ? 'xiaomi'
      : hasAmapKey.value
        ? 'amap'
        : 'openMeteo'
    const cacheKey = `${locale}|${searchProvider}|${searchQuery.value.toLocaleLowerCase()}`
    const cached = searchCache.get(cacheKey)

    if (cached && cached.expiresAt > Date.now()) {
      searchNotice.value = cached.notice
      searchResults.value = cached.results
      searchStatus.value = 'success'
      searchError.value = null
      return
    }

    searchStatus.value = 'loading'
    searchError.value = null
    searchNotice.value = null
    searchResults.value = []

    try {
      if (provider.value === 'xiaomi' && xiaomiSearchAvailability.available) {
        const results = await weatherProviderRuntime.searchXiaomi(
          searchQuery.value,
          searchController.signal,
        )
        if (requestId !== searchRequestId) return
        searchResults.value = results
        searchStatus.value = 'success'
        searchCache.set(cacheKey, {
          expiresAt: Date.now() + WEATHER_SEARCH_CACHE_MS,
          notice: null,
          results,
        })
        trimSearchCache()
        return
      }

      if (provider.value === 'xiaomi' && !xiaomiSearchAvailability.available) {
        searchNotice.value = xiaomiSearchAvailability.reason === 'unsupported-locale'
          ? 'xiaomiUnsupportedLocale'
          : 'xiaomiFeatureDisabled'
        const results = await searchOpenMeteoLocations(searchQuery.value, searchController.signal)
        if (requestId !== searchRequestId) return
        searchResults.value = results.map(normalizeLocation)
        searchStatus.value = 'success'
        searchCache.set(cacheKey, {
          expiresAt: Date.now() + WEATHER_SEARCH_CACHE_MS,
          notice: searchNotice.value,
          results: searchResults.value,
        })
        trimSearchCache()
        return
      }

      if (hasAmapKey.value) {
        try {
          const amapResults = await searchAmapLocations(
            searchQuery.value,
            locale,
            searchController.signal,
          )

          if (amapResults.length > 0) {
            if (requestId !== searchRequestId) return
            searchResults.value = amapResults
            searchStatus.value = 'success'
            searchCache.set(cacheKey, {
              expiresAt: Date.now() + WEATHER_SEARCH_CACHE_MS,
              notice: searchNotice.value,
              results: amapResults,
            })
            trimSearchCache()
            return
          }

          searchNotice.value = 'amapUnavailable'
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }

          searchNotice.value = 'amapUnavailable'
        }
      } else {
        searchNotice.value = 'amapMissing'
      }

      const results = await searchOpenMeteoLocations(searchQuery.value, searchController.signal)
      if (requestId !== searchRequestId) return
      searchResults.value = results.map(normalizeLocation)
      searchStatus.value = 'success'
      searchCache.set(cacheKey, {
        expiresAt: Date.now() + WEATHER_SEARCH_CACHE_MS,
        notice: searchNotice.value,
        results: searchResults.value,
      })
      trimSearchCache()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      searchError.value = getErrorMessage(
        error,
        'City search is unavailable. Please try again.',
      )
      searchStatus.value = 'error'
    }
  }

  function trimSearchCache() {
    while (searchCache.size > SEARCH_CACHE_LIMIT) {
      const firstKey = searchCache.keys().next().value
      if (!firstKey) return
      searchCache.delete(firstKey)
    }
  }

  async function selectLocation(location: WeatherLocation) {
    searchResults.value = []
    searchStatus.value = 'idle'
    searchError.value = null
    const loaded = await loadForecast(location, {
      commitSelectedLocation: true,
      persistLocationOnSuccess: true,
    })

    if (loaded) {
      void loadAirQuality(weather.value?.location ?? location)
    }

    return loaded
  }

  function selectSearchResult(result: OpenMeteoGeocodingResult) {
    return selectLocation(normalizeLocation(result))
  }

  function addSelectedLocationToFavorites() {
    if (!selectedLocation.value) {
      return false
    }

    const selectedIdentity = getWeatherFavoriteIdentity(selectedLocation.value)
    const alreadySaved = favoriteCities.value.some(
      (favorite) => getWeatherFavoriteIdentity(favorite) === selectedIdentity,
    )

    if (alreadySaved) {
      favoriteMessage.value = 'duplicate'
      return false
    }

    const nextFavorite = createWeatherFavoriteCity(selectedLocation.value)
    const saved = commitFavoriteCities([...favoriteCities.value, nextFavorite])

    if (saved) {
      favoriteMessage.value = 'saved'
    }

    return saved
  }

  function removeFavoriteCity(favoriteId: string) {
    const nextFavorites = favoriteCities.value.filter(
      (favorite) => favorite.id !== favoriteId,
    )

    if (nextFavorites.length === favoriteCities.value.length) {
      return false
    }

    const saved = commitFavoriteCities(nextFavorites)

    if (saved) {
      favoriteMessage.value = 'removed'
    }

    return saved
  }

  async function selectFavoriteCity(favorite: WeatherFavoriteCity) {
    return selectLocation(favoriteCityToWeatherLocation(favorite))
  }

  function clearFavoriteMessage() {
    favoriteMessage.value = null
  }

  function setProvider(nextProvider: WeatherProviderId) {
    const result = saveWeatherProviderPreference(nextProvider)

    if (!result.ok) {
      providerPersistenceError.value = result.error
      providerMessage.value = null
      return false
    }

    forecastController?.abort()
    forecastRequestId += 1
    provider.value = nextProvider
    providerError.value = null
    providerPersistenceError.value = null
    providerMessage.value = 'providerSaved'
    clearLongRangeForecast()

    if (selectedLocation.value) {
      void loadForecast(selectedLocation.value)
    }

    return true
  }

  function saveCaiyunToken(tokenInput: string) {
    const result = saveStoredCaiyunToken(tokenInput)

    if (!result.ok) {
      providerPersistenceError.value = result.error
      providerMessage.value = null
      return false
    }

    hasCaiyunToken.value = true
    providerPersistenceError.value = null
    providerMessage.value = 'tokenSaved'

    if (provider.value === 'caiyun' && selectedLocation.value) {
      void loadForecast(selectedLocation.value)
    }

    return true
  }

  function clearCaiyunToken() {
    const result = clearStoredCaiyunToken()

    if (!result.ok) {
      providerPersistenceError.value = result.error
      providerMessage.value = null
      return false
    }

    hasCaiyunToken.value = false
    providerPersistenceError.value = null
    providerMessage.value = 'tokenCleared'

    if (provider.value === 'caiyun') {
      forecastController?.abort()
      forecastRequestId += 1
      pendingForecastLocation.value = null
      clearLongRangeForecast()
      forecastStatus.value = weather.value ? 'error' : 'idle'
      forecastError.value = weather.value
        ? 'Caiyun Weather is selected, but no token is saved. Add one in Settings before loading Caiyun forecasts.'
        : null
    }

    return true
  }

  function clearProviderMessage() {
    providerMessage.value = null
    providerPersistenceError.value = null
  }

  function saveAmapKey(keyInput: string) {
    const result = saveStoredAmapKey(keyInput)

    if (!result.ok) {
      amapPersistenceError.value = result.error
      amapMessage.value = null
      return false
    }

    hasAmapKey.value = true
    amapPersistenceError.value = null
    amapMessage.value = 'amapKeySaved'
    return true
  }

  function clearAmapKey() {
    const result = clearStoredAmapKey()

    if (!result.ok) {
      amapPersistenceError.value = result.error
      amapMessage.value = null
      return false
    }

    hasAmapKey.value = false
    amapPersistenceError.value = null
    amapMessage.value = 'amapKeyCleared'
    return true
  }

  function setAutoLocationOnHome(enabled: boolean) {
    const result = saveAutoLocationOnHome(enabled)

    if (!result.ok) {
      amapPersistenceError.value = result.error
      amapMessage.value = null
      return false
    }

    autoLocationOnHome.value = enabled
    amapPersistenceError.value = null
    amapMessage.value = 'autoLocationSaved'
    return true
  }

  function clearAmapMessage() {
    amapMessage.value = null
    amapPersistenceError.value = null
  }

  async function selectCurrentCoordinates({
    latitude,
    longitude,
    locale,
    fallbackName,
  }: {
    latitude: number
    longitude: number
    locale: AppLocale
    fallbackName: string
  }) {
    let location = createCurrentLocation({ latitude, longitude, fallbackName })

    if (hasAmapKey.value) {
      try {
        location = await reverseGeocodeAmapLocation(longitude, latitude, locale)
      } catch {
        amapMessage.value = null
        amapPersistenceError.value = null
      }
    }

    return selectLocation(location)
  }

  function clearSearchResults() {
    searchController?.abort()
    searchRequestId += 1
    searchResults.value = []
    searchStatus.value = 'idle'
    searchError.value = null
    searchNotice.value = null
  }

  function resetLocation() {
    if (!removePersistedLocation()) {
      return false
    }

    forecastController?.abort()
    clearAirQuality()
    clearWeatherForecastCache()
    selectedLocation.value = null
    weather.value = null
    providerSnapshot.value = null
    providerError.value = null
    forecastStatus.value = 'idle'
    forecastError.value = null
    lastUpdatedAt.value = null
    commitForecastCacheState('error-no-data')
    searchError.value = null
    pendingForecastLocation.value = null
    clearLongRangeForecast()
    return true
  }

  function synchronizeLocation(location: WeatherLocation | null) {
    forecastController?.abort()
    clearAirQuality()
    selectedLocation.value = location
    weather.value = null
    providerSnapshot.value = null
    providerError.value = null
    forecastStatus.value = 'idle'
    forecastError.value = null
    lastUpdatedAt.value = null
    commitForecastCacheState('error-no-data')
    pendingForecastLocation.value = null
    clearLongRangeForecast()
    favoriteMessage.value = null
    searchNotice.value = null
  }

  function synchronizeFavoriteCities(nextFavorites: WeatherFavoriteCity[]) {
    favoriteCities.value = [...nextFavorites]
    favoriteMessage.value = null
  }

  function synchronizeProviderPreferences(nextProvider: WeatherProviderId) {
    provider.value = nextProvider
    hasCaiyunToken.value = false
    providerMessage.value = null
    providerPersistenceError.value = null
    amapMessage.value = null
    amapPersistenceError.value = null
    clearLongRangeForecast()
  }

  function setLocale(nextLocale: AppLocale) {
    if (activeLocale.value === nextLocale) return

    activeLocale.value = nextLocale
    searchController?.abort()
    searchRequestId += 1
    searchResults.value = []
    searchStatus.value = 'idle'
    searchNotice.value = null
    forecastController?.abort()
    forecastRequestId += 1
    providerError.value = null

    if (selectedLocation.value) {
      void loadForecast(selectedLocation.value)
    }
  }

  return {
    selectedLocation,
    searchQuery,
    searchResults,
    weather,
    providerSnapshot,
    searchStatus,
    forecastStatus,
    searchError,
    forecastError,
    airQuality,
    airQualityStatus,
    airQualityError,
    airQualityLocationId,
    airQualityRequestLocationId,
    airQualityFetchedAt,
    displayAirQuality,
    displayAirQualityStatus,
    displayAirQualityError,
    favoriteCities,
    favoriteMessage,
    provider,
    preferredProvider: provider,
    effectiveProvider,
    providerAvailability,
    providerError,
    locationResolutionState,
    xiaomiWeatherEnabled,
    activeLocale,
    hasCaiyunToken,
    providerMessage,
    providerPersistenceError,
    hasAmapKey,
    autoLocationOnHome,
    amapMessage,
    amapPersistenceError,
    searchNotice,
    lastUpdatedAt,
    forecastCacheState,
    forecastCacheUpdatedAt,
    forecastCacheExpiresAt,
    longRangeForecast,
    longRangeStatus,
    longRangeError,
    longRangeLocationKey,
    hasUsableCachedWeather,
    isInitialized,
    hasLocation,
    hasWeather,
    hasSelectedFavorite,
    isInitialLoading,
    needsCaiyunToken,
    initializeWeather,
    initializeProviderPreferences,
    initializeAmapPreferences,
    searchCities,
    selectLocation,
    selectSearchResult,
    addSelectedLocationToFavorites,
    removeFavoriteCity,
    selectFavoriteCity,
    clearFavoriteMessage,
    setProvider,
    saveCaiyunToken,
    clearCaiyunToken,
    clearProviderMessage,
    saveAmapKey,
    clearAmapKey,
    setAutoLocationOnHome,
    clearAmapMessage,
    selectCurrentCoordinates,
    loadForecast,
    loadLongRangeForecast,
    clearLongRangeForecast,
    loadAirQuality,
    retryAirQuality,
    clearAirQuality,
    clearSearchResults,
    resetLocation,
    synchronizeLocation,
    synchronizeFavoriteCities,
    synchronizeProviderPreferences,
    setLocale,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWeatherStore, import.meta.hot))
}
