import type { WeatherProviderId as ProviderWeatherId } from '@/modules/weather/providers/types'

export type WeatherProviderId = ProviderWeatherId

export type WeatherProviderAvailabilityReason =
  | 'feature-disabled'
  | 'unsupported-locale'
  | 'missing-provider-location'
  | 'environment-disabled'
  | 'missing-credential'
  | 'unknown-provider'

export type WeatherProviderAvailability =
  | { available: true }
  | { available: false; reason: WeatherProviderAvailabilityReason }

export type WeatherLocationResolutionState = 'ready' | 'required'

export interface WeatherProviderCapabilities {
  alerts: boolean
  visibility: boolean
  airQuality: boolean
  shortTermPrecipitation?: boolean
}

export interface WeatherProviderPreferences {
  provider: WeatherProviderId
  hasCaiyunToken: boolean
}

export type WeatherProviderStorageError =
  | 'storageUnavailable'
  | 'emptyToken'
  | 'invalidProvider'

export type WeatherProviderMessage =
  | 'providerSaved'
  | 'tokenSaved'
  | 'tokenCleared'
