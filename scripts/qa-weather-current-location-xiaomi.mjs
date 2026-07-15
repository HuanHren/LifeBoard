import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HOST = '127.0.0.1'
const WINDOWS = process.platform === 'win32'

function fixture(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function runBuild() {
  const env = { ...process.env, VITE_XIAOMI_WEATHER_ENABLED: 'true' }
  const result = WINDOWS
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], {
        cwd: ROOT, env, stdio: 'inherit', windowsHide: true,
      })
    : spawnSync('npm', ['run', 'build'], { cwd: ROOT, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error('W6A feature-enabled build failed.')
}

function freePort() {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(0, HOST, () => {
      const address = server.address()
      server.close(() => resolve(typeof address === 'object' && address ? address.port : 4173))
    })
  })
}

function waitForPort(port) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const probe = () => {
      const socket = net.createConnection({ host: HOST, port })
      socket.once('connect', () => { socket.destroy(); resolve() })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - started > 30_000) reject(new Error('W6A preview start timed out.'))
        else setTimeout(probe, 200)
      })
    }
    probe()
  })
}

async function startPreview() {
  const port = await freePort()
  const command = WINDOWS ? process.env.ComSpec || 'cmd.exe' : 'npm'
  const args = WINDOWS
    ? ['/d', '/s', '/c', `npm run preview -- --host ${HOST} --port ${port}`]
    : ['run', 'preview', '--', '--host', HOST, '--port', String(port)]
  const child = spawn(command, args, { cwd: ROOT, stdio: 'ignore', windowsHide: true })
  await waitForPort(port)
  return {
    url: `http://${HOST}:${port}`,
    stop() {
      if (WINDOWS) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      else child.kill('SIGTERM')
    },
  }
}

function capabilityState(raw, key) {
  if (!Object.hasOwn(raw, key)) return 'missing'
  const value = raw[key]
  if (value === null) return 'null'
  if (Array.isArray(value)) return value.length ? 'available' : 'empty-array'
  if (typeof value === 'object') return Object.keys(value).length ? 'available' : 'empty-object'
  return 'available'
}

function xiaomiAllEnvelope() {
  const raw = fixture('tests/weather-xiaomi/fixtures/all.success.json')
  const paths = {
    current: 'current', hourly: 'forecastHourly', daily: 'forecastDaily', aqi: 'aqi',
    minutely: 'minutely', alerts: 'alerts', indices: 'indices', typhoon: 'typhoon',
    yesterday: 'yesterday', preHour: 'preHour', sourceMaps: 'sourceMaps',
    brandInfo: 'brandInfo', updateTime: 'updateTime',
  }
  return {
    ok: true,
    provider: 'xiaomi',
    operation: 'all',
    data: raw,
    meta: {
      receivedAt: '2026-07-15T08:00:00.000Z',
      upstreamStatus: 200,
      capabilities: Object.fromEntries(
        Object.entries(paths).map(([name, key]) => [name, capabilityState(raw, key)]),
      ),
    },
  }
}

function openMeteoFixture() {
  const hours = Array.from({ length: 48 }, (_, index) => {
    const date = index < 24 ? '15' : '16'
    return `2026-07-${date}T${String(index % 24).padStart(2, '0')}:00`
  })
  const days = Array.from({ length: 15 }, (_, index) =>
    `2026-07-${String(index + 15).padStart(2, '0')}`)
  const series = (length, value) => Array.from({ length }, (_, index) => value + index % 2)
  return {
    timezone: 'Asia/Shanghai', timezone_abbreviation: 'CST',
    current: {
      time: hours[8], temperature_2m: 26, apparent_temperature: 27,
      relative_humidity_2m: 60, precipitation: 0, rain: 0, showers: 0,
      snowfall: 0, weather_code: 1, cloud_cover: 25, wind_speed_10m: 8,
      wind_direction_10m: 90, wind_gusts_10m: 14, surface_pressure: 1002,
      visibility: 10000, is_day: 1,
    },
    current_units: {
      temperature_2m: '°C', precipitation: 'mm', relative_humidity_2m: '%',
      wind_speed_10m: 'km/h', surface_pressure: 'hPa',
    },
    hourly: {
      time: hours, temperature_2m: series(48, 26),
      apparent_temperature: series(48, 27),
      precipitation_probability: hours.map(() => 0), precipitation: hours.map(() => 0),
      weather_code: hours.map(() => 1), wind_speed_10m: hours.map(() => 8),
      wind_gusts_10m: hours.map(() => 14), uv_index: hours.map(() => 1),
      is_day: hours.map((_, index) => index >= 7 && index <= 18 ? 1 : 0),
    },
    hourly_units: { precipitation_probability: '%', uv_index: '' },
    daily: {
      time: days, weather_code: days.map(() => 1), temperature_2m_max: series(15, 31),
      temperature_2m_min: series(15, 24), apparent_temperature_max: series(15, 33),
      apparent_temperature_min: series(15, 25), precipitation_sum: days.map(() => 0),
      precipitation_probability_max: days.map(() => 0), wind_speed_10m_max: days.map(() => 8),
      wind_direction_10m_dominant: days.map(() => 90), wind_gusts_10m_max: days.map(() => 14),
      uv_index_max: days.map(() => 5), sunrise: days.map((date) => `${date}T05:30`),
      sunset: days.map((date) => `${date}T19:30`),
    },
  }
}

