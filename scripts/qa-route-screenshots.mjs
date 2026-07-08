import { createRequire } from 'node:module'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IS_WINDOWS = process.platform === 'win32'
const CI_MODE = process.argv.includes('--ci') || process.env.CI === 'true'
const DEFAULT_OUTPUT_DIR = path.join(PROJECT_ROOT, '.qa', 'route-screenshots')
const DEFAULT_SUMMARY_PATH = path.join(PROJECT_ROOT, '.qa', 'route-screenshots-summary.json')
const OUTPUT_DIR = path.resolve(process.env.QA_SCREENSHOT_OUTPUT_DIR || DEFAULT_OUTPUT_DIR)
const SUMMARY_PATH = path.resolve(process.env.QA_SCREENSHOT_SUMMARY_PATH || DEFAULT_SUMMARY_PATH)
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json')

const ROUTES = [
  { key: 'landing', path: '/' },
  { key: 'home', path: '/app' },
  { key: 'weather', path: '/weather' },
  { key: 'todos', path: '/todos' },
  { key: 'tools', path: '/tools' },
  { key: 'bookmarks', path: '/bookmarks' },
  { key: 'settings', path: '/settings' },
  { key: 'settings-data-sources', path: '/settings/data-sources' },
  { key: 'not-found', path: '/missing-route-stage-18' },
]

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const WEATHER_EXTRA_VIEWPORTS = [
  { name: 'weather-wide', width: 1600, height: 900 },
  { name: 'weather-fullhd', width: 1920, height: 1080 },
]

const EXPECTED_SCREENSHOTS = ROUTES.length * VIEWPORTS.length + WEATHER_EXTRA_VIEWPORTS.length
const PREVIEW_HOST = process.env.QA_PREVIEW_HOST || '127.0.0.1'
const PREVIEW_PORT = Number.parseInt(process.env.QA_PREVIEW_PORT || '4173', 10)

function loadPlaywright() {
  try {
    return require('playwright')
  } catch (error) {
    const configuredPath = process.env.PLAYWRIGHT_NODE_PATH

    if (!configuredPath) {
      throw error
    }

    return createRequire(path.resolve(configuredPath))('playwright')
  }
}

function ensureCleanOutput() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.mkdirSync(path.dirname(SUMMARY_PATH), { recursive: true })

  const safeOutputRoot = path.join(PROJECT_ROOT, '.qa')
  const resolvedOutput = path.resolve(OUTPUT_DIR)

  if (!resolvedOutput.startsWith(safeOutputRoot)) {
    return
  }

  for (const entry of fs.readdirSync(OUTPUT_DIR, { withFileTypes: true })) {
    if (entry.isFile() && (entry.name.endsWith('.png') || entry.name === 'manifest.json')) {
      fs.rmSync(path.join(OUTPUT_DIR, entry.name), { force: true })
    }
  }
}

function waitForPort(host, port, timeoutMs = 30000) {
  const startedAt = Date.now()

  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = net.createConnection({ host, port })

      socket.once('connect', () => {
        socket.destroy()
        resolve()
      })

      socket.once('error', () => {
        socket.destroy()

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for preview at ${host}:${port}`))
          return
        }

        setTimeout(check, 250)
      })
    }

    check()
  })
}

function getFreePort(preferredPort) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.unref()
    server.on('error', () => resolve(getFreePort(0)))
    server.listen(preferredPort, PREVIEW_HOST, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : preferredPort
      server.close(() => resolve(port))
    })
  })
}

async function startPreview() {
  const externalBaseUrl = process.env.QA_BASE_URL

  if (externalBaseUrl) {
    const url = new URL(externalBaseUrl)
    await waitForPort(url.hostname, Number(url.port || (url.protocol === 'https:' ? 443 : 80)))
    return {
      baseUrl: externalBaseUrl.replace(/\/$/, ''),
      owned: false,
      stop: () => {},
    }
  }

  const port = await getFreePort(PREVIEW_PORT)
  const previewCommand = IS_WINDOWS ? process.env.ComSpec || 'cmd.exe' : 'npm'
  const previewArgs = IS_WINDOWS
    ? ['/d', '/s', '/c', `npm run preview -- --host ${PREVIEW_HOST} --port ${port}`]
    : ['run', 'preview', '--', '--host', PREVIEW_HOST, '--port', String(port)]
  const child = spawn(previewCommand, previewArgs, {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    detached: !IS_WINDOWS,
    env: { ...process.env, BROWSER: 'none' },
  })

  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })

  try {
    await waitForPort(PREVIEW_HOST, port)
  } catch (error) {
    stopPreview(child)
    throw new Error(`${error.message}\n${output.trim()}`)
  }

  return {
    baseUrl: `http://${PREVIEW_HOST}:${port}`,
    owned: true,
    stop: () => stopPreview(child),
  }
}

function stopPreview(child) {
  if (!child || child.killed) {
    return
  }

  if (IS_WINDOWS) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }

  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    child.kill('SIGTERM')
  }
}

