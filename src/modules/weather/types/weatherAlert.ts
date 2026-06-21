export type WeatherAlertTransportProvider = 'caiyun'

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
