import type {
  XiaomiAllProxySuccess,
  XiaomiProxyFailure,
  XiaomiProxyMeta,
  XiaomiSearchProxySuccess,
  XiaomiWeatherAllRaw,
} from '@/modules/weather/providers/xiaomi/xiaomiRawTypes'
import type { WeatherCapabilityMap, WeatherCapabilityState } from '@/modules/weather/providers/types'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCapabilityState(value: unknown): value is WeatherCapabilityState {
  return value === 'missing' || value === 'null' || value === 'empty-array' || value === 'empty-object' || value === 'available'
}

function parseCapabilities(value: unknown): WeatherCapabilityMap | null {
  if (!isRecord(value)) return null
  const read = (key: keyof WeatherCapabilityMap) => {
    const state = value[key]
    return isCapabilityState(state) ? state : null
  }
  const current = read('current')
  const hourly = read('hourly')
  const daily = read('daily')
  const aqi = read('aqi')
  const minutely = read('minutely')
  const alerts = read('alerts')
  const indices = read('indices')
  const typhoon = read('typhoon')
  const yesterday = read('yesterday')
  const preHour = read('preHour')
  const sourceMaps = read('sourceMaps')
  const brandInfo = read('brandInfo')
  const updateTime = read('updateTime')
  if (!current || !hourly || !daily || !aqi || !minutely || !alerts || !indices || !typhoon || !yesterday || !preHour || !sourceMaps || !brandInfo || !updateTime) return null
  return { current, hourly, daily, aqi, minutely, alerts, indices, typhoon, yesterday, preHour, sourceMaps, brandInfo, updateTime }
}

function parseMeta(value: unknown): XiaomiProxyMeta | null {
  if (
    !isRecord(value) ||
    typeof value.receivedAt !== 'string' ||
    typeof value.upstreamStatus !== 'number' ||
    !Number.isInteger(value.upstreamStatus)
  ) {
    return null
  }

  const capabilities = value.capabilities === undefined ? undefined : parseCapabilities(value.capabilities)
  if (value.capabilities !== undefined && !capabilities) return null

  return {
    receivedAt: value.receivedAt,
    upstreamStatus: value.upstreamStatus,
    ...(capabilities ? { capabilities } : {}),
  }
}

export function parseXiaomiProxyFailure(value: unknown): XiaomiProxyFailure | null {
  if (!isRecord(value) || value.ok !== false || !isRecord(value.error) || typeof value.error.code !== 'string') {
    return null
  }

  const upstreamStatus = value.error.upstreamStatus
  if (upstreamStatus !== undefined && (!Number.isInteger(upstreamStatus) || typeof upstreamStatus !== 'number')) {
    return null
  }

  return {
    ok: false,
    error: {
      code: value.error.code,
      ...(typeof upstreamStatus === 'number' ? { upstreamStatus } : {}),
    },
  }
}

function parseSuccessBase(value: unknown, operation: 'search' | 'all') {
  if (
    !isRecord(value) ||
    value.ok !== true ||
    value.provider !== 'xiaomi' ||
    value.operation !== operation
  ) {
    return null
  }

  const meta = parseMeta(value.meta)
  return meta ? { value, meta } : null
}

export function parseXiaomiSearchSuccess(value: unknown): XiaomiSearchProxySuccess | null {
  const base = parseSuccessBase(value, 'search')
  if (!base || !isRecord(base.value.data) || !Array.isArray(base.value.data.results)) {
    return null
  }

  if (!base.value.data.results.every(isRecord)) {
    return null
  }

  return {
    ok: true,
    provider: 'xiaomi',
    operation: 'search',
    data: { results: base.value.data.results },
    meta: base.meta,
  }
}

export function parseXiaomiAllSuccess(value: unknown): XiaomiAllProxySuccess | null {
  const base = parseSuccessBase(value, 'all')
  if (!base || !isRecord(base.value.data)) {
    return null
  }

  return {
    ok: true,
    provider: 'xiaomi',
    operation: 'all',
    data: base.value.data as XiaomiWeatherAllRaw,
    meta: base.meta,
  }
}
