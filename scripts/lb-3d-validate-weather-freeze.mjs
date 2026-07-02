import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import Module from 'node:module'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const outDir = join(root, 'tmp', 'lb-3d-weather-freeze')
const port = Number(process.env.LB3D_PREVIEW_PORT ?? 5323)
const baseUrl = `http://127.0.0.1:${port}`
const errors = []
const results = []

mkdirSync(outDir, { recursive: true })

const bundledPlaywright = 'C:\\Users\\jingr\\AppData\\Local\\npm-cache\\_npx\\e41f203b7505f1fb\\node_modules'
if (!process.env.NODE_PATH && existsSync(bundledPlaywright)) {
  process.env.NODE_PATH = bundledPlaywright
  Module._initPaths()
}

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8')
}

function requireToken(relPath, token, label = token) {
  const text = read(relPath)
  if (!text.includes(token)) {
    errors.push(`${relPath} is missing ${label}`)
  }
}

function requireRegex(relPath, regex, label) {
  const text = read(relPath)
  if (!regex.test(text)) {
    errors.push(`${relPath} is missing ${label}`)
  }
}

function parseCsvLine(line) {
  const values = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && next === '"') {
      value += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(value)
      value = ''
      continue
    }

    value += char
  }

  values.push(value)
  return values
}

function validateStaticFreezeArtifacts() {
  for (const file of [
    'docs/lb-3d-weather-freeze-verification.md',
    'docs/weather-module-freeze-baseline.md',
    'scripts/lb-3d-validate-weather-freeze.mjs',
  ]) {
    if (!existsSync(join(root, file))) {
      errors.push(`${file} is missing`)
    }
  }

  const matrix = read('docs/lb-3a-weather-issue-matrix.csv')
  for (const row of matrix.split(/\r?\n/).filter(Boolean)) {
    if (row.startsWith('id,')) {
      continue
    }
    const [id, priority, , status, , , blocksFreeze] = parseCsvLine(row)
    if (priority === 'P0') {
      errors.push(`P0 item still exists: ${id}`)
    }
    if (priority === 'P1' && status !== 'RESOLVED') {
      errors.push(`${id} is not RESOLVED`)
    }
    if (priority === 'P2' && blocksFreeze !== 'false') {
      errors.push(`${id} is incorrectly blocking freeze`)
    }
  }

  for (const id of ['P1-01', 'P1-02', 'P1-03', 'P1-04']) {
    if (!matrix.includes(`${id},P1,`)) {
      errors.push(`issue matrix is missing ${id}`)
    }
    const row = matrix.split(/\r?\n/).find((line) => line.startsWith(`${id},`))
    if (!row?.includes(',RESOLVED,')) {
      errors.push(`${id} is not RESOLVED`)
    }
  }

  requireToken(
    'docs/weather-scene-architecture.md',
    'Mixed renderer is the frozen production architecture for the current weather module.',
    'frozen mixed renderer contract',
  )
  requireToken('docs/weather-module-freeze-baseline.md', 'Freeze decision: FROZEN_WITH_ACCEPTED_P2')
  requireToken('docs/weather-module-freeze-baseline.md', 'WEATHER_MODULE_FROZEN')
  requireToken('docs/lb-3d-weather-freeze-verification.md', 'Freeze decision: FROZEN_WITH_ACCEPTED_P2')
  requireToken('docs/lb-3a-weather-definition-of-done.md', 'PASS')
  requireToken('docs/lb-3a-weather-definition-of-done.md', 'ACCEPTED_P2')

  requireRegex(
    'src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts',
    /PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'[\s\S]*PARTLY_CLOUDY_NIGHT_SCENE_ID = 'partly-cloudy-night'/,
    'explicit config-driven scene ids',
  )
  requireRegex(
    'src/modules/weather/scenes/runtime/weatherSceneCapabilities.ts',
    /scene\.selectedQuality !== 'static'[\s\S]*!scene\.context\.reducedMotion/,
    'static and reduced-motion exclusion',
  )
  requireRegex(
    'src/modules/weather/scenes/presets/partlyCloudyScenePresets.ts',
    /weatherSceneId\('partly-cloudy-day'\)[\s\S]*weatherSceneId\('partly-cloudy-night'\)/,
    'only approved config-driven presets',
  )
  requireRegex(
    'src/modules/weather/scenes/presets/clearScenePresets.ts',
    /weatherSceneId\('clear-day'\)[\s\S]*weatherSceneId\('clear-night'\)/,
    'legacy clear scene presets remain documented',
  )
  requireToken('src/modules/weather/constants/weatherProviderCapabilities.ts', 'alerts: false')
  requireToken('src/modules/weather/constants/weatherProviderCapabilities.ts', 'alerts: true')
  requireToken('src/modules/weather/utils/weatherAlerts.ts', 'UNSUPPORTED_BY_PROVIDER')
  requireToken('src/modules/weather/utils/weatherFormatting.ts', 'formatVisibility')
  requireToken('src/modules/weather/renderers/pixi/weatherPixiRuntimeDebug.ts', '__lifeboard_weather_runtime_debug')
  requireToken('src/modules/weather/components/WeatherAtmosphere.vue', 'VITE_ENABLE_LOCAL_WEATHER_REFERENCE_ASSETS')

  const packageJson = JSON.parse(read('package.json'))
  if (packageJson.dependencies?.['pixi.js'] !== '8.19.0') {
    errors.push('pixi.js must remain exact-locked to 8.19.0')
  }
}