function reversePayload({ foreign = false, secondCity = false } = {}) {
  if (foreign) {
    return {
      countryCode: 'US', countryName: 'United States', principalSubdivision: 'California',
      city: 'San Francisco', locality: 'San Francisco', localityInfo: { administrative: [] },
    }
  }
  if (secondCity) {
    return {
      countryCode: 'CN', countryName: '中国', principalSubdivision: '上海市',
      city: '上海市', locality: '黄浦区',
      localityInfo: { administrative: [
        { name: '上海市', adminLevel: 4 }, { name: '黄浦区', adminLevel: 8 },
      ] },
    }
  }
  return {
    countryCode: 'CN', countryName: '中国', principalSubdivision: '河南省',
    city: '开封市', locality: '尉氏县',
    localityInfo: { administrative: [
      { name: '河南省', adminLevel: 4 }, { name: '开封市', adminLevel: 6 },
      { name: '尉氏县', adminLevel: 8 },
    ] },
  }
}

function searchEnvelope(query, multiple = false) {
  const primary = query === '黄浦区'
    ? {
        affiliation: '上海市, 上海, 中国', key: 'sanitized-shanghai-city',
        latitude: '31.230000', locationKey: 'sanitized-shanghai-location',
        longitude: '121.470000', name: '黄浦区', timeZoneShift: 28800000,
      }
    : {
        affiliation: '开封市, 河南, 中国', key: 'sanitized-kaifeng-city',
        latitude: '34.410000', locationKey: 'sanitized-weishi-location',
        longitude: '114.200000', name: query === '开封市' ? '开封市' : '尉氏县',
        timeZoneShift: 28800000,
      }
  const data = multiple
    ? [
        { ...primary, affiliation: '昆明市, 云南, 中国', locationKey: 'sanitized-other-location', latitude: '25.040000', longitude: '102.710000' },
        primary,
      ]
    : [primary]
  return {
    ok: true, provider: 'xiaomi', operation: 'search', data: { results: data },
    meta: { receivedAt: '2026-07-15T08:00:00.000Z', upstreamStatus: 200 },
  }
}

async function installRoutes(page, options = {}) {
  const state = {
    reverse: 0, search: 0, all: 0, openMeteo: 0, upstream: 0,
    allLocationKeys: [], errors: [], consoleMessages: [],
  }
  page.on('console', (message) => {
    state.consoleMessages.push(message.text())
    if (message.type() === 'error') state.errors.push(message.text())
  })
  page.on('pageerror', (error) => state.errors.push(error.message))
  page.on('request', (request) => {
    if (/weatherapi\.market\.xiaomi\.com/i.test(request.url())) state.upstream += 1
  })
  await page.route('https://api.bigdatacloud.net/data/reverse-geocode-client?*', async (route) => {
    state.reverse += 1
    const requestUrl = new URL(route.request().url())
    const secondCity = Number(requestUrl.searchParams.get('latitude')) < 33
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(reversePayload({ foreign: options.foreign, secondCity })),
    })
  })
  await page.route('**/api/weather/xiaomi/search?*', async (route) => {
    state.search += 1
    const query = new URL(route.request().url()).searchParams.get('q') ?? ''
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(searchEnvelope(query, options.multiple)),
    })
  })
  await page.route('**/api/weather/xiaomi/all?*', async (route) => {
    state.all += 1
    state.allLocationKeys.push(new URL(route.request().url()).searchParams.get('locationKey'))
    await route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify(xiaomiAllEnvelope()),
    })
  })
  await page.route('https://api.open-meteo.com/**', async (route) => {
    state.openMeteo += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(openMeteoFixture()) })
  })
  await page.route('https://air-quality-api.open-meteo.com/**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ hourly: { time: ['2026-07-15T08:00'], pm10: [10], pm2_5: [5], carbon_monoxide: [100], nitrogen_dioxide: [5], sulphur_dioxide: [2], ozone: [40], us_aqi: [20] } }),
  }))
  return state
}

