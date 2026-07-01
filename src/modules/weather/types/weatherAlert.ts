export type WeatherAlertTransportProvider = 'caiyun'
export type WeatherAlertStatus =
  | 'ACTIVE_ALERTS'
  | 'SUPPORTED_NO_ACTIVE_ALERTS'
  | 'UNSUPPORTED_BY_PROVIDER'
  | 'UNAVAILABLE'
  | 'ERROR'

export interface WeatherAlert {
  id: string
  provider: WeatherAlertTransportProvider
  title: string
  description: string
  severityLabel: string | null
  status: string | null
  issuingAuthority: string | null
  issuedAt: string | null
  locationLabel: string | null
  locationId: string
}