function createLocation() {
  return {
    id: 1816670,
    name: 'Shanghai',
    kind: 'Locality',
    admin1: 'Shanghai',
    country: 'China',
    countryCode: 'CN',
    latitude: 31.23,
    longitude: 121.47,
    elevation: 4,
    timezone: 'Asia/Shanghai',
    source: 'openMeteo',
  }
}

function condition(code, label) {
  return {
    code,
    label,
    shortLabel: label,
  }
}

function createSnapshot({
  code = 2,
  label = 'Partly cloudy',
  provider = 'openMeteo',
  currentTime = '2026-07-02T12:00',
  isDay = true,
  visibility = 12.4,
} = {}) {
  const location = createLocation()
  const hourly = Array.from({ length: 24 }, (_, index) => ({
    time: `2026-07-02T${String(index).padStart(2, '0')}:00`,
    temperature: 29 + (index % 3),
    apparentTemperature: 31 + (index % 2),
    precipitationProbability: code >= 51 ? 70 : index % 4 === 0 ? 20 : 5,
    precipitation: code >= 51 ? 1.2 : 0,
    windSpeed: 10 + index / 4,
    windGusts: 18,
    uvIndex: index >= 8 && index <= 16 ? 5 : 0,
    isDay: index >= 6 && index <= 18,
    condition: condition(code, label),
  }))
  const daily = Array.from({ length: 15 }, (_, index) => {
    const day = String(2 + index).padStart(2, '0')
    return {
      date: `2026-07-${day}`,
      temperatureMax: 32,
      temperatureMin: 25,
      apparentTemperatureMax: 35,
      apparentTemperatureMin: 27,
      precipitationSum: code >= 51 ? 4.4 : 0.4,
      precipitationProbabilityMax: code >= 51 ? 80 : 30,
      windSpeedMax: 18,
      windDirectionDominant: 135,
      windGustsMax: 28,
      uvIndexMax: 7,
      sunrise: `2026-07-${day}T04:55`,
      sunset: `2026-07-${day}T19:02`,
      condition: condition(code, label),
    }
  })

  return {
    provider,
    location,
    timezone: 'Asia/Shanghai',
    timezoneAbbreviation: 'CST',
    fetchedAt: '2026-07-02T04:00:00.000Z',
    current: {
      time: currentTime,
      temperature: 30,
      apparentTemperature: 33,
      relativeHumidity: 64,
      precipitation: code >= 51 ? 1.2 : 0,
      rain: code >= 51 ? 1.2 : 0,
      showers: 0,
      snowfall: 0,
      cloudCover: code === 0 ? 0 : 48,
      windSpeed: 13,
      windDirection: 135,
      windGusts: 22,
      uvIndex: isDay ? 5 : 0,
      pressure: 1008,
      visibility,
      isDay,
      condition: condition(code, label),
    },
    hourly,
    daily,
    shortTermPrecipitation: null,
    alerts: [],
    providerCapabilities: {
      alerts: provider === 'caiyun',
      visibility: true,
      airQuality: provider === 'openMeteo',
    },
    units: {
      temperature: '°C',
      precipitation: 'mm',
      probability: '%',
      windSpeed: 'km/h',
      humidity: '%',
      uvIndex: '',
      pressure: 'hPa',
      visibility: 'km',
    },
    advice: {
      items: [],
      notes: [],
    },
  }
}