function createWeatherLoadedRouteSeed() {
  const now = Date.now()
  const hourly = Array.from({ length: 24 }, (_, index) => ({
    time: new Date(now + index * 60 * 60 * 1000).toISOString(),
    temperature: 20 + (index % 6),
    precipitationProbability: index % 5 === 0 ? 20 : 5,
    weatherCode: index % 5 === 0 ? 61 : 1,
  }))
  const daily = Array.from({ length: 7 }, (_, index) => ({
    date: new Date(now + index * 24 * 60 * 60 * 1000).toISOString(),
    minTemperature: 15 + index,
    maxTemperature: 23 + index,
    weatherCode: index % 3 === 0 ? 3 : 1,
    precipitationProbability: index % 3 === 0 ? 30 : 10,
  }))

  return {
    location: {
      id: 'stage-28-shanghai',
      name: 'Shanghai',
      country: 'China',
      latitude: 31.23,
      longitude: 121.47,
      timezone: 'Asia/Shanghai',
    },
    cache: {
      '31.23,121.47': {
        timestamp: now,
        data: {
          current: {
            temperature: 24,
            apparentTemperature: 25,
            weatherCode: 1,
            windSpeed: 9,
            windDirection: 120,
            humidity: 62,
            uvIndex: 4,
            isDay: true,
            time: new Date(now).toISOString(),
          },
          hourly,
          daily,
        },
      },
    },
  }
}

async function seedWeatherLoadedRoute(page) {
  const seed = createWeatherLoadedRouteSeed()

  await page.addInitScript(({ location, cache }) => {
    window.localStorage.setItem('lifeboard-weather-location', JSON.stringify(location))
    window.localStorage.setItem('lifeboard.weather.provider', 'mock')
    window.localStorage.setItem('lifeboard.weather.forecastCache.v1', JSON.stringify(cache))
  }, seed)

  await page.route('**/v1/air-quality**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        hourly: {
          time: [new Date().toISOString()],
          pm10: [18],
          pm2_5: [9],
          carbon_monoxide: [160],
          nitrogen_dioxide: [12],
          sulphur_dioxide: [3],
          ozone: [52],
          us_aqi: [32],
        },
      }),
    })
  })
}

function buildScreenshotPlan() {
  const plan = []

  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      plan.push({ route, viewport })
    }
  }

  const weatherRoute = ROUTES.find((route) => route.key === 'weather')

  for (const viewport of WEATHER_EXTRA_VIEWPORTS) {
    plan.push({ route: weatherRoute, viewport })
  }

  return plan
}

function screenshotFilename(route, viewport) {
  return `${route.key}__${viewport.name}__${viewport.width}x${viewport.height}.png`
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const html = document.documentElement
    const body = document.body
    const root = document.querySelector('#app')
    const h1 = Array.from(document.querySelectorAll('h1'))
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
      .join(' | ')

    return {
      title: document.title,
      h1,
      htmlScrollWidth: html.scrollWidth,
      htmlClientWidth: html.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
      rootTextLength: root?.textContent?.trim().length ?? 0,
      rootPresent: Boolean(root),
    }
  })
}

async function captureRoute(browser, baseUrl, route, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
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

  if (route.key === 'weather') {
    await seedWeatherLoadedRoute(page)
  }

  const url = `${baseUrl}${route.path}`
  const failures = []
  let dom = null
  let responseStatus = null
  let screenshotPath = path.join(OUTPUT_DIR, screenshotFilename(route, viewport))

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    responseStatus = response?.status() ?? null

    await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {})
    await page.locator('#app').waitFor({ state: 'visible', timeout: 10000 })
    await page.waitForTimeout(CI_MODE ? 150 : 300)

    dom = await inspectPage(page)

    if (!dom.rootPresent || dom.rootTextLength === 0) {
      failures.push('app root is missing or empty')
    }

    if (dom.htmlScrollWidth > dom.htmlClientWidth + 1) {
      failures.push(`html horizontal overflow ${dom.htmlScrollWidth}/${dom.htmlClientWidth}`)
    }

    if (dom.bodyScrollWidth > dom.bodyClientWidth + 1) {
      failures.push(`body horizontal overflow ${dom.bodyScrollWidth}/${dom.bodyClientWidth}`)
    }

    if (consoleErrors.length > 0) {
      failures.push(`console errors ${consoleErrors.length}`)
    }

    await page.screenshot({ path: screenshotPath, fullPage: false })
  } catch (error) {
    failures.push(error.message)
    screenshotPath = null
  } finally {
    await context.close()
  }

  return {
    routeKey: route.key,
    path: route.path,
    viewportName: viewport.name,
    width: viewport.width,
    height: viewport.height,
    screenshotPath: screenshotPath ? path.relative(PROJECT_ROOT, screenshotPath).replaceAll('\\', '/') : null,
    htmlScrollWidth: dom?.htmlScrollWidth ?? null,
    htmlClientWidth: dom?.htmlClientWidth ?? null,
    bodyScrollWidth: dom?.bodyScrollWidth ?? null,
    bodyClientWidth: dom?.bodyClientWidth ?? null,
    h1Text: dom?.h1 ?? '',
    title: dom?.title ?? '',
    consoleErrorCount: consoleErrors.length,
    consoleErrors,
    responseStatus,
    status: failures.length === 0 ? 'pass' : 'fail',
    pass: failures.length === 0,
    failReasons: failures,
  }
}

