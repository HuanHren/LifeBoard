import { readFileSync, readdirSync, statSync } from 'node:fs'
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

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

const requiredFiles = [
  'docs/lb-2e-clear-day-migration-suitability.md',
  'docs/weather-scene-architecture.md',
  'scripts/lb-2e-validate-clear-day-suitability.mjs',
  'src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts',
  'src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts',
  'src/modules/weather/scenes/presets/clearScenePresets.ts',
  'src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts',
  'src/modules/weather/components/WeatherAtmosphere.vue',
  'src/modules/weather/components/WeatherSnapshotLayer.vue',
  'src/modules/weather/renderers/pixi/WeatherPixiLayer.vue',
  'src/modules/weather/constants/weatherAtmosphereAssets.ts',
  'src/modules/weather/visual/weather-visual-registry.ts',
  'src/modules/weather/visual/resolve-weather-visual.ts',
  'public/weather-assets/vendor/xiaomi/manifest.json',
]

for (const file of requiredFiles) {
  requireFile(file)
}

const doc = read('docs/lb-2e-clear-day-migration-suitability.md')
const architecture = read('docs/weather-scene-architecture.md')
const capabilities = read('src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts')
const planBuilder = read('src/modules/weather/scenes/runtime/buildWeatherSceneRenderPlan.ts')
const clearPresets = read('src/modules/weather/scenes/presets/clearScenePresets.ts')
const atmosphere = read('src/modules/weather/components/WeatherAtmosphere.vue')
const snapshotLayer = read('src/modules/weather/components/WeatherSnapshotLayer.vue')
const pixiLayer = read('src/modules/weather/renderers/pixi/WeatherPixiLayer.vue')
const assets = read('src/modules/weather/constants/weatherAtmosphereAssets.ts')
const visualRegistry = read('src/modules/weather/visual/weather-visual-registry.ts')
const resolveVisual = read('src/modules/weather/visual/resolve-weather-visual.ts')
const manifest = JSON.parse(read('public/weather-assets/vendor/xiaomi/manifest.json'))

const requiredSections = [
  '## Skill Gate',
  '## Branch And Baseline',
  '## Build And Regression Baseline',
  '## Existing Clear Day Path',
  '## Desktop Asset Readiness',
  '## Mobile Asset Readiness',
  '## Legacy Layer Model',
  '## Motion Parameters',
  '## Solar Period And Resolver Boundary',
  '## Runtime Capability Comparison',
  '## Layer Applicability',
  '## Fallback Readiness',
  '## Visual Equivalence Feasibility',
  '## Browser Baseline',
  '## Runtime Risk',
  '## Migration Value',
  '## Prerequisites',
  '## Final Decision',
  '## Production Code Confirmation',
  '## Validation',
  '## Files Changed',
  '## Recommended Next Step',
]

for (const section of requiredSections) {
  if (!doc.includes(section)) {
    errors.push(`LB-2E document is missing section ${section}`)
  }
}

const decisionMatch = doc.match(/Decision:\s*`(SUITABLE|SUITABLE_WITH_PREREQUISITES|NOT_SUITABLE_YET)`/)
if (!decisionMatch) {
  errors.push('LB-2E document does not contain a legal decision value')
}

if (!doc.includes('Decision: `NOT_SUITABLE_YET`')) {
  errors.push('LB-2E decision must remain NOT_SUITABLE_YET for the current evidence')
}

const prereqMatches = doc.match(/^PREREQ-\d+:/gm) ?? []
if (prereqMatches.length > 3) {
  errors.push('LB-2E document lists more than three prerequisites')
}

for (const token of [
  'data-weather-asset-origin="authorized-vendor"',
  'sceneKey: `clear-day`',
  'Current browser-verified legacy layer count: `3`',
  '`particle`',
  'imgCurrentSrc=null',
  '%TEMP%\\lifeboard-lb2e-browser\\desktop-clear-day.png',
]) {
  if (!doc.includes(token)) {
    errors.push(`LB-2E document is missing evidence token: ${token}`)
  }
}

if (!architecture.includes('LB-2E clear-day migration suitability')) {
  errors.push('architecture doc does not record LB-2E status')
}
if (!architecture.includes('clear-day is not allowed to enter LB-2F yet')) {
  errors.push('architecture doc does not state the LB-2F gate')
}

for (const token of [
  "PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'",
  "PARTLY_CLOUDY_NIGHT_SCENE_ID = 'partly-cloudy-night'",
  'isConfigDrivenPartlyCloudyScene',
  "scene.selectedQuality !== 'static'",
  '!scene.context.reducedMotion',
]) {
  if (!capabilities.includes(token)) {
    errors.push(`config-driven capability guard missing ${token}`)
  }
}

