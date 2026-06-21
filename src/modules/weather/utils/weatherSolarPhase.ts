import type {
  DailyForecastItem,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import type {
  WeatherSolarPhase,
  WeatherSolarPhaseResult,
} from '@/modules/weather/types/weatherSolarPhase'

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const MIN_VALID_DAYLIGHT_MS = 4 * HOUR_MS
const MAX_VALID_DAYLIGHT_MS = 20 * HOUR_MS

interface LocalDateTimeParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

interface ParsedLocalDate {
  year: number
  month: number
  day: number
  identity: string
}

interface ParsedLocalDateTime extends LocalDateTimeParts {
  hasExplicitOffset: boolean
}

interface PhaseBoundary {
  phase: WeatherSolarPhase
  startsAt: number
}

const safeFallback: WeatherSolarPhaseResult = {
  phase: 'day',
  source: 'safe-fallback',
  nextBoundaryAt: null,
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function localDateIdentity(parts: Pick<LocalDateTimeParts, 'year' | 'month' | 'day'>) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

export function isValidWeatherTimeZone(timezone: string | null | undefined) {
  if (!timezone) {
    return false
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date(0))
    return true
  } catch {
    return false
  }
}

function getLocationDateTimeParts(
  timestamp: number,
  timezone: string,
): LocalDateTimeParts | null {
  if (!Number.isFinite(timestamp) || !isValidWeatherTimeZone(timezone)) {
    return null
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      calendar: 'iso8601',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    })
    const values = new Map(
      formatter
        .formatToParts(new Date(timestamp))
        .map((part) => [part.type, part.value]),
    )
    const year = Number(values.get('year'))
    const month = Number(values.get('month'))
    const day = Number(values.get('day'))
    const hour = Number(values.get('hour'))
    const minute = Number(values.get('minute'))
    const second = Number(values.get('second'))

    if (
      [year, month, day, hour, minute, second].some((value) => !Number.isInteger(value))
    ) {
      return null
    }

    return { year, month, day, hour, minute, second }
  } catch {
    return null
  }
}

function parseLocalDate(value: string): ParsedLocalDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return {
    year,
    month,
    day,
    identity: localDateIdentity({ year, month, day }),
  }
}

function parseLocalDateTime(value: string): ParsedLocalDateTime | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.exec(
      value.trim(),
    )

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = match[6] ? Number(match[6]) : 0
  const parsedDate = parseLocalDate(`${match[1]}-${match[2]}-${match[3]}`)

  if (
    !parsedDate ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    hasExplicitOffset: Boolean(match[7]),
  }
}

function localPartsAsUtc(parts: LocalDateTimeParts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
}

function sameLocalParts(a: LocalDateTimeParts, b: LocalDateTimeParts) {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute &&
    a.second === b.second
  )
}

function zonedLocalDateTimeToTimestamp(
  parts: LocalDateTimeParts,
  timezone: string,
): number | null {
  if (!isValidWeatherTimeZone(timezone)) {
    return null
  }

  const target = localPartsAsUtc(parts)
  let guess = target

  for (let index = 0; index < 4; index += 1) {
    const guessParts = getLocationDateTimeParts(guess, timezone)

    if (!guessParts) {
      return null
    }

    const diff = target - localPartsAsUtc(guessParts)
    guess += diff

    if (diff === 0) {
      break
    }
  }

  const verifiedParts = getLocationDateTimeParts(guess, timezone)
  return verifiedParts && sameLocalParts(parts, verifiedParts) ? guess : null
}

function parseSolarTimestamp(
  value: string,
  timezone: string | null,
): number | null {
  const parsed = parseLocalDateTime(value)

  if (!parsed) {
    return null
  }

  if (parsed.hasExplicitOffset) {
    const timestamp = Date.parse(value)
    return Number.isFinite(timestamp) ? timestamp : null
  }

  if (!timezone) {
    return null
  }

  return zonedLocalDateTimeToTimestamp(parsed, timezone)
}

function findDailyItemForLocalDate(
  daily: DailyForecastItem[],
  localDate: string,
) {
  return daily.find((item) => parseLocalDate(item.date)?.identity === localDate) ?? null
}

function hasMatchingSolarLocalDate(
  timestamp: number,
  timezone: string,
  expectedLocalDate: string,
) {
  const parts = getLocationDateTimeParts(timestamp, timezone)
  return parts ? localDateIdentity(parts) === expectedLocalDate : false
}

function phaseFromBoundaries(
  nowMs: number,
  boundaries: PhaseBoundary[],
) {
  let active = boundaries[0]
  let next: PhaseBoundary | null = null

  for (let index = 0; index < boundaries.length; index += 1) {
    const boundary = boundaries[index]
    const following = boundaries[index + 1] ?? null

    if (nowMs >= boundary.startsAt) {
      active = boundary
      next = following
      continue
    }

    next = boundary
    break
  }

  return {
    phase: active.phase,
    source: 'sunrise-sunset',
    nextBoundaryAt: next?.startsAt ?? null,
  } satisfies WeatherSolarPhaseResult
}

