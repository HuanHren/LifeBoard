import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import Module from 'node:module'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const outDir = join(root, 'tmp', 'lb-3c-weather-states')
const port = Number(process.env.LB3C_PREVIEW_PORT ?? 5313)
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

function condition() {
  return {
    code: 2,
    label: 'Partly cloudy',
    shortLabel: 'Partly cloudy',
  }
}

function createSnapshot({
  provider = 'openMeteo',
  visibility = 12.4,
  alerts = [],
  alertCapability = provider === 'caiyun',
} = {}) {
  const location = createLocation()
  const currentTime = '2026-07-02T12:00'
  const hourly = Array.from({ length: 24 }, (_, index) => ({
    time: `2026-07-02T${String(index).padStart(2, '0')}:00`,
    temperature: 29 + (index % 3),
    apparentTemperature: 31 + (index % 2),
    precipitationProbability: index % 4 === 0 ? 20 : 5,
    precipitation: 0,
    windSpeed: 10 + index / 4,
    windGusts: 18,
    uvIndex: index >= 8 && index <= 16 ? 5 : 0,
    isDay: index >= 6 && index <= 18,
    condition: condition(),
  }))
  const daily = Array.from({ length: 15 }, (_, index) => {
    const day = String(2 + index).padStart(2, '0')
    return {
      date: `2026-07-${day}`,
      temperatureMax: 32,
      temperatureMin: 25,
      apparentTemperatureMax: 35,
      apparentTemperatureMin: 27,
      precipitationSum: index === 0 ? 0.4 : 0,
      precipitationProbabilityMax: 30,
      windSpeedMax: 18,
      windDirectionDominant: 135,
      windGustsMax: 28,
      uvIndexMax: 7,
      sunrise: `2026-07-${day}T04:55`,
      sunset: `2026-07-${day}T19:02`,
      condition: condition(),
    }
  })
  const current = {
    time: currentTime,
    temperature: 30,
    apparentTemperature: 33,
    relativeHumidity: 64,
    precipitation: 0,
    rain: 0,
    showers: 0,
    snowfall: 0,
    cloudCover: 48,
    windSpeed: 13,
    windDirection: 135,
    windGusts: 22,
    uvIndex: 5,
    pressure: 1008,
    visibility,
    isDay: true,
    condition: condition(),
  }

  return {
    provider,
    location,
    timezone: 'Asia/Shanghai',
    timezoneAbbreviation: 'CST',
    fetchedAt: '2026-07-02T04:00:00.000Z',
    current,
    hourly,
    daily,
    shortTermPrecipitation: null,
    alerts,
    providerCapabilities: {
      alerts: alertCapability,
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

function cacheKey(provider, location) {
  return [
    provider,
    location.source ?? 'unknown',
    location.countryCode,
    location.latitude.toFixed(4),
    location.longitude.toFixed(4),
  ].join('|')
}

function cacheEnvelope(snapshot, freshness = 'fresh') {
  const now = Date.now()
  const fetchedAt = freshness === 'expired' ? now - 90 * 60 * 1000 : now
  const expiresAt = freshness === 'expired' ? now - 80 * 60 * 1000 : now + 60 * 60 * 1000

  return {
    version: 1,
    locationKey: cacheKey(snapshot.provider, snapshot.location),
    location: snapshot.location,
    forecast: snapshot,
    fetchedAt,
    expiresAt,
  }
}

async function startPreview() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args = process.platform === 'win32'
    ? ['/c', 'npm', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
    : ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
  const child = spawn(
    command,
    args,
    {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

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
  if (!child || child.killed) {
    return
  }

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

async function seedPage(page, {
  snapshot = null,
  freshness = 'fresh',
  provider = snapshot?.provider ?? 'openMeteo',
  selectedLocation = snapshot?.location ?? createLocation(),
  clearCache = false,
} = {}) {
  await page.addInitScript(({ snapshot, freshness, provider, selectedLocation, clearCache }) => {
    localStorage.clear()
    localStorage.setItem('lifeboard-weather-location', JSON.stringify(selectedLocation))
    localStorage.setItem('lifeboard.weather.provider', provider)

    if (provider === 'caiyun') {
      localStorage.setItem('lifeboard.weather.caiyunToken', 'lb-3c-test-token')
    }

    if (!clearCache && snapshot) {
      const key = [
        snapshot.provider,
        snapshot.location.source ?? 'unknown',
        snapshot.location.countryCode,
        snapshot.location.latitude.toFixed(4),
        snapshot.location.longitude.toFixed(4),
      ].join('|')
      const now = Date.now()
      const fetchedAt = freshness === 'expired' ? now - 90 * 60 * 1000 : now
      const expiresAt = freshness === 'expired' ? now - 80 * 60 * 1000 : now + 60 * 60 * 1000
      localStorage.setItem(
        'lifeboard.weather.forecastCache.v1',
        JSON.stringify({
          version: 1,
          locationKey: key,
          location: snapshot.location,
          forecast: snapshot,
          fetchedAt,
          expiresAt,
        }),
      )
    }
  }, { snapshot, freshness, provider, selectedLocation, clearCache })
}

async function blockWeatherApis(page, partialResponse = null) {
  await page.route('**/*', async (route) => {
    const url = route.request().url()
    if (partialResponse && url.includes('api.open-meteo.com/v1/forecast')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(partialResponse),
      })
      return
    }
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

async function collect(page, scenario, expectedState) {
  await page.waitForTimeout(750)
  const data = await page.evaluate(() => {
    const atmosphere = document.querySelector('[data-weather-asset-origin]')
    const text = document.body.innerText
    const rect = document.documentElement.getBoundingClientRect()
    return {
      url: location.href,
      text,
      assetOrigin: atmosphere?.getAttribute('data-weather-asset-origin') ?? null,
      sceneKey: atmosphere?.getAttribute('data-weather-scene-key') ?? null,
      timeline: atmosphere?.getAttribute('data-weather-timeline') ?? null,
      pixiStatus: atmosphere?.getAttribute('data-weather-pixi-status') ?? null,
      layerCount: atmosphere?.getAttribute('data-weather-layer-count') ?? null,
      canvasCount: document.querySelectorAll('canvas').length,
      retryAvailable: /retry|重试/i.test(text),
      staleIndicator: /cached|cache|stale|缓存|离线/i.test(text),
      alertStatus:
        /does not supply weather alerts|不提供天气预警/.test(text)
          ? 'UNSUPPORTED_BY_PROVIDER'
          : /No active alerts|没有活动预警/.test(text)
            ? 'SUPPORTED_NO_ACTIVE_ALERTS'
            : /Test storm alert|测试预警/.test(text)
              ? 'ACTIVE_ALERTS'
              : 'NOT_VISIBLE',
      visibilityValue:
        /Visibility[\s\S]{0,80}(12|12\.4) km/.test(text) || /能见度[\s\S]{0,80}(12|12\.4) km/.test(text)
          ? 'PRESENT'
          : /Visibility[\s\S]{0,80}Unavailable/.test(text) || /能见度[\s\S]{0,80}不可用/.test(text)
            ? 'UNAVAILABLE'
            : 'NOT_VISIBLE',
      overflowX: Math.ceil(rect.width) > window.innerWidth + 1,
    }
  })

  return {
    scenario,
    expectedState,
    ...data,
  }
}

async function runWeatherScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport ?? { width: 1280, height: 900 },
    reducedMotion: scenario.reducedMotion ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message)
  })
  if (scenario.disableWebgl) {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, ...args) {
        if (type === 'webgl' || type === 'webgl2' || type === 'webgpu') {
          return null
        }
        return original.call(this, type, ...args)
      }
    })
  }
  await blockWeatherApis(page, scenario.partialResponse ?? null)
  await seedPage(page, scenario.seed)
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  const collected = await collect(page, scenario.name, scenario.expectedState)
  await page.screenshot({
    path: join(outDir, `${scenario.name}.png`),
    fullPage: true,
  })
  await context.close()
  return {
    ...collected,
    consoleErrors,
    result: scenario.assert(collected, consoleErrors) ? 'PASS' : 'FAIL',
  }
}

