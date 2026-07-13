import type {
  ProviderWeatherLocation,
  ProviderWeatherSnapshot,
  WeatherCapabilityMap,
  WeatherCapabilityName,
  WeatherCapabilityState,
  WeatherNormalizationDiagnostic,
} from '@/modules/weather/providers/types'
import { isRecord } from '@/modules/weather/providers/xiaomi/xiaomiGuards'
import type {
  XiaomiCurrentRaw,
  XiaomiDailyPairRaw,
  XiaomiSearchResultRaw,
  XiaomiWeatherAllRaw,
  XiaomiWeatherExtensions,
} from '@/modules/weather/providers/xiaomi/xiaomiRawTypes'
import { mapXiaomiWeatherCode } from '@/modules/weather/providers/xiaomi/xiaomiWeatherCodes'

const capabilityNames: readonly WeatherCapabilityName[] = [
  'current',
  'hourly',
  'daily',
  'aqi',
  'minutely',
  'alerts',
  'indices',
  'typhoon',
  'yesterday',
  'preHour',
  'sourceMaps',
  'brandInfo',
  'updateTime',
]

const rootPathByCapability: Record<WeatherCapabilityName, string> = {
  current: 'current',
  hourly: 'forecastHourly',
  daily: 'forecastDaily',
  aqi: 'aqi',
  minutely: 'minutely',
  alerts: 'alerts',
  indices: 'indices',
  typhoon: 'typhoon',
  yesterday: 'yesterday',
  preHour: 'preHour',
  sourceMaps: 'sourceMaps',
  brandInfo: 'brandInfo',
  updateTime: 'updateTime',
}

const forbiddenSecretKeys = new Set(['appkey', 'sign', 'oaid', 'device', 'appversion', 'romversion'])

export class XiaomiNormalizationError extends Error {
  readonly code: 'invalid-location' | 'invalid-current' | 'invalid-update-time' | 'invalid-hourly-contract' | 'secret-detected'
  readonly path: string

  constructor(
    code: 'invalid-location' | 'invalid-current' | 'invalid-update-time' | 'invalid-hourly-contract' | 'secret-detected',
    path: string,
  ) {
    super(`Xiaomi weather normalization failed at ${path}.`)
    this.name = 'XiaomiNormalizationError'
    this.code = code
    this.path = path
  }
}

function classifyCapability(value: unknown, present = true): WeatherCapabilityState {
  if (!present) return 'missing'
  if (value === null) return 'null'
  if (Array.isArray(value)) return value.length === 0 ? 'empty-array' : 'available'
  if (isRecord(value)) return Object.keys(value).length === 0 ? 'empty-object' : 'available'
  return 'available'
}

