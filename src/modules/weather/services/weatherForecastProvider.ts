import { fetchCaiyunWeatherForecast } from '@/modules/weather/services/caiyunWeatherService'
import { fetchOpenMeteoForecast } from '@/modules/weather/services/openMeteoService'
import { readCaiyunTokenForRequest } from '@/modules/weather/services/weatherProviderStorage'
import type { WeatherProviderId } from '@/modules/weather/types/weatherProvider'
import type {
  WeatherLocation,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import { normalizeCaiyunWeatherForecast } from '@/modules/weather/utils/caiyunWeatherNormalizer'
import { normalizeWeatherForecast } from '@/modules/weather/utils/weatherNormalizer'

export class WeatherProviderForecastError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeatherProviderForecastError'
  }
}

interface ForecastProviderOptions {
  provider: WeatherProviderId
  location: WeatherLocation
  signal?: AbortSignal
}

export async function fetchWeatherForecastForProvider({
  provider,
  location,
  signal,
}: ForecastProviderOptions): Promise<WeatherSnapshot> {
  if (provider === 'openMeteo') {
    const response = await fetchOpenMeteoForecast(location, signal)
    return normalizeWeatherForecast(response, location)
  }

  const tokenResult = readCaiyunTokenForRequest()

  if (!tokenResult.ok) {
    throw new WeatherProviderForecastError(
      'Caiyun Weather is selected, but no token is saved. Add one in Settings before loading Caiyun forecasts.',
    )
  }

  const response = await fetchCaiyunWeatherForecast(location, tokenResult.data, signal)
  return normalizeCaiyunWeatherForecast(response, location)
}
