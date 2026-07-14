import type { AppLocale } from '@/i18n/types'
import type {
  NormalizedCurrentWeather,
  ProviderWeatherSnapshot,
  WeatherCapabilityState,
} from '@/modules/weather/providers/types'
import { isRecord } from '@/modules/weather/providers/xiaomi/xiaomiGuards'
import type {
  XiaomiAttributionViewModel,
  XiaomiExtendedAdapterResult,
  XiaomiExtendedDiagnostic,
  XiaomiMinutelySummaryViewModel,
  XiaomiRecentChangesViewModel,
  XiaomiRecentMetricId,
  XiaomiRecentMetricUnit,
  XiaomiRecentMetricViewModel,
} from '@/modules/weather/extended/xiaomiExtendedWeatherViewModel'

const forbiddenSecretKeys = new Set([
  'appkey',
  'sign',
  'oaid',
  'device',
  'appversion',
  'romversion',
])

function hasSecretShapedKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasSecretShapedKey)
  if (!isRecord(value)) return false

  return Object.entries(value).some(([key, nested]) => (
    forbiddenSecretKeys.has(key.toLowerCase()) || hasSecretShapedKey(nested)
  ))
}

function safeText(value: unknown, maximumLength = 240): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (text === '' || text.length > maximumLength || /[\u0000-\u001f\u007f]/.test(text)) return null
  return text
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function isoTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
}

function uniqueTexts(values: readonly (string | null)[]) {
  return values.filter((value, index): value is string => (
    value !== null && values.indexOf(value) === index
  ))
}

export function adaptXiaomiMinutelySummary(
  value: unknown,
  capability: WeatherCapabilityState,
  diagnostics: XiaomiExtendedDiagnostic[] = [],
): XiaomiMinutelySummaryViewModel | undefined {
  if (capability !== 'available') return undefined
  if (!isRecord(value) || value.status !== 0 || !isRecord(value.precipitation)) {
    diagnostics.push({ path: '$.extensions.minutely', code: 'invalid-minutely' })
    return undefined
  }

  const precipitation = value.precipitation
  if (precipitation.status !== 0 || precipitation.isShow !== true) return undefined

  const texts = uniqueTexts([
    safeText(precipitation.headDescription),
    safeText(precipitation.shortDescription),
    safeText(precipitation.description),
  ])
  const summary = texts[0]
  if (!summary) {
    diagnostics.push({ path: '$.extensions.minutely.precipitation', code: 'invalid-minutely' })
    return undefined
  }

  const detail = texts[1]
  const advice = safeText(precipitation.subtitle)
  const observedAt = isoTimestamp(precipitation.pubTime)

  return {
    summary,
    ...(detail ? { detail } : {}),
    ...(advice && advice !== summary && advice !== detail ? { advice } : {}),
    ...(observedAt ? { observedAt } : {}),
  }
}

interface MetricDefinition {
  id: XiaomiRecentMetricId
  current: keyof NormalizedCurrentWeather
  source: string
  units: readonly string[]
  unit: XiaomiRecentMetricUnit
}

const metricDefinitions: readonly MetricDefinition[] = [
  { id: 'temperature', current: 'temperatureC', source: 'temperature', units: ['C', '℃'], unit: 'celsius' },
  { id: 'feelsLike', current: 'apparentTemperatureC', source: 'feelsLike', units: ['C', '℃'], unit: 'celsius' },
  { id: 'humidity', current: 'humidityPercent', source: 'humidity', units: ['%'], unit: 'percent' },
  { id: 'pressure', current: 'pressureHpa', source: 'pressure', units: ['hPa'], unit: 'hectopascals' },
  { id: 'visibility', current: 'visibilityKm', source: 'visibility', units: ['km'], unit: 'kilometres' },
  { id: 'windSpeed', current: 'windSpeedKmh', source: 'wind.speed', units: ['km/h'], unit: 'kilometres-per-hour' },
]

function nestedValue(value: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => (
    isRecord(current) ? current[segment] : undefined
  ), value)
}