async function main() {
  const startedAt = Date.now()
  ensureCleanOutput()

  const { chromium } = loadPlaywright()
  const preview = await startPreview()
  const browser = await chromium.launch({ headless: true })
  const screenshots = []

  try {
    for (const item of buildScreenshotPlan()) {
      const result = await captureRoute(browser, preview.baseUrl, item.route, item.viewport)
      screenshots.push(result)
      const marker = result.pass ? 'PASS' : 'FAIL'
      const reasons = result.failReasons.length > 0 ? ` - ${result.failReasons.join('; ')}` : ''
      console.log(`${marker} ${result.routeKey} ${result.viewportName} ${result.width}x${result.height}${reasons}`)
    }
  } finally {
    await browser.close()
    preview.stop()
  }

  const failedScreenshots = screenshots.filter((item) => !item.pass)
  const consoleErrorCount = screenshots.reduce((total, item) => total + item.consoleErrorCount, 0)
  const generatedAt = new Date().toISOString()
  const durationMs = Date.now() - startedAt
  const manifest = {
    generatedAt,
    mode: CI_MODE ? 'ci' : 'local',
    baseUrl: preview.baseUrl,
    ownedPreview: preview.owned,
    outputDir: path.relative(PROJECT_ROOT, OUTPUT_DIR).replaceAll('\\', '/'),
    expectedScreenshots: EXPECTED_SCREENSHOTS,
    totalScreenshots: screenshots.length,
    passedScreenshots: screenshots.length - failedScreenshots.length,
    failedScreenshots: failedScreenshots.length,
    routes: ROUTES,
    viewports: VIEWPORTS,
    routeSpecificViewports: {
      weather: WEATHER_EXTRA_VIEWPORTS,
    },
    screenshots,
  }
  const summary = {
    generatedAt,
    durationMs,
    mode: manifest.mode,
    status: failedScreenshots.length === 0 && screenshots.length === EXPECTED_SCREENSHOTS ? 'pass' : 'fail',
    totalScreenshots: screenshots.length,
    expectedScreenshots: EXPECTED_SCREENSHOTS,
    passedScreenshots: manifest.passedScreenshots,
    failedScreenshots: manifest.failedScreenshots,
    failureCount: failedScreenshots.length,
    consoleErrorCount,
    outputDir: manifest.outputDir,
    manifestPath: path.relative(PROJECT_ROOT, MANIFEST_PATH).replaceAll('\\', '/'),
    routes: ROUTES.map((route) => route.key),
    viewports: VIEWPORTS.map((viewport) => `${viewport.name}:${viewport.width}x${viewport.height}`),
    routeSpecificViewports: {
      weather: WEATHER_EXTRA_VIEWPORTS.map((viewport) => `${viewport.name}:${viewport.width}x${viewport.height}`),
    },
    failures: failedScreenshots.map((item) => ({
      routeKey: item.routeKey,
      viewportName: item.viewportName,
      failReasons: item.failReasons,
    })),
    limitations: [
      'Screenshots are deterministic route baselines, not visual diff assertions.',
      'Weather is seeded for stable regression coverage and does not exercise live provider variance.',
      'The script checks horizontal overflow and console errors; manual design review still classifies visual polish severity.',
    ],
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  fs.writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')

  console.log(`\nRoute screenshots: ${summary.passedScreenshots}/${summary.totalScreenshots} passed`)
  console.log(`Manifest: ${summary.manifestPath}`)
  console.log(`Summary: ${path.relative(PROJECT_ROOT, SUMMARY_PATH).replaceAll('\\', '/')}`)

  if (summary.status !== 'pass') {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