export function getXiaomiCapabilityStates(raw: XiaomiWeatherAllRaw): WeatherCapabilityMap {
  return Object.fromEntries(capabilityNames.map((name) => {
    const path = rootPathByCapability[name]
    const present = Object.prototype.hasOwnProperty.call(raw, path)
    return [name, classifyCapability(raw[path], present)]
  })) as WeatherCapabilityMap
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function coordinate(value: unknown, min: number, max: number): number | null {
  const parsed = finiteNumber(value)
  return parsed !== null && parsed >= min && parsed <= max ? parsed : null
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function isoTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
}

function dateOnlyFromTimestamp(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && isoTimestamp(value)
    ? value.slice(0, 10)
    : null
}

function addDaysToDateOnly(date: string, days: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const base = new Date(Date.UTC(year, month - 1, day))
  if (base.getUTCFullYear() !== year || base.getUTCMonth() !== month - 1 || base.getUTCDate() !== day) return null
  const value = new Date(base.getTime() + days * 86_400_000)
  return value.toISOString().slice(0, 10)
}

function requireUnit(value: unknown, accepted: readonly string[]) {
  return typeof value === 'string' && accepted.includes(value)
}

function optionalUnitNumber(
  container: unknown,
  acceptedUnits: readonly string[],
  path: string,
  diagnostics: WeatherNormalizationDiagnostic[],
) {
  if (!isRecord(container)) return undefined
  if (!requireUnit(container.unit, acceptedUnits)) {
    diagnostics.push({ path: `${path}.unit`, code: 'unmapped-unit' })
    return undefined
  }
  const parsed = finiteNumber(container.value)
  if (parsed === null) diagnostics.push({ path: `${path}.value`, code: 'invalid-optional-field' })
  return parsed ?? undefined
}

export function normalizeXiaomiLocations(results: readonly XiaomiSearchResultRaw[]): ProviderWeatherLocation[] {
  return results.flatMap((result) => {
    const providerLocationId = nonEmptyString(result.locationKey)
    const name = nonEmptyString(result.name)
    const latitude = coordinate(result.latitude, -90, 90)
    const longitude = coordinate(result.longitude, -180, 180)

    if (!providerLocationId || !name || latitude === null || longitude === null) return []

    const administrativeArea = nonEmptyString(result.affiliation)
    return [{
      provider: 'xiaomi',
      providerLocationId,
      name,
      ...(administrativeArea ? { administrativeArea } : {}),
      latitude,
      longitude,
    }]
  })
}

function validateLocation(location: ProviderWeatherLocation) {
  if (
    location.provider !== 'xiaomi' ||
    !nonEmptyString(location.providerLocationId) ||
    !nonEmptyString(location.name) ||
    coordinate(location.latitude, -90, 90) === null ||
    coordinate(location.longitude, -180, 180) === null
  ) {
    throw new XiaomiNormalizationError('invalid-location', 'location')
  }
}

function assertSecretSafe(value: unknown, path = '$'): void {
  if (typeof value === 'string') return
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertSecretSafe(entry, `${path}[${index}]`))
    return
  }
  if (!isRecord(value)) return
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenSecretKeys.has(key.toLowerCase())) {
      throw new XiaomiNormalizationError('secret-detected', `${path}.${key}`)
    }
    assertSecretSafe(nested, `${path}.${key}`)
  }
}

function cloneJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneJsonValue)
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneJsonValue(nested)]))
  return value
}

function normalizeCurrent(current: XiaomiCurrentRaw | null | undefined, diagnostics: WeatherNormalizationDiagnostic[]) {
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    throw new XiaomiNormalizationError('invalid-current', '$.current')
  }
  const temperatureC = optionalUnitNumber(current.temperature, ['C', '℃'], '$.current.temperature', diagnostics)
  const observedAt = isoTimestamp(current.pubTime)
  if (temperatureC === undefined || !observedAt || current.weather === undefined || current.weather === null) {
    throw new XiaomiNormalizationError('invalid-current', '$.current')
  }

  const humidityPercent = optionalUnitNumber(current.humidity, ['%'], '$.current.humidity', diagnostics)
  const apparentTemperatureC = optionalUnitNumber(current.feelsLike, ['C', '℃'], '$.current.feelsLike', diagnostics)
  const pressureHpa = optionalUnitNumber(current.pressure, ['hPa'], '$.current.pressure', diagnostics)
  const visibilityKm = optionalUnitNumber(current.visibility, ['km'], '$.current.visibility', diagnostics)
  const windSpeedKmh = optionalUnitNumber(current.wind?.speed, ['km/h'], '$.current.wind.speed', diagnostics)
  const windDirectionDegrees = optionalUnitNumber(current.wind?.direction, ['degree', '°'], '$.current.wind.direction', diagnostics)
  const uvIndex = finiteNumber(current.uvIndex)
  if (current.uvIndex !== undefined && uvIndex === null) diagnostics.push({ path: '$.current.uvIndex', code: 'invalid-optional-field' })

  return {
    observedAt,
    temperatureC,
    ...(apparentTemperatureC !== undefined ? { apparentTemperatureC } : {}),
    ...(humidityPercent !== undefined ? { humidityPercent } : {}),
    ...(windSpeedKmh !== undefined ? { windSpeedKmh } : {}),
    ...(windDirectionDegrees !== undefined ? { windDirectionDegrees } : {}),
    ...(pressureHpa !== undefined ? { pressureHpa } : {}),
    ...(visibilityKm !== undefined ? { visibilityKm } : {}),
    ...(uvIndex !== null ? { uvIndex } : {}),
    condition: mapXiaomiWeatherCode(current.weather),
  }
}

