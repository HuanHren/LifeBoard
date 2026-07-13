const REQUIRED_NON_EMPTY_VARIABLES = [
  'XIAOMI_WEATHER_BASE_URL',
  'XIAOMI_WEATHER_APP_KEY',
  'XIAOMI_WEATHER_SIGN',
  'XIAOMI_WEATHER_APP_VERSION',
  'XIAOMI_WEATHER_ROM_VERSION',
  'XIAOMI_WEATHER_DEVICE',
]

export const XIAOMI_ENVIRONMENT_VARIABLES = [
  ...REQUIRED_NON_EMPTY_VARIABLES,
  'XIAOMI_WEATHER_OAID',
]

export class XiaomiConfigError extends Error {
  constructor(variableNames) {
    super('Xiaomi Weather proxy configuration is invalid.')
    this.name = 'XiaomiConfigError'
    this.variableNames = [...variableNames]
  }
}

function readNonEmptyValue(environment, variableName) {
  const value = environment[variableName]
  return typeof value === 'string' ? value.trim() : ''
}

function parseBaseUrl(value) {
  let url

  try {
    url = new URL(value)
  } catch {
    throw new XiaomiConfigError(['XIAOMI_WEATHER_BASE_URL'])
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new XiaomiConfigError(['XIAOMI_WEATHER_BASE_URL'])
  }

  return url
}

export function loadXiaomiConfig(environment = process.env) {
  const missingVariables = REQUIRED_NON_EMPTY_VARIABLES.filter(
    (variableName) => readNonEmptyValue(environment, variableName).length === 0,
  )

  if (missingVariables.length > 0) {
    throw new XiaomiConfigError(missingVariables)
  }

  const baseUrl = parseBaseUrl(readNonEmptyValue(environment, 'XIAOMI_WEATHER_BASE_URL'))

  return Object.freeze({
    baseUrl,
    appKey: readNonEmptyValue(environment, 'XIAOMI_WEATHER_APP_KEY'),
    sign: readNonEmptyValue(environment, 'XIAOMI_WEATHER_SIGN'),
    appVersion: readNonEmptyValue(environment, 'XIAOMI_WEATHER_APP_VERSION'),
    romVersion: readNonEmptyValue(environment, 'XIAOMI_WEATHER_ROM_VERSION'),
    device: readNonEmptyValue(environment, 'XIAOMI_WEATHER_DEVICE'),
    // The authorized HAR proves successful requests with an explicitly empty oaid.
    oaid: typeof environment.XIAOMI_WEATHER_OAID === 'string'
      ? environment.XIAOMI_WEATHER_OAID.trim()
      : '',
  })
}

export function getXiaomiSecretValues(config) {
  return [...new Set([
    config.appKey,
    config.sign,
    config.appVersion,
    config.romVersion,
    config.device,
    config.oaid,
  ].filter((value) => typeof value === 'string' && value.length > 0))]
}
