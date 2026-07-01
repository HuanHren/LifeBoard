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

const requiredFiles = [
  'src/modules/weather/scenes/runtime/weatherSceneRuntimeTypes.ts',
  'src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts',
  'src/modules/weather/scenes/runtime/resolveWeatherSceneAsset.ts',
  'src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts',
  'src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts',
  'src/modules/weather/components/WeatherAtmosphere.vue',
  'src/modules/weather/components/WeatherSnapshotLayer.vue',
  'src/modules/weather/renderers/pixi/WeatherPixiLayer.vue',
  'docs/lb-2b-partly-cloudy-day-config-renderer.md',
]

for (const file of requiredFiles) {
  requireFile(file)
}

const capabilities = read('src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts')
if (!capabilities.includes("PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'")) {
  errors.push('config-driven renderer does not use the stable partly-cloudy-day scene id')
}
if (!/scene\.preset\.id === PARTLY_CLOUDY_DAY_SCENE_ID/.test(capabilities)) {
  errors.push('renderer routing is not based on resolved scene id')
}
if (!/scene\.selectedQuality !== 'static'/.test(capabilities)) {
  errors.push('static quality is not excluded from config-driven routing')
}
if (!/isPartlyCloudyDayScene\(scene\) && scene\.context\.timeline !== 'night'/.test(capabilities)) {
  errors.push('partly-cloudy-day routing does not guard against night timeline')
}
if (!/!scene\.context\.reducedMotion/.test(capabilities)) {
  errors.push('reduced motion is not excluded from config-driven routing')
}

const planBuilder = read('src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts')
for (const token of [
  'validateWeatherScenePreset',
  'resolveWeatherSceneAsset',
  "'UNSUPPORTED_LAYER'",
  ":'partly-cloudy-day'",
  'driftX: cloudLayer.drift.x',
  'driftY: cloudLayer.drift.y',
  'ambientOpacity: lightLayer.opacity',
]) {
  if (!planBuilder.replace(/\s+/g, '').includes(token.replace(/\s+/g, ''))) {
    errors.push(`render plan is missing ${token}`)
  }
}
if (/kind !== 'cloud' && layer\.kind !== 'light'/.test(planBuilder) === false) {
  errors.push('render plan does not reject unsupported layer kinds')
}

const preset = read('src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts')
for (const token of [
  "id: weatherSceneId('partly-cloudy-day')",
  "kind: 'cloud'",
  "kind: 'light'",
  'x: 5',
  'y: -2',
  'scale: 1.008',
  'opacity: 0.2',
  "objectPosition: '56% center'",
]) {
  if (!preset.includes(token)) {
    errors.push(`partly-cloudy-day preset is missing ${token}`)
  }
}
if (/kind:\s*'particle'|kind:\s*'shader'/.test(preset)) {
  errors.push('partly cloudy presets enable forbidden particle or shader layers')
}

const atmosphere = read('src/modules/weather/components/WeatherAtmosphere.vue')
for (const token of [
  'buildWeatherSceneContext',
  'resolveWeatherScene',
  'buildWeatherSceneRenderPlan',
  'configDrivenRenderPlan',
  "return 'config-driven'",
  ':scene-plan="configDrivenRenderPlan"',
]) {
  if (!atmosphere.includes(token)) {
    errors.push(`WeatherAtmosphere does not wire ${token}`)
  }
}
if (/props\.visual\?\.condition\s*!==\s*'partly-cloudy'/.test(atmosphere) === false) {
  errors.push('legacy pixi visual key routing was not preserved for non-config scenes')
}

const pixiLayer = read('src/modules/weather/renderers/pixi/WeatherPixiLayer.vue')
for (const token of [
  'scenePlan?: ConfigDrivenWeatherScenePlan | null',
  'props.scenePlan.options',
  'props.scenePlan?.visualKey ?? props.visualKey',
  'props.scenePlan?.layerCount',
  'props.scenePlan?.loadedLayerCount',
]) {
  if (!pixiLayer.includes(token)) {
    errors.push(`WeatherPixiLayer does not consume ${token}`)
  }
}
if (/new pixi\.Application\(\)/g.test(pixiLayer) === false) {
  errors.push('Pixi runtime initialization was not preserved')
}
if ((pixiLayer.match(/app\.ticker\.add\(onTick\)/g) ?? []).length !== 1) {
  errors.push('Pixi ticker registration count changed unexpectedly')
}

for (const file of [
  'src/modules/weather/services/weatherForecastProvider.ts',
  'src/modules/weather/services/weatherForecastCache.ts',
  'src/modules/weather/stores/weather.ts',
]) {
  const text = read(file)
  if (/WeatherScene|scenePreset|ConfigDrivenWeatherScenePlan/.test(text)) {
    errors.push(`${file} gained scene renderer coupling`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('LB-2B partly-cloudy-day config renderer validation PASS')