function normalizeHourly(raw: XiaomiWeatherAllRaw, diagnostics: WeatherNormalizationDiagnostic[]) {
  const hourly = raw.forecastHourly
  if (hourly === null || hourly === undefined) return []
  if (typeof hourly !== 'object' || Array.isArray(hourly)) {
    diagnostics.push({ path: '$.forecastHourly', code: 'capability-invalid' })
    return []
  }
  if (Object.keys(hourly).length === 0) return []
  const temperatures = isRecord(hourly.temperature) && Array.isArray(hourly.temperature.value) ? hourly.temperature.value : null
  const weather = isRecord(hourly.weather) && Array.isArray(hourly.weather.value) ? hourly.weather.value : null
  const wind = isRecord(hourly.wind) && Array.isArray(hourly.wind.value) ? hourly.wind.value : null
  if (!temperatures || !weather || !wind || temperatures.length !== weather.length || weather.length !== wind.length) {
    throw new XiaomiNormalizationError('invalid-hourly-contract', '$.forecastHourly')
  }
  if (!requireUnit(hourly.temperature?.unit, ['C', '℃'])) {
    diagnostics.push({ path: '$.forecastHourly.temperature.unit', code: 'unmapped-unit' })
    return []
  }
  diagnostics.push({ path: '$.forecastHourly.wind', code: 'unmapped-unit' })
  diagnostics.push({ path: '$.forecastHourly.precipitationProbability', code: 'unmapped-unit' })

  return temperatures.flatMap((temperature, index) => {
    const temperatureC = finiteNumber(temperature)
    const windEntry = wind[index]
    const time = isRecord(windEntry) ? isoTimestamp(windEntry.datetime) : null
    const code = weather[index]
    if (temperatureC === null || !time || code === undefined || code === null) {
      diagnostics.push({ path: `$.forecastHourly[${index}]`, code: 'invalid-entry' })
      return []
    }
    return [{ time, temperatureC, condition: mapXiaomiWeatherCode(code) }]
  })
}

function dailyPair(value: unknown): XiaomiDailyPairRaw | null {
  return isRecord(value) ? value : null
}

