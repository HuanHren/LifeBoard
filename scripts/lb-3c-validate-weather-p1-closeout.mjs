import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const errors = []

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8')
}

function requireFile(relPath) {
  if (!existsSync(join(root, relPath))) {
    errors.push(`${relPath} is missing`)
  }
}

function requireIncludes(relPath, tokens) {
  const text = existsSync(join(root, relPath)) ? read(relPath) : ''

  for (const token of tokens) {
    if (!text.includes(token)) {
      errors.push(`${relPath} is missing ${token}`)
    }
  }
}

const requiredFiles = [
  'scripts/lb-3c-validate-weather-p1-closeout.mjs',
  'scripts/lb-3c-verify-weather-states.mjs',
  'docs/lb-3c-weather-p1-closeout.md',
  'docs/weather-scene-architecture.md',
  'docs/lb-3a-weather-completion-audit.md',
  'docs/lb-3a-weather-definition-of-done.md',
  'docs/lb-3a-weather-closeout-roadmap.md',
  'docs/lb-3a-weather-issue-matrix.csv',
]

for (const file of requiredFiles) {
  requireFile(file)
}

requireIncludes('src/modules/weather/utils/weatherSolarPhase.ts', [
  'getWeatherCurrentTimestamp',
  'parseSolarTimestamp(weather.current.time',
  'const phaseNowMs',
])

requireIncludes('src/modules/weather/types/weather.ts', [
  'visibility: string',
  'visibility: number | null',
  'providerCapabilities?: WeatherProviderCapabilities',
])
requireIncludes('src/modules/weather/constants/weather.ts', ["'visibility'"])
requireIncludes('src/modules/weather/types/openMeteo.ts', [
  'visibility: string',
  'visibility?: number',
])
requireIncludes('src/modules/weather/utils/weatherNormalizer.ts', [
  'normalizeVisibilityMeters',
  "providerCapabilities: getWeatherProviderCapabilities('openMeteo')",
  "visibility: 'km'",
])
requireIncludes('src/modules/weather/types/caiyun.ts', ['visibility?: number'])
requireIncludes('src/modules/weather/utils/caiyunWeatherNormalizer.ts', [
  'normalizeVisibilityKm',
  "providerCapabilities: getWeatherProviderCapabilities('caiyun')",
  "visibility: 'km'",
])
requireIncludes('src/modules/weather/utils/weatherFormatting.ts', [
  'formatVisibility',
])
requireIncludes('src/modules/weather/components/WeatherDetailsGrid.vue', [
  'weather.details.visibility.label',
  'formatVisibility',
  'describeVisibility',
])

requireIncludes('src/modules/weather/constants/weatherProviderCapabilities.ts', [
  'WEATHER_PROVIDER_CAPABILITIES',
  'alerts: false',
  'alerts: true',
])
requireIncludes('src/modules/weather/types/weatherAlert.ts', [
  'WeatherAlertStatus',
  'SUPPORTED_NO_ACTIVE_ALERTS',
  'UNSUPPORTED_BY_PROVIDER',
])
requireIncludes('src/modules/weather/utils/weatherAlerts.ts', [
  'resolveWeatherAlertStatus',
  'getWeatherProviderCapabilities',
])
requireIncludes('src/modules/weather/components/WeatherAlertSection.vue', [
  'status: WeatherAlertStatus',
  'weather.alert.status.supportedNone',
  'weather.alert.status.unsupported',
])
requireIncludes('src/modules/weather/components/WeatherWorkspace.vue', [
  'resolveWeatherAlertStatus',
  ':status="weatherAlertStatus"',
])
requireIncludes('src/modules/weather/constants/weatherSources.ts', ["'alerts'"])

const harness = existsSync(join(root, 'scripts/lb-3c-verify-weather-states.mjs'))
  ? read('scripts/lb-3c-verify-weather-states.mjs')
  : ''
for (const scenario of [
  'NORMAL_DESKTOP',
  'NORMAL_MOBILE',
  'OFFLINE_WITH_STALE_CACHE',
  'PROVIDER_ERROR_NO_CACHE',
  'LOCATION_DENIED',
  'LOCATION_TIMEOUT',
  'CITY_SEARCH_EMPTY',
  'PARTIAL_CURRENT_ONLY',
  'PARTIAL_NO_HOURLY',
  'PARTIAL_NO_DAILY',
  'ALERTS_UNSUPPORTED',
  'ALERTS_SUPPORTED_NONE',
  'ALERTS_ACTIVE',
  'VISIBILITY_PRESENT',
  'VISIBILITY_MISSING',
  'REDUCED_MOTION',
  'WEBGL_UNAVAILABLE',
]) {
  if (!harness.includes(scenario)) {
    errors.push(`browser state harness is missing ${scenario}`)
  }
}

const matrix = existsSync(join(root, 'docs/lb-3a-weather-issue-matrix.csv'))
  ? read('docs/lb-3a-weather-issue-matrix.csv')
  : ''
for (const id of ['P1-01', 'P1-02', 'P1-03', 'P1-04']) {
  const row = matrix.split(/\r?\n/).find((line) => line.startsWith(`${id},`))
  if (!row) {
    errors.push(`issue matrix is missing ${id}`)
  } else if (!/,RESOLVED,|,ACCEPTED_LIMITATION,/.test(row)) {
    errors.push(`${id} is not RESOLVED or ACCEPTED_LIMITATION`)
  }
}

const preset = existsSync(join(root, 'src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts'))
  ? read('src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts')
  : ''
if (/weatherSceneId\('(clear|rain|snow|fog|cloudy|haze)/.test(preset)) {
  errors.push('LB-3C introduced an out-of-scope scene preset')
}

function gitLines(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const changedPaths = [
  ...gitLines(['diff', '--name-only', '--diff-filter=ACMRTUXB', 'HEAD', '--']),
  ...gitLines(['ls-files', '--others', '--exclude-standard']),
]

for (const changedPath of changedPaths) {
  const normalized = changedPath.replace(/\\/g, '/')
  if (/^(public\/weather|package\.json|package-lock\.json|docs\/skill-audit|docs copy)/.test(normalized)) {
    errors.push(`out-of-scope path changed: ${normalized}`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('LB-3C weather P1 closeout validation PASS')
