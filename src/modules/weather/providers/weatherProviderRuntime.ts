import type { AppLocale } from '@/i18n/types'
import type {
  ProviderWeatherLocation,
  ProviderWeatherSnapshot,
  WeatherProviderId,
} from '@/modules/weather/providers/types'
import {
  getXiaomiWeatherSnapshot,
  searchXiaomiLocations,
  XiaomiProviderError,
} from '@/modules/weather/providers/xiaomi/xiaomiProvider'
import { fetchCaiyunWeatherForecast } from '@/modules/weather/services/caiyunWeatherService'
import { fetchOpenMeteoForecast } from '@/modules/weather/services/openMeteoService'
import { readCaiyunTokenForRequest } from '@/modules/weather/services/weatherProviderStorage'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import { normalizeCaiyunWeatherForecast } from '@/modules/weather/utils/caiyunWeatherNormalizer'
import { normalizeWeatherForecast } from '@/modules/weather/utils/weatherNormalizer'
import {
  adaptLegacyWeatherSnapshot,
  providerLocationToWeatherLocation,
} from '@/modules/weather/providers/weatherSnapshotAdapters'

export type WeatherProviderRuntimeErrorCategory =
  | 'input'
  | 'eligibility'
  | 'location-resolution'
  | 'network'
  | 'http'
  | 'proxy'
  | 'contract'
  | 'aborted'
  | 'normalization'
  | 'configuration'

export class WeatherProviderRuntimeError extends Error {
  readonly provider: WeatherProviderId
  readonly operation: 'search' | 'forecast'
  readonly category: WeatherProviderRuntimeErrorCategory
  readonly code: string
  override readonly cause?: unknown

  constructor(
    provider: WeatherProviderId,
    operation: 'search' | 'forecast',
    category: WeatherProviderRuntimeErrorCategory,
    code: string,
    message: string,
    cause?: unknown,
  ) {
    super(message)
    this.name = 'WeatherProviderRuntimeError'
    this.provider = provider
    this.operation = operation
    this.category = category
    this.code = code
    this.cause = cause
  }
}

export interface WeatherProviderRuntimeRequest {
  provider: WeatherProviderId
  location: WeatherLocation
  locale: AppLocale
  signal?: AbortSignal
}

export interface WeatherProviderRuntimeDependencies {
  fetchOpenMeteo: typeof fetchOpenMeteoForecast
  fetchCaiyun: typeof fetchCaiyunWeatherForecast
  normalizeOpenMeteo: typeof normalizeWeatherForecast
  normalizeCaiyun: typeof normalizeCaiyunWeatherForecast
  readCaiyunToken: typeof readCaiyunTokenForRequest
  fetchXiaomi: typeof getXiaomiWeatherSnapshot
  searchXiaomi: typeof searchXiaomiLocations
}

const defaultDependencies: WeatherProviderRuntimeDependencies = {
  fetchOpenMeteo: fetchOpenMeteoForecast,
  fetchCaiyun: fetchCaiyunWeatherForecast,
  normalizeOpenMeteo: normalizeWeatherForecast,
  normalizeCaiyun: normalizeCaiyunWeatherForecast,
  readCaiyunToken: readCaiyunTokenForRequest,
  fetchXiaomi: getXiaomiWeatherSnapshot,
  searchXiaomi: searchXiaomiLocations,
}

function toProviderLocation(location: WeatherLocation): ProviderWeatherLocation {
  const providerLocationId = location.providerLocationIds?.xiaomi
  if (!providerLocationId) {
    throw new WeatherProviderRuntimeError(
      'xiaomi',
      'forecast',
      'location-resolution',
      'locationResolutionRequired',
      'Select this city from Xiaomi search before loading Xiaomi Weather.',
    )
  }

  return {
    provider: 'xiaomi',
    providerLocationId,
    name: location.name,
    ...(location.admin1 ? { administrativeArea: location.admin1 } : {}),
    ...(location.country ? { country: location.country } : {}),
    latitude: location.latitude,
    longitude: location.longitude,
    ...(location.timezone && location.timezone !== 'auto'
      ? { timezone: location.timezone }
      : {}),
    kind: location.kind,
    countryCode: location.countryCode,
    elevation: location.elevation,
    ...(location.displayLabel ? { displayLabel: location.displayLabel } : {}),
    providerLocationIds: { ...location.providerLocationIds },
  }
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function wrapRuntimeError(
  provider: WeatherProviderId,
  operation: 'search' | 'forecast',
  error: unknown,
): never {
  if (error instanceof WeatherProviderRuntimeError) throw error

  if (isAbortError(error) || (error instanceof XiaomiProviderError && error.kind === 'aborted')) {
    throw new WeatherProviderRuntimeError(
      provider,
      operation,
      'aborted',
      'requestAborted',
      'The weather request was cancelled.',
      error,
    )
  }

  if (error instanceof XiaomiProviderError) {
    const category = error.kind === 'proxy'
      ? 'proxy'
      : error.kind === 'http'
        ? 'http'
        : error.kind === 'network'
          ? 'network'
          : error.kind === 'input'
            ? 'input'
            : 'contract'

    throw new WeatherProviderRuntimeError(
      provider,
      operation,
      category,
      error.code,
      error.message,
      error,
    )
  }

  throw new WeatherProviderRuntimeError(
    provider,
    operation,
    'network',
    'weatherProviderUnavailable',
    error instanceof Error ? error.message : 'The weather provider is unavailable.',
    error,
  )
}

export function createWeatherProviderRuntime(
  dependencies: WeatherProviderRuntimeDependencies = defaultDependencies,
) {
  const providers: Record<
    WeatherProviderId,
    (request: WeatherProviderRuntimeRequest) => Promise<ProviderWeatherSnapshot>
  > = {
    openMeteo: async ({ location, signal }) => {
      const response = await dependencies.fetchOpenMeteo(location, signal)
      return adaptLegacyWeatherSnapshot(dependencies.normalizeOpenMeteo(response, location))
    },
    caiyun: async ({ location, signal }) => {
      const token = dependencies.readCaiyunToken()
      if (!token.ok) {
        throw new WeatherProviderRuntimeError(
          'caiyun',
          'forecast',
          'configuration',
          'caiyunTokenMissing',
          'Caiyun Weather is selected, but no token is saved. Add one in Settings before loading Caiyun forecasts.',
        )
      }
      const response = await dependencies.fetchCaiyun(location, token.data, signal)
      return adaptLegacyWeatherSnapshot(dependencies.normalizeCaiyun(response, location))
    },
    xiaomi: async ({ location, locale, signal }) => dependencies.fetchXiaomi(
      {
        location: toProviderLocation(location),
        locale,
        days: 15,
      },
      { signal },
    ),
  }

  return {
    async fetchSnapshot(request: WeatherProviderRuntimeRequest) {
      try {
        const provider = providers[request.provider]
        if (!provider) {
          throw new WeatherProviderRuntimeError(
            request.provider,
            'forecast',
            'input',
            'unknownWeatherProvider',
            'The requested weather provider is not registered.',
          )
        }
        return await provider(request)
      } catch (error) {
        return wrapRuntimeError(request.provider, 'forecast', error)
      }
    },
    async searchXiaomi(query: string, signal?: AbortSignal) {
      try {
        const results = await dependencies.searchXiaomi(query, { signal })
        return results.map(providerLocationToWeatherLocation)
      } catch (error) {
        return wrapRuntimeError('xiaomi', 'search', error)
      }
    },
  }
}

export const weatherProviderRuntime = createWeatherProviderRuntime()