if (/CLEAR_DAY|clear-day|clearDay/.test(capabilities)) {
  errors.push('clear-day must not be added to config-driven capability routing')
}
if (/startsWith|includes\('partly-cloudy'\)/.test(capabilities)) {
  errors.push('config-driven routing must remain explicit, not prefix based')
}

for (const forbidden of [
  "weatherSceneId('clear-day')",
  "CLEAR_DAY",
  "visualKey = 'clear-day'",
  ":'clear-day'",
]) {
  if (planBuilder.includes(forbidden)) {
    errors.push(`render plan appears to migrate clear-day: ${forbidden}`)
  }
}

for (const token of [
  'Only partly-cloudy-day and partly-cloudy-night are enabled for config-driven rendering.',
  "Layer kind ${unsupportedLayer.kind} is not supported by the partly cloudy config renderer.",
  "kind !== 'cloud' && layer.kind !== 'light'",
]) {
  if (!planBuilder.includes(token)) {
    errors.push(`render plan missing guard token: ${token}`)
  }
}

if (!clearPresets.includes("id: weatherSceneId('clear-day')")) {
  errors.push('typed clear-day preset is unexpectedly missing')
}
if (!/export const clearDayScenePreset = \{[\s\S]*?layers:\s*\[\]/.test(clearPresets)) {
  errors.push('clear-day preset must remain static with no config layers in LB-2E')
}
if (!clearPresets.includes('quality: staticSceneQuality')) {
  errors.push('clear-day preset must remain on staticSceneQuality')
}

if (!/props\.visual\?\.condition\s*!==\s*'partly-cloudy'/.test(atmosphere)) {
  errors.push('legacy Pixi visual key guard for non-partly-cloudy scenes is missing')
}
if (!atmosphere.includes("return 'authorized-vendor'")) {
  errors.push('legacy authorized-vendor asset origin must remain available')
}
if (!atmosphere.includes(':reference-scene="referenceScene"')) {
  errors.push('WeatherAtmosphere must still pass reference scenes to WeatherPixiLayer')
}
if (!atmosphere.includes(':scene-plan="configDrivenRenderPlan"')) {
  errors.push('WeatherAtmosphere must still pass config-driven plans')
}

if (/resolveWeatherScene|buildWeatherSceneRenderPlan|WeatherScenePreset/.test(snapshotLayer)) {
  errors.push('WeatherSnapshotLayer gained scene renderer coupling')
}

for (const token of [
  'referenceScene?: PixiWeatherReferenceScene | null',
  'scenePlan?: ConfigDrivenWeatherScenePlan | null',
  'props.referenceScene',
  'props.scenePlan?.id ?? props.referenceScene?.key',
  'app.ticker.add(onTick)',
]) {
  if (!pixiLayer.includes(token)) {
    errors.push(`WeatherPixiLayer missing expected legacy/config token: ${token}`)
  }
}

if (!assets.includes("'clear-day'") || !assets.includes('clearDayBaseMobileAvif')) {
  errors.push('clear-day local atmosphere assets are not registered')
}
if (/['"]clear-day['"]\s*:\s*\{/.test(visualRegistry)) {
  errors.push('clear-day must not be newly registered in the visual asset registry')
}
if (resolveVisual.includes('getWeatherVisualDefinition')) {
  errors.push('resolveWeatherVisual must not start using clear-day visual registry in LB-2E')
}

const clearDayScene = manifest.scenes?.['clear-day']
if (!clearDayScene || !Array.isArray(clearDayScene.layers)) {
  errors.push('vendor clear-day scene is missing from manifest')
} else {
  if (clearDayScene.layers.length !== 3) {
    errors.push(`vendor clear-day baseline layer count changed: ${clearDayScene.layers.length}`)
  }
  if (!clearDayScene.layers.some((layer) => layer.type === 'particle')) {
    errors.push('vendor clear-day baseline must include the blocking particle layer')
  }
}

const sceneFiles = walk(join(root, 'src/modules/weather/scenes')).filter((file) => file.endsWith('.ts'))
for (const file of sceneFiles) {
  const text = readFileSync(file, 'utf8')
  if (/kind:\s*'shader'/.test(text) && !/enabled:\s*false/.test(text)) {
    errors.push(`${file} enables a shader layer`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('LB-2E clear-day migration suitability validation PASS')
