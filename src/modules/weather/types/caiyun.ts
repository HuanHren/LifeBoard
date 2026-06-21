export interface CaiyunFailureResponse {
  status: 'failed'
  error?: string
  api_version?: string
}

export interface CaiyunWeatherResponse {
  status: 'ok'
  api_version: string
  api_status: string
  lang: string
  unit: string
  tzshift: number
  timezone: string
  server_time: number
  location: [number, number]
  result: {
    realtime: CaiyunRealtime
    minutely?: CaiyunMinutely
    hourly: CaiyunHourly
    daily: CaiyunDaily
    alert?: CaiyunAlert
    primary?: number
    forecast_keypoint?: string
  }
}

export interface CaiyunAlert {
  status?: string
  content?: CaiyunAlertContent[]
}

export interface CaiyunAlertContent {
  title?: string
  description?: string
  status?: string
  code?: string
  source?: string
  pubtimestamp?: number
  alertId?: string
  location?: string
}

export type CaiyunSeries<T> =
  | T[]
  | {
      value?: T[]
    }

export interface CaiyunRealtime {
  status?: string
  temperature: number
  apparent_temperature?: number
  humidity: number
  pressure?: number
  cloudrate?: number
  skycon: CaiyunSkycon
  wind?: CaiyunWind
  precipitation?: {
    local?: {
      intensity?: number
    }
  }
  life_index?: {
    ultraviolet?: {
      index?: number
    }
  }
}

export interface CaiyunMinutely {
  status?: string
  description?: string
  precipitation_2h?: number[]
  precipitation?: number[]
  probability?: number[]
  datasource?: string
}

export interface CaiyunHourly {
  status?: string
  description?: string
  temperature: CaiyunSeries<CaiyunHourlyValue>
  apparent_temperature?: CaiyunSeries<CaiyunHourlyValue>
  precipitation: CaiyunSeries<CaiyunHourlyPrecipitation>
  wind: CaiyunSeries<CaiyunHourlyWind>
  humidity?: CaiyunSeries<CaiyunHourlyValue>
  cloudrate?: CaiyunSeries<CaiyunHourlyValue>
  skycon: CaiyunSeries<CaiyunHourlySkycon>
}

export interface CaiyunDaily {
  status?: string
  astro?: CaiyunSeries<CaiyunDailyAstro>
  precipitation: CaiyunSeries<CaiyunDailyRange>
  temperature: CaiyunSeries<CaiyunDailyRange>
  apparent_temperature?: CaiyunSeries<CaiyunDailyRange>
  wind: CaiyunSeries<CaiyunDailyWind>
  humidity?: CaiyunSeries<CaiyunDailyRange>
  cloudrate?: CaiyunSeries<CaiyunDailyRange>
  skycon: CaiyunSeries<CaiyunDailySkycon>
  life_index?: {
    ultraviolet?: CaiyunSeries<CaiyunDailyLifeIndex>
  }
}

export type CaiyunSkycon =
  | 'CLEAR_DAY'
  | 'CLEAR_NIGHT'
  | 'PARTLY_CLOUDY_DAY'
  | 'PARTLY_CLOUDY_NIGHT'
  | 'CLOUDY'
  | 'LIGHT_HAZE'
  | 'MODERATE_HAZE'
  | 'HEAVY_HAZE'
  | 'LIGHT_RAIN'
  | 'MODERATE_RAIN'
  | 'HEAVY_RAIN'
  | 'STORM_RAIN'
  | 'FOG'
  | 'LIGHT_SNOW'
  | 'MODERATE_SNOW'
  | 'HEAVY_SNOW'
  | 'STORM_SNOW'
  | 'DUST'
  | 'SAND'
  | 'WIND'

export interface CaiyunWind {
  speed: number
  direction: number
}

export interface CaiyunHourlyValue {
  datetime: string
  value: number
}

export interface CaiyunHourlyPrecipitation extends CaiyunHourlyValue {
  probability?: number
}

export interface CaiyunHourlyWind extends CaiyunWind {
  datetime: string
}

export interface CaiyunHourlySkycon {
  datetime: string
  value: CaiyunSkycon
}

export interface CaiyunDailyRange {
  date: string
  max: number
  min: number
  avg: number
  probability?: number
}

export interface CaiyunDailyWind {
  date: string
  max: CaiyunWind
  min: CaiyunWind
  avg: CaiyunWind
}

export interface CaiyunDailySkycon {
  date: string
  value: CaiyunSkycon
}

export interface CaiyunDailyAstro {
  date: string
  sunrise?: {
    time?: string
  }
  sunset?: {
    time?: string
  }
}

export interface CaiyunDailyLifeIndex {
  date: string
  index?: string | number
  desc?: string
}
