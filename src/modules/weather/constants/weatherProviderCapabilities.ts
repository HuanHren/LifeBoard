import type { WeatherDataProvider } from '@/modules/weather/types/weather'
import type { WeatherProviderCapabilities } from '@/modules/weather/types/weatherProvider'

export const WEATHER_PROVIDER_CAPABILITIES = {
  openMeteo: {
    alerts: false,
    visibility: true,
    airQuality: true,
  },
  caiyun: {
    alerts: true,
    visibility: true,
    airQuality: false,
  },
} as const satisfies Record<WeatherDataProvider, WeatherProviderCapabilities>

export function getWeatherProviderCapabilities(
  provider: WeatherDataProvider,
): WeatherProviderCapabilities {
  return WEATHER_PROVIDER_CAPABILITIES[provider]
}
