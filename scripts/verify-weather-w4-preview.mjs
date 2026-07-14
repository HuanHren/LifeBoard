import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const PROJECT_ROOT = process.cwd()
const baseUrl = process.argv[2]
const authFile = process.env.W4_PREVIEW_AUTH_FILE
  ?? path.join(PROJECT_ROOT, '.qa', 'weather-w4', 'preview-auth-response.txt')

if (!baseUrl || !/^https:\/\//.test(baseUrl)) {
  throw new Error('Provide the HTTPS Preview URL as the first argument.')
}

const authBytes = fs.readFileSync(authFile)
const authContent = authBytes[0] === 0xff && authBytes[1] === 0xfe
  ? authBytes.subarray(2).toString('utf16le')
  : authBytes.toString('utf8')
const cookieMatch = authContent.match(/(?:^|\r?\n)set-cookie:\s*_vercel_jwt=([^;\r\n]+)/i)
if (!cookieMatch?.[1]) throw new Error('Protected Preview authentication cookie is unavailable.')

const preview = new URL(baseUrl)
const summaryPath = path.join(PROJECT_ROOT, '.qa', 'weather-w4', 'preview-summary.json')
const renderInventoryPath = path.join(PROJECT_ROOT, '.qa', 'weather-w4', 'preview-render-inventory.json')
const forbiddenTextMarkers = [
  'weatherapi.market.xiaomi.com',
  'XIAOMI_WEATHER_BASE_URL',
  'XIAOMI_WEATHER_APP_KEY',
  'XIAOMI_WEATHER_SIGN',
  'XIAOMI_WEATHER_APP_VERSION',
  'XIAOMI_WEATHER_ROM_VERSION',
  'XIAOMI_WEATHER_DEVICE',
  'XIAOMI_WEATHER_OAID',
]
const forbiddenKeys = new Set(['appkey', 'sign', 'oaid', 'device', 'appversion', 'romversion'])

function hasForbiddenKey(value) {
  if (Array.isArray(value)) return value.some(hasForbiddenKey)
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(([key, nested]) => (
    forbiddenKeys.has(key.toLowerCase()) || hasForbiddenKey(nested)
  ))
}

function assertSafeText(value, surface) {
  if (forbiddenTextMarkers.some((marker) => value.includes(marker))) {
    throw new Error(`${surface} contains a forbidden marker.`)
  }
}