function createMetric(
  current: NormalizedCurrentWeather,
  previous: Record<string, unknown>,
  definition: MetricDefinition,
): XiaomiRecentMetricViewModel | null {
  const currentValue = current[definition.current]
  const source = nestedValue(previous, definition.source)
  if (typeof currentValue !== 'number' || !Number.isFinite(currentValue) || !isRecord(source)) return null
  if (typeof source.unit !== 'string' || !definition.units.includes(source.unit)) return null
  const previousValue = finiteNumber(source.value)
  if (previousValue === null) return null

  const rawDelta = currentValue - previousValue
  const delta = Object.is(rawDelta, -0) ? 0 : rawDelta
  return {
    id: definition.id,
    unit: definition.unit,
    previousValue,
    currentValue,
    delta,
    direction: delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'unchanged',
  }
}

export function adaptXiaomiRecentChanges(
  current: NormalizedCurrentWeather,
  value: unknown,
  capability: WeatherCapabilityState,
  diagnostics: XiaomiExtendedDiagnostic[] = [],
): XiaomiRecentChangesViewModel | undefined {
  if (capability !== 'available') return undefined
  if (!Array.isArray(value)) {
    diagnostics.push({ path: '$.extensions.preHour', code: 'invalid-previous-hour' })
    return undefined
  }

  const currentTime = Date.parse(current.observedAt)
  const candidates = value.flatMap((entry) => {
    if (!isRecord(entry)) return []
    const observedAt = isoTimestamp(entry.pubTime)
    if (!observedAt) return []
    const time = Date.parse(observedAt)
    return Number.isFinite(time) && time <= currentTime ? [{ entry, observedAt, time }] : []
  }).sort((a, b) => b.time - a.time)

  const selected = candidates[0]
  if (!selected) {
    diagnostics.push({ path: '$.extensions.preHour', code: 'invalid-previous-hour' })
    return undefined
  }

  const metrics = metricDefinitions.flatMap((definition) => {
    const metric = createMetric(current, selected.entry, definition)
    return metric ? [metric] : []
  })
  if (metrics.length === 0) {
    diagnostics.push({ path: '$.extensions.preHour[0]', code: 'invalid-previous-hour' })
    return undefined
  }

  return { observedAt: selected.observedAt, metrics }
}

export function adaptXiaomiAttribution(
  value: unknown,
  capability: WeatherCapabilityState,
  locale: AppLocale,
  updatedAt: string,
  diagnostics: XiaomiExtendedDiagnostic[] = [],
): XiaomiAttributionViewModel | undefined {
  if (capability !== 'available') return undefined
  if (!isRecord(value) || !Array.isArray(value.brands)) {
    diagnostics.push({ path: '$.extensions.brandInfo', code: 'invalid-attribution' })
    return undefined
  }

  const localeKey = locale === 'zh-CN' ? 'zh_CN' : 'en_US'
  const sourceNames = value.brands.flatMap((brand) => {
    if (!isRecord(brand) || !isRecord(brand.names)) return []
    const name = safeText(brand.names[localeKey], 80)
    return name ? [name] : []
  }).filter((name, index, names) => names.indexOf(name) === index)

  if (sourceNames.length === 0) return undefined
  return { sourceNames, updatedAt }
}

export function buildXiaomiExtendedWeatherViewModel(
  snapshot: ProviderWeatherSnapshot | null,
  locale: AppLocale,
): XiaomiExtendedAdapterResult {
  const diagnostics: XiaomiExtendedDiagnostic[] = []
  if (!snapshot || snapshot.provider !== 'xiaomi' || !isRecord(snapshot.extensions)) {
    return { diagnostics }
  }
  if (hasSecretShapedKey(snapshot.extensions)) {
    return { diagnostics: [{ path: '$.extensions', code: 'secret-field' }] }
  }

  const minutely = adaptXiaomiMinutelySummary(
    snapshot.extensions.minutely,
    snapshot.capabilities.minutely,
    diagnostics,
  )
  const recentChanges = adaptXiaomiRecentChanges(
    snapshot.current,
    snapshot.extensions.preHour,
    snapshot.capabilities.preHour,
    diagnostics,
  )

  if (!minutely && !recentChanges) return { diagnostics }

  const attribution = adaptXiaomiAttribution(
    snapshot.extensions.brandInfo,
    snapshot.capabilities.brandInfo,
    locale,
    snapshot.updatedAt,
    diagnostics,
  )
  return {
    viewModel: {
      ...(minutely ? { minutely } : {}),
      ...(recentChanges ? { recentChanges } : {}),
      ...(attribution ? { attribution } : {}),
    },
    diagnostics,
  }
}
