import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const baseUrl = process.argv[2]
const jwt = process.env.W5_PREVIEW_JWT
if (!baseUrl || !/^https:\/\//.test(baseUrl)) throw new Error('Provide the HTTPS Preview URL.')
if (!jwt) throw new Error('Protected Preview authentication is unavailable.')

const preview = new URL(baseUrl)
const output = path.join(process.cwd(), '.qa', 'weather-w5')
const forbidden = [
  'weatherapi.market.xiaomi.com', 'XIAOMI_WEATHER_BASE_URL', 'XIAOMI_WEATHER_APP_KEY',
  'XIAOMI_WEATHER_SIGN', 'XIAOMI_WEATHER_APP_VERSION', 'XIAOMI_WEATHER_ROM_VERSION',
  'XIAOMI_WEATHER_DEVICE', 'XIAOMI_WEATHER_OAID', 'sourceMaps.clientInfo.appKey',
  'x-vercel-protection-bypass',
]

function assertSafe(text, surface) {
  if (forbidden.some((marker) => text.includes(marker))) throw new Error(`${surface} contains a forbidden marker.`)
}

function findSecretKeyPath(value, pathParts = []) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSecretKeyPath(value[index], [...pathParts, String(index)])
      if (found) return found
    }
    return null
  }
  if (!value || typeof value !== 'object') return null
  for (const [key, nested] of Object.entries(value)) {
    if (['appkey', 'sign', 'oaid', 'device', 'appversion', 'romversion', 'clientinfo'].includes(key.toLowerCase())) return [...pathParts, key].join('.')
    const found = findSecretKeyPath(nested, [...pathParts, key])
    if (found) return found
  }
  return null
}