async function responseContract(response, operation) {
  const text = await response.text()
  assertSafeText(text, `${operation} response`)
  const body = JSON.parse(text)
  if (hasForbiddenKey(body)) throw new Error(`${operation} response contains a forbidden key.`)
  if (body?.ok !== true || body?.provider !== 'xiaomi' || body?.operation !== operation) {
    throw new Error(`${operation} proxy envelope is invalid.`)
  }
  return body
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

function structuralInventory(value, depth = 0) {
  if (Array.isArray(value)) return {
    type: 'array',
    length: value.length,
    ...(value[0] && typeof value[0] === 'object' && !Array.isArray(value[0])
      ? { itemFields: Object.keys(value[0]).sort() }
      : {}),
  }
  if (!value || typeof value !== 'object') return { type: value === null ? 'null' : typeof value }
  if (depth >= 3) return { type: 'object' }
  return {
    type: 'object',
    fields: Object.fromEntries(Object.entries(value).map(([key, nested]) => [
      key,
      structuralInventory(nested, depth + 1),
    ])),
  }
}

let activeBrowser

async function main() {
  const browser = await chromium.launch({ headless: true })
  activeBrowser = browser
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await context.addCookies([{
    name: '_vercel_jwt',
    value: cookieMatch[1],
    domain: preview.hostname,
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'Lax',
  }])

  const page = await context.newPage()
  const consoleErrors = []
  const requestState = {
    search: 0,
    all: 0,
    directUpstream: 0,
    unsafeQuery: 0,
    unsafeHeader: 0,
  }

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push('console-error')
  })
  page.on('pageerror', () => consoleErrors.push('page-error'))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.hostname === 'weatherapi.market.xiaomi.com') requestState.directUpstream += 1
    if (url.origin === preview.origin && url.pathname === '/api/weather/xiaomi/search') requestState.search += 1
    if (url.origin === preview.origin && url.pathname === '/api/weather/xiaomi/all') requestState.all += 1
    if (/appKey|sign|oaid|XIAOMI_WEATHER_/i.test(url.search)) requestState.unsafeQuery += 1
    const headers = request.headers()
    const safeHeaderText = Object.entries(headers)
      .filter(([name]) => name.toLowerCase() !== 'cookie')
      .map(([name, value]) => `${name}:${value}`)
      .join('\n')
    if (/appKey|XIAOMI_WEATHER_APP_KEY|XIAOMI_WEATHER_SIGN|XIAOMI_WEATHER_OAID/i.test(safeHeaderText)) {
      requestState.unsafeHeader += 1
    }
  })

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  const authenticationPassed = !(await page.getByText(/Log in to Vercel/i).count())
  if (!authenticationPassed) throw new Error('Vercel authentication page remained visible.')

  const xiaomiRadio = page.getByRole('radio', { name: /小米天气|Xiaomi Weather/ })
  if (await xiaomiRadio.count() !== 1 || await xiaomiRadio.isDisabled()) {
    throw new Error('The enabled Xiaomi selector is unavailable in the Preview build.')
  }
  const providerGroupLabel = await xiaomiRadio.evaluate((element) => {
    const fieldset = element.closest('fieldset')
    return Boolean(fieldset?.querySelector('legend')?.textContent?.trim())
  })
  await xiaomiRadio.focus()
  const focusVisible = await xiaomiRadio.evaluate((element) => element.matches(':focus-visible'))
  await xiaomiRadio.check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.weather.provider') === 'xiaomi')

  await page.goto(`${baseUrl}/weather/cities`, { waitUntil: 'domcontentloaded' })
  const searchResponsePromise = page.waitForResponse((response) => (
    new URL(response.url()).pathname === '/api/weather/xiaomi/search'
  ))
  await page.getByRole('searchbox').fill('尉氏县')
  await page.getByRole('button', { name: /搜索|Search/ }).click()
  const searchResponse = await searchResponsePromise
  if (!searchResponse.ok()) throw new Error(`Xiaomi search returned HTTP ${searchResponse.status()}.`)
  const searchEnvelope = await responseContract(searchResponse, 'search')

  const resultOptions = page.locator('[data-weather-search-option]')
  await resultOptions.first().waitFor()
  const resultTexts = await resultOptions.allTextContents()
  const matchingIndexes = resultTexts.flatMap((text, index) => (
    text.includes('尉氏县') && text.includes('开封') && text.includes('河南') && text.includes('中国')
      ? [index]
      : []
  ))
  if (matchingIndexes.length !== 1) throw new Error('A unique verified Weishi County result was not found.')
  const intendedResult = resultOptions.nth(matchingIndexes[0])
  await intendedResult.focus()
  const resultKeyboardAccessible = await intendedResult.evaluate((element) => element === document.activeElement)

  const allResponsePromise = page.waitForResponse((response) => (
    new URL(response.url()).pathname === '/api/weather/xiaomi/all'
  ))
  await intendedResult.press('Enter')
  const allResponse = await allResponsePromise
  if (!allResponse.ok()) throw new Error(`Xiaomi all-weather returned HTTP ${allResponse.status()}.`)
  const allEnvelope = await responseContract(allResponse, 'all')
  await page.getByRole('heading', { level: 1, name: /天气|Weather/ }).waitFor()
  await page.waitForTimeout(1_000)

  const storedLocationHasOpaqueId = await page.evaluate(() => {
    const raw = localStorage.getItem('lifeboard-weather-location')
    if (!raw) return false
    try {
      const value = JSON.parse(raw)
      return typeof value?.providerLocationIds?.xiaomi === 'string'
        && value.providerLocationIds.xiaomi.length > 0
    } catch {
      return false
    }
  })
  if (!storedLocationHasOpaqueId) throw new Error('The selected location did not retain an opaque Xiaomi ID.')

  const extendedHeading = page.getByRole('heading', { level: 2, name: '小米天气补充信息' })
  const extendedRegionRendered = await extendedHeading.count() === 1
  const commonCurrentRendered = await page.getByText(/°C/).count() > 0
  const commonHourlyRendered = await page.getByRole('heading', { name: '未来 24 小时', exact: true }).count() === 1
  const commonDailyRendered = await page.getByRole('heading', { name: '未来 7 天', exact: true }).count() === 1
  fs.writeFileSync(renderInventoryPath, `${JSON.stringify({
    commonCurrentRendered,
    commonHourlyRendered,
    commonDailyRendered,
    rawHourly: structuralInventory(allEnvelope?.data?.forecastHourly),
    rawHourlyDetails: {
      temperatureUnit: allEnvelope?.data?.forecastHourly?.temperature?.unit ?? null,
      firstTemperatureType: typeof allEnvelope?.data?.forecastHourly?.temperature?.value?.[0],
      firstWeatherType: typeof allEnvelope?.data?.forecastHourly?.weather?.value?.[0],
      firstWindDatetimeFormat: (() => {
        const value = allEnvelope?.data?.forecastHourly?.wind?.value?.[0]?.datetime
        if (typeof value !== 'string') return 'not-string'
        if (/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return 'iso-offset'
        if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return 'local-date-time'
        return 'other'
      })(),
    },
  }, null, 2)}\n`)
  if (!commonCurrentRendered || !commonHourlyRendered || !commonDailyRendered) {
    throw new Error('Common current, hourly, or daily Weather UI did not render.')
  }
  const pageText = await page.locator('body').innerText()
  const html = await page.content()
  assertSafeText(pageText, 'rendered DOM')
  assertSafeText(html, 'page HTML')
  if (/sourceMaps|clientInfo|brandInfo|preHour/.test(pageText)) {
    throw new Error('Raw Xiaomi extension labels reached the rendered UI.')
  }

  const capabilityStates = allEnvelope?.meta?.capabilities ?? {}
  const renderedSectionNames = {
    minutely: await page.getByRole('heading', { name: '分钟级降水提示' }).count() === 1,
    recentChanges: await page.getByRole('heading', { name: '与上一小时相比' }).count() === 1,
  }
  if (extendedRegionRendered && !renderedSectionNames.minutely && !renderedSectionNames.recentChanges) {
    throw new Error('The Xiaomi extended region rendered without useful sections.')
  }

  const viewportChecks = {}
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 })
    viewportChecks[width] = { overflow: await overflow(page) }
    if (viewportChecks[width].overflow) throw new Error(`Weather overflow at ${width}px.`)
  }

  await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' })
  const homeHasExtendedRegion = await page.getByRole('heading', { name: '小米天气补充信息' }).count() > 0
  if (homeHasExtendedRegion) throw new Error('Home rendered the W4 extended region.')

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('radio', { name: /Open-Meteo/ }).check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.weather.provider') === 'openMeteo')
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  const openMeteoHasExtendedRegion = await page.getByRole('heading', { name: '小米天气补充信息' }).count() > 0
  if (openMeteoHasExtendedRegion) throw new Error('Open-Meteo retained stale Xiaomi extensions.')

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  const restoreAllPromise = page.waitForResponse((response) => (
    new URL(response.url()).pathname === '/api/weather/xiaomi/all'
  ))
  await page.getByRole('radio', { name: /小米天气|Xiaomi Weather/ }).check()
  const restoredAllResponse = await restoreAllPromise
  if (!restoredAllResponse.ok()) throw new Error('Xiaomi did not reload after provider switching.')
  await responseContract(restoredAllResponse, 'all')

  const beforeEnglish = { search: requestState.search, all: requestState.all }
  await page.locator('input[name="interface-language"][value="en-US"]').check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.language') === 'en-US')
  await page.waitForTimeout(300)
  await page.goto(`${baseUrl}/weather`, { waitUntil: 'domcontentloaded' })
  const englishHasExtendedRegion = await page.getByRole('heading', { name: 'Xiaomi weather details' }).count() > 0
  if (englishHasExtendedRegion) throw new Error('en-US retained Xiaomi extended content.')
  if (requestState.search !== beforeEnglish.search || requestState.all !== beforeEnglish.all) {
    throw new Error('en-US triggered a Xiaomi proxy request.')
  }

  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' })
  const englishXiaomiRadio = page.getByRole('radio', { name: /Xiaomi Weather/ })
  const englishDisabledExplanation = await englishXiaomiRadio.isDisabled()
    && (await englishXiaomiRadio.locator('xpath=ancestor::label[1]').innerText()).length > 0
  await page.locator('input[name="interface-language"][value="zh-CN"]').check()
  await page.waitForFunction(() => localStorage.getItem('lifeboard.language') === 'zh-CN')

  const storageKeys = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }))
  const storageKeyText = [...storageKeys.local, ...storageKeys.session].join('\n')
  assertSafeText(storageKeyText, 'storage key names')
  if (/appKey|sign|oaid|device/i.test(storageKeyText)) {
    throw new Error('A credential-shaped storage key was found.')
  }

  if (requestState.directUpstream || requestState.unsafeQuery || requestState.unsafeHeader) {
    throw new Error('Unsafe Xiaomi browser request metadata was detected.')
  }
  if (consoleErrors.length > 0) throw new Error(`Browser console errors: ${consoleErrors.length}.`)

  const summary = {
    status: 'passed',
    deployment: { url: baseUrl, target: 'preview' },
    authenticationPassed,
    selector: { providerGroupLabel, focusVisible, enabled: true },
    search: {
      httpStatus: searchResponse.status(),
      resultCount: searchEnvelope.data.results.length,
      intendedCityMatch: true,
      affiliationMatch: true,
      opaqueLocationIdRetained: storedLocationHasOpaqueId,
      keyboardAccessible: resultKeyboardAccessible,
    },
    weather: {
      httpStatus: allResponse.status(),
      commonCurrentRendered,
      commonHourlyRendered,
      commonDailyRendered,
      extendedRegionRendered,
      renderedSections: renderedSectionNames,
      capabilityStates,
      liveStructureInventory: {
        minutely: structuralInventory(allEnvelope?.data?.minutely),
        alerts: structuralInventory(allEnvelope?.data?.alerts),
        typhoon: structuralInventory(allEnvelope?.data?.typhoon),
      },
    },
    switching: {
      openMeteoRemovedExtendedRegion: !openMeteoHasExtendedRegion,
      xiaomiReloaded: true,
      homeHasExtendedRegion,
    },
    locale: {
      englishPreventedXiaomiRequests: true,
      englishRemovedExtendedRegion: !englishHasExtendedRegion,
      disabledExplanation: englishDisabledExplanation,
      chineseEligibilityRestored: true,
    },
    network: { ...requestState, sameOriginProxyOnly: true },
    security: { forbiddenMarkersFound: false, rawExtensionLabelsFound: false },
    accessibility: { providerGroupLabel, focusVisible, resultKeyboardAccessible },
    layout: { viewportChecks, consoleErrors: 0 },
  }
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`)
  process.stdout.write('PASS Weather W4 protected Preview browser validation\n')
  process.stdout.write(`Search HTTP: ${summary.search.httpStatus}\n`)
  process.stdout.write(`All-weather HTTP: ${summary.weather.httpStatus}\n`)
  process.stdout.write(`Extended region rendered: ${summary.weather.extendedRegionRendered}\n`)
  process.stdout.write(`Minutely rendered: ${summary.weather.renderedSections.minutely}\n`)
  process.stdout.write(`Recent comparison rendered: ${summary.weather.renderedSections.recentChanges}\n`)
  process.stdout.write(`Console errors: ${summary.layout.consoleErrors}\n`)
  process.stdout.write('Secret markers: not found\n')

  await context.close()
  await browser.close()
  activeBrowser = undefined
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
}).finally(async () => {
  await activeBrowser?.close()
})