function createCacheEnvelope(snapshot) {
  const now = Date.now()
  const location = snapshot.location
  const key = [
    snapshot.provider,
    location.source ?? 'unknown',
    location.countryCode,
    location.latitude.toFixed(4),
    location.longitude.toFixed(4),
  ].join('|')

  return {
    key,
    envelope: {
      version: 1,
      locationKey: key,
      location,
      forecast: snapshot,
      fetchedAt: now,
      expiresAt: now + 60 * 60 * 1000,
    },
  }
}

async function startPreview() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args = process.platform === 'win32'
    ? ['/c', 'npm', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
    : ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
  const child = spawn(command, args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })

  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) {
        return child
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }

  child.kill()
  throw new Error(`Preview did not start on ${baseUrl}\n${output}`)
}

function stopPreview(child) {
  if (!child || child.killed) return

  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
      })
    } else {
      child.kill('SIGTERM')
    }
  } catch {
    child.kill()
  }
}

async function seedPage(page, snapshot, debug = false) {
  await page.addInitScript(({ snapshot, debug }) => {
    localStorage.clear()
    const location = snapshot.location
    const key = [
      snapshot.provider,
      location.source ?? 'unknown',
      location.countryCode,
      location.latitude.toFixed(4),
      location.longitude.toFixed(4),
    ].join('|')
    localStorage.setItem('lifeboard-weather-location', JSON.stringify(location))
    localStorage.setItem('lifeboard.weather.provider', snapshot.provider)
    localStorage.setItem('lifeboard.weather.forecastCache.v1', JSON.stringify({
      version: 1,
      locationKey: key,
      location,
      forecast: snapshot,
      fetchedAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000,
    }))
    if (debug) {
      localStorage.setItem('__lifeboard_weather_runtime_debug', '1')
    }
  }, { snapshot, debug })
}

async function blockWeatherApis(page) {
  await page.route('**/*', async (route) => {
    const url = route.request().url()
    if (
      url.includes('api.open-meteo.com') ||
      url.includes('air-quality-api.open-meteo.com') ||
      url.includes('/api/caiyun-weather') ||
      url.includes('/api/amap-')
    ) {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
}

function allowedConsoleErrors(messages) {
  return messages.every((message) =>
    /Failed to load resource: net::ERR_FAILED|ERR_ABORTED|ReadPixels|GL Driver/.test(message),
  )
}

async function collectPage(page, scenario) {
  await page.waitForTimeout(900)
  const data = await page.evaluate(() => {
    const atmosphere = document.querySelector('[data-weather-asset-origin]')
    const rect = document.documentElement.getBoundingClientRect()
    const debug = window.__lifeboardWeatherSceneRuntimeDebug?.snapshot?.() ?? null
    const canvas = document.querySelector('canvas')
    return {
      route: location.pathname,
      renderer: atmosphere?.getAttribute('data-weather-asset-origin') ?? null,
      sceneId: atmosphere?.getAttribute('data-weather-scene-key') ?? null,
      timeline: atmosphere?.getAttribute('data-weather-timeline') ?? null,
      pixiStatus: atmosphere?.getAttribute('data-weather-pixi-status') ?? null,
      provider: localStorage.getItem('lifeboard.weather.provider'),
      visibility: document.body.innerText.includes('12 km') ? 'present' : 'not-detected',
      canvasCount: document.querySelectorAll('canvas').length,
      canvasAriaHidden: canvas?.getAttribute('aria-hidden') ?? null,
      canvasRole: canvas?.getAttribute('role') ?? null,
      horizontalOverflow: Math.ceil(rect.width) > window.innerWidth + 1,
      debug,
    }
  })
  await page.screenshot({
    path: join(outDir, `${scenario}.png`),
    fullPage: true,
  })
  return data
}

async function runScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    reducedMotion: scenario.reducedMotion ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message)
  })
  await blockWeatherApis(page)
  await seedPage(page, scenario.snapshot, scenario.debug)
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  const data = await collectPage(page, scenario.name)
  await context.close()
  const result = {
    scenario: scenario.name,
    viewport: `${scenario.viewport.width}x${scenario.viewport.height}`,
    expectedRenderer: scenario.expectedRenderer,
    expectedScene: scenario.expectedScene,
    ...data,
    consoleErrors,
    result: scenario.assert(data, consoleErrors) && allowedConsoleErrors(consoleErrors)
      ? 'PASS'
      : 'FAIL',
  }
  results.push(result)
  if (result.result !== 'PASS') {
    errors.push(`${scenario.name} failed`)
  }
}

