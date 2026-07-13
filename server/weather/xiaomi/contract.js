const CAPABILITY_TYPES = Object.freeze({
  current: 'object',
  hourly: 'object',
  daily: 'object',
  aqi: 'object',
  minutely: 'object',
  alerts: 'array',
  indices: 'object',
  typhoon: 'array',
  yesterday: 'object',
  preHour: 'array',
  sourceMaps: 'object',
  brandInfo: 'object',
  updateTime: 'integer',
})

const CAPABILITY_PATHS = Object.freeze({
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
})

export class XiaomiContractError extends Error {
  constructor() {
    super('Xiaomi Weather response contract is invalid.')
    this.name = 'XiaomiContractError'
  }
}

export class XiaomiResponseSecretLeakError extends Error {
  constructor() {
    super('Xiaomi Weather response contained a server credential.')
    this.name = 'XiaomiResponseSecretLeakError'
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidSearchResult(value) {
  return isPlainObject(value) && typeof value.locationKey === 'string' && value.locationKey.trim().length > 0
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value))
}

function removeKnownSecretEchoes(value) {
  const clientInfo = value?.sourceMaps?.clientInfo

  if (isPlainObject(clientInfo)) {
    delete clientInfo.appKey
    delete clientInfo.appVersion
  }
}

function containsSecretValue(value, secrets) {
  if (value === null || value === undefined) return false

  if (typeof value !== 'object') {
    const comparableValue = String(value)
    return secrets.some((secret) => comparableValue.includes(secret))
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsSecretValue(item, secrets))
  }

  return Object.values(value).some((item) => containsSecretValue(item, secrets))
}

export function sanitizeXiaomiPayload(payload, secrets) {
  const sanitized = cloneJson(payload)
  removeKnownSecretEchoes(sanitized)

  if (containsSecretValue(sanitized, secrets.filter((secret) => secret.length > 0))) {
    throw new XiaomiResponseSecretLeakError()
  }

  return sanitized
}

export function normalizeXiaomiSearchPayload(payload) {
  if (payload === null) return []

  const results = Array.isArray(payload) ? payload : [payload]

  if (!results.every(isValidSearchResult)) {
    throw new XiaomiContractError()
  }

  return results
}

function valueState(value, exists) {
  if (!exists) return 'missing'
  if (value === null) return 'null'
  if (Array.isArray(value)) return value.length === 0 ? 'empty-array' : 'available'
  if (isPlainObject(value)) return Object.keys(value).length === 0 ? 'empty-object' : 'available'
  return 'available'
}

function matchesExpectedType(value, expectedType) {
  if (value === null || value === undefined) return true
  if (expectedType === 'array') return Array.isArray(value)
  if (expectedType === 'object') return isPlainObject(value)
  if (expectedType === 'integer') return Number.isInteger(value)
  return false
}

export function inspectXiaomiAllPayload(payload) {
  if (!isPlainObject(payload)) {
    throw new XiaomiContractError()
  }

  const capabilities = {}

  for (const [capability, propertyName] of Object.entries(CAPABILITY_PATHS)) {
    const exists = Object.prototype.hasOwnProperty.call(payload, propertyName)
    const value = payload[propertyName]

    if (exists && !matchesExpectedType(value, CAPABILITY_TYPES[capability])) {
      throw new XiaomiContractError()
    }

    capabilities[capability] = valueState(value, exists)
  }

  return capabilities
}
