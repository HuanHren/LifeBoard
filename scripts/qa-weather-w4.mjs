import { createRequire } from 'node:module'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_DIR = path.join(PROJECT_ROOT, '.qa', 'weather-w4')
const SUMMARY_PATH = path.join(OUTPUT_DIR, 'summary.json')
const HOST = '127.0.0.1'
const IS_WINDOWS = process.platform === 'win32'

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8'))
}

function clone(value) {
  return structuredClone(value)
}

function runEnabledBuild() {
  const env = { ...process.env, VITE_XIAOMI_WEATHER_ENABLED: 'true' }
  const result = IS_WINDOWS
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], {
        cwd: PROJECT_ROOT,
        env,
        stdio: 'inherit',
        windowsHide: true,
      })
    : spawnSync('npm', ['run', 'build'], { cwd: PROJECT_ROOT, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error('Feature-enabled W4 build failed.')
}

function waitForPort(port, timeoutMs = 30_000) {
  const startedAt = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = net.createConnection({ host: HOST, port })
      socket.once('connect', () => {
        socket.destroy()
        resolve()
      })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${HOST}:${port}.`))
          return
        }
        setTimeout(check, 250)
      })
    }
    check()
  })
}

function freePort() {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.listen(0, HOST, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 4173
      server.close(() => resolve(port))
    })
  })
}

function stopProcess(child) {
  if (!child || child.killed) return
  if (IS_WINDOWS) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
}

async function startPreview() {
  const port = await freePort()
  const command = IS_WINDOWS ? process.env.ComSpec || 'cmd.exe' : 'npm'
  const args = IS_WINDOWS
    ? ['/d', '/s', '/c', `npm run preview -- --host ${HOST} --port ${port}`]
    : ['run', 'preview', '--', '--host', HOST, '--port', String(port)]
  const child = spawn(command, args, {
    cwd: PROJECT_ROOT,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  await waitForPort(port)
  return { baseUrl: `http://${HOST}:${port}`, stop: () => stopProcess(child) }
}

function capabilityState(value, present) {
  if (!present) return 'missing'
  if (value === null) return 'null'
  if (Array.isArray(value)) return value.length === 0 ? 'empty-array' : 'available'
  if (typeof value === 'object') return Object.keys(value).length === 0 ? 'empty-object' : 'available'
  return 'available'
}

function capabilities(raw) {
  const paths = {
    current: 'current',
    hourly: 'forecastHourly',
    daily: 'forecastDaily',
    aqi: 'aqi',
    minutely: 'minutely',
    alerts: 'alerts',
    indices: 'indices',
    typhoon: 'typhoon',
    yesterday: 'yesterday',
    preHour: 'preHour',
    sourceMaps: 'sourceMaps',
    brandInfo: 'brandInfo',
    updateTime: 'updateTime',
  }
  return Object.fromEntries(Object.entries(paths).map(([name, pathName]) => [
    name,
    capabilityState(raw[pathName], Object.hasOwn(raw, pathName)),
  ]))
}

function allEnvelope(raw) {
  return {
    ok: true,
    provider: 'xiaomi',
    operation: 'all',
    data: raw,
    meta: {
      receivedAt: '2026-01-01T01:00:00.000Z',
      upstreamStatus: 200,
      capabilities: capabilities(raw),
    },
  }
}

function openMeteoFixture() {
  const hourlyTime = Array.from({ length: 24 }, (_, index) => `2026-01-01T${String(index).padStart(2, '0')}:00`)
  const dailyTime = Array.from({ length: 15 }, (_, index) => `2026-01-${String(index + 1).padStart(2, '0')}`)
  const hourlyValues = (value) => hourlyTime.map((_, index) => value + (index % 3))
  const dailyValues = (value) => dailyTime.map((_, index) => value + (index % 3))
  return {
    timezone: 'Asia/Shanghai',
    timezone_abbreviation: 'CST',
    current: {
      time: '2026-01-01T01:00',
      temperature_2m: 20,
      apparent_temperature: 20,
      relative_humidity_2m: 50,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      weather_code: 0,
      cloud_cover: 10,
      wind_speed_10m: 3,
      wind_direction_10m: 0,
      wind_gusts_10m: 5,
      surface_pressure: 1000,
      visibility: 10_000,
      is_day: 1,
    },
    current_units: {
      temperature_2m: '°C', precipitation: 'mm', relative_humidity_2m: '%',
      wind_speed_10m: 'km/h', surface_pressure: 'hPa',
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: hourlyValues(20),
      apparent_temperature: hourlyValues(20),
      precipitation_probability: hourlyValues(0),
      precipitation: hourlyValues(0),
      weather_code: hourlyValues(0),
      wind_speed_10m: hourlyValues(3),
      wind_gusts_10m: hourlyValues(5),
      uv_index: hourlyValues(1),
      is_day: hourlyTime.map((_, index) => index >= 7 && index <= 18 ? 1 : 0),
    },
    hourly_units: { precipitation_probability: '%', uv_index: '' },
    daily: {
      time: dailyTime,
      weather_code: dailyValues(0),
      temperature_2m_max: dailyValues(24),
      temperature_2m_min: dailyValues(14),
      apparent_temperature_max: dailyValues(24),
      apparent_temperature_min: dailyValues(14),
      precipitation_sum: dailyValues(0),
      precipitation_probability_max: dailyValues(0),
      wind_speed_10m_max: dailyValues(8),
      wind_direction_10m_dominant: dailyValues(0),
      wind_gusts_10m_max: dailyValues(12),
      uv_index_max: dailyValues(2),
      sunrise: dailyTime.map((date) => `${date}T07:00`),
      sunset: dailyTime.map((date) => `${date}T18:00`),
    },
  }
}

const location = {
  id: 'sanitized-location',
  name: 'Sanitized City',
  kind: 'Locality',
  admin1: 'Sanitized Region',
  country: 'Sanitized Country',
  countryCode: 'CN',
  latitude: 0,
  longitude: 0,
  elevation: null,
  timezone: 'Asia/Shanghai',
  displayLabel: 'Sanitized City, Sanitized Region',
  source: 'xiaomi',
  providerLocationIds: { xiaomi: 'sanitized-location-key' },
}

async function configurePage(page, raw, options = {}) {
  const counters = { all: 0, search: 0, openMeteo: 0 }
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  await page.addInitScript(({ storedLocation, theme }) => {
    localStorage.setItem('lifeboard.language', 'zh-CN')
    localStorage.setItem('lifeboard.weather.provider', 'xiaomi')
    localStorage.setItem('lifeboard-weather-location', JSON.stringify(storedLocation))
    if (theme) localStorage.setItem('lifeboard.theme', theme)
  }, { storedLocation: location, theme: options.theme })
  await page.route('**/api/weather/xiaomi/all?*', async (route) => {
    counters.all += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(allEnvelope(raw)) })
  })
  await page.route('**/api/weather/xiaomi/search?*', async (route) => {
    counters.search += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, provider: 'xiaomi', operation: 'search', data: { results: [] }, meta: { receivedAt: '2026-01-01T01:00:00.000Z', upstreamStatus: 200 } }),
    })
  })
  await page.route('https://api.open-meteo.com/**', async (route) => {
    counters.openMeteo += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(openMeteoFixture()) })
  })
  await page.route('https://air-quality-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ hourly: { time: ['2026-01-01T01:00'], pm10: [10], pm2_5: [5], carbon_monoxide: [100], nitrogen_dioxide: [5], sulphur_dioxide: [2], ozone: [40], us_aqi: [20] } }),
    })
  })
  return { counters, consoleErrors }
}