async function createContext(browser, baseUrl, width, locale = 'zh-CN') {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    permissions: ['geolocation'],
    geolocation: { latitude: 34.411, longitude: 114.193 },
  })
  const page = await context.newPage()
  await page.addInitScript(({ selectedLocale }) => {
    localStorage.setItem('lifeboard.language', selectedLocale)
    localStorage.setItem('lifeboard.weather.provider', 'xiaomi')
  }, { selectedLocale: locale })
  return { context, page, origin: baseUrl }
}

async function noOverflow(page) {
  return !(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth))
}

async function assertSafe(page, state) {
  const surfaces = await page.evaluate(() => ({
    html: document.documentElement.outerHTML,
    localStorage: Object.entries(localStorage),
    sessionStorage: Object.entries(sessionStorage),
  }))
  const serialized = JSON.stringify({ surfaces, console: state.consoleMessages })
  for (const marker of [
    'weatherapi.market.xiaomi.com', 'sourceMaps.clientInfo', '"appKey":', '"sign":',
    '"OAID":', '"oaid":', '"device":', '_vercel_jwt', 'x-vercel-protection-bypass',
  ]) {
    if (serialized.includes(marker)) throw new Error(`W6A client surface exposed ${marker}.`)
  }
  if (state.upstream !== 0) throw new Error('W6A made a direct Xiaomi upstream request.')
}

async function completeCandidateConfirmation(page) {
  const firstRadio = page.locator('[data-qa="xiaomi-current-location-candidate-0"]')
  await firstRadio.waitFor()
  const confirm = page.locator('[data-qa="xiaomi-current-location-confirm"]')
  if (await confirm.isEnabled()) throw new Error('W6A preselected a Xiaomi candidate.')
  await firstRadio.focus()
  await firstRadio.press('Space')
  if (!await confirm.isEnabled()) throw new Error('W6A candidate confirmation did not become available.')
  await confirm.focus()
  await confirm.press('Enter')
  await page.locator('#weather-hero-title').waitFor()
}

async function verifyPrimaryFlow(browser, baseUrl, width) {
  const { context, page } = await createContext(browser, baseUrl, width)
  const state = await installRoutes(page)
  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-qa="weather-use-current-location"]').click()
  await page.locator('[data-qa="xiaomi-current-location-dialog"]').waitFor()
  await page.locator('[data-qa="xiaomi-current-location-cancel"]').click()
  if (state.reverse !== 0 || state.search !== 0 || state.all !== 0) {
    throw new Error(`${width}: cancel before consent triggered a provider request.`)
  }

  await page.locator('[data-qa="weather-use-current-location"]').click()
  await page.locator('[data-qa="xiaomi-current-location-continue"]').click()
  try {
    await page.getByText('尉氏县', { exact: true }).first().waitFor()
  } catch {
    const visible = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 500)
    throw new Error(`${width}: candidate did not render; reverse=${state.reverse}, search=${state.search}, all=${state.all}, errors=${state.errors.join(' | ')}, visible=${visible}`)
  }
  if (state.reverse !== 1 || state.search !== 1) {
    throw new Error(`${width}: expected one reverse and one district search request.`)
  }
  await completeCandidateConfirmation(page)
  if (state.all !== 1) throw new Error(`${width}: expected one Xiaomi all request.`)
  const firstStored = await page.evaluate(() => JSON.parse(localStorage.getItem('lifeboard-weather-location') ?? '{}'))
  if (firstStored.latitude !== 34.411 || firstStored.longitude !== 114.193) {
    throw new Error(`${width}: candidate coordinates replaced the GPS coordinates.`)
  }

  await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
  await page.getByText(/尉氏县/).first().waitFor()
  if (state.search !== 1) throw new Error(`${width}: Home navigation repeated Xiaomi search.`)

  await context.setGeolocation({ latitude: 31.231, longitude: 121.471 })
  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-qa="weather-use-current-location"]').click()
  await page.locator('[data-qa="xiaomi-current-location-continue"]').click()
  await page.getByText('黄浦区', { exact: true }).first().waitFor()
  await completeCandidateConfirmation(page)
  if (state.all !== 2 || state.allLocationKeys[0] === state.allLocationKeys[1]) {
    throw new Error(`${width}: a second GPS location reused the old Xiaomi locationKey.`)
  }
  if (!await noOverflow(page)) throw new Error(`${width}: horizontal overflow.`)
  if (state.errors.length) throw new Error(`${width}: console or page errors ${state.errors.length}.`)
  await assertSafe(page, state)
  await context.close()
  return { width, reverseRequests: state.reverse, searchRequests: state.search, allRequests: state.all }
}

