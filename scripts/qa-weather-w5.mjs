import { createRequire } from 'node:module'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = path.join(ROOT, '.qa', 'weather-w5')
const HOST = '127.0.0.1'
const WINDOWS = process.platform === 'win32'

function json(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function runBuild(enabled) {
  const env = { ...process.env, VITE_XIAOMI_WEATHER_ENABLED: enabled ? 'true' : 'false' }
  const result = WINDOWS
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], { cwd: ROOT, env, stdio: 'inherit', windowsHide: true })
    : spawnSync('npm', ['run', 'build'], { cwd: ROOT, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`W5 ${enabled ? 'enabled' : 'disabled'} build failed.`)
}

function freePort() {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.listen(0, HOST, () => {
      const address = server.address()
      server.close(() => resolve(typeof address === 'object' && address ? address.port : 4173))
    })
  })
}

function waitForPort(port, timeoutMs = 30_000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const probe = () => {
      const socket = net.createConnection({ host: HOST, port })
      socket.once('connect', () => { socket.destroy(); resolve() })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - started > timeoutMs) reject(new Error('Preview server did not start.'))
        else setTimeout(probe, 200)
      })
    }
    probe()
  })
}

async function startPreview() {
  const port = await freePort()
  const child = WINDOWS
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `npm run preview -- --host ${HOST} --port ${port}`], { cwd: ROOT, windowsHide: true, stdio: 'ignore' })
    : spawn('npm', ['run', 'preview', '--', '--host', HOST, '--port', String(port)], { cwd: ROOT, stdio: 'ignore' })
  await waitForPort(port)
  return {
    url: `http://${HOST}:${port}`,
    stop() {
      if (WINDOWS) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      else child.kill('SIGTERM')
    },
  }
}

function capabilities(raw) {
  const paths = { current: 'current', hourly: 'forecastHourly', daily: 'forecastDaily', aqi: 'aqi', minutely: 'minutely', alerts: 'alerts', indices: 'indices', typhoon: 'typhoon', yesterday: 'yesterday', preHour: 'preHour', sourceMaps: 'sourceMaps', brandInfo: 'brandInfo', updateTime: 'updateTime' }
  return Object.fromEntries(Object.entries(paths).map(([name, field]) => {
    if (!Object.hasOwn(raw, field)) return [name, 'missing']
    const value = raw[field]
    if (value === null) return [name, 'null']
    if (Array.isArray(value)) return [name, value.length ? 'available' : 'empty-array']
    if (typeof value === 'object') return [name, Object.keys(value).length ? 'available' : 'empty-object']
    return [name, 'available']
  }))
}

function xiaomiEnvelope(raw) {
  return { ok: true, provider: 'xiaomi', operation: 'all', data: raw, meta: { receivedAt: '2026-01-01T01:00:00.000Z', upstreamStatus: 200, capabilities: capabilities(raw) } }
}