async function runCityScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  if (scenario.geolocationError) {
    await page.addInitScript((code) => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition(_success, error) {
            error({ code })
          },
        },
      })
    }, scenario.geolocationError)
  }
  await page.route('**/*', async (route) => {
    const url = route.request().url()
    if (scenario.emptySearch && url.includes('geocoding-api.open-meteo.com')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] }),
      })
      return
    }
    if (url.includes('api.open-meteo.com') || url.includes('/api/')) {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  if (scenario.geolocationError) {
    await page.getByRole('button', { name: /current location|当前位置/i }).click()
  }
  if (scenario.emptySearch) {
    const input = page.locator('#weather-city-search')
    await input.fill('zzzz-empty-city')
    await page.getByRole('button', { name: /search|搜索/i }).click()
  }
  const collected = await collect(page, scenario.name, scenario.expectedState)
  await page.screenshot({
    path: join(outDir, `${scenario.name}.png`),
    fullPage: true,
  })
  await context.close()
  return {
    ...collected,
    consoleErrors,
    result: scenario.assert(collected, consoleErrors) ? 'PASS' : 'FAIL',
  }
}

const openMeteoSnapshot = createSnapshot()
const caiyunNoAlerts = createSnapshot({ provider: 'caiyun', alertCapability: true })
const caiyunActiveAlert = createSnapshot({
  provider: 'caiyun',
  alertCapability: true,
  alerts: [
    {
      id: 'lb-3c-alert-1',
      provider: 'caiyun',
      title: 'Test storm alert',
      description: 'Deterministic browser harness alert.',
      severityLabel: 'orange',
      status: 'active',
      issuingAuthority: 'LifeBoard Test',
      issuedAt: '2026-07-02T03:30:00.000Z',
      locationLabel: 'Shanghai',
      locationId: 'openMeteo-CN-31.2300-121.4700',
    },
  ],
})
const missingVisibility = createSnapshot({ visibility: null })