async function checkOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

async function captureScenario(browser, baseUrl, { name, viewport, raw, theme, expectRegion }) {
  const context = await browser.newContext({ viewport, colorScheme: theme === 'dark' ? 'dark' : 'light' })
  const page = await context.newPage()
  const state = await configurePage(page, raw, { theme })
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  const region = page.getByRole('heading', { name: '小米天气补充信息' })
  if (expectRegion) await region.waitFor()
  else if (await region.count()) throw new Error(`${name}: unexpected Xiaomi extended region.`)
  if (await checkOverflow(page)) throw new Error(`${name}: horizontal overflow.`)
  if (state.consoleErrors.length > 0) throw new Error(`${name}: console errors: ${state.consoleErrors.length}`)
  const file = path.join(OUTPUT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  await context.close()
  return { name, file, requests: state.counters, consoleErrors: 0, overflow: 0 }
}

async function interactionFlow(browser, baseUrl, raw) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  const state = await configurePage(page, raw)
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: '小米天气补充信息' }).waitFor()
  const initialAll = state.counters.all

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('radio', { name: /Open-Meteo/ }).check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.weather.provider') === 'openMeteo')
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  if (await page.getByRole('heading', { name: '小米天气补充信息' }).count()) throw new Error('Open-Meteo retained stale Xiaomi extensions.')
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'open-meteo-mobile.png'), fullPage: true })

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('radio', { name: /Xiaomi Weather|小米天气/ }).check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.weather.provider') === 'xiaomi')
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: '小米天气补充信息' }).waitFor()

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  const beforeEnglish = state.counters.all
  await page.locator('input[name="interface-language"][value="en-US"]').check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.language') === 'en-US')
  await page.waitForTimeout(100)
  if (state.counters.all !== beforeEnglish) throw new Error('en-US triggered a Xiaomi request.')
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  if (await page.getByRole('heading', { name: 'Xiaomi weather details' }).count()) throw new Error('en-US retained Xiaomi extensions.')

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="interface-language"][value="zh-CN"]').check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.language') === 'zh-CN')
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: '小米天气补充信息' }).waitFor()
  if (state.counters.all < initialAll + 2) throw new Error('Provider/locale switching did not restore Xiaomi data.')

  await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
  if (await page.getByRole('heading', { name: '小米天气补充信息' }).count()) throw new Error('Home rendered W4 extensions.')
  if (await checkOverflow(page)) throw new Error('Interaction flow overflowed.')
  if (state.consoleErrors.length > 0) throw new Error(`Interaction flow console errors: ${state.consoleErrors.length}`)
  await context.close()
  return { requests: state.counters, consoleErrors: 0, overflow: 0 }
}