async function runRouteLoop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await blockWeatherApis(page)
  await seedPage(page, createSnapshot(), true)
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  for (let index = 0; index < 10; index += 1) {
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(150)
    await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(350)
  }
  const data = await collectPage(page, 'ROUTE_LOOP_10')
  await context.close()

  const debug = data.debug
  const pass = Boolean(debug) &&
    data.canvasCount === 1 &&
    debug.applicationCount === 1 &&
    debug.canvasCount === 1 &&
    debug.activeSceneCount === 1 &&
    debug.tickerCallbackCount === 1 &&
    debug.visibilityListenerCount === 1 &&
    debug.resizeListenerCount === 1 &&
    debug.applicationCreateCount === debug.applicationDestroyCount + 1 &&
    debug.tickerAddCount === debug.tickerRemoveCount + 1 &&
    debug.visibilityListenerAddCount === debug.visibilityListenerRemoveCount + 1 &&
    allowedConsoleErrors(consoleErrors)

  results.push({
    scenario: 'ROUTE_LOOP_10',
    viewport: '1440x900',
    ...data,
    consoleErrors,
    result: pass ? 'PASS' : 'FAIL',
  })
  if (!pass) {
    errors.push('ROUTE_LOOP_10 failed')
  }
}

async function runVisibilityLoop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await blockWeatherApis(page)
  await seedPage(page, createSnapshot(), true)
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  const before = await page.evaluate(() =>
    window.__lifeboardWeatherSceneRuntimeDebug?.snapshot?.() ?? null,
  )
  for (let index = 0; index < 10; index += 1) {
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await page.waitForTimeout(40)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await page.waitForTimeout(40)
  }
  const data = await collectPage(page, 'VISIBILITY_LOOP_10')
  await context.close()

  const debug = data.debug
  const pauseDelta = debug && before ? debug.pauseCount - before.pauseCount : null
  const resumeDelta = debug && before ? debug.resumeCount - before.resumeCount : null
  const pass = Boolean(debug) &&
    data.canvasCount === 1 &&
    debug.applicationCount === 1 &&
    debug.canvasCount === 1 &&
    debug.tickerCallbackCount === 1 &&
    debug.visibilityListenerCount === 1 &&
    pauseDelta === 10 &&
    resumeDelta === 10 &&
    allowedConsoleErrors(consoleErrors)

  results.push({
    scenario: 'VISIBILITY_LOOP_10',
    viewport: '1440x900',
    ...data,
    consoleErrors,
    result: pass ? 'PASS' : 'FAIL',
  })
  if (!pass) {
    errors.push('VISIBILITY_LOOP_10 failed')
  }
}

validateStaticFreezeArtifacts()

