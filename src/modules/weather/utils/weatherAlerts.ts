import { getWeatherProviderCapabilities } from '@/modules/weather/constants/weatherProviderCapabilities'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import type { WeatherAlertStatus } from '@/modules/weather/types/weatherAlert'

export function resolveWeatherAlertStatus(
  weather: WeatherSnapshot | null | undefined,
): WeatherAlertStatus {
  if (!weather) {
    return 'UNAVAILABLE'
  }

  if (weather.alerts.length > 0) {
    return 'ACTIVE_ALERTS'
  }

  const capabilities =
    weather.providerCapabilities ?? getWeatherProviderCapabilities(weather.provider)

  return capabilities.alerts ? 'SUPPORTED_NO_ACTIVE_ALERTS' : 'UNSUPPORTED_BY_PROVIDER'
}
