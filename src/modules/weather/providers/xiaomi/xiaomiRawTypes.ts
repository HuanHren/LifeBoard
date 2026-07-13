import type { WeatherCapabilityMap } from '@/modules/weather/providers/types'

export interface XiaomiSearchResultRaw {
  affiliation?: unknown
  key?: unknown
  latitude?: unknown
  locationKey?: unknown
  longitude?: unknown
  name?: unknown
  timeZoneShift?: unknown
}

export interface XiaomiUnitValueRaw {
  unit?: unknown
  value?: unknown
}

export interface XiaomiCurrentRaw {
  feelsLike?: XiaomiUnitValueRaw
  humidity?: XiaomiUnitValueRaw
  pressure?: XiaomiUnitValueRaw
  pubTime?: unknown
  temperature?: XiaomiUnitValueRaw
  uvIndex?: unknown
  visibility?: XiaomiUnitValueRaw
  weather?: unknown
  wind?: {
    direction?: XiaomiUnitValueRaw
    speed?: XiaomiUnitValueRaw
  }
}

export interface XiaomiHourlyWindRaw {
  datetime?: unknown
  direction?: unknown
  speed?: unknown
}

export interface XiaomiHourlyRaw {
  temperature?: { pubTime?: unknown; status?: unknown; unit?: unknown; value?: unknown }
  weather?: { pubTime?: unknown; status?: unknown; value?: unknown }
  precipitationProbability?: { desc?: unknown; pubTime?: unknown; status?: unknown; value?: unknown }
  wind?: { status?: unknown; value?: unknown }
  aqi?: { pubTime?: unknown; status?: unknown; value?: unknown; brandInfo?: unknown }
  desc?: unknown
  status?: unknown
}

export interface XiaomiDailyPairRaw {
  from?: unknown
  to?: unknown
}

export interface XiaomiDailyRaw {
  pubTime?: unknown
  status?: unknown
  temperature?: { status?: unknown; unit?: unknown; value?: unknown }
  weather?: { status?: unknown; value?: unknown }
  precipitationProbability?: { status?: unknown; value?: unknown }
  sunRiseSet?: { status?: unknown; value?: unknown }
  wind?: {
    direction?: { status?: unknown; unit?: unknown; value?: unknown }
    speed?: { status?: unknown; unit?: unknown; value?: unknown }
  }
  aqi?: { pubTime?: unknown; status?: unknown; value?: unknown; brandInfo?: unknown }
  moonPhase?: unknown
}

export interface XiaomiAqiRaw {
  aqi?: unknown
  pubTime?: unknown
  status?: unknown
  brandInfo?: unknown
  [key: string]: unknown
}

export interface XiaomiWeatherAllRaw {
  current?: XiaomiCurrentRaw | null
  forecastHourly?: XiaomiHourlyRaw | null
  forecastDaily?: XiaomiDailyRaw | null
  aqi?: XiaomiAqiRaw | null
  minutely?: unknown
  alerts?: unknown
  indices?: unknown
  typhoon?: unknown
  yesterday?: unknown
  preHour?: unknown
  sourceMaps?: unknown
  brandInfo?: unknown
  updateTime?: unknown
  [key: string]: unknown
}

export interface XiaomiProxyMeta {
  receivedAt: string
  upstreamStatus: number
  capabilities?: WeatherCapabilityMap
}

export interface XiaomiProxySuccess<TData, TOperation extends 'search' | 'all'> {
  ok: true
  provider: 'xiaomi'
  operation: TOperation
  data: TData
  meta: XiaomiProxyMeta
}

export interface XiaomiProxyFailure {
  ok: false
  error: {
    code: string
    upstreamStatus?: number
  }
}

export interface XiaomiSearchData {
  results: XiaomiSearchResultRaw[]
}

export type XiaomiSearchProxySuccess = XiaomiProxySuccess<XiaomiSearchData, 'search'>
export type XiaomiAllProxySuccess = XiaomiProxySuccess<XiaomiWeatherAllRaw, 'all'>

export interface XiaomiWeatherExtensions {
  minutely?: unknown
  alerts?: unknown
  indices?: unknown
  typhoon?: unknown
  yesterday?: unknown
  preHour?: unknown
  sourceMaps?: unknown
  brandInfo?: unknown
}
