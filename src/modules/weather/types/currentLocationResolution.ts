import type { WeatherLocation } from '@/modules/weather/types/weather'

export type CurrentLocationResolutionErrorCode =
  | 'permission-denied'
  | 'position-unavailable'
  | 'geolocation-timeout'
  | 'reverse-network'
  | 'reverse-http'
  | 'reverse-contract'
  | 'outside-xiaomi-region'
  | 'xiaomi-no-candidate'
  | 'xiaomi-ambiguous'
  | 'aborted'

export interface ReverseAdministrativeName {
  name: string
  level?: number
  isoCode?: string
  chinaAdminCode?: string
}

export interface ReverseGeocodedLocation {
  latitude: number
  longitude: number
  countryCode: string
  countryName?: string
  principalSubdivision?: string
  principalSubdivisionCode?: string
  city?: string
  locality?: string
  postcode?: string
  chinaAdminCode?: string
  administrativeNames: ReverseAdministrativeName[]
  lookupSource: 'bigdatacloud'
}

export interface CurrentCoordinates {
  latitude: number
  longitude: number
}

export interface RankedXiaomiLocationCandidate {
  location: WeatherLocation
  distanceKm?: number
  score: number
  recommended: boolean
}

export interface XiaomiCurrentLocationResolution {
  reverseLocation: ReverseGeocodedLocation
  queries: string[]
  searchCount: number
  candidates: RankedXiaomiLocationCandidate[]
}
