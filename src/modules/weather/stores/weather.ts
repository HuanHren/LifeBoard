import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { WEATHER_STORAGE_KEY } from '@/modules/weather/constants/weather'
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
import { fetchWeatherForecastForProvider } from '@/modules/weather/services/weatherForecastProvider'
import type {
  WeatherFavoriteCity,
  WeatherFavoriteMessage,
} from '@/modules/weather/types/weatherFavorites'
import type {
  WeatherProviderId,
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
  normalizeLocation,
} from '@/modules/weather/utils/weatherNormalizer'
import { parseWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof WeatherServiceError || error instanceof Error) {
    return error.message
  }

  return fallback
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
  const searchQuery = shallowRef('')
  const searchResults = shallowRef<WeatherLocation[]>([])
  const weather = shallowRef<WeatherSnapshot | null>(null)
  const searchStatus = shallowRef<WeatherRequestStatus>('idle')
  const forecastStatus = shallowRef<WeatherRequestStatus>('idle')
  const searchError = shallowRef<string | null>(null)
  const forecastError = shallowRef<string | null>(null)
  const favoriteCities = shallowRef<WeatherFavoriteCity[]>([])
  const favoriteMessage = shallowRef<WeatherFavoriteMessage | null>(null)
  const provider = shallowRef<WeatherProviderId>('openMeteo')
  const hasCaiyunToken = shallowRef(false)
  const providerMessage = shallowRef<WeatherProviderMessage | null>(null)
  const providerPersistenceError = shallowRef<WeatherProviderStorageError | null>(null)
  const hasAmapKey = shallowRef(false)
  const autoLocationOnHome = shallowRef(false)
  const amapMessage = shallowRef<WeatherAmapMessage | null>(null)
  const amapPersistenceError = shallowRef<WeatherAmapStorageError | null>(null)
  const searchNotice = shallowRef<'amapMissing' | 'amapUnavailable' | null>(null)
  const lastUpdatedAt = shallowRef<string | null>(null)
  const isInitialized = shallowRef(false)

  let searchController: AbortController | null = null
  let forecastController: AbortController | null = null

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

  async function loadForecast(location = selectedLocation.value) {
    if (!location) {
      return
    }

    forecastController?.abort()

    if (needsCaiyunToken.value) {
      weather.value = null
      forecastStatus.value = 'idle'
      forecastError.value = null
      lastUpdatedAt.value = null
      return
    }

    forecastController = new AbortController()
    forecastStatus.value = 'loading'
    forecastError.value = null
    weather.value = null

    try {
      const snapshot = await fetchWeatherForecastForProvider({
        provider: provider.value,
        location,
        signal: forecastController.signal,
      })
      weather.value = snapshot
      lastUpdatedAt.value = snapshot.fetchedAt
      forecastStatus.value = 'success'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      forecastError.value = getErrorMessage(
        error,
        'The forecast could not be loaded. Please try again.',
      )
      forecastStatus.value = 'error'
    }
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

    selectedLocation.value = storedLocation
    await loadForecast(storedLocation)
  }

  async function searchCities(query: string, locale: AppLocale = 'en-US') {
    searchController?.abort()
    searchController = new AbortController()
    searchQuery.value = query.trim()
    searchStatus.value = 'loading'
    searchError.value = null
    searchNotice.value = null
    searchResults.value = []

    try {
      if (hasAmapKey.value) {
        try {
          const amapResults = await searchAmapLocations(
            searchQuery.value,
            locale,
            searchController.signal,
          )

          if (amapResults.length > 0) {
            searchResults.value = amapResults
            searchStatus.value = 'success'
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
      searchResults.value = results.map(normalizeLocation)
      searchStatus.value = 'success'
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

  async function selectLocation(location: WeatherLocation) {
    if (!persistLocation(location)) {
      return false
    }

    selectedLocation.value = location
    searchResults.value = []
    searchStatus.value = 'idle'
    searchError.value = null
    await loadForecast(location)
    return true
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

    provider.value = nextProvider
    providerPersistenceError.value = null
    providerMessage.value = 'providerSaved'

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
      weather.value = null
      forecastStatus.value = 'idle'
      forecastError.value = null
      lastUpdatedAt.value = null
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
    selectedLocation.value = null
    weather.value = null
    forecastStatus.value = 'idle'
    forecastError.value = null
    lastUpdatedAt.value = null
    searchError.value = null
    return true
  }

  function synchronizeLocation(location: WeatherLocation | null) {
    forecastController?.abort()
    selectedLocation.value = location
    weather.value = null
    forecastStatus.value = 'idle'
    forecastError.value = null
    lastUpdatedAt.value = null
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
  }

  return {
    selectedLocation,
    searchQuery,
    searchResults,
    weather,
    searchStatus,
    forecastStatus,
    searchError,
    forecastError,
    favoriteCities,
    favoriteMessage,
    provider,
    hasCaiyunToken,
    providerMessage,
    providerPersistenceError,
    hasAmapKey,
    autoLocationOnHome,
    amapMessage,
    amapPersistenceError,
    searchNotice,
    lastUpdatedAt,
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
    clearSearchResults,
    resetLocation,
    synchronizeLocation,
    synchronizeFavoriteCities,
    synchronizeProviderPreferences,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWeatherStore, import.meta.hot))
}