async function main() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  runEnabledBuild()
  const baseRaw = { ...readJson('tests/weather-xiaomi/fixtures/all.success.json'), ...readJson('tests/weather-w4/fixtures/extended.success.json') }
  const sparseRaw = clone(baseRaw)
  delete sparseRaw.minutely
  delete sparseRaw.preHour
  const longRaw = clone(baseRaw)
  longRaw.minutely.precipitation.headDescription = '这是一段用于验证窄屏换行的较长分钟级降水说明，内容保持为脱敏测试文字，不代表真实天气。'
  longRaw.minutely.precipitation.shortDescription = '补充说明同样需要在移动端自然换行，且不能挤压或溢出页面。'

  const preview = await startPreview()
  const browser = await chromium.launch({ headless: true })
  try {
    const screenshots = []
    for (const scenario of [
      { name: 'xiaomi-full-mobile', viewport: { width: 390, height: 844 }, raw: baseRaw, expectRegion: true },
      { name: 'xiaomi-full-tablet', viewport: { width: 768, height: 1024 }, raw: baseRaw, expectRegion: true },
      { name: 'xiaomi-full-desktop', viewport: { width: 1440, height: 900 }, raw: baseRaw, expectRegion: true },
      { name: 'xiaomi-sparse-tablet', viewport: { width: 768, height: 1024 }, raw: sparseRaw, expectRegion: false },
      { name: 'xiaomi-dark-desktop', viewport: { width: 1440, height: 900 }, raw: baseRaw, theme: 'dark', expectRegion: true },
      { name: 'xiaomi-long-mobile', viewport: { width: 390, height: 844 }, raw: longRaw, expectRegion: true },
    ]) screenshots.push(await captureScenario(browser, preview.baseUrl, scenario))
    const interaction = await interactionFlow(browser, preview.baseUrl, baseRaw)
    const summary = { status: 'passed', screenshots, interaction }
    fs.writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`)
    process.stdout.write(`PASS Weather W4 targeted browser QA (${screenshots.length} screenshots)\n`)
    process.stdout.write(`Console errors: 0\nOverflow failures: 0\n`)
  } finally {
    await browser.close()
    preview.stop()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
