import {
  WEATHER_AMAP_KEY_STORAGE_KEY,
  WEATHER_AUTO_LOCATION_HOME_STORAGE_KEY,
} from '@/modules/weather/constants/weather'

export type WeatherAmapStorageError = 'storageUnavailable' | 'emptyAmapKey'

export type WeatherAmapMessage =
  | 'amapKeySaved'
  | 'amapKeyCleared'
  | 'autoLocationSaved'

export interface WeatherAmapPreferences {
  hasAmapKey: boolean
  autoLocationOnHome: boolean
}

export type WeatherAmapStorageResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: WeatherAmapStorageError }

function getStorage(): WeatherAmapStorageResult<Storage> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'storageUnavailable' }
  }

  try {
    window.localStorage.length
    return { ok: true, data: window.localStorage }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function loadWeatherAmapPreferences(): WeatherAmapStorageResult<WeatherAmapPreferences> {
  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  try {
    return {
      ok: true,
      data: {
        hasAmapKey: storageResult.data.getItem(WEATHER_AMAP_KEY_STORAGE_KEY) !== null,
        autoLocationOnHome:
          storageResult.data.getItem(WEATHER_AUTO_LOCATION_HOME_STORAGE_KEY) === 'true',
      },
    }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function saveAmapKey(keyInput: string): WeatherAmapStorageResult {
  const key = keyInput.trim()

  if (key.length === 0) {
    return { ok: false, error: 'emptyAmapKey' }
  }

  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  try {
    storageResult.data.setItem(WEATHER_AMAP_KEY_STORAGE_KEY, key)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function clearAmapKey(): WeatherAmapStorageResult {
  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  try {
    storageResult.data.removeItem(WEATHER_AMAP_KEY_STORAGE_KEY)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function saveAutoLocationOnHome(enabled: boolean): WeatherAmapStorageResult {
  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  try {
    storageResult.data.setItem(
      WEATHER_AUTO_LOCATION_HOME_STORAGE_KEY,
      enabled ? 'true' : 'false',
    )
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function readAmapKeyForRequest(): WeatherAmapStorageResult<string> {
  const storageResult = getStorage()
  if (!storageResult.ok) return storageResult

  try {
    const key = storageResult.data.getItem(WEATHER_AMAP_KEY_STORAGE_KEY)

    if (!key) {
      return { ok: false, error: 'emptyAmapKey' }
    }

    return { ok: true, data: key }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}
