import type { WeatherSourceId } from '@/modules/weather/types/weatherSources'

export type AirQualityScale = 'us-aqi' | 'european-aqi'
export type UsAqiCategoryId =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'veryUnhealthy'
  | 'hazardous'
export type EuropeanAqiCategoryId =
  | 'good'
  | 'fair'
  | 'moderate'
  | 'poor'
  | 'veryPoor'
  | 'extremelyPoor'
export type AirQualityCategoryId = UsAqiCategoryId | EuropeanAqiCategoryId
export type AirQualityErrorKind =
  | 'network'
  | 'unreadable'
  | 'status'
  | 'serviceRejected'
  | 'incomplete'

export type AirQualityCategoryResult =
  | {
      scale: 'us-aqi'
      categoryId: UsAqiCategoryId
      level: number
    }
  | {
      scale: 'european-aqi'
      categoryId: EuropeanAqiCategoryId
      level: number
    }

export interface AirQualitySnapshot {
  locationId: string
  latitude: number
  longitude: number
  observedAt: string
  fetchedAt: string
  timezone: string
  sourceId: Extract<WeatherSourceId, 'open-meteo'>
  modelSourceId: Extract<WeatherSourceId, 'cams'>
  usAqi: number | null
  europeanAqi: number | null
  pm25: number | null
  pm10: number | null
  ozone: number | null
  nitrogenDioxide: number | null
  sulphurDioxide: number | null
  carbonMonoxide: number | null
  units: {
    pm25: string | null
    pm10: string | null
    ozone: string | null
    nitrogenDioxide: string | null
    sulphurDioxide: string | null
    carbonMonoxide: string | null
  }
}

export interface OpenMeteoAirQualityErrorResponse {
  error: true
  reason: string
}

export interface OpenMeteoAirQualityCurrent {
  time?: unknown
  interval?: unknown
  us_aqi?: unknown
  european_aqi?: unknown
  pm10?: unknown
  pm2_5?: unknown
  carbon_monoxide?: unknown
  nitrogen_dioxide?: unknown
  sulphur_dioxide?: unknown
  ozone?: unknown
}

export interface OpenMeteoAirQualityCurrentUnits {
  time?: unknown
  interval?: unknown
  us_aqi?: unknown
  european_aqi?: unknown
  pm10?: unknown
  pm2_5?: unknown
  carbon_monoxide?: unknown
  nitrogen_dioxide?: unknown
  sulphur_dioxide?: unknown
  ozone?: unknown
}

export interface OpenMeteoAirQualityResponse {
  latitude?: unknown
  longitude?: unknown
  generationtime_ms?: unknown
  utc_offset_seconds?: unknown
  timezone?: unknown
  timezone_abbreviation?: unknown
  current?: OpenMeteoAirQualityCurrent
  current_units?: OpenMeteoAirQualityCurrentUnits
}
