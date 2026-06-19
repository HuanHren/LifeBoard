export type WeatherDataDomain =
  | 'forecast'
  | 'current'
  | 'precipitation-nowcast'
  | 'air-quality'
  | 'alerts'
  | 'long-range'
  | 'temperature-normal'
  | 'location'

export type WeatherSourceId = 'open-meteo' | 'caiyun' | 'amap' | 'cams'

export interface WeatherSourceMetadata {
  id: WeatherSourceId
  displayName: string
  domains: readonly WeatherDataDomain[]
  officialUrl?: string
  licenceLabel?: string
  licenceUrl?: string
  requiresUserCredential: boolean
}