const weatherScenarios = [
  {
    name: 'NORMAL_DESKTOP',
    expectedState: 'normal loaded weather, config-driven partly-cloudy-day',
    seed: { snapshot: openMeteoSnapshot },
    assert: (r) => r.assetOrigin === 'config-driven' && r.sceneKey === 'partly-cloudy-day',
  },
  {
    name: 'NORMAL_MOBILE',
    expectedState: 'normal loaded weather on mobile',
    viewport: { width: 390, height: 844 },
    seed: { snapshot: openMeteoSnapshot },
    assert: (r) => r.sceneKey === 'partly-cloudy-day' && !r.overflowX,
  },
  {
    name: 'REDUCED_MOTION',
    expectedState: 'reduced motion avoids animated canvas',
    reducedMotion: true,
    seed: { snapshot: openMeteoSnapshot },
    assert: (r) => r.pixiStatus === 'static-fallback' && r.canvasCount === 0,
  },
  {
    name: 'WEBGL_UNAVAILABLE',
    expectedState: 'WebGL unavailable falls back without blank page',
    disableWebgl: true,
    seed: { snapshot: openMeteoSnapshot },
    assert: (r) => /Weather|天气/.test(r.text) && r.sceneKey === 'partly-cloudy-day',
  },
  {
    name: 'VISIBILITY_PRESENT',
    expectedState: 'visibility value is visible and formatted',
    seed: { snapshot: openMeteoSnapshot },
    assert: (r) => r.visibilityValue === 'PRESENT',
  },
  {
    name: 'VISIBILITY_MISSING',
    expectedState: 'missing visibility renders unavailable',
    seed: { snapshot: missingVisibility },
    assert: (r) => r.visibilityValue === 'UNAVAILABLE',
  },
  {
    name: 'ALERTS_UNSUPPORTED',
    expectedState: 'Open-Meteo alert unsupported status is explicit',
    seed: { snapshot: openMeteoSnapshot },
    assert: (r) => r.alertStatus === 'UNSUPPORTED_BY_PROVIDER',
  },
  {
    name: 'ALERTS_SUPPORTED_NONE',
    expectedState: 'Caiyun alert capability with no active alerts is explicit',
    seed: { snapshot: caiyunNoAlerts, provider: 'caiyun' },
    assert: (r) => r.alertStatus === 'SUPPORTED_NO_ACTIVE_ALERTS',
  },
  {
    name: 'ALERTS_ACTIVE',
    expectedState: 'active Caiyun alerts render',
    seed: { snapshot: caiyunActiveAlert, provider: 'caiyun' },
    assert: (r) => r.alertStatus === 'ACTIVE_ALERTS',
  },
  {
    name: 'OFFLINE_WITH_STALE_CACHE',
    expectedState: 'expired cache restores offline-stale when provider fails',
    seed: { snapshot: openMeteoSnapshot, freshness: 'expired' },
    assert: (r) => r.sceneKey === 'partly-cloudy-day' && r.retryAvailable === false,
  },
  {
    name: 'PROVIDER_ERROR_NO_CACHE',
    expectedState: 'provider failure with no cache shows retry',
    seed: { snapshot: null, clearCache: true },
    assert: (r) => r.retryAvailable && /could not be loaded|无法|重试/i.test(r.text),
  },
  {
    name: 'PARTIAL_CURRENT_ONLY',
    expectedState: 'current-only provider response becomes readable error',
    seed: { snapshot: null, clearCache: true },
    partialResponse: { current: { time: '2026-07-02T12:00' } },
    assert: (r) => r.retryAvailable && /could not be loaded|无法|重试/i.test(r.text),
  },
  {
    name: 'PARTIAL_NO_HOURLY',
    expectedState: 'missing hourly provider response becomes readable error',
    seed: { snapshot: null, clearCache: true },
    partialResponse: { current: {}, daily: {} },
    assert: (r) => r.retryAvailable && /could not be loaded|无法|重试/i.test(r.text),
  },
  {
    name: 'PARTIAL_NO_DAILY',
    expectedState: 'missing daily provider response becomes readable error',
    seed: { snapshot: null, clearCache: true },
    partialResponse: { current: {}, hourly: {} },
    assert: (r) => r.retryAvailable && /could not be loaded|无法|重试/i.test(r.text),
  },
]