function openMeteoFixture() {
  const hours = Array.from({ length: 48 }, (_, i) => {
    const day = i < 24 ? '01' : '02'
    return `2026-01-${day}T${String(i % 24).padStart(2, '0')}:00`
  })
  const days = Array.from({ length: 15 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`)
  const series = (length, value) => Array.from({ length }, (_, i) => value + (i % 3))
  return {
    timezone: 'Asia/Shanghai', timezone_abbreviation: 'CST',
    current: { time: '2026-01-01T01:00', temperature_2m: 20, apparent_temperature: 20, relative_humidity_2m: 50, precipitation: 0, rain: 0, showers: 0, snowfall: 0, weather_code: 0, cloud_cover: 10, wind_speed_10m: 3, wind_direction_10m: 0, wind_gusts_10m: 5, surface_pressure: 1000, visibility: 10000, is_day: 1 },
    current_units: { temperature_2m: '°C', precipitation: 'mm', relative_humidity_2m: '%', wind_speed_10m: 'km/h', surface_pressure: 'hPa' },
    hourly: { time: hours, temperature_2m: series(48, 20), apparent_temperature: series(48, 20), precipitation_probability: series(48, 0), precipitation: series(48, 0), weather_code: series(48, 0), wind_speed_10m: series(48, 3), wind_gusts_10m: series(48, 5), uv_index: series(48, 1), is_day: hours.map((_, i) => i % 24 >= 7 && i % 24 <= 18 ? 1 : 0) },
    hourly_units: { precipitation_probability: '%', uv_index: '' },
    daily: { time: days, weather_code: series(15, 0), temperature_2m_max: series(15, 24), temperature_2m_min: series(15, 14), apparent_temperature_max: series(15, 24), apparent_temperature_min: series(15, 14), precipitation_sum: series(15, 0), precipitation_probability_max: series(15, 0), wind_speed_10m_max: series(15, 8), wind_direction_10m_dominant: series(15, 0), wind_gusts_10m_max: series(15, 12), uv_index_max: series(15, 2), sunrise: days.map((date) => `${date}T07:00`), sunset: days.map((date) => `${date}T18:00`) },
  }
}

const LOCATION = { id: 'sanitized-location', name: 'Sanitized City', kind: 'Locality', admin1: 'Sanitized Region', country: 'Sanitized Country', countryCode: 'CN', latitude: 0, longitude: 0, elevation: null, timezone: 'Asia/Shanghai', displayLabel: 'Sanitized City, Sanitized Region', source: 'xiaomi', providerLocationIds: { xiaomi: 'sanitized-location-key' } }

async function createScenario(browser, baseUrl, raw, { viewport, provider = 'xiaomi', xiaomiMode = 'success', openMode = 'success', offlineAfterSeed = false } = {}) {
  const context = await browser.newContext({ viewport: viewport ?? { width: 390, height: 844 } })
  const page = await context.newPage()
  const state = { xiaomi: 0, openMeteo: 0, errors: [], xiaomiMode, openMode }
  page.on('console', (message) => { if (message.type() === 'error') state.errors.push(message.text()) })
  page.on('pageerror', (error) => state.errors.push(error.message))
  await page.addInitScript(({ location, providerId }) => {
    if (!localStorage.getItem('lifeboard.language')) localStorage.setItem('lifeboard.language', 'zh-CN')
    if (!localStorage.getItem('lifeboard.weather.provider')) localStorage.setItem('lifeboard.weather.provider', providerId)
    if (!localStorage.getItem('lifeboard-weather-location')) localStorage.setItem('lifeboard-weather-location', JSON.stringify(location))
    if (localStorage.getItem('w5-offline') === 'true') Object.defineProperty(Navigator.prototype, 'onLine', { configurable: true, get: () => false })
  }, { location: LOCATION, providerId: provider })
  await page.route('**/api/weather/xiaomi/all?*', async (route) => {
    state.xiaomi += 1
    if (state.xiaomiMode === 'network') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"error":{"code":"xiaomiUnavailable"}}' })
    if (state.xiaomiMode === '429') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"error":{"code":"xiaomiRejected","upstreamStatus":429,"retryAfterSeconds":60}}' })
    if (state.xiaomiMode === 'contract') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"unexpected":true}' })
    if (state.xiaomiMode === 'retry-once' && state.xiaomi === 1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"error":{"code":"xiaomiUnavailable"}}' })
    if (state.xiaomiMode === 'retry-switch') {
      if (state.xiaomi === 1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"error":{"code":"xiaomiUnavailable"}}' })
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(xiaomiEnvelope(raw)) })
  })
  await page.route('https://api.open-meteo.com/**', async (route) => {
    state.openMeteo += 1
    if (state.openMode === '429') return route.fulfill({ status: 429, headers: { 'Retry-After': '60' }, body: '{}' })
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(openMeteoFixture()) })
  })
  await page.route('https://air-quality-api.open-meteo.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ hourly: { time: ['2026-01-01T01:00'], pm10: [10], pm2_5: [5], carbon_monoxide: [100], nitrogen_dioxide: [5], sulphur_dioxide: [2], ozone: [40], us_aqi: [20] } }) }))
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  if (offlineAfterSeed) localStorage.setItem('w5-offline', 'true')
  return { context, page, state }
}

async function noOverflow(page) {
  return !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))
}

async function readForecastCacheMetrics(page) {
  return page.evaluate(() => {
    const serialized = localStorage.getItem('lifeboard.weather.forecastCache.v1')
    if (!serialized) return { bytes: 0, entries: 0 }
    const parsed = JSON.parse(serialized)
    return {
      bytes: new TextEncoder().encode(serialized).byteLength,
      entries: Array.isArray(parsed.entries) ? parsed.entries.length : 0,
    }
  })
}

async function ageCache(page, { expired = false } = {}) {
  await page.evaluate(({ hardExpired }) => {
    const key = 'lifeboard.weather.forecastCache.v1'
    const cache = JSON.parse(localStorage.getItem(key))
    for (const entry of cache.entries) {
      entry.storedAt = Date.now() - 16 * 60 * 1000
      entry.freshUntil = entry.storedAt + 15 * 60 * 1000
      entry.staleUntil = hardExpired ? Date.now() - 1 : Date.now() + 60 * 60 * 1000
    }
    localStorage.setItem(key, JSON.stringify(cache))
  }, { hardExpired: expired })
}

async function assertClean(name, page, state) {
  if (state.errors.length) throw new Error(`${name}: ${state.errors.length} console errors.`)
  if (!await noOverflow(page)) throw new Error(`${name}: horizontal overflow.`)
}

async function enabledQa(browser, baseUrl, raw) {
  const evidence = []

  for (const width of [390, 768, 1440]) {
    const scenario = await createScenario(browser, baseUrl, raw, { viewport: { width, height: width === 390 ? 844 : 900 } })
    await scenario.page.locator('#xiaomi-extended-weather-title').waitFor()
    if (scenario.state.xiaomi !== 1) throw new Error(`live-${width}: expected one Xiaomi request.`)
    await assertClean(`live-${width}`, scenario.page, scenario.state)
    await scenario.page.screenshot({ path: path.join(OUTPUT, `live-${width}.png`), fullPage: true })
    evidence.push({ scenario: `fresh-live-${width}`, xiaomi: scenario.state.xiaomi, openMeteo: scenario.state.openMeteo })
    await scenario.context.close()
  }

  const fresh = await createScenario(browser, baseUrl, raw)
  await fresh.page.reload({ waitUntil: 'domcontentloaded' })
  await fresh.page.getByRole('status').filter({ hasText: /保存|缓存/ }).waitFor()
  if (fresh.state.xiaomi !== 1) throw new Error('fresh-cache made a duplicate request.')
  const cacheMetrics = await readForecastCacheMetrics(fresh.page)
  if (cacheMetrics.entries > 4) throw new Error('fresh-cache exceeded the four-entry retention bound.')
  evidence.push({ scenario: 'fresh-cache', xiaomi: fresh.state.xiaomi, cacheMetrics })
  await fresh.context.close()

  const stale = await createScenario(browser, baseUrl, raw, { viewport: { width: 768, height: 900 } })
  await ageCache(stale.page)
  stale.state.xiaomiMode = 'network'
  await stale.page.reload({ waitUntil: 'domcontentloaded' })
  await stale.page.waitForTimeout(1000)
  const staleStatuses = await stale.page.getByRole('status').allTextContents()
  if (!staleStatuses.some((text) => /保存|更新失败/.test(text))) {
    const labels = staleStatuses.map((text) => text.replace(/\s+/g, ' ').trim().slice(0, 80)).join(' | ')
    throw new Error(`stale-cache notice missing; requests=${stale.state.xiaomi}; statuses=${labels}`)
  }
  await stale.page.screenshot({ path: path.join(OUTPUT, 'stale-network-768.png'), fullPage: true })
  evidence.push({ scenario: 'stale-after-network-failure', xiaomi: stale.state.xiaomi })
  await assertClean('stale-cache', stale.page, stale.state)
  await stale.context.close()

  const fallback = await createScenario(browser, baseUrl, raw, { viewport: { width: 1440, height: 900 }, xiaomiMode: 'network' })
  await fallback.page.waitForTimeout(1000)
  const fallbackStatuses = await fallback.page.getByRole('status').allTextContents()
  if (!fallbackStatuses.some((text) => /Open-Meteo/.test(text))) {
    const labels = fallbackStatuses.map((text) => text.replace(/\s+/g, ' ').trim().slice(0, 80)).join(' | ')
    const pageText = (await fallback.page.locator('body').innerText()).replace(/\s+/g, ' ').trim().slice(0, 300)
    throw new Error(`fallback notice missing; xiaomi=${fallback.state.xiaomi}; open=${fallback.state.openMeteo}; statuses=${labels}; page=${pageText}`)
  }
  if (fallback.state.xiaomi !== 2 || fallback.state.openMeteo !== 1) {
    throw new Error(`fallback request budget exceeded; xiaomi=${fallback.state.xiaomi}; open=${fallback.state.openMeteo}.`)
  }
  const xiaomiBeforeHome = fallback.state.xiaomi
  await Promise.all([
    fallback.page.waitForURL('**/app'),
    fallback.page.locator('a[href="/app"]').first().click(),
  ])
  await fallback.page.getByText(/Open-Meteo/).first().waitFor()
  if (fallback.state.xiaomi !== xiaomiBeforeHome) throw new Error('Home navigation retried Xiaomi during active fallback.')
  await fallback.page.screenshot({ path: path.join(OUTPUT, 'fallback-home-1440.png'), fullPage: true })
  evidence.push({ scenario: 'xiaomi-fallback-home', xiaomi: fallback.state.xiaomi, openMeteo: fallback.state.openMeteo })
  await assertClean('fallback', fallback.page, fallback.state)
  await fallback.context.close()

  const fallbackLocale = await createScenario(browser, baseUrl, raw, { xiaomiMode: 'network' })
  await fallbackLocale.page.getByRole('status').filter({ hasText: /Open-Meteo/ }).first().waitFor()
  const xiaomiBeforeLocale = fallbackLocale.state.xiaomi
  await fallbackLocale.page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await fallbackLocale.page.locator('input[name="interface-language"][value="en-US"]').check()
  await fallbackLocale.page.waitForFunction(() => localStorage.getItem('lifeboard.language') === 'en-US')
  await fallbackLocale.page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  if (fallbackLocale.state.xiaomi !== xiaomiBeforeLocale) throw new Error('Locale switch during fallback triggered Xiaomi.')
  if (await fallbackLocale.page.getByRole('status').filter({ hasText: /Open-Meteo is serving/ }).count()) throw new Error('Locale switch retained stale fallback status.')
  evidence.push({ scenario: 'locale-switch-during-fallback', xiaomi: fallbackLocale.state.xiaomi })
  await fallbackLocale.context.close()

  const fatal = await createScenario(browser, baseUrl, raw, { xiaomiMode: 'contract' })
  await fatal.page.getByRole('heading', { name: /天气加载错误|Weather loading error/ }).waitFor()
  if (fatal.state.openMeteo !== 0) throw new Error('Contract failure silently fell back.')
  evidence.push({ scenario: 'contract-fatal-no-fallback', xiaomi: fatal.state.xiaomi, openMeteo: 0 })
  await fatal.context.close()

  const retry = await createScenario(browser, baseUrl, raw, { xiaomiMode: 'retry-once' })
  await retry.page.getByRole('status').filter({ hasText: /已加载|loaded/i }).first().waitFor()
  if (retry.state.xiaomi !== 2) throw new Error(`Bounded retry made ${retry.state.xiaomi} Xiaomi attempts instead of two.`)
  evidence.push({ scenario: 'retry-success', xiaomi: retry.state.xiaomi })
  await retry.context.close()

  const switchDuringRetry = await createScenario(browser, baseUrl, raw, { xiaomiMode: 'retry-switch' })
  while (switchDuringRetry.state.xiaomi < 2) await switchDuringRetry.page.waitForTimeout(20)
  await switchDuringRetry.page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await switchDuringRetry.page.getByRole('radio', { name: /Open-Meteo/ }).check()
  await switchDuringRetry.page.waitForFunction(() => localStorage.getItem('lifeboard.weather.provider') === 'openMeteo')
  await switchDuringRetry.page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  await switchDuringRetry.page.waitForTimeout(1400)
  if (await switchDuringRetry.page.locator('#xiaomi-extended-weather-title').isVisible().catch(() => false)) {
    const storedProvider = await switchDuringRetry.page.evaluate(() => localStorage.getItem('lifeboard.weather.provider'))
    throw new Error(`Stale Xiaomi retry overwrote Open-Meteo; stored=${storedProvider}; xiaomi=${switchDuringRetry.state.xiaomi}; open=${switchDuringRetry.state.openMeteo}.`)
  }
  evidence.push({ scenario: 'provider-switch-during-retry', xiaomi: switchDuringRetry.state.xiaomi, openMeteo: switchDuringRetry.state.openMeteo })
  await switchDuringRetry.context.close()

  const offline = await createScenario(browser, baseUrl, raw)
  await ageCache(offline.page)
  await offline.page.evaluate(() => localStorage.setItem('w5-offline', 'true'))
  await offline.page.reload({ waitUntil: 'domcontentloaded' })
  await offline.page.getByRole('status').filter({ hasText: /离线|offline/i }).waitFor()
  evidence.push({ scenario: 'offline-stale-cache', xiaomi: offline.state.xiaomi })
  await offline.context.close()

  const limited = await createScenario(browser, baseUrl, raw)
  await ageCache(limited.page)
  limited.state.xiaomiMode = '429'
  await limited.page.reload({ waitUntil: 'domcontentloaded' })
  await limited.page.getByRole('status').filter({ hasText: /暂停请求|pause requests/ }).waitFor()
  evidence.push({ scenario: 'rate-limited-stale-cache', xiaomi: limited.state.xiaomi })
  await limited.context.close()

  return evidence
}

async function disabledQa(browser, baseUrl) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('lifeboard.language', 'zh-CN'))
  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  if (await page.getByRole('radio', { name: /Xiaomi/ }).count()) throw new Error('Production-equivalent build exposed Xiaomi selection.')
  if (!await noOverflow(page)) throw new Error('Feature-disabled Settings overflowed.')
  await context.close()
  return { scenario: 'feature-disabled-production-equivalent', xiaomiControls: 0 }
}

async function main() {
  fs.rmSync(OUTPUT, { recursive: true, force: true })
  fs.mkdirSync(OUTPUT, { recursive: true })
  const raw = { ...json('tests/weather-xiaomi/fixtures/all.success.json'), ...json('tests/weather-w4/fixtures/extended.success.json') }
  const browser = await chromium.launch({ headless: true })
  const evidence = []
  try {
    if (process.env.W5_QA_SKIP_BUILD !== 'true') runBuild(true)
    let preview = await startPreview()
    try { evidence.push(...await enabledQa(browser, preview.url, raw)) } finally { preview.stop() }
    if (process.env.W5_QA_SKIP_BUILD === 'true') {
      fs.writeFileSync(path.join(OUTPUT, 'summary.json'), `${JSON.stringify({ status: 'debug-enabled-only', scenarios: evidence }, null, 2)}\n`)
      return
    }
    runBuild(false)
    preview = await startPreview()
    try { evidence.push(await disabledQa(browser, preview.url)) } finally { preview.stop() }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(OUTPUT, 'summary.json'), `${JSON.stringify({ status: 'passed', consoleErrors: 0, overflowFailures: 0, scenarios: evidence }, null, 2)}\n`)
  process.stdout.write(`PASS Weather W5 deterministic resilience QA (${evidence.length} scenarios)\nConsole errors: 0\nOverflow failures: 0\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