function openMeteoFixture() {
  const hours = Array.from({ length: 48 }, (_, i) => `2026-01-${i < 24 ? '01' : '02'}T${String(i % 24).padStart(2, '0')}:00`)
  const days = Array.from({ length: 15 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`)
  const series = (length, value) => Array.from({ length }, (_, i) => value + (i % 3))
  return {
    timezone: 'Asia/Shanghai', timezone_abbreviation: 'CST',
    current: { time: '2026-01-01T01:00', temperature_2m: 20, apparent_temperature: 20, relative_humidity_2m: 50, precipitation: 0, rain: 0, showers: 0, snowfall: 0, weather_code: 0, cloud_cover: 10, wind_speed_10m: 3, wind_direction_10m: 0, wind_gusts_10m: 5, surface_pressure: 1000, visibility: 10000, is_day: 1 },
    current_units: { temperature_2m: '°C', precipitation: 'mm', relative_humidity_2m: '%', wind_speed_10m: 'km/h', surface_pressure: 'hPa' },
    hourly: { time: hours, temperature_2m: series(48, 20), apparent_temperature: series(48, 20), precipitation_probability: series(48, 0), precipitation: series(48, 0), weather_code: series(48, 0), wind_speed_10m: series(48, 3), wind_gusts_10m: series(48, 5), uv_index: series(48, 1), is_day: hours.map((_, i) => i % 24 >= 7 && i % 24 <= 18 ? 1 : 0) },
    hourly_units: { precipitation_probability: '%', uv_index: '' },
    daily: { time: days, weather_code: series(15, 0), temperature_2m_max: series(15, 24), temperature_2m_min: series(15, 14), apparent_temperature_max: series(15, 24), apparent_temperature_min: series(15, 14), precipitation_sum: series(15, 0), precipitation_probability_max: series(15, 0), wind_speed_10m_max: series(15, 8), wind_direction_10m_dominant: series(15, 0), wind_gusts_10m_max: series(15, 12), uv_index_max: series(15, 2), sunrise: days.map((day) => `${day}T07:00`), sunset: days.map((day) => `${day}T18:00`) },
  }
}

function proxyFailure(code, details = {}) {
  return JSON.stringify({ ok: false, error: { code, ...details } })
}

async function newContext(browser, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport ?? { width: 390, height: 844 }, storageState: options.storageState })
  if (!options.storageState) await context.addCookies([{ name: '_vercel_jwt', value: jwt, domain: preview.hostname, path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }])
  return context
}

function monitor(page) {
  const errors = []
  const requests = { search: 0, all: 0, directUpstream: 0, unsafe: 0, unsafeSurfaces: [] }
  page.on('console', (message) => { if (message.type() === 'error') errors.push('console') })
  page.on('pageerror', () => errors.push('pageerror'))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.hostname === 'weatherapi.market.xiaomi.com') requests.directUpstream += 1
    if (url.origin === preview.origin && url.pathname === '/api/weather/xiaomi/search') requests.search += 1
    if (url.origin === preview.origin && url.pathname === '/api/weather/xiaomi/all') requests.all += 1
    if (/appKey|sign|oaid|XIAOMI_WEATHER_/i.test(url.search)) { requests.unsafe += 1; requests.unsafeSurfaces.push('query') }
    const nonCookieHeaders = Object.entries(request.headers()).filter(([name]) => name.toLowerCase() !== 'cookie')
    const unsafeHeaders = nonCookieHeaders.filter(([name, value]) => (
      /XIAOMI_WEATHER_|appkey|sign|oaid|x-xiaomi/i.test(name) ||
      /XIAOMI_WEATHER_|weatherapi\.market\.xiaomi\.com/i.test(value)
    )).map(([name]) => name)
    if (unsafeHeaders.length) { requests.unsafe += 1; requests.unsafeSurfaces.push(...unsafeHeaders) }
  })
  return { errors, requests }
}

async function assertOverflow(page) {
  if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error(`Horizontal overflow at ${page.viewportSize()?.width}px.`)
}

async function parseProxy(response, operation) {
  const text = await response.text()
  assertSafe(text, `${operation} response`)
  const body = JSON.parse(text)
  const unsafePath = findSecretKeyPath(body)
  if (unsafePath) throw new Error(`${operation} response contains internal credential-shaped field at ${unsafePath}.`)
  if (body.ok !== true || body.provider !== 'xiaomi' || body.operation !== operation) throw new Error(`${operation} envelope invalid.`)
  return body
}

async function ageCache(page, remove = false) {
  await page.evaluate(({ shouldRemove }) => {
    const key = 'lifeboard.weather.forecastCache.v1'
    if (shouldRemove) { localStorage.removeItem(key); return }
    const envelope = JSON.parse(localStorage.getItem(key))
    for (const entry of envelope.entries) {
      entry.storedAt = Date.now() - 16 * 60 * 1000
      entry.freshUntil = entry.storedAt + 15 * 60 * 1000
      entry.staleUntil = Date.now() + 60 * 60 * 1000
    }
    localStorage.setItem(key, JSON.stringify(envelope))
  }, { shouldRemove: remove })
}

async function main() {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await newContext(browser)
    const page = await context.newPage()
    const live = monitor(page)
    await page.addInitScript(() => localStorage.setItem('lifeboard.language', 'zh-CN'))
    await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { level: 1 }).waitFor()
    if (await page.getByText(/Log in to Vercel/i).count()) throw new Error('Vercel authentication page remained visible.')
    const xiaomi = page.getByRole('radio', { name: /小米天气|Xiaomi Weather/ })
    if (await xiaomi.count() !== 1 || await xiaomi.isDisabled()) throw new Error('Xiaomi Preview selector unavailable.')
    await xiaomi.check()
    await page.waitForFunction(() => localStorage.getItem('lifeboard.weather.provider') === 'xiaomi')

    await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
    const searchResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/weather/xiaomi/search')
    await page.getByRole('searchbox').fill('尉氏县')
    await page.getByRole('button', { name: /搜索|Search/ }).click()
    const searchResponse = await searchResponsePromise
    if (!searchResponse.ok()) throw new Error(`Real search HTTP ${searchResponse.status()}.`)
    const searchBody = await parseProxy(searchResponse, 'search')
    const options = page.locator('[data-weather-search-option]')
    await options.first().waitFor()
    const texts = await options.allTextContents()
    const matches = texts.flatMap((text, index) => text.includes('尉氏县') && text.includes('开封') && text.includes('河南') && text.includes('中国') ? [index] : [])
    if (matches.length !== 1) throw new Error('Real search did not produce one verified Weishi County match.')
    const target = options.nth(matches[0])
    await target.focus()
    if (!await target.evaluate((element) => element === document.activeElement)) throw new Error('Search result is not keyboard focusable.')
    const allResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/weather/xiaomi/all')
    await target.press('Enter')
    const allResponse = await allResponsePromise
    if (!allResponse.ok()) throw new Error(`Real all-weather HTTP ${allResponse.status()}.`)
    const allBody = await parseProxy(allResponse, 'all')
    await page.getByRole('status').filter({ hasText: /已加载|loaded/i }).first().waitFor()
    const firstAllCount = live.requests.all
    for (const width of [390, 768, 1440]) { await page.setViewportSize({ width, height: width === 390 ? 844 : 900 }); await assertOverflow(page) }
    await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
    await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
    if (live.requests.all !== firstAllCount) throw new Error('Navigation bypassed fresh cache.')
    const dom = `${await page.locator('body').innerText()}\n${await page.content()}`
    assertSafe(dom, 'Preview DOM')
    const cachedEnvelope = await page.evaluate(() => {
      const raw = localStorage.getItem('lifeboard.weather.forecastCache.v1')
      return raw ? JSON.parse(raw) : null
    })
    const cacheUnsafePath = findSecretKeyPath(cachedEnvelope)
    if (cacheUnsafePath) throw new Error(`Cache contains internal credential-shaped field at ${cacheUnsafePath}.`)
    const storageState = await context.storageState()
    await context.close()

    const scenarios = []
    async function failureScenario(name, mode, { stale = false, expect, fallback = false } = {}) {
      const failureContext = await newContext(browser, { storageState })
      const failurePage = await failureContext.newPage()
      const state = monitor(failurePage)
      await failurePage.addInitScript(({ staleCache }) => {
        const key = 'lifeboard.weather.forecastCache.v1'
        if (!staleCache) localStorage.removeItem(key)
        else {
          const envelope = JSON.parse(localStorage.getItem(key))
          for (const entry of envelope.entries) { entry.storedAt = Date.now() - 16 * 60 * 1000; entry.freshUntil = entry.storedAt + 15 * 60 * 1000; entry.staleUntil = Date.now() + 60 * 60 * 1000 }
          localStorage.setItem(key, JSON.stringify(envelope))
        }
      }, { staleCache: stale })
      await failurePage.route('**/api/weather/xiaomi/all?*', (route) => {
        const body = mode === 'contract' ? '{"unexpected":true}'
          : mode === '429' ? proxyFailure('xiaomiRejected', { upstreamStatus: 429, retryAfterSeconds: 60 })
            : mode === 'timeout' ? proxyFailure('xiaomiTimeout')
              : proxyFailure('xiaomiUnavailable')
        return route.fulfill({ status: 200, contentType: 'application/json', body })
      })
      await failurePage.route('https://api.open-meteo.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(openMeteoFixture()) }))
      await failurePage.route('https://air-quality-api.open-meteo.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ hourly: { time: ['2026-01-01T01:00'], pm10: [10], pm2_5: [5], carbon_monoxide: [100], nitrogen_dioxide: [5], sulphur_dioxide: [2], ozone: [40], us_aqi: [20] } }) }))
      await failurePage.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
      if (expect === 'fatal') {
        await failurePage.getByRole('heading', { name: /天气加载错误|Weather loading error/ }).waitFor()
        if (state.requests.directUpstream) throw new Error(`${name}: direct upstream call.`)
      } else {
        await failurePage.getByRole('status').filter({ hasText: expect }).first().waitFor()
      }
      if (mode === 'contract' && state.requests.all !== 1) throw new Error('Fatal contract failure retried or looped.')
      if (fallback && state.requests.all > 2) throw new Error(`${name}: Xiaomi request loop.`)
      if (state.errors.length || state.requests.unsafe || state.requests.directUpstream) {
        throw new Error(`${name}: console=${state.errors.length}; unsafe=${state.requests.unsafe}(${state.requests.unsafeSurfaces.join(',')}); direct=${state.requests.directUpstream}.`)
      }
      await assertOverflow(failurePage)
      scenarios.push({ name, xiaomiRequests: state.requests.all, expectedState: expect })
      await failureContext.close()
    }

    await failureScenario('proxy-unavailable-stale', 'unavailable', { stale: true, expect: /更新失败|refresh failed/i })
    await failureScenario('upstream-429-stale', '429', { stale: true, expect: /暂停请求|pause requests/i })
    await failureScenario('timeout-fallback', 'timeout', { expect: /Open-Meteo/, fallback: true })
    await failureScenario('contract-fatal', 'contract', { expect: 'fatal' })

    if (live.errors.length || live.requests.unsafe || live.requests.directUpstream) throw new Error('Real Preview flow produced console or request security failures.')
    const result = {
      status: 'passed', deployment: { url: baseUrl, target: 'preview' }, authentication: 'httpOnly-cookie-memory-only',
      real: { searchStatus: searchResponse.status(), allStatus: allResponse.status(), searchResults: searchBody.data.results.length, intendedCity: true, capabilities: allBody.meta.capabilities, navigationAllRequests: live.requests.all },
      intercepted: scenarios, layout: { widths: [390, 768, 1440], overflow: 0 }, consoleErrors: 0, secretMarkersFound: false,
    }
    fs.writeFileSync(path.join(output, 'preview-summary.json'), `${JSON.stringify(result, null, 2)}\n`)
    process.stdout.write('PASS Weather W5 protected Preview validation\nReal search HTTP: 200\nReal all-weather HTTP: 200\nIntercepted failure scenarios: 4\nConsole errors: 0\nSecret markers: not found\n')
  } finally {
    await browser.close()
  }
}

main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1 })
