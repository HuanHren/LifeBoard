import type { Translator } from '@/i18n/types'
import type {
  HourlyForecastItem,
  ShortTermPrecipitation,
} from '@/modules/weather/types/weather'

export function hasMeaningfulHourlyPrecipitation(items: HourlyForecastItem[]) {
  return items.some(
    (item) => item.precipitationProbability > 0 || item.precipitation > 0,
  )
}

export function summarizeHourlyPrecipitation(
  items: HourlyForecastItem[],
  t: Translator,
) {
  if (items.length === 0) {
    return t('weather.precipitation.unavailable')
  }

  if (!hasMeaningfulHourlyPrecipitation(items)) {
    return t('weather.precipitation.noneExpected')
  }

  const highestChance = Math.max(...items.map((item) => item.precipitationProbability))
  const totalAmount = items.reduce((sum, item) => sum + item.precipitation, 0)

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
