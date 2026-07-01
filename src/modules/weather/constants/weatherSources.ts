import type { WeatherDataProvider } from '@/modules/weather/types/weather'
import type {
  WeatherSourceId,
  WeatherSourceMetadata,
} from '@/modules/weather/types/weatherSources'

type ActiveWeatherSourceKey = 'openMeteo' | 'caiyun' | 'amap' | 'cams'

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
  return provider === 'caiyun'
    ? WEATHER_SOURCE_METADATA.caiyun
    : WEATHER_SOURCE_METADATA.openMeteo
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
