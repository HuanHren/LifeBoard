import type { WeatherLocation } from '@/modules/weather/types/weather'
import type { AppLocale } from '@/i18n/types'
import type { Translator } from '@/i18n/types'

function parseLocalDateParts(value: string) {
  const datePart = value.slice(0, 10)
  const [year, month, day] = datePart.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(Date.UTC(year, month - 1, day))
}

export function formatLocationName(location: WeatherLocation) {
  const region = location.admin1 && location.admin1 !== location.name ? location.admin1 : null
  return [location.name, region, location.country].filter(Boolean).join(', ')
}

export function formatTemperature(value: number, unit = '°C') {
  return `${Math.round(value)}${unit}`
}

export function formatPercentage(value: number) {
  return `${Math.round(value)}%`
}

export function formatWind(value: number, unit = 'km/h') {
  return `${Math.round(value)} ${unit}`
}

export function formatOptionalWind(
  value: number | null,
  unit: string,
  unavailableLabel: string,
) {
  return value === null ? unavailableLabel : formatWind(value, unit)
}

export function formatPrecipitation(value: number, unit = 'mm') {
  return `${value < 1 ? value.toFixed(1) : Math.round(value)} ${unit}`
}

export function formatUvIndex(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatPressure(value: number, unit = 'hPa') {
  return `${Math.round(value)} ${unit}`
}

export function formatHour(value: string, locale: AppLocale) {
  const hour = Number(value.slice(11, 13))

  if (!Number.isFinite(hour)) {
    return value
  }

  const date = new Date(Date.UTC(2000, 0, 1, hour))
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatFullLocalTime(value: string, locale: AppLocale) {
  const date = parseLocalDateParts(value)
  const time = formatHour(value, locale)

  if (!date) {
    return value
  }

  const day = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)

  return `${day}, ${time}`
}

export function formatDay(
  value: string,
  index: number,
  locale: AppLocale,
  t: Translator,
) {
  if (index === 0) {
    return t('weather.daily.today')
  }

  const date = parseLocalDateParts(value)

  if (!date) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function formatDateLabel(value: string, locale: AppLocale) {
  const date = parseLocalDateParts(value)

  if (!date) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatWindDirection(degrees: number, t: Translator) {
  const directions = [
    t('weather.wind.n'),
    t('weather.wind.ne'),
    t('weather.wind.e'),
    t('weather.wind.se'),
    t('weather.wind.s'),
    t('weather.wind.sw'),
    t('weather.wind.w'),
    t('weather.wind.nw'),
  ]
  const normalized = ((degrees % 360) + 360) % 360
  return directions[Math.round(normalized / 45) % directions.length]
}
