import type { Translator } from '@/i18n/types'
import type {
  HourlyForecastItem,
  ShortTermPrecipitation,
} from '@/modules/weather/types/weather'

export function hasMeaningfulHourlyPrecipitation(items: HourlyForecastItem[]) {
  return items.some(
    (item) =>
      (typeof item.precipitationProbability === 'number' && item.precipitationProbability > 0) ||
      (typeof item.precipitation === 'number' && item.precipitation > 0),
  )
}

export function summarizeHourlyPrecipitation(
  items: HourlyForecastItem[],
  t: Translator,
) {
  const usableItems = items.filter(
    (item) =>
      typeof item.precipitationProbability === 'number' &&
      typeof item.precipitation === 'number',
  )

  if (usableItems.length === 0) {
    return t('weather.precipitation.unavailable')
  }

  if (!hasMeaningfulHourlyPrecipitation(usableItems)) {
    return t('weather.precipitation.noneExpected')
  }

  const highestChance = Math.max(...usableItems.map((item) => item.precipitationProbability as number))
  const totalAmount = usableItems.reduce((sum, item) => sum + (item.precipitation as number), 0)

  if (highestChance >= 60 || totalAmount >= 1) {
    return t('weather.precipitation.likely')
  }

  return t('weather.precipitation.possible')
}

export function summarizeShortTermPrecipitation(
  shortTerm: ShortTermPrecipitation | null,
  t: Translator,
) {
  if (!shortTerm || shortTerm.items.length === 0) {
    return t('weather.shortTerm.unavailable')
  }

  const wetMinutes = shortTerm.items.filter((item) => item.precipitation > 0).length

  if (wetMinutes === 0) {
    return shortTerm.summary ?? t('weather.shortTerm.noneExpected')
  }

  return shortTerm.summary ?? t('weather.shortTerm.expected', { count: wetMinutes })
}