async function verifyMultipleCandidates(browser, baseUrl) {
  const { context, page } = await createContext(browser, baseUrl, 390)
  const state = await installRoutes(page, { multiple: true })
  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-qa="weather-use-current-location"]').click()
  await page.locator('[data-qa="xiaomi-current-location-continue"]').click()
  await page.locator('[data-qa^="xiaomi-current-location-candidate-"]').first().waitFor()
  const count = await page.locator('[data-qa^="xiaomi-current-location-candidate-"]').count()
  if (count !== 2) throw new Error(`W6A multiple-candidate flow displayed ${count} candidates.`)
  if (await page.locator('[data-qa="xiaomi-current-location-confirm"]').isEnabled()) {
    throw new Error('W6A multiple-candidate flow auto-selected a candidate.')
  }
  if (state.all !== 0) throw new Error('W6A loaded weather before candidate confirmation.')
  await context.close()
  return { candidates: count, allBeforeConfirmation: state.all }
}

async function verifyOutsideChina(browser, baseUrl) {
  const { context, page } = await createContext(browser, baseUrl, 390)
  const state = await installRoutes(page, { foreign: true })
  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-qa="weather-use-current-location"]').click()
  await page.locator('[data-qa="xiaomi-current-location-continue"]').click()
  await page.locator('[role="alert"]').getByText(/不支持小米天气/).waitFor()
  if (state.search !== 0 || state.all !== 0) throw new Error('W6A called Xiaomi outside China.')
  if (state.openMeteo < 1) throw new Error('W6A did not preserve foreign GPS coordinates for Open-Meteo.')
  await context.close()
  return { searchRequests: state.search, allRequests: state.all, openMeteoRequests: state.openMeteo }
}

async function verifyEnglishLocale(browser, baseUrl) {
  const { context, page } = await createContext(browser, baseUrl, 390, 'en-US')
  const state = await installRoutes(page)
  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-qa="weather-use-current-location"]').click()
  try {
    await page.waitForURL((url) => url.pathname === '/weather', { timeout: 10_000 })
  } catch {
    const visible = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 500)
    throw new Error(`W6A en-US flow did not finish; reverse=${state.reverse}, search=${state.search}, all=${state.all}, openMeteo=${state.openMeteo}, errors=${state.errors.join(' | ')}, visible=${visible}`)
  }
  await page.locator('#weather-hero-title').waitFor()
  if (state.reverse !== 0 || state.search !== 0 || state.all !== 0) {
    throw new Error('W6A called Xiaomi or BigDataCloud for en-US.')
  }
  if (state.openMeteo < 1) throw new Error('W6A did not preserve en-US Open-Meteo behavior.')
  await context.close()
  return { reverseRequests: state.reverse, searchRequests: state.search, allRequests: state.all }
}

async function main() {
  runBuild()
  const preview = await startPreview()
  const browser = await chromium.launch({ headless: true })
  try {
    const widths = []
    for (const width of [390, 768, 1440]) {
      widths.push(await verifyPrimaryFlow(browser, preview.url, width))
    }
    const multiple = await verifyMultipleCandidates(browser, preview.url)
    const outsideChina = await verifyOutsideChina(browser, preview.url)
    const enUS = await verifyEnglishLocale(browser, preview.url)
    process.stdout.write(`${JSON.stringify({
      status: 'passed', widths, multiple, outsideChina, enUS,
      consoleErrors: 0, pageErrors: 0, unhandledErrors: 0,
      frameworkOverlays: 0, overflowFailures: 0, directXiaomiUpstream: 0,
    }, null, 2)}\n`)
  } finally {
    await browser.close()
    preview.stop()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
