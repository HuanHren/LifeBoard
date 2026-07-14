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
import { XiaomiNormalizationError } from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import {
  CaiyunWeatherServiceError,
  fetchCaiyunWeatherForecast,
} from '@/modules/weather/services/caiyunWeatherService'
import {
  fetchOpenMeteoForecast,
  WeatherServiceError,
} from '@/modules/weather/services/openMeteoService'
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
  | 'timeout'
  | 'http'
  | 'http-recoverable'
  | 'rate-limited'
  | 'proxy'
  | 'contract'
  | 'secret-boundary'
  | 'aborted'
  | 'normalization'
  | 'configuration'

export class WeatherProviderRuntimeError extends Error {
  readonly provider: WeatherProviderId
  readonly operation: 'search' | 'forecast'
  readonly category: WeatherProviderRuntimeErrorCategory
  readonly code: string
  readonly status?: number
  readonly retryAfterMs?: number
  override readonly cause?: unknown

  constructor(
    provider: WeatherProviderId,
    operation: 'search' | 'forecast',
    category: WeatherProviderRuntimeErrorCategory,
    code: string,
    message: string,
    cause?: unknown,
    details: { status?: number; retryAfterMs?: number } = {},
  ) {
    super(message)
    this.name = 'WeatherProviderRuntimeError'
    this.provider = provider
    this.operation = operation
    this.category = category
    this.code = code
    this.cause = cause
    this.status = details.status
    this.retryAfterMs = details.retryAfterMs
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

  if (error instanceof XiaomiNormalizationError) {
    throw new WeatherProviderRuntimeError(
      provider,
      operation,
      error.code === 'secret-detected' ? 'secret-boundary' : 'normalization',
      error.code,
      'The Xiaomi weather response could not be safely normalized.',
      error,
    )
  }

  if (error instanceof XiaomiProviderError) {
    const upstreamStatus = error.upstreamStatus ?? error.status
    const category: WeatherProviderRuntimeErrorCategory = error.code === 'xiaomiResponseSecretLeak'
      ? 'secret-boundary'
      : error.kind === 'proxy'
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
      { status: upstreamStatus, retryAfterMs: error.retryAfterMs },
    )
  }


  if (error instanceof WeatherServiceError || error instanceof CaiyunWeatherServiceError) {
    const category: WeatherProviderRuntimeErrorCategory = error.kind === 'timeout'
      ? 'timeout'
      : error.kind === 'contract'
        ? 'contract'
        : error.kind === 'configuration'
          ? 'configuration'
          : error.status === 429
            ? 'rate-limited'
            : error.kind === 'http' && error.status !== undefined && (
                error.status === 408 || error.status === 425 || error.status >= 500
              )
              ? 'http-recoverable'
              : error.kind === 'http'
                ? 'http'
                : 'network'
    throw new WeatherProviderRuntimeError(
      provider,
      operation,
      category,
      category === 'rate-limited' ? 'weatherRateLimited' : `weather${category}`,
      error.message,
      error,
      { status: error.status, retryAfterMs: error.retryAfterMs },
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
      try {
        return adaptLegacyWeatherSnapshot(dependencies.normalizeOpenMeteo(response, location))
      } catch (error) {
        throw new WeatherProviderRuntimeError(
          'openMeteo', 'forecast', 'normalization', 'openMeteoNormalizationFailed',
          'Open-Meteo returned a forecast that LifeBoard could not normalize.', error,
        )
      }
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
      try {
        return adaptLegacyWeatherSnapshot(dependencies.normalizeCaiyun(response, location))
      } catch (error) {
        throw new WeatherProviderRuntimeError(
          'caiyun', 'forecast', 'normalization', 'caiyunNormalizationFailed',
          'Caiyun returned a forecast that LifeBoard could not normalize.', error,
        )
      }
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
