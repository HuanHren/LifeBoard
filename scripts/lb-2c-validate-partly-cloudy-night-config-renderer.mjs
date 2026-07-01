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
  'src/modules/weather/constants/weatherAtmosphereAssets.ts',
  'src/modules/weather/scenes/weatherSceneAssets.ts',
  'src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts',
  'src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts',
  'src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts',
  'src/modules/weather/components/WeatherAtmosphere.vue',
  'src/modules/weather/components/WeatherSnapshotLayer.vue',
  'src/modules/weather/renderers/pixi/WeatherPixiLayer.vue',
  'docs/lb-2c-partly-cloudy-night-config-renderer.md',
]

for (const file of requiredFiles) {
  requireFile(file)
}

const assets = read('src/modules/weather/constants/weatherAtmosphereAssets.ts')
for (const token of [
  'partlyCloudyNightBaseDesktopAvif',
  'partlyCloudyNightBaseDesktopWebp',
  'partlyCloudyNightBaseMobileAvif',
  'partlyCloudyNightBaseMobileWebp',
  "'partly-cloudy-night'",
  'base: {',
]) {
  if (!assets.includes(token)) {
    errors.push(`partly-cloudy-night atmosphere assets are missing ${token}`)
  }
}

const sceneAssets = read('src/modules/weather/scenes/weatherSceneAssets.ts')
for (const token of [
  'partlyCloudyNightAssets',
  'desktop: partlyCloudyNightAssets?.desktop',
  'mobile: partlyCloudyNightAssets?.mobile',
  'fallback: partlyCloudyNightAssets?.desktop',
]) {
  if (!sceneAssets.includes(token)) {
    errors.push(`partly-cloudy-night scene asset registry is missing ${token}`)
  }
}

const capabilities = read('src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts')
for (const token of [
  "PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'",
  "PARTLY_CLOUDY_NIGHT_SCENE_ID = 'partly-cloudy-night'",
  'isPartlyCloudyDayScene(scene) && scene.context.timeline !==',
  'isPartlyCloudyNightScene(scene) && scene.context.timeline ===',
  "scene.selectedQuality !== 'static'",
  '!scene.context.reducedMotion',
]) {
  if (!capabilities.includes(token)) {
    errors.push(`config-driven routing is missing ${token}`)
  }
}
if (/startsWith|includes\('partly-cloudy'\)/.test(capabilities)) {
  errors.push('config-driven routing must use explicit scene ids, not prefix matching')
}

const planBuilder = read('src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts')
for (const token of [
  'isConfigDrivenPartlyCloudyScene',
  'isPartlyCloudyNightScene',
  "Only partly-cloudy-day and partly-cloudy-night",
  "'UNSUPPORTED_LAYER'",
  "visualKey = isPartlyCloudyNightScene(scene)",
  "?'partly-cloudy-night'",
  ":'partly-cloudy-day'",
  'driftX: cloudLayer.drift.x',
  'driftY: cloudLayer.drift.y',
  'scale: cloudLayer.scale',
  'ambientOpacity: lightLayer.opacity',
]) {
  if (!planBuilder.replace(/\s+/g, '').includes(token.replace(/\s+/g, ''))) {
    errors.push(`render plan is missing ${token}`)
  }
}

const preset = read('src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts')
const nightPresetMatch = preset.match(/export const partlyCloudyNightScenePreset = \{[\s\S]*?\n\} satisfies WeatherScenePreset/)
const nightPreset = nightPresetMatch?.[0] ?? ''
for (const token of [
  "id: weatherSceneId('partly-cloudy-night')",
  "periods: ['night', 'pre-dawn', 'dusk']",
  "id: weatherSceneLayerId('partly-cloudy-night-base')",
  "kind: 'cloud'",
  "assetId: WEATHER_SCENE_ASSET_IDS.partlyCloudyNightPoster",
  'x: 3',
  'y: -1.5',
  'scale: 1.006',
  "id: weatherSceneLayerId('partly-cloudy-night-ambient')",
  "kind: 'light'",
  'opacity: 0.16',
  "objectPosition: '56% center'",
  'quality: partlyCloudyConfigSceneQuality',
]) {
  if (!nightPreset.includes(token)) {
    errors.push(`partly-cloudy-night preset is missing ${token}`)
  }
}
if (/kind:\s*'particle'|kind:\s*'shader'/.test(nightPreset)) {
  errors.push('partly-cloudy-night enables forbidden particle or shader layers')
}

const atmosphere = read('src/modules/weather/components/WeatherAtmosphere.vue')
for (const token of [
  'buildWeatherSceneContext',
  'resolveWeatherScene',
  'buildWeatherSceneRenderPlan',
  'configDrivenRenderPlan',
  'shouldUseStaticNightPoster',
  "props.atmosphere === 'partly-cloudy-night'",
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

const snapshotLayer = read('src/modules/weather/components/WeatherSnapshotLayer.vue')
if (/resolveWeatherScene|buildWeatherSceneRenderPlan|WeatherScenePreset/.test(snapshotLayer)) {
  errors.push('WeatherSnapshotLayer gained scene renderer coupling')
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
if ((pixiLayer.match(/new pixi\.Application\(\)/g) ?? []).length !== 1) {
  errors.push('Pixi runtime initialization count changed unexpectedly')
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

console.log('LB-2C partly-cloudy-night config renderer validation PASS')
