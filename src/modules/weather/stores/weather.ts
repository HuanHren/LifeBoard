import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { WEATHER_STORAGE_KEY } from '@/modules/weather/constants/weather'
import {
  fetchOpenMeteoForecast,
  searchOpenMeteoLocations,
  WeatherServiceError,
} from '@/modules/weather/services/openMeteoService'
import type { OpenMeteoGeocodingResult } from '@/modules/weather/types/openMeteo'
import type {
  WeatherLocation,
  WeatherRequestStatus,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import {
  normalizeLocation,
  normalizeWeatherForecast,
} from '@/modules/weather/utils/weatherNormalizer'
import { parseWeatherLocation } from '@/modules/weather/utils/weatherLocationValidation'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof WeatherServiceError || error instanceof Error) {
    return error.message
  }

  return fallback
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
  const lastUpdatedAt = shallowRef<string | null>(null)
  const isInitialized = shallowRef(false)

  let searchController: AbortController | null = null
  let forecastController: AbortController | null = null

  const hasLocation = computed(() => selectedLocation.value !== null)
  const hasWeather = computed(() => weather.value !== null)
  const isInitialLoading = computed(
    () => forecastStatus.value === 'loading' && weather.value === null,
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

  async function loadForecast(location = selectedLocation.value) {
    if (!location) {
      return
    }

    forecastController?.abort()
    forecastController = new AbortController()
    forecastStatus.value = 'loading'
    forecastError.value = null
    weather.value = null

    try {
      const response = await fetchOpenMeteoForecast(location, forecastController.signal)
      const snapshot = normalizeWeatherForecast(response, location)
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
    const storedLocation = readStoredLocation()

    if (!storedLocation) {
      return
    }

    selectedLocation.value = storedLocation
    await loadForecast(storedLocation)
  }

  async function searchCities(query: string) {
    searchController?.abort()
    searchController = new AbortController()
    searchQuery.value = query.trim()
    searchStatus.value = 'loading'
    searchError.value = null
    searchResults.value = []

    try {
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

  function clearSearchResults() {
    searchController?.abort()
    searchResults.value = []
    searchStatus.value = 'idle'
    searchError.value = null
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
    lastUpdatedAt,
    isInitialized,
    hasLocation,
    hasWeather,
    isInitialLoading,
    initializeWeather,
    searchCities,
    selectLocation,
    selectSearchResult,
    loadForecast,
    clearSearchResults,
    resetLocation,
    synchronizeLocation,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWeatherStore, import.meta.hot))
}