function detailedPhaseFromSunriseSunset(
  weather: WeatherSnapshot,
  nowMs: number,
  timezone: string,
  currentLocalDate: string,
): WeatherSolarPhaseResult | null {
  const today = findDailyItemForLocalDate(weather.daily, currentLocalDate)

  if (!today || !today.sunrise || !today.sunset) {
    return null
  }

  const sunrise = parseSolarTimestamp(today.sunrise, timezone)
  const sunset = parseSolarTimestamp(today.sunset, timezone)

  if (
    sunrise === null ||
    sunset === null ||
    sunrise >= sunset ||
    !hasMatchingSolarLocalDate(sunrise, timezone, currentLocalDate) ||
    !hasMatchingSolarLocalDate(sunset, timezone, currentLocalDate)
  ) {
    return null
  }

  const daylightDuration = sunset - sunrise

  if (
    daylightDuration < MIN_VALID_DAYLIGHT_MS ||
    daylightDuration > MAX_VALID_DAYLIGHT_MS
  ) {
    return null
  }

  const nextLocalDate = new Date(Date.UTC(
    Number(currentLocalDate.slice(0, 4)),
    Number(currentLocalDate.slice(5, 7)) - 1,
    Number(currentLocalDate.slice(8, 10)) + 1,
  ))
  const nextLocalDateIdentity = [
    nextLocalDate.getUTCFullYear(),
    pad(nextLocalDate.getUTCMonth() + 1),
    pad(nextLocalDate.getUTCDate()),
  ].join('-')
  const nextDay = findDailyItemForLocalDate(weather.daily, nextLocalDateIdentity)
  const nextSunrise = nextDay?.sunrise
    ? parseSolarTimestamp(nextDay.sunrise, timezone)
    : null
  const nextPreDawn = nextSunrise === null ? null : nextSunrise - 90 * MINUTE_MS

  const boundaries: PhaseBoundary[] = [
    { phase: 'night', startsAt: Number.NEGATIVE_INFINITY },
    { phase: 'pre-dawn', startsAt: sunrise - 90 * MINUTE_MS },
    { phase: 'sunrise-transition', startsAt: sunrise - 20 * MINUTE_MS },
    { phase: 'day', startsAt: sunrise + 45 * MINUTE_MS },
    { phase: 'late-day', startsAt: sunset - 120 * MINUTE_MS },
    { phase: 'golden-hour', startsAt: sunset - 45 * MINUTE_MS },
    { phase: 'dusk', startsAt: sunset },
    { phase: 'night', startsAt: sunset + 60 * MINUTE_MS },
  ]

  if (nextPreDawn !== null && nextPreDawn > sunset + 60 * MINUTE_MS) {
    boundaries.push({ phase: 'pre-dawn', startsAt: nextPreDawn })
  }

  return phaseFromBoundaries(nowMs, boundaries)
}

function phaseFromLocalTime(hour: number, minute: number): WeatherSolarPhase {
  if (hour === 4) {
    return 'pre-dawn'
  }

  if (hour >= 5 && hour < 7) {
    return 'sunrise-transition'
  }

  if (hour >= 7 && hour < 16) {
    return 'day'
  }

  if (hour === 16 || (hour === 17 && minute < 30)) {
    return 'late-day'
  }

  if ((hour === 17 && minute >= 30) || (hour === 18 && minute < 30)) {
    return 'golden-hour'
  }

  if ((hour === 18 && minute >= 30) || (hour === 19 && minute < 30)) {
    return 'dusk'
  }

  return 'night'
}

function broadProviderPhase(isDay: boolean): WeatherSolarPhaseResult {
  return {
    phase: isDay ? 'day' : 'night',
    source: 'provider-is-day',
    nextBoundaryAt: null,
  }
}

function localHourFallback(
  hour: number,
  minute: number,
  source: 'location-hour' | 'browser-hour',
): WeatherSolarPhaseResult {
  return {
    phase: phaseFromLocalTime(hour, minute),
    source,
    nextBoundaryAt: null,
  }
}

export function deriveWeatherSolarPhase(
  weather: WeatherSnapshot,
  nowMs = Date.now(),
): WeatherSolarPhaseResult {
  const timezone = isValidWeatherTimeZone(weather.timezone) ? weather.timezone : null
  const localNow = timezone ? getLocationDateTimeParts(nowMs, timezone) : null

  if (timezone && localNow) {
    const solarResult = detailedPhaseFromSunriseSunset(
      weather,
      nowMs,
      timezone,
      localDateIdentity(localNow),
    )

    if (solarResult) {
      return solarResult
    }
  }

  if (typeof weather.current.isDay === 'boolean') {
    return broadProviderPhase(weather.current.isDay)
  }

  if (localNow) {
    return localHourFallback(localNow.hour, localNow.minute, 'location-hour')
  }

  const browserDate = new Date(nowMs)
  const browserHour = browserDate.getHours()
  const browserMinute = browserDate.getMinutes()

  if (Number.isInteger(browserHour) && Number.isInteger(browserMinute)) {
    return localHourFallback(browserHour, browserMinute, 'browser-hour')
  }

  return safeFallback
}

export const weatherSolarPhaseTestInternals = {
  getLocationDateTimeParts,
  isValidWeatherTimeZone,
  parseSolarTimestamp,
}