const scenarios = [
  ...[
    { width: 1896, height: 829 },
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ].map((viewport) => ({
    name: `RESPONSIVE_${viewport.width}x${viewport.height}`,
    viewport,
    snapshot: createSnapshot(),
    expectedRenderer: 'config-driven',
    expectedScene: 'partly-cloudy-day',
    assert: (data) =>
      data.renderer === 'config-driven' &&
      data.sceneId === 'partly-cloudy-day' &&
      data.canvasCount === 1 &&
      data.visibility === 'present' &&
      data.canvasAriaHidden === 'true' &&
      data.canvasRole === 'presentation' &&
      !data.horizontalOverflow,
  })),
  {
    name: 'PARTLY_CLOUDY_NIGHT_CONFIG',
    viewport: { width: 1440, height: 900 },
    snapshot: createSnapshot({
      currentTime: '2026-07-02T22:00',
      isDay: false,
    }),
    expectedRenderer: 'config-driven',
    expectedScene: 'partly-cloudy-night',
    assert: (data) =>
      data.renderer === 'config-driven' &&
      data.sceneId === 'partly-cloudy-night' &&
      data.canvasCount === 1 &&
      !data.horizontalOverflow,
  },
  {
    name: 'CLEAR_DAY_LEGACY',
    viewport: { width: 1440, height: 900 },
    snapshot: createSnapshot({ code: 0, label: 'Clear sky' }),
    expectedRenderer: 'authorized-vendor',
    expectedScene: 'clear-day',
    assert: (data) =>
      data.renderer === 'authorized-vendor' &&
      data.sceneId === 'clear-day' &&
      data.canvasCount === 1 &&
      !data.horizontalOverflow,
  },
  {
    name: 'CLEAR_NIGHT_LEGACY',
    viewport: { width: 1440, height: 900 },
    snapshot: createSnapshot({
      code: 0,
      label: 'Clear sky',
      currentTime: '2026-07-02T22:00',
      isDay: false,
    }),
    expectedRenderer: 'authorized-vendor',
    expectedScene: 'clear-night',
    assert: (data) =>
      data.renderer === 'authorized-vendor' &&
      data.sceneId === 'clear-night' &&
      data.canvasCount === 1 &&
      !data.horizontalOverflow,
  },
  {
    name: 'RAIN_LEGACY',
    viewport: { width: 1440, height: 900 },
    snapshot: createSnapshot({ code: 61, label: 'Rain' }),
    expectedRenderer: 'authorized-vendor',
    expectedScene: 'light-rain-day',
    assert: (data) =>
      data.renderer === 'authorized-vendor' &&
      data.sceneId === 'light-rain-day' &&
      data.canvasCount === 1 &&
      !data.horizontalOverflow,
  },
  {
    name: 'REDUCED_MOTION_DAY',
    viewport: { width: 390, height: 844 },
    reducedMotion: true,
    snapshot: createSnapshot(),
    expectedRenderer: 'fallback',
    expectedScene: 'static-fallback',
    assert: (data) =>
      data.renderer === 'fallback' &&
      data.pixiStatus === 'static-fallback' &&
      data.canvasCount === 0 &&
      !data.horizontalOverflow,
  },
  {
    name: 'REDUCED_MOTION_NIGHT',
    viewport: { width: 390, height: 844 },
    reducedMotion: true,
    snapshot: createSnapshot({
      currentTime: '2026-07-02T22:00',
      isDay: false,
    }),
    expectedRenderer: 'fallback',
    expectedScene: 'fallback',
    assert: (data) =>
      data.renderer === 'fallback' &&
      data.sceneId === 'fallback' &&
      data.pixiStatus === 'static-fallback' &&
      data.canvasCount === 0 &&
      !data.horizontalOverflow,
  },
]

if (errors.length === 0) {
  const preview = await startPreview()
  try {
    const browser = await chromium.launch()
    for (const scenario of scenarios) {
      await runScenario(browser, scenario)
    }
    await runRouteLoop(browser)
    await runVisibilityLoop(browser)
    await browser.close()
  } finally {
    stopPreview(preview)
  }
}

const resultPath = join(outDir, 'results.json')
writeFileSync(resultPath, `${JSON.stringify(results, null, 2)}\n`)

if (errors.length > 0) {
  console.error(errors.join('\n'))
  console.error(`LB-3D results: ${resultPath}`)
  process.exit(1)
}

console.log(`LB-3D weather freeze validation PASS: ${resultPath}`)
