import type { AppLocale } from '@/i18n/types'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function getDateParts(value: string) {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

export function isDateOnly(value: unknown): value is string {
  return typeof value === 'string' && getDateParts(value) !== null
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function compareDateStrings(left: string, right: string) {
  return left.localeCompare(right)
}

export function differenceInCalendarDays(target: string, base: string) {
  const targetParts = getDateParts(target)
  const baseParts = getDateParts(base)

  if (!targetParts || !baseParts) {
    return 0
  }

  const targetUtc = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day)
  const baseUtc = Date.UTC(baseParts.year, baseParts.month - 1, baseParts.day)
  return Math.round((targetUtc - baseUtc) / 86_400_000)
}

export function formatReadableDate(value: string, locale: AppLocale) {
  const parts = getDateParts(value)

  if (!parts) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)))
}

export function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}
