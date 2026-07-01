import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const sceneRoot = join(root, 'src/modules/weather/scenes')
const requiredFiles = [
  'src/modules/weather/scenes/weatherSceneTypes.ts',
  'src/modules/weather/scenes/buildWeatherSceneContext.ts',
  'src/modules/weather/scenes/weatherSceneAssets.ts',
  'src/modules/weather/scenes/weatherSceneRegistry.ts',
  'src/modules/weather/scenes/resolveWeatherScene.ts',
  'src/modules/weather/scenes/validateWeatherScene.ts',
  'src/modules/weather/scenes/compareWeatherSceneResolution.ts',
  'src/modules/weather/scenes/adapters/legacyWeatherVisualAdapter.ts',
  'docs/weather-scene-architecture.md',
  'docs/lb-2a-weather-scene-schema-integration.md',
]

const errors = []

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8')
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

for (const file of requiredFiles) {
  try {
    if (statSync(join(root, file)).size === 0) {
      errors.push(`${file} is empty`)
    }
  } catch {
    errors.push(`${file} is missing`)
  }
}

const sceneFiles = walk(sceneRoot).filter((file) => file.endsWith('.ts'))
for (const file of sceneFiles) {
  const text = readFileSync(file, 'utf8')
  const rel = relative(root, file)
  if (/\bany\b/.test(text)) errors.push(`${rel} contains any`)
  if (/@ts-ignore|@ts-expect-error/.test(text)) errors.push(`${rel} contains TypeScript suppression`)
  if (/MGL|Majestic|XiaomiWeather-Reversing|http:\/\/|https:\/\//.test(text)) {
    errors.push(`${rel} contains forbidden runtime/API wording or external URL`)
  }
}

const registry = read('src/modules/weather/scenes/weatherSceneRegistry.ts')
for (const sceneId of ['clear-day', 'clear-night', 'partly-cloudy-day', 'partly-cloudy-night', 'static-fallback']) {
  if (!registry.includes(sceneId.replace(/-([a-z])/g, (_, char) => char.toUpperCase()))) {
    errors.push(`registry does not import expected preset for ${sceneId}`)
  }
}

const clearPresets = read('src/modules/weather/scenes/presets/clearScenePresets.ts')
const partlyPresets = read('src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts')
const fallbackPreset = read('src/modules/weather/scenes/presets/staticFallbackScenePreset.ts')
for (const [label, text] of [
  ['clear presets', clearPresets],
  ['partly cloudy presets', partlyPresets],
  ['fallback preset', fallbackPreset],
]) {
  if (/kind:\s*'particle'/.test(text)) errors.push(`${label} unexpectedly enables particle layers`)
  if (/kind:\s*'shader'/.test(text) && !/enabled:\s*false/.test(text)) {
    errors.push(`${label} contains enabled shader layer`)
  }
}

const store = read('src/modules/weather/stores/weather.ts')
if (/WeatherScene|weatherScene|scenePreset|ScenePreset/.test(store)) {
  errors.push('weather store references scene preset concepts')
}

for (const visualFile of [
  'src/modules/weather/components/WeatherAtmosphere.vue',
  'src/modules/weather/renderers/pixi/WeatherPixiLayer.vue',
  'src/modules/weather/components/WeatherHero.vue',
  'src/modules/weather/composables/useWeatherSnapshotTransition.ts',
]) {
  if (!statSync(join(root, visualFile)).isFile()) {
    errors.push(`${visualFile} is unavailable`)
  }
}

const validationSource = read('src/modules/weather/scenes/validateWeatherScene.ts')
for (const token of ['duplicate', 'External URLs are not allowed', 'Shader layers must remain disabled']) {
  if (!validationSource.includes(token)) {
    errors.push(`validator does not cover ${token}`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('LB-2A weather scene foundation validation PASS')
