import type { AppLocale } from '@/i18n/types'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type {
  WeatherProviderAvailability,
  WeatherProviderId,
} from '@/modules/weather/types/weatherProvider'

export interface WeatherProviderEligibilityInput {
  provider: WeatherProviderId
  locale: AppLocale
  location?: WeatherLocation | null
  xiaomiEnabled: boolean
  hasCaiyunToken?: boolean
  requireLocation?: boolean
}

export function getWeatherProviderAvailability({
  provider,
  locale,
  location = null,
  xiaomiEnabled,
  hasCaiyunToken = false,
  requireLocation = true,
}: WeatherProviderEligibilityInput): WeatherProviderAvailability {
  if (provider !== 'openMeteo' && provider !== 'caiyun' && provider !== 'xiaomi') {
    return { available: false, reason: 'unknown-provider' }
  }

  if (provider === 'openMeteo') return { available: true }

  if (provider === 'caiyun') {
    return hasCaiyunToken
      ? { available: true }
      : { available: false, reason: 'missing-credential' }
  }

  if (!xiaomiEnabled) return { available: false, reason: 'feature-disabled' }
  if (locale !== 'zh-CN') return { available: false, reason: 'unsupported-locale' }

  if (
    requireLocation &&
    !location?.providerLocationIds?.xiaomi
  ) {
    return { available: false, reason: 'missing-provider-location' }
  }

  return { available: true }
}

export function getEffectiveWeatherProvider(
  input: WeatherProviderEligibilityInput,
): WeatherProviderId {
  const availability = getWeatherProviderAvailability(input)

  if (!availability.available && availability.reason === 'unknown-provider') {
    return 'openMeteo'
  }

  if (input.provider === 'xiaomi' && !availability.available) {
    return 'openMeteo'
  }

  return input.provider
}

export function isWeatherProviderCacheEnabled(provider: WeatherProviderId) {
  return provider !== 'xiaomi'
}
