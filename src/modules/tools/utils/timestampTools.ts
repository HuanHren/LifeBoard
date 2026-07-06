import type {
  TimestampConversion,
  TimestampInputType,
  TimestampResult,
} from '@/modules/tools/types/tools'
import type { AppLocale } from '@/i18n/types'

const NUMERIC_PATTERN = /^-?\d+(?:\.\d+)?$/
const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000
const MAX_SECONDS_MAGNITUDE = 10_000_000_000
const MIN_MILLISECONDS_MAGNITUDE = 100_000_000_000

function createConversion(
  date: Date,
  interpretedAs: TimestampInputType,
  locale: AppLocale,
): TimestampConversion {
  const milliseconds = date.getTime()

  return {
    interpretedAs,
    localDateTime: new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(date),
    utcDateTime: new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    }).format(date),
    iso: date.toISOString(),
    unixSeconds: Math.floor(milliseconds / 1000),
    unixMilliseconds: milliseconds,
  }
}

export function convertTimestamp(input: string, locale: AppLocale): TimestampResult {
  const normalized = input.trim()

  if (normalized.length === 0) {
    return {
      ok: false,
      error: 'Enter Unix seconds, Unix milliseconds, or an ISO-compatible date value.',
    }
  }

  if (NUMERIC_PATTERN.test(normalized)) {
    const numericValue = Number(normalized)

    if (!Number.isFinite(numericValue)) {
      return { ok: false, error: 'Enter a finite numeric timestamp.' }
    }

    const magnitude = Math.abs(numericValue)
    let milliseconds: number
    let interpretedAs: TimestampInputType

    if (magnitude <= MAX_SECONDS_MAGNITUDE) {
      milliseconds = numericValue * 1000
      interpretedAs = 'Unix seconds'
    } else if (magnitude >= MIN_MILLISECONDS_MAGNITUDE) {
      milliseconds = numericValue
      interpretedAs = 'Unix milliseconds'
    } else {
      return {
        ok: false,
        error:
          'This numeric value is ambiguous. Use a typical Unix seconds value or a 12-13 digit millisecond value.',
      }
    }

    if (Math.abs(milliseconds) > MAX_DATE_MILLISECONDS) {
      return { ok: false, error: 'The timestamp is outside the supported date range.' }
    }

    const date = new Date(milliseconds)
    return Number.isNaN(date.getTime())
      ? { ok: false, error: 'The timestamp does not produce a valid date.' }
      : { ok: true, value: createConversion(date, interpretedAs, locale) }
  }

  const milliseconds = Date.parse(normalized)

  if (!Number.isFinite(milliseconds)) {
    return {
      ok: false,
      error: 'Enter a valid ISO-compatible date, Unix seconds, or Unix milliseconds.',
    }
  }

  return {
    ok: true,
    value: createConversion(new Date(milliseconds), 'Date text', locale),
  }
}
