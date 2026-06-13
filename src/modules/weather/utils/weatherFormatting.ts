import type { WeatherLocation } from '@/modules/weather/types/weather'

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

export function formatPrecipitation(value: number, unit = 'mm') {
  return `${value < 1 ? value.toFixed(1) : Math.round(value)} ${unit}`
}

export function formatHour(value: string) {
  const hour = Number(value.slice(11, 13))

  if (!Number.isFinite(hour)) {
    return value
  }

  if (hour === 0) {
    return '12 AM'
  }

  if (hour === 12) {
    return '12 PM'
  }

  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
}

export function formatFullLocalTime(value: string) {
  const date = parseLocalDateParts(value)
  const time = formatHour(value)

  if (!date) {
    return value
  }

  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)

  return `${day}, ${time}`
}

export function formatDay(value: string, index: number) {
  if (index === 0) {
    return 'Today'
  }

  const date = parseLocalDateParts(value)

  if (!date) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function formatDateLabel(value: string) {
  const date = parseLocalDateParts(value)

  if (!date) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatWindDirection(degrees: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const normalized = ((degrees % 360) + 360) % 360
  return directions[Math.round(normalized / 45) % directions.length]
}
