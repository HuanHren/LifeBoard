import {
  WEATHER_CAIYUN_TOKEN_STORAGE_KEY,
  WEATHER_PROVIDER_STORAGE_KEY,
} from '@/modules/weather/constants/weather'
import type {
  WeatherProviderId,
  WeatherProviderPreferences,
  WeatherProviderStorageError,
} from '@/modules/weather/types/weatherProvider'

export type WeatherProviderStorageResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: WeatherProviderStorageError }

export function isWeatherProviderId(value: unknown): value is WeatherProviderId {
  return value === 'openMeteo' || value === 'caiyun'
}

function getStorage(): WeatherProviderStorageResult<Storage> {
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

export function loadWeatherProviderPreferences(): WeatherProviderStorageResult<WeatherProviderPreferences> {
  const storageResult = getStorage()

  if (!storageResult.ok) {
    return { ok: false, error: storageResult.error }
  }

  try {
    const storedProvider = storageResult.data.getItem(WEATHER_PROVIDER_STORAGE_KEY)
    const provider = storedProvider === null ? 'openMeteo' : storedProvider

    if (!isWeatherProviderId(provider)) {
      return { ok: false, error: 'invalidProvider' }
    }

    return {
      ok: true,
      data: {
        provider,
        hasCaiyunToken:
          storageResult.data.getItem(WEATHER_CAIYUN_TOKEN_STORAGE_KEY) !== null,
      },
    }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function saveWeatherProviderPreference(
  provider: WeatherProviderId,
): WeatherProviderStorageResult {
  const storageResult = getStorage()

  if (!storageResult.ok) {
    return storageResult
  }

  try {
    storageResult.data.setItem(WEATHER_PROVIDER_STORAGE_KEY, provider)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function saveCaiyunToken(tokenInput: string): WeatherProviderStorageResult {
  const token = tokenInput.trim()

  if (token.length === 0) {
    return { ok: false, error: 'emptyToken' }
  }

  const storageResult = getStorage()

  if (!storageResult.ok) {
    return storageResult
  }

  try {
    storageResult.data.setItem(WEATHER_CAIYUN_TOKEN_STORAGE_KEY, token)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function clearCaiyunToken(): WeatherProviderStorageResult {
  const storageResult = getStorage()

  if (!storageResult.ok) {
    return storageResult
  }

  try {
    storageResult.data.removeItem(WEATHER_CAIYUN_TOKEN_STORAGE_KEY)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}

export function readCaiyunTokenForRequest(): WeatherProviderStorageResult<string> {
  const storageResult = getStorage()

  if (!storageResult.ok) {
    return storageResult
  }

  try {
    const token = storageResult.data.getItem(WEATHER_CAIYUN_TOKEN_STORAGE_KEY)

    if (!token) {
      return { ok: false, error: 'emptyToken' }
    }

    return { ok: true, data: token }
  } catch {
    return { ok: false, error: 'storageUnavailable' }
  }
}
