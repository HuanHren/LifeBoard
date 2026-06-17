export type WeatherProviderId = 'openMeteo' | 'caiyun'

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