function normalizeDaily(raw: XiaomiWeatherAllRaw, diagnostics: WeatherNormalizationDiagnostic[]) {
  const daily = raw.forecastDaily
  if (daily === null || daily === undefined) return []
  if (typeof daily !== 'object' || Array.isArray(daily)) {
    diagnostics.push({ path: '$.forecastDaily', code: 'capability-invalid' })
    return []
  }
  const temperatures = isRecord(daily.temperature) && Array.isArray(daily.temperature.value) ? daily.temperature.value : null
  const weather = isRecord(daily.weather) && Array.isArray(daily.weather.value) ? daily.weather.value : null
  const sunRiseSet = isRecord(daily.sunRiseSet) && Array.isArray(daily.sunRiseSet.value) ? daily.sunRiseSet.value : []
  const firstDate = dateOnlyFromTimestamp(daily.pubTime)
  if (!temperatures || !weather || temperatures.length !== weather.length) {
    diagnostics.push({ path: '$.forecastDaily', code: 'capability-invalid' })
    return []
  }
  if (!requireUnit(daily.temperature?.unit, ['C', '℃'])) {
    diagnostics.push({ path: '$.forecastDaily.temperature.unit', code: 'unmapped-unit' })
    return []
  }

  return temperatures.flatMap((temperatureValue, index) => {
    const temperature = dailyPair(temperatureValue)
    const weatherValue = dailyPair(weather[index])
    const astronomy = dailyPair(sunRiseSet[index])
    const temperatureMaxC = finiteNumber(temperature?.from)
    const temperatureMinC = finiteNumber(temperature?.to)
    const sunrise = isoTimestamp(astronomy?.from)
    const sunset = isoTimestamp(astronomy?.to)
    const date = addDaysToDateOnly(firstDate ?? '', index)
    if (
      temperatureMaxC === null ||
      temperatureMinC === null ||
      weatherValue?.from === undefined ||
      weatherValue.to === undefined ||
      !date
    ) {
      diagnostics.push({ path: `$.forecastDaily[${index}]`, code: 'invalid-entry' })
      return []
    }

    return [{
      date,
      temperatureMaxC,
      temperatureMinC,
      dayCondition: mapXiaomiWeatherCode(weatherValue.from),
      nightCondition: mapXiaomiWeatherCode(weatherValue.to),
      ...(sunrise ? { sunrise } : {}),
      ...(sunset ? { sunset } : {}),
    }]
  })
}

function normalizeAirQuality(raw: XiaomiWeatherAllRaw, diagnostics: WeatherNormalizationDiagnostic[]) {
  if (!isRecord(raw.aqi)) return undefined
  const value = finiteNumber(raw.aqi.aqi)
  if (value === null || value < 0) {
    diagnostics.push({ path: '$.aqi.aqi', code: 'invalid-optional-field' })
    return undefined
  }
  const observedAt = isoTimestamp(raw.aqi.pubTime)
  return { value, scale: 'unknown' as const, ...(observedAt ? { observedAt } : {}) }
}

function extensionsFrom(raw: XiaomiWeatherAllRaw): XiaomiWeatherExtensions {
  const extensionKeys = ['minutely', 'alerts', 'indices', 'typhoon', 'yesterday', 'preHour', 'sourceMaps', 'brandInfo'] as const
  return Object.fromEntries(extensionKeys.flatMap((key) => (
    Object.prototype.hasOwnProperty.call(raw, key) ? [[key, cloneJsonValue(raw[key])]] : []
  )))
}

export function normalizeXiaomiWeather(
  raw: XiaomiWeatherAllRaw,
  location: ProviderWeatherLocation,
): ProviderWeatherSnapshot<XiaomiWeatherExtensions> {
  validateLocation(location)
  assertSecretSafe(raw)
  const diagnostics: WeatherNormalizationDiagnostic[] = []
  let updatedAt: string | null = null
  if (typeof raw.updateTime === 'number' && Number.isFinite(raw.updateTime)) {
    try {
      updatedAt = new Date(raw.updateTime).toISOString()
    } catch {
      updatedAt = null
    }
  }
  if (!updatedAt) {
    throw new XiaomiNormalizationError('invalid-update-time', '$.updateTime')
  }

  const airQuality = normalizeAirQuality(raw, diagnostics)

  return {
    provider: 'xiaomi',
    location: { ...location },
    updatedAt,
    current: normalizeCurrent(raw.current, diagnostics),
    hourly: normalizeHourly(raw, diagnostics),
    daily: normalizeDaily(raw, diagnostics),
    ...(airQuality ? { airQuality } : {}),
    capabilities: getXiaomiCapabilityStates(raw),
    units: {
      temperature: 'celsius',
      windSpeed: 'kilometres-per-hour',
      windDirection: 'degrees',
      humidity: 'percent',
      pressure: 'hectopascals',
      visibility: 'kilometres',
    },
    extensions: extensionsFrom(raw),
    diagnostics,
  }
}

export const xiaomiNormalizerTestInternals = { classifyCapability, assertSecretSafe }