const cityScenarios = [
  {
    name: 'LOCATION_DENIED',
    expectedState: 'location denied is shown on city page',
    geolocationError: 1,
    assert: (r) => /denied|拒绝/.test(r.text),
  },
  {
    name: 'LOCATION_TIMEOUT',
    expectedState: 'location timeout/unavailable is shown on city page',
    geolocationError: 3,
    assert: (r) => /unavailable|不可用|重试/.test(r.text),
  },
  {
    name: 'CITY_SEARCH_EMPTY',
    expectedState: 'empty city search shows no matches',
    emptySearch: true,
    assert: (r) => /No matching cities|未找到|没有/.test(r.text),
  },
]

const preview = await startPreview()
try {
  const browser = await chromium.launch()
  for (const scenario of weatherScenarios) {
    const result = await runWeatherScenario(browser, scenario)
    results.push(result)
    if (result.result !== 'PASS') {
      errors.push(`${scenario.name} failed`)
    }
  }
  for (const scenario of cityScenarios) {
    const result = await runCityScenario(browser, scenario)
    results.push(result)
    if (result.result !== 'PASS') {
      errors.push(`${scenario.name} failed`)
    }
  }
  await browser.close()
} finally {
  stopPreview(preview)
}

const resultPath = join(root, 'tmp', 'lb-3c-weather-state-results.json')
writeFileSync(resultPath, `${JSON.stringify(results, null, 2)}\n`)

if (errors.length > 0) {
  console.error(errors.join('\n'))
  console.error(`State results: ${resultPath}`)
  process.exit(1)
}

console.log(`LB-3C weather browser state verification PASS: ${resultPath}`)
