import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const errors = []

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8')
}

function requireFile(relPath) {
  try {
    if (!statSync(join(root, relPath)).isFile()) {
      errors.push(`${relPath} is not a file`)
    }
  } catch {
    errors.push(`${relPath} is missing`)
  }
}

for (const script of [
  'scripts/lb-2a-validate-weather-scenes.mjs',
  'scripts/lb-2b-validate-partly-cloudy-day-config-renderer.mjs',
  'scripts/lb-2c-validate-partly-cloudy-night-config-renderer.mjs',
]) {
  execFileSync(process.execPath, [join(root, script)], {
    cwd: root,
    stdio: 'inherit',
  })
}

const requiredFiles = [
  'src/modules/weather/renderers/pixi/WeatherPixiLayer.vue',
  'src/modules/weather/renderers/pixi/weatherPixiRuntimeDebug.ts',
  'src/modules/weather/renderers/pixi/createPixiTextureFromImage.ts',
  'src/modules/weather/renderers/pixi/createAmbientLightTexture.ts',
  'src/modules/weather/renderers/pixi/partlyCloudyPixiPreset.ts',
  'src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts',
  'src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts',
  'src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts',
  'docs/weather-scene-architecture.md',
  'docs/lb-2d-weather-scene-runtime-stability-audit.md',
]

for (const file of requiredFiles) {
  requireFile(file)
}

const pixiLayer = read('src/modules/weather/renderers/pixi/WeatherPixiLayer.vue')
const debug = read('src/modules/weather/renderers/pixi/weatherPixiRuntimeDebug.ts')
const preset = read('src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts')
const capabilities = read('src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts')
const planBuilder = read('src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts')
const packageJson = read('package.json')

function count(text, pattern) {
  return text.match(pattern)?.length ?? 0
}

if (count(pixiLayer, /new pixi\.Application\(\)/g) !== 1) {
  errors.push('Pixi runtime must keep exactly one Application creation entry point')
}

for (const token of [
  'let initializingApp',
  'recordWeatherPixiApplicationCreated',
  'recordWeatherPixiApplicationDestroyed',
  'recordWeatherPixiCanvasMounted',
  'recordWeatherPixiCanvasRemoved',
  'recordWeatherPixiSceneBuilt',
  'recordWeatherPixiSceneDestroyed',
  'recordWeatherPixiTickerAdded',
  'recordWeatherPixiTickerRemoved',
  'recordWeatherPixiResizeListenerAdded',
  'recordWeatherPixiResizeListenerRemoved',
  'recordWeatherPixiVisibilityListenerAdded',
  'recordWeatherPixiVisibilityListenerRemoved',
  'recordWeatherPixiMediaQueryListenersAdded',
  'recordWeatherPixiMediaQueryListenersRemoved',
  'recordWeatherPixiGeneration',
]) {
  if (!pixiLayer.includes(token)) {
    errors.push(`WeatherPixiLayer missing lifecycle counter or guard: ${token}`)
  }
}

if (count(pixiLayer, /app\.ticker\.add\(onTick\)/g) !== 1) {
  errors.push('Pixi ticker add count changed unexpectedly')
}
if (count(pixiLayer, /handles\.app\.ticker\.remove\(handles\.onTick\)/g) !== 1) {
  errors.push('Pixi ticker removal must use the same stable callback reference')
}
if (count(pixiLayer, /document\.addEventListener\('visibilitychange', pauseForVisibility\)/g) !== 1) {
  errors.push('visibility listener must be registered once per component instance')
}
if (count(pixiLayer, /document\.removeEventListener\('visibilitychange', pauseForVisibility\)/g) !== 1) {
  errors.push('visibility listener must be removed with the same callback reference')
}
if (count(pixiLayer, /\.addEventListener\('change', handle/g) !== 3) {
  errors.push('media query change listener add count must remain three')
}
if (count(pixiLayer, /\.removeEventListener\('change', handle/g) !== 3) {
  errors.push('media query change listener remove count must remain three')
}
if (!/resizeObserver = new ResizeObserver/.test(pixiLayer) || !/resizeObserver\.disconnect\(\)/.test(pixiLayer)) {
  errors.push('ResizeObserver setup and cleanup must both be present')
}
if (!/initGeneration\.value \+= 1/.test(pixiLayer) || !/generation !== initGeneration\.value/.test(pixiLayer)) {
  errors.push('async initialization must retain generation guards')
}
if (!/disposed \|\| generation !== initGeneration\.value/.test(pixiLayer)) {
  errors.push('async initialization must check disposed/generation before committing')
}
if (/ref<.*Application|reactive\(|markRaw/.test(pixiLayer)) {
  errors.push('Pixi Application should remain outside deep Vue reactivity')
}

for (const token of [
  'import.meta.env.DEV',
  "window.localStorage.getItem(debugStorageKey) === '1'",
  '__lifeboardWeatherSceneRuntimeDebug',
  'applicationCount',
  'canvasCount',
  'tickerCallbackCount',
  'resizeListenerCount',
  'visibilityListenerCount',
  'textureCreationCount',
  'currentGeneration',
]) {
  if (!debug.includes(token)) {
    errors.push(`runtime debug snapshot missing gated field or API token: ${token}`)
  }
}

for (const token of [
  "x: 5",
  "y: -2",
  'scale: 1.008',
  'opacity: 0.2',
  "x: 3",
  "y: -1.5",
  'scale: 1.006',
  'opacity: 0.16',
  "maxFps: 30",
  "maxFps: 24",
]) {
  if (!preset.includes(token)) {
    errors.push(`partly cloudy visual parameter unexpectedly missing: ${token}`)
  }
}

for (const forbidden of [
  "weatherSceneId('clear-day')",
  "weatherSceneId('rain",
  "weatherSceneId('snow",
  "weatherSceneId('fog",
  "weatherSceneId('thunder",
  "weatherSceneId('sand",
]) {
  if (planBuilder.includes(forbidden)) {
    errors.push(`LB-2D must not migrate another scene through the config renderer: ${forbidden}`)
  }
}

if (!capabilities.includes("PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'")) {
  errors.push('partly-cloudy-day explicit routing id is missing')
}
if (!capabilities.includes("PARTLY_CLOUDY_NIGHT_SCENE_ID = 'partly-cloudy-night'")) {
  errors.push('partly-cloudy-night explicit routing id is missing')
}
if (/startsWith|includes\('partly-cloudy'\)/.test(capabilities)) {
  errors.push('config-driven routing must not use prefix matching')
}

if (/playwright|vitest|jest|@testing-library/.test(packageJson)) {
  errors.push('LB-2D must not add test dependencies or package changes')
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('LB-2D weather scene runtime stability validation PASS')
