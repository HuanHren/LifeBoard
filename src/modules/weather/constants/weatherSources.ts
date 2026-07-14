import type { WeatherDataProvider } from '@/modules/weather/types/weather'
import type {
  WeatherSourceId,
  WeatherSourceMetadata,
} from '@/modules/weather/types/weatherSources'

type ActiveWeatherSourceKey = 'openMeteo' | 'caiyun' | 'xiaomi' | 'amap' | 'cams'

export const WEATHER_SOURCE_METADATA = {
  openMeteo: {
    id: 'open-meteo',
    displayName: 'Open-Meteo',
    domains: ['forecast', 'current', 'location', 'air-quality', 'long-range'],
    officialUrl: 'https://open-meteo.com/',
    licenceLabel: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    requiresUserCredential: false,
  },
  caiyun: {
    id: 'caiyun',
    displayName: 'Caiyun Weather',
    domains: ['forecast', 'current', 'precipitation-nowcast', 'alerts', 'long-range'],
    officialUrl: 'https://www.caiyunapp.com/',
    requiresUserCredential: true,
  },
  xiaomi: {
    id: 'xiaomi',
    displayName: 'Xiaomi Weather',
    domains: ['forecast', 'current', 'air-quality', 'long-range'],
    requiresUserCredential: false,
  },
  amap: {
    id: 'amap',
    displayName: 'AMap',
    domains: ['location'],
    officialUrl: 'https://lbs.amap.com/',
    requiresUserCredential: true,
  },
  cams: {
    id: 'cams',
    displayName: 'CAMS',
    domains: ['air-quality'],
    officialUrl: 'https://atmosphere.copernicus.eu/',
    requiresUserCredential: false,
  },
} as const satisfies Record<ActiveWeatherSourceKey, WeatherSourceMetadata>

export function getForecastSourceForProvider(
  provider: WeatherDataProvider,
): WeatherSourceMetadata {
  if (provider === 'caiyun') return WEATHER_SOURCE_METADATA.caiyun
  if (provider === 'xiaomi') return WEATHER_SOURCE_METADATA.xiaomi
  return WEATHER_SOURCE_METADATA.openMeteo
}

export function getWeatherSourceMetadata(
  sourceId: WeatherSourceId,
): WeatherSourceMetadata | null {
  const source = Object.values(WEATHER_SOURCE_METADATA).find(
    (metadata) => metadata.id === sourceId,
  )

  return source ?? null
}

export function getAirQualityApiSource() {
  return WEATHER_SOURCE_METADATA.openMeteo
}

export function getAirQualityModelSource() {
  return WEATHER_SOURCE_METADATA.cams
}
