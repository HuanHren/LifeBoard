export interface WeatherFeatureEnvironment {
  readonly VITE_XIAOMI_WEATHER_ENABLED?: unknown
}

export function isXiaomiWeatherFeatureEnabled(
  environment?: WeatherFeatureEnvironment,
) {
  const source = environment ?? (import.meta.env as unknown as WeatherFeatureEnvironment)
  return source.VITE_XIAOMI_WEATHER_ENABLED === 'true'
}

export const xiaomiWeatherEnabled = isXiaomiWeatherFeatureEnabled()
