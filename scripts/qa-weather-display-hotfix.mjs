import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = path.join(ROOT, '.qa', 'weather-display-hotfix')
const HOST = '127.0.0.1'
const WINDOWS = process.platform === 'win32'

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'))
}

function runBuild() {
  const env = { ...process.env, VITE_XIAOMI_WEATHER_ENABLED: 'true' }
  const result = WINDOWS
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run build'], { cwd: ROOT, env, stdio: 'inherit', windowsHide: true })
    : spawnSync('npm', ['run', 'build'], { cwd: ROOT, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error('Feature-enabled hotfix build failed.')
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
        if (Date.now() - started > 30_000) reject(new Error('Preview start timed out.'))
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

function capabilities(raw) {
  const paths = { current: 'current', hourly: 'forecastHourly', daily: 'forecastDaily', aqi: 'aqi', minutely: 'minutely', alerts: 'alerts', indices: 'indices', typhoon: 'typhoon', yesterday: 'yesterday', preHour: 'preHour', sourceMaps: 'sourceMaps', brandInfo: 'brandInfo', updateTime: 'updateTime' }
  return Object.fromEntries(Object.entries(paths).map(([name, key]) => {
    if (!Object.hasOwn(raw, key)) return [name, 'missing']
    const value = raw[key]
    if (value === null) return [name, 'null']
    if (Array.isArray(value)) return [name, value.length ? 'available' : 'empty-array']
    if (typeof value === 'object') return [name, Object.keys(value).length ? 'available' : 'empty-object']
    return [name, 'available']
  }))
}

function xiaomiRaw() {
  const raw = fixture('tests/weather-xiaomi/fixtures/all.success.json')
  raw.updateTime = Date.parse('2026-07-14T10:29:00Z')
  raw.current.pubTime = '2026-07-14T10:29:00Z'
  raw.current.weather = '1'
  raw.forecastHourly.temperature.value = [26]
  raw.forecastHourly.weather.value = [1]
  raw.forecastHourly.precipitationProbability.value = [70]
  raw.forecastHourly.wind.value = [{ datetime: '2026-07-14T11:00:00Z', speed: '5.4', direction: '90' }]
  raw.forecastDaily.pubTime = '2026-07-14T00:00:00Z'
  raw.forecastDaily.temperature.value = [{ from: '31', to: '24' }]
  raw.forecastDaily.weather.value = [{ from: '1', to: '1' }]
  raw.forecastDaily.precipitationProbability.value = ['70']
  raw.forecastDaily.sunRiseSet.value = [{ from: '2026-07-14T05:30:00+08:00', to: '2026-07-14T19:30:00+08:00' }]
  return raw
}

function openMeteoRaw() {
  const times = ['2026-07-14T18:00', '2026-07-14T19:00']
  return {
    timezone: 'Asia/Shanghai', timezone_abbreviation: 'CST',
    current: { time: times[0], temperature_2m: 26, apparent_temperature: 27, relative_humidity_2m: 60, precipitation: 0, rain: 0, showers: 0, snowfall: 0, weather_code: 1, cloud_cover: 25, wind_speed_10m: 8, wind_direction_10m: 90, wind_gusts_10m: 14, surface_pressure: 1002, visibility: 10000, is_day: 1 },
    current_units: { temperature_2m: '°C', precipitation: 'mm', relative_humidity_2m: '%', wind_speed_10m: 'km/h', surface_pressure: 'hPa' },
    hourly: { time: times, temperature_2m: [26, 25], apparent_temperature: [27, 26], precipitation_probability: [70, 50], precipitation: [0.4, 0.2], weather_code: [1, 2], wind_speed_10m: [8, 7], wind_gusts_10m: [14, 13], uv_index: [1, 0], is_day: [1, 0] },
    hourly_units: { precipitation_probability: '%', uv_index: '' },
    daily: { time: ['2026-07-14'], weather_code: [1], temperature_2m_max: [31], temperature_2m_min: [24], apparent_temperature_max: [33], apparent_temperature_min: [25], precipitation_sum: [0.6], precipitation_probability_max: [70], wind_speed_10m_max: [8], wind_direction_10m_dominant: [90], wind_gusts_10m_max: [14], uv_index_max: [5], sunrise: ['2026-07-14T05:30'], sunset: ['2026-07-14T19:30'] },
  }
}

const location = {
  id: 'xiaomi:sanitized-location', name: 'Sanitized City', kind: 'Location', admin1: 'Sanitized Region', country: 'Sanitized Country', countryCode: 'CN', latitude: 34, longitude: 114, elevation: null, timezone: 'Asia/Shanghai', displayLabel: 'Sanitized City, Sanitized Region', source: 'xiaomi', providerLocationIds: { xiaomi: 'sanitized-location' },
}

async function configure(page, provider) {
  const errors = []
  const consoleMessages = []
  const requests = { xiaomiAll: 0, openMeteo: 0 }
  page.on('console', (message) => {
    consoleMessages.push(message.text())
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  const storedLocation = provider === 'openMeteo'
    ? { ...location, id: 101, kind: 'Locality', source: 'openMeteo', providerLocationIds: undefined }
    : location
  await page.addInitScript(({ storedLocation, selectedProvider }) => {
    localStorage.setItem('lifeboard.language', 'zh-CN')
    localStorage.setItem('lifeboard.weather.provider', selectedProvider)
    localStorage.setItem('lifeboard-weather-location', JSON.stringify(storedLocation))
  }, { storedLocation, selectedProvider: provider })
  await page.route('**/api/weather/xiaomi/all?*', async (route) => {
    requests.xiaomiAll += 1
    const raw = xiaomiRaw()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, provider: 'xiaomi', operation: 'all', data: raw, meta: { receivedAt: '2026-07-14T10:29:01Z', upstreamStatus: 200, capabilities: capabilities(raw) } }) })
  })
  await page.route('https://api.open-meteo.com/**', async (route) => {
    requests.openMeteo += 1
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(openMeteoRaw()) })
  })
  await page.route('https://air-quality-api.open-meteo.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ hourly: { time: ['2026-07-14T18:00'], pm10: [10], pm2_5: [5], carbon_monoxide: [100], nitrogen_dioxide: [5], sulphur_dioxide: [2], ozone: [40], us_aqi: [20] } }) }))
  return { errors, consoleMessages, requests }
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

async function assertClientSurfacesSafe(page, consoleMessages) {
  const surfaces = await page.evaluate(() => ({
    html: document.documentElement.outerHTML,
    localStorage: Object.entries(localStorage),
    sessionStorage: Object.entries(sessionStorage),
  }))
  const serialized = JSON.stringify({ ...surfaces, consoleMessages })
  for (const marker of [
    'weatherapi.market.xiaomi.com', '"appKey":', '"sign":', '"oaid":', '"OAID":',
    '"device":', '"clientInfo":', 'sourceMaps.clientInfo', '_vercel_jwt',
    'x-vercel-protection-bypass',
  ]) {
    if (serialized.includes(marker)) throw new Error(`Client surface exposed forbidden marker: ${marker}.`)
  }
}

async function verifyXiaomi(browser, baseUrl, width) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } })
  const page = await context.newPage()
  const state = await configure(page, 'xiaomi')
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  try {
    await page.getByText(/更新于.*18:29/).first().waitFor({ timeout: 15_000 })
  } catch {
    const visibleStatus = (await page.locator('body').innerText()).slice(0, 300).replace(/\s+/g, ' ')
    throw new Error(`${width}: Weather did not load (${visibleStatus}).`)
  }
  await page.getByText('多云', { exact: true }).first().waitFor()
  await page.getByText(/18:29/).first().waitFor()
  if (await page.getByText('不可用', { exact: true }).count()) throw new Error(`${width}: cloudy rendered unavailable.`)
  if (!await page.getByText('70%', { exact: true }).count()) throw new Error(`${width}: probability missing.`)
  if (await page.getByText('降水量', { exact: true }).count()) throw new Error(`${width}: unsupported hourly amount rendered.`)
  if (!await page.getByText('5 km/h', { exact: true }).count()) throw new Error(`${width}: verified hourly wind missing.`)
  if (await page.getByText('最大阵风', { exact: true }).count()) throw new Error(`${width}: unverified Xiaomi gust rendered.`)
  if (await overflow(page)) throw new Error(`${width}: horizontal overflow.`)
  if (state.errors.length) throw new Error(`${width}: console errors ${state.errors.length}.`)
  if (state.requests.xiaomiAll !== 1) throw new Error(`${width}: expected one Xiaomi request, got ${state.requests.xiaomiAll}.`)
  await assertClientSurfacesSafe(page, state.consoleMessages)
  const screenshot = path.join(OUTPUT, `xiaomi-${width}.png`)
  await page.screenshot({ path: screenshot, fullPage: true })
  await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
  if (await page.getByText('小米扩展天气', { exact: false }).count()) throw new Error(`${width}: Home duplicated Xiaomi UI.`)
  await context.close()
  return { width, screenshot, consoleErrors: 0, overflow: 0, requests: state.requests }
}

async function main() {
  fs.rmSync(OUTPUT, { recursive: true, force: true })
  fs.mkdirSync(OUTPUT, { recursive: true })
  runBuild()
  const preview = await startPreview()
  const browser = await chromium.launch({ headless: true })
  try {
    const xiaomi = []
    for (const width of [390, 768, 1440]) xiaomi.push(await verifyXiaomi(browser, preview.url, width))
    const summary = { status: 'passed', xiaomi, consoleErrors: 0, overflowFailures: 0 }
    fs.writeFileSync(path.join(OUTPUT, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
    process.stdout.write('PASS Xiaomi display-contract hotfix browser QA (390/768/1440)\nConsole errors: 0\nOverflow failures: 0\n')
  } finally {
    await browser.close()
    preview.stop()
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
