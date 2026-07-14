import { weatherProviderRuntime } from '@/modules/weather/providers/weatherProviderRuntime'
import { adaptProviderSnapshotForDisplay } from '@/modules/weather/providers/weatherSnapshotAdapters'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'
import type {
  LongRangeForecastProviderResult,
  NormalizedLongRangeForecast,
} from '@/modules/weather/types/longRangeForecast'
import type {
  WeatherLocation,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'

export class WeatherProviderForecastError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeatherProviderForecastError'
  }
}

interface ForecastProviderOptions {
  provider: WeatherProviderId
  location: WeatherLocation
  locale?: 'zh-CN' | 'en-US'
  signal?: AbortSignal
}

function toLongRangeForecast(
  snapshot: WeatherSnapshot,
): NormalizedLongRangeForecast {
  return {
    provider: snapshot.provider,
    location: snapshot.location,
    timezone: snapshot.timezone,
    timezoneAbbreviation: snapshot.timezoneAbbreviation,
    fetchedAt: snapshot.fetchedAt,
    daily: snapshot.daily,
    units: snapshot.units,
  }
}

export async function fetchWeatherForecastForProvider({
  provider,
  location,
  signal,
  locale = 'en-US',
}: ForecastProviderOptions): Promise<WeatherSnapshot> {
  const snapshot = await weatherProviderRuntime.fetchSnapshot({
    provider,
    location,
    locale,
    signal,
  })
  return adaptProviderSnapshotForDisplay(snapshot)
}

export function createLongRangeForecastFromSnapshot(
  snapshot: WeatherSnapshot,
): NormalizedLongRangeForecast {
  return toLongRangeForecast(snapshot)
}

export async function fetchLongRangeForecastForProvider(
  options: ForecastProviderOptions,
): Promise<LongRangeForecastProviderResult> {
  const forecast = await fetchWeatherForecastForProvider(options)

  return {
    supported: true,
    forecast: toLongRangeForecast(forecast),
  }
}
