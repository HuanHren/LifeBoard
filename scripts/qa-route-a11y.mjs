import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
const ARGS = new Set(process.argv.slice(2))
const JSON_OUTPUT = ARGS.has('--json')
const CI_OUTPUT = ARGS.has('--ci') || JSON_OUTPUT || process.env.CI === 'true'
const OUTPUT_PATH = parseOutputPath(process.argv.slice(2))
const ROUTES = [
  { name: 'Landing', path: '/' },
  { name: 'Home', path: '/app' },
  { name: 'Weather', path: '/weather' },
  { name: 'Todos', path: '/todos' },
  { name: 'Tools', path: '/tools' },
  { name: 'Bookmarks', path: '/bookmarks' },
  { name: 'Settings', path: '/settings' },
  { name: 'SettingsDataSources', path: '/settings/data-sources' },
  { name: 'NotFound', path: '/missing-route-stage-18' },
]
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]
const WEATHER_OVERFLOW_VIEWPORTS = [
  { name: 'weather-wide', width: 1600, height: 900 },
  { name: 'weather-full', width: 1920, height: 1080 },
]
const PORT = Number(process.env.QA_PREVIEW_PORT || 4173)
const HOST = process.env.QA_PREVIEW_HOST || '127.0.0.1'
const EXTERNAL_BASE_URL = process.env.QA_BASE_URL
const OVERFLOW_TOLERANCE = 1

let previewProcess = null

function parseOutputPath(args) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--output') return args[index + 1] || null
    if (arg.startsWith('--output=')) return arg.slice('--output='.length) || null
  }

  return null
}

function writeInfo(message) {
  if (!JSON_OUTPUT) console.log(message)
}

function writeError(message) {
  if (!JSON_OUTPUT) console.error(message)
}

function loadPlaywright() {
  const candidates = []

  if (process.env.PLAYWRIGHT_NODE_PATH) {
    candidates.push(path.join(process.env.PLAYWRIGHT_NODE_PATH, 'playwright'))
  }

  try {
    return require('playwright')
  } catch {
    // Continue with explicit override probing for unusual local runtimes.
  }

  for (const candidate of candidates) {
    try {
      return require(candidate)
    } catch {
      // Try the next known local runtime.
    }
  }

  throw new Error(
    'Playwright is not available. Run npm install, then run npx playwright install chromium if the browser binary is missing.',
  )
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, HOST)
  })
}

async function findPort(startPort) {
  for (let port = startPort; port < startPort + 30; port += 1) {
    if (await isPortAvailable(port)) return port
  }

  throw new Error(`No free preview port found from ${startPort} to ${startPort + 29}.`)
}

async function waitForPreview(baseUrl) {
  const started = Date.now()
  let lastError = null

  while (Date.now() - started < 30_000) {
    try {
      const response = await fetch(baseUrl, { method: 'GET' })
      if (response.ok) return
      lastError = new Error(`Preview responded with ${response.status}.`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  throw new Error(`Preview did not become ready at ${baseUrl}: ${lastError?.message ?? 'timeout'}`)
}

async function startPreview() {
  if (EXTERNAL_BASE_URL) {
    const baseUrl = EXTERNAL_BASE_URL.replace(/\/$/, '')
    await waitForPreview(baseUrl)
    return { baseUrl, owned: false }
  }

  const port = await findPort(PORT)
  const previewCommand = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm'
  const previewArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run preview -- --host ${HOST} --port ${port}`]
    : ['run', 'preview', '--', '--host', HOST, '--port', String(port)]
  previewProcess = spawn(
    previewCommand,
    previewArgs,
    {
      cwd: process.cwd(),
      env: { ...process.env, BROWSER: 'none' },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
      windowsHide: true,
    },
  )

  let previewOutput = ''
  previewProcess.stdout.on('data', (chunk) => {
    previewOutput += chunk.toString()
  })
  previewProcess.stderr.on('data', (chunk) => {
    previewOutput += chunk.toString()
  })

  previewProcess.once('exit', (code) => {
    if (code !== null && code !== 0 && previewProcess) {
      writeError(`[qa:a11y:routes] preview exited early with code ${code}`)
      if (previewOutput.trim()) writeError(previewOutput.trim())
    }
  })

  const baseUrl = `http://${HOST}:${port}`
  await waitForPreview(baseUrl)
  return { baseUrl, owned: true }
}

function stopPreview() {
  if (!previewProcess?.pid) return

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(previewProcess.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    })
  } else {
    try {
      process.kill(-previewProcess.pid, 'SIGTERM')
    } catch {
      previewProcess.kill('SIGTERM')
    }
  }

  previewProcess = null
}

function addFailure(failures, route, viewport, check, reason, selector = undefined) {
  const failure = {
    route: route.name,
    path: route.path,
    viewport: viewport.name,
    check,
    reason,
  }

  if (selector) failure.selector = selector
  failures.push(failure)
}

function writeSummaryFile(summary, outputPath) {
  if (!outputPath) return

  const resolvedPath = path.resolve(process.cwd(), outputPath)
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })
  fs.writeFileSync(resolvedPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  writeInfo(`Wrote QA summary: ${outputPath}`)
}

function createDomAudit() {
  return () => {
    function text(element) {
      return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim()
    }

    function visible(element) {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }

    function accessibleName(element) {
      const id = element.getAttribute('id')
      const labelledBy = element.getAttribute('aria-labelledby')
      const labelledByText = labelledBy
        ? labelledBy
          .split(/\s+/)
          .map((part) => document.getElementById(part)?.textContent || '')
          .join(' ')
          .trim()
        : ''
      const explicitLabel = id
        ? Array.from(document.querySelectorAll(`label[for="${CSS.escape(id)}"]`))
          .map(text)
          .join(' ')
          .trim()
        : ''
      const wrappingLabel = element.closest('label') ? text(element.closest('label')) : ''

      return [
        element.getAttribute('aria-label'),
        labelledByText,
        explicitLabel,
        wrappingLabel,
        element.getAttribute('title'),
        text(element),
      ]
        .filter(Boolean)
        .join(' ')
        .trim()
    }

    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(visible)
      .map((element) => ({
        level: Number(element.tagName.slice(1)),
        text: text(element),
      }))
    const headingJumps = []

    for (let index = 1; index < headings.length; index += 1) {
      if (headings[index].level > headings[index - 1].level + 1) {
        headingJumps.push(`${headings[index - 1].level}->${headings[index].level}: ${headings[index].text}`)
      }
    }

    const focusables = Array.from(
      document.querySelectorAll('a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])'),
    )
      .filter(visible)
      .filter((element) => !element.disabled && element.getAttribute('aria-hidden') !== 'true')
    const unnamedFocusables = focusables
      .filter((element) => !accessibleName(element))
      .map((element) => element.tagName.toLowerCase())
    const formControls = Array.from(document.querySelectorAll('input:not([type="hidden"]),textarea,select'))
      .filter(visible)
      .filter((element) => !element.disabled)
    const unlabeledControls = formControls
      .filter((element) => !accessibleName(element))
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`)
    const invalidWithoutDescription = formControls
      .filter((element) => element.getAttribute('aria-invalid') === 'true' && !element.getAttribute('aria-describedby'))
      .map((element) => element.id || element.name || element.tagName.toLowerCase())
    const tablists = Array.from(document.querySelectorAll('[role="tablist"]'))
      .filter(visible)
      .map((list) => {
        const tabs = Array.from(list.querySelectorAll('[role="tab"]')).filter(visible)
        return {
          label: accessibleName(list),
          tabs: tabs.length,
          selected: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length,
          tabbable: tabs.filter((tab) => tab.tabIndex === 0).length,
        }
      })
    const dialogs = Array.from(document.querySelectorAll('dialog,[role="dialog"]'))
      .filter(visible)
      .map((dialog) => ({
        tag: dialog.tagName.toLowerCase(),
        name: accessibleName(dialog),
        modal: dialog.getAttribute('aria-modal'),
      }))
    const h1s = headings.filter((heading) => heading.level === 1)
    const skipLink = document.querySelector('a.skip-link[href="#main-content"]')
    const main = document.querySelector('main')

    return {
      bodyTextLength: document.body.innerText.trim().length,
      mainCount: document.querySelectorAll('main').length,
      mainId: main?.id || '',
      mainTabIndex: main?.getAttribute('tabindex') || '',
      h1Count: h1s.length,
      h1Text: h1s[0]?.text || '',
      headingJumps,
      skipLinkExists: Boolean(skipLink),
      skipTargetExists: Boolean(document.getElementById('main-content')),
      overflowX:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ||
        document.body.scrollWidth > document.documentElement.clientWidth + 1,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      clientWidth: document.documentElement.clientWidth,
      visibleCurrentPageCount: Array.from(document.querySelectorAll('[aria-current="page"]')).filter(visible).length,
      unnamedFocusables,
      unlabeledControls,
      invalidWithoutDescription,
      tablists,
      dialogs,
      liveRegions: Array.from(document.querySelectorAll('[role="status"],[role="alert"],[aria-live]')).length,
    }
  }
}

function createWeatherLoadedRouteSeed() {
  const now = Date.now()
  const iso = (hours = 0) => new Date(now + hours * 60 * 60 * 1000).toISOString()
  const date = (days = 0) => new Date(now + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const location = {
    id: 'qa-weather-loaded-beijing',
    name: 'Beijing',
    kind: 'Capital city',
    admin1: 'Beijing',
    country: 'China',
    countryCode: 'CN',
    latitude: 39.9075,
    longitude: 116.39723,
    elevation: 49,
    timezone: 'Asia/Shanghai',
    displayLabel: 'Beijing, China',
    source: 'openMeteo',
  }
  const condition = {
    code: 3,
    label: 'Overcast',
    shortLabel: 'Overcast',
  }
  const units = {
    temperature: '°C',
    precipitation: 'mm',
    probability: '%',
    windSpeed: 'km/h',
    humidity: '%',
    uvIndex: '',
    pressure: 'hPa',
    visibility: 'km',
  }
  const hourly = Array.from({ length: 24 }, (_, index) => ({
    time: iso(index),
    temperature: 22 + (index % 6),
    apparentTemperature: 23 + (index % 5),
    precipitationProbability: (index * 7) % 100,
    precipitation: index % 4 === 0 ? 0.4 : 0,
    windSpeed: 8 + index,
    windGusts: 18 + index,
    uvIndex: index > 7 && index < 18 ? 4 : 0,
    isDay: index > 6 && index < 19,
    condition,
  }))
  const daily = Array.from({ length: 7 }, (_, index) => ({
    date: date(index),
    temperatureMax: 28 + index,
    temperatureMin: 17 + index,
    apparentTemperatureMax: 29 + index,
    apparentTemperatureMin: 18 + index,
    precipitationSum: index % 3,
    precipitationProbabilityMax: 30 + index * 8,
    windSpeedMax: 24 + index,
    windDirectionDominant: 120,
    windGustsMax: 36 + index,
    uvIndexMax: 6,
    sunrise: `${date(index)}T05:12:00+08:00`,
    sunset: `${date(index)}T19:41:00+08:00`,
    condition,
  }))
  const forecast = {
    provider: 'openMeteo',
    location,
    timezone: 'Asia/Shanghai',
    timezoneAbbreviation: 'GMT+8',
    fetchedAt: new Date(now).toISOString(),
    current: {
      time: iso(0),
      temperature: 24,
      apparentTemperature: 25,
      relativeHumidity: 62,
      precipitation: 0.2,
      rain: 0.2,
      showers: 0,
      snowfall: 0,
      cloudCover: 86,
      windSpeed: 18,
      windDirection: 110,
      windGusts: 32,
      uvIndex: 4,
      pressure: 1008,
      visibility: 11,
      isDay: true,
      condition,
    },
    hourly,
    daily,
    shortTermPrecipitation: {
      provider: 'openMeteo',
      summary: null,
      items: [],
    },
    alerts: [],
    providerCapabilities: {
      alerts: false,
      airQuality: true,
      visibility: true,
      shortTermPrecipitation: false,
    },
    units,
    advice: {
      items: [
        {
          kind: 'umbrella',
          title: 'Carry an umbrella',
          summary: 'Light rain may pass through.',
          detail: 'A compact umbrella is enough for brief showers.',
          level: 'consider',
        },
        {
          kind: 'clothing',
          title: 'Light layers',
          summary: 'Mild afternoon with a cooler evening.',
          detail: 'A thin outer layer should cover the day.',
          level: 'clear',
        },
        {
          kind: 'outdoor',
          title: 'Outdoor plans are workable',
          summary: 'Wind stays moderate.',
          detail: 'Check again if showers increase.',
          level: 'clear',
        },
      ],
      notes: ['Forecast cached for route QA.'],
    },
  }
  const locationKey = 'openMeteo|openMeteo|CN|39.9075|116.3972'

  return {
    location,
    forecastCache: {
      version: 1,
      locationKey,
      location,
      forecast,
      fetchedAt: now,
      expiresAt: now + 10 * 60 * 1000,
    },
  }
}

async function seedWeatherLoadedRoute(page) {
  const seed = createWeatherLoadedRouteSeed()
  await page.route('https://air-quality-api.open-meteo.com/**', async (route) => {
    const observedAt = new Date().toISOString()

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        latitude: seed.location.latitude,
        longitude: seed.location.longitude,
        timezone: seed.location.timezone,
        current_units: {
          time: 'iso8601',
          us_aqi: 'USA AQI',
          european_aqi: 'European AQI',
          pm2_5: 'μg/m³',
          pm10: 'μg/m³',
          ozone: 'μg/m³',
          nitrogen_dioxide: 'μg/m³',
          sulphur_dioxide: 'μg/m³',
          carbon_monoxide: 'μg/m³',
        },
        current: {
          time: observedAt,
          us_aqi: 42,
          european_aqi: 28,
          pm2_5: 8,
          pm10: 18,
          ozone: 54,
          nitrogen_dioxide: 16,
          sulphur_dioxide: 3,
          carbon_monoxide: 170,
        },
      }),
    })
  })
  await page.addInitScript((data) => {
    window.localStorage.setItem('lifeboard-weather-location', JSON.stringify(data.location))
    window.localStorage.setItem('lifeboard.weather.provider', 'openMeteo')
    window.localStorage.setItem(
      'lifeboard.weather.forecastCache.v1',
      JSON.stringify(data.forecastCache),
    )
  }, seed)
}

async function checkCommon(page, route, viewport, failures) {
  const response = await page.goto(route.url, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(120)

  if (!response || response.status() >= 400) {
    addFailure(failures, route, viewport, 'page-open', `Expected HTTP < 400, got ${response?.status() ?? 'no response'}.`)
  }

  const audit = await page.evaluate(createDomAudit())

  if (audit.bodyTextLength === 0) addFailure(failures, route, viewport, 'page-not-blank', 'Document body has no visible text.')
  if (audit.mainCount !== 1) addFailure(failures, route, viewport, 'main-landmark', `Expected exactly one main, got ${audit.mainCount}.`)
  if (audit.mainId !== 'main-content') addFailure(failures, route, viewport, 'main-target', `Expected main id main-content, got "${audit.mainId}".`)
  if (audit.mainTabIndex !== '-1') addFailure(failures, route, viewport, 'main-focus-target', `Expected main tabindex -1, got "${audit.mainTabIndex}".`)
  if (audit.h1Count !== 1) addFailure(failures, route, viewport, 'h1-count', `Expected exactly one visible h1, got ${audit.h1Count}.`)
  if (!audit.h1Text) addFailure(failures, route, viewport, 'h1-text', 'Visible h1 text is empty.')
  if (!audit.skipLinkExists || !audit.skipTargetExists) addFailure(failures, route, viewport, 'skip-link', 'Skip link or #main-content target is missing.')

  if (audit.skipLinkExists) {
    await page.locator('a.skip-link').focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(80)
    const skipFocusOk = await page.evaluate(() => document.activeElement?.id === 'main-content')
    if (!skipFocusOk) addFailure(failures, route, viewport, 'skip-link-focus', 'Skip link did not move focus to #main-content.')
  }

  if (audit.overflowX) {
    addFailure(
      failures,
      route,
      viewport,
      'horizontal-overflow',
      `scrollWidth ${audit.scrollWidth} exceeds clientWidth ${audit.clientWidth}.`,
    )
  }

  if (audit.unnamedFocusables.length > 0) {
    addFailure(failures, route, viewport, 'focusable-name', `Unnamed focusables: ${audit.unnamedFocusables.join(', ')}.`)
  }

  if (audit.unlabeledControls.length > 0) {
    addFailure(failures, route, viewport, 'form-label', `Unlabeled controls: ${audit.unlabeledControls.join(', ')}.`)
  }

  if (audit.invalidWithoutDescription.length > 0) {
    addFailure(
      failures,
      route,
      viewport,
      'invalid-description',
      `Invalid controls missing aria-describedby: ${audit.invalidWithoutDescription.join(', ')}.`,
    )
  }

  for (const jump of audit.headingJumps) {
    addFailure(failures, route, viewport, 'heading-jump', jump)
  }

  for (const tablist of audit.tablists) {
    if (tablist.tabs > 0 && (tablist.selected !== 1 || tablist.tabbable !== 1)) {
      addFailure(
        failures,
        route,
        viewport,
        'tablist-semantics',
        `${tablist.label || 'unnamed tablist'} has ${tablist.selected} selected tabs and ${tablist.tabbable} tabbable tabs.`,
      )
    }
  }

  for (const dialog of audit.dialogs) {
    if (!dialog.name) addFailure(failures, route, viewport, 'dialog-name', `${dialog.tag} dialog has no accessible name.`)
    if (dialog.tag !== 'dialog' && dialog.modal !== 'true') {
      addFailure(failures, route, viewport, 'dialog-modal', 'Custom dialog is missing aria-modal="true".')
    }
  }

  if (!['Landing', 'NotFound'].includes(route.name) && audit.visibleCurrentPageCount === 0) {
    addFailure(failures, route, viewport, 'active-navigation', 'No visible active navigation item with aria-current="page".')
  }

  return audit
}

async function checkHome(page, route, viewport, failures) {
  const quickActions = await page.locator('main a, main button').evaluateAll((elements) =>
    elements.filter((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    }).length,
  )

  if (quickActions === 0) addFailure(failures, route, viewport, 'home-actions', 'No visible Home action link or button found.')
}

async function checkWeather(page, route, viewport, failures) {
  const result = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll('main button, main input, main a[href]')).filter((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    })
    const blockedControl = controls.find((element) => {
      const centerX = element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2
      const centerY = element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2
      const topElement = document.elementFromPoint(centerX, centerY)
      return topElement && topElement !== element && !element.contains(topElement) && !topElement.contains(element)
    })
    const pointerBlockingCanvas = Array.from(document.querySelectorAll('canvas')).filter(
      (canvas) => getComputedStyle(canvas).pointerEvents !== 'none',
    ).length

    return {
      visibleControls: controls.length,
      blockedControl: blockedControl?.tagName.toLowerCase() || '',
      pointerBlockingCanvas,
    }
  })

  if (result.visibleControls === 0) addFailure(failures, route, viewport, 'weather-controls', 'No visible Weather controls found.')
  if (result.blockedControl) addFailure(failures, route, viewport, 'weather-overlay', `A Weather control appears covered by ${result.blockedControl}.`)
  if (result.pointerBlockingCanvas > 0) {
    addFailure(failures, route, viewport, 'weather-canvas-pointer-events', `${result.pointerBlockingCanvas} canvas element(s) can receive pointer events.`)
  }
}

async function checkTodos(page, route, viewport, failures) {
  const title = page.locator('#task-title')
  if (!(await title.count())) {
    addFailure(failures, route, viewport, 'todos-composer', 'Task title input was not found.')
    return
  }

  await title.focus()
  if (!(await title.evaluate((element) => document.activeElement === element))) {
    addFailure(failures, route, viewport, 'todos-composer-focus', 'Task title input could not receive focus.')
  }

  const filterButtons = page.locator('.task-filter-bar button')
  const filterCount = await filterButtons.count()
  if (filterCount === 0) addFailure(failures, route, viewport, 'todos-filters', 'No task filter buttons found.')

  const pressedCount = await page.locator('.task-filter-bar button[aria-pressed="true"]').count()
  if (pressedCount !== 1) {
    addFailure(failures, route, viewport, 'todos-active-filter', `Expected one active aria-pressed filter, got ${pressedCount}.`)
  }
}

async function checkTools(page, route, viewport, failures) {
  const tabs = page.locator('[role="tab"]')
  const tabCount = await tabs.count()
  if (tabCount === 0) {
    addFailure(failures, route, viewport, 'tools-tabs', 'No tool tabs found.')
    return
  }

  const initialSelected = await page.locator('[role="tab"][aria-selected="true"]').first().getAttribute('id')
  await tabs.first().focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(120)
  const activeTab = await page.evaluate(() => document.activeElement?.id || '')
  const nextSelected = await page.locator('[role="tab"][aria-selected="true"]').first().getAttribute('id')
  const tabbableCount = await page.locator('[role="tab"][tabindex="0"]').count()

  if (!activeTab || activeTab === initialSelected || nextSelected === initialSelected) {
    addFailure(failures, route, viewport, 'tools-tab-keyboard', `Arrow key did not move selection from ${initialSelected}.`)
  }

  if (tabbableCount !== 1) addFailure(failures, route, viewport, 'tools-roving-tabindex', `Expected one tabbable tab, got ${tabbableCount}.`)
  if (!(await page.locator('[role="tabpanel"]').count())) addFailure(failures, route, viewport, 'tools-tabpanel', 'Active tool panel role="tabpanel" was not found.')

  await page.goto(`${route.baseUrl}/tools?tool=json`, { waitUntil: 'networkidle' })
  await page.locator('#json-input').fill('{"name":"LifeBoard"}')
  await page.locator('.tool-panel__actions button').first().click()
  await page.waitForTimeout(120)
  const jsonOutput = await page.locator('#json-output').inputValue().catch(() => '')
  if (!jsonOutput.includes('"name"') || !jsonOutput.includes('LifeBoard')) {
    addFailure(failures, route, viewport, 'tools-json', 'JSON formatting did not produce expected output.')
  }

  await page.goto(`${route.baseUrl}/tools?tool=timestamp`, { waitUntil: 'networkidle' })
  await page.locator('#timestamp-input').fill('not-a-timestamp')
  await page.locator('.tool-panel__actions button').first().click()
  await page.waitForTimeout(120)
  if (!(await page.locator('#timestamp-input-error[role="alert"]').count())) {
    addFailure(failures, route, viewport, 'tools-timestamp-error', 'Timestamp invalid input did not expose role="alert" error text.')
  }
}

async function checkBookmarks(page, route, viewport, failures) {
  const search = page.locator('#bookmark-search')
  if (!(await search.count())) {
    addFailure(failures, route, viewport, 'bookmarks-search', 'Bookmark search input was not found.')
    return
  }

  const searchName = await search.evaluate((element) => {
    const label = document.querySelector(`label[for="${element.id}"]`)
    return `${element.getAttribute('aria-label') || ''} ${label?.textContent || ''}`.trim()
  })
  if (!searchName) addFailure(failures, route, viewport, 'bookmarks-search-label', 'Bookmark search input has no label or aria-label.')

  const filterCount = await page.locator('.bookmarks-controls__filters button').count()
  if (filterCount === 0) addFailure(failures, route, viewport, 'bookmarks-filters', 'Bookmark filter controls were not found.')
}

async function checkSettings(page, route, viewport, failures) {
  const controls = await page.locator('main input[type="radio"], main input[type="file"], main button').count()
  if (controls === 0) addFailure(failures, route, viewport, 'settings-controls', 'No Settings controls found.')

  const fileInputsWithoutLabel = await page.locator('input[type="file"]').evaluateAll((inputs) =>
    inputs.filter((input) => {
      const id = input.getAttribute('id')
      return !input.closest('label') && !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`))
    }).length,
  )
  if (fileInputsWithoutLabel > 0) addFailure(failures, route, viewport, 'settings-file-label', `${fileInputsWithoutLabel} file input(s) lack a label.`)

  const clearAllButton = page.locator('[data-qa="settings-clear-all-button"]')
  if (!(await clearAllButton.count())) {
    addFailure(
      failures,
      route,
      viewport,
      'settings-clear-selector',
      'Clear-all action is missing the stable QA selector.',
      '[data-qa="settings-clear-all-button"]',
    )
    return
  }

  await clearAllButton.evaluate((button) => {
    window.localStorage.setItem(
      'lifeboard.bookmarks',
      JSON.stringify({
        version: 1,
        bookmarks: [
          {
            id: 'qa-settings-dialog-bookmark',
            title: 'QA dialog bookmark',
            url: 'https://example.com',
            category: null,
            note: null,
            pinned: false,
            createdAt: '2026-07-07T00:00:00.000Z',
            updatedAt: '2026-07-07T00:00:00.000Z',
          },
        ],
      }),
    )
    button.dispatchEvent(new CustomEvent('qa-storage-seeded'))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.locator('[data-qa="settings-clear-all-button"]').click()
  const dialog = page.locator('[data-qa="settings-confirmation-dialog"]')

  if (!(await dialog.count()) || !(await dialog.evaluate((element) => element.open).catch(() => false))) {
    addFailure(
      failures,
      route,
      viewport,
      'settings-dialog-open',
      'Clear-all action did not open the confirmation dialog.',
      '[data-qa="settings-confirmation-dialog"]',
    )
    return
  }

  const dialogAudit = await dialog.evaluate((element) => ({
    labelledBy: element.getAttribute('aria-labelledby') || '',
    describedBy: element.getAttribute('aria-describedby') || '',
    activeSelector: document.activeElement?.getAttribute('data-qa') || '',
    acknowledgementExists: Boolean(document.querySelector('[data-qa="settings-confirmation-acknowledgement"]')),
    confirmDisabled: document.querySelector('[data-qa="settings-confirmation-confirm-button"]')?.hasAttribute('disabled') ?? false,
  }))

  if (!dialogAudit.labelledBy || !dialogAudit.describedBy) {
    addFailure(failures, route, viewport, 'settings-dialog-name', 'Confirmation dialog is missing label or description references.')
  }
  if (dialogAudit.activeSelector !== 'settings-confirmation-cancel-button') {
    addFailure(failures, route, viewport, 'settings-dialog-focus', `Expected cancel button focus, got "${dialogAudit.activeSelector}".`)
  }
  if (!dialogAudit.acknowledgementExists || !dialogAudit.confirmDisabled) {
    addFailure(failures, route, viewport, 'settings-dialog-acknowledgement', 'Clear-all dialog must require acknowledgement before confirming.')
  }

  await page.locator('[data-qa="settings-confirmation-cancel-button"]').click()
  const dialogClosed = await dialog.evaluate((element) => !element.open).catch(() => true)
  const focusReturned = await clearAllButton.evaluate((button) => document.activeElement === button).catch(() => false)

  if (!dialogClosed) addFailure(failures, route, viewport, 'settings-dialog-close', 'Cancel did not close the confirmation dialog.')
  if (!focusReturned) addFailure(failures, route, viewport, 'settings-dialog-focus-return', 'Cancel did not return focus to the triggering clear-all action.')
}

async function checkSettingsDataSources(page, route, viewport, failures) {
  const rows = await page.locator('main a[href^="http"], main [aria-label*="Open"], main [aria-label*="source"], main [aria-label*="licence"]').count()
  if (rows === 0) addFailure(failures, route, viewport, 'data-source-rows', 'No data source links or labelled rows were found.')

  const labelledStatusCount = await page.locator('main [aria-label]').count()
  if (labelledStatusCount === 0) addFailure(failures, route, viewport, 'data-source-labels', 'No labelled data source status or link elements found.')
}

async function checkNotFound(page, route, viewport, failures) {
  const recoveryActions = await page.locator('main a[href], main button').count()
  if (recoveryActions === 0) addFailure(failures, route, viewport, 'not-found-recovery', 'No NotFound recovery action found.')
}

async function runRouteSpecificChecks(page, route, viewport, failures) {
  if (route.name === 'Home') await checkHome(page, route, viewport, failures)
  if (route.name === 'Weather') await checkWeather(page, route, viewport, failures)
  if (route.name === 'Todos') await checkTodos(page, route, viewport, failures)
  if (route.name === 'Tools') await checkTools(page, route, viewport, failures)
  if (route.name === 'Bookmarks') await checkBookmarks(page, route, viewport, failures)
  if (route.name === 'Settings') await checkSettings(page, route, viewport, failures)
  if (route.name === 'SettingsDataSources') await checkSettingsDataSources(page, route, viewport, failures)
  if (route.name === 'NotFound') await checkNotFound(page, route, viewport, failures)
}

async function run() {
  const startedAt = Date.now()
  const { chromium } = loadPlaywright()
  const preview = await startPreview()
  const browser = await chromium.launch({ headless: true })
  const failures = []
  const results = []
  let consoleErrorCount = 0

  writeInfo('QA route accessibility regression baseline')
  writeInfo(`Mode: ${CI_OUTPUT ? 'ci' : 'local'}`)
  writeInfo(`Routes: ${ROUTES.map((route) => route.path).join(', ')}`)
  writeInfo(`Viewports: ${VIEWPORTS.map((viewport) => `${viewport.name}:${viewport.width}x${viewport.height}`).join(', ')}`)
  writeInfo(`Weather overflow viewports: ${WEATHER_OVERFLOW_VIEWPORTS.map((viewport) => `${viewport.name}:${viewport.width}x${viewport.height}`).join(', ')}`)
  writeInfo('Checks: landmarks, h1, skip link, overflow, console errors, active nav, tablists, forms, dialogs, route-specific smoke, reduced motion.')

  try {
    const allViewports = [...VIEWPORTS, ...WEATHER_OVERFLOW_VIEWPORTS]

    for (const viewport of allViewports) {
      for (const routeConfig of ROUTES) {
        const isWeatherExtraViewport =
          WEATHER_OVERFLOW_VIEWPORTS.some((extraViewport) => extraViewport.name === viewport.name)

        if (isWeatherExtraViewport && routeConfig.name !== 'Weather') {
          continue
        }

        const route = {
          ...routeConfig,
          baseUrl: preview.baseUrl,
          url: `${preview.baseUrl}${routeConfig.path}`,
        }
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        const consoleErrors = []
        const failuresBeforeRoute = failures.length

        page.on('console', (message) => {
          if (message.type() === 'error') consoleErrors.push(message.text())
        })
        page.on('pageerror', (error) => {
          consoleErrors.push(error.message)
        })

        if (route.name === 'Weather') {
          await seedWeatherLoadedRoute(page)
        }

        await checkCommon(page, route, viewport, failures)
        await runRouteSpecificChecks(page, route, viewport, failures)

        for (const error of consoleErrors) {
          addFailure(failures, route, viewport, 'console-error', error)
        }
        consoleErrorCount += consoleErrors.length

        const routeFailures = failures.slice(failuresBeforeRoute)
        const status = routeFailures.length > 0 ? 'FAIL' : 'PASS'
        results.push({
          status,
          route: route.name,
          path: route.path,
          viewport: viewport.name,
          checksFailed: routeFailures.length,
        })
        writeInfo(`${status} [${viewport.name}] ${route.name} ${route.path}${routeFailures.length ? ` (${routeFailures.length} failure(s))` : ''}`)

        await context.close()
      }
    }
  } finally {
    await browser.close()
    if (preview.owned) stopPreview()
  }

  const total = (ROUTES.length * VIEWPORTS.length) + WEATHER_OVERFLOW_VIEWPORTS.length
  const failedCombos = results.filter((result) => result.status === 'FAIL').length
  const passedCombos = total - failedCombos
  const summary = {
    status: failures.length > 0 ? 'FAIL' : 'PASS',
    totalRouteViewports: total,
    passedRouteViewports: passedCombos,
    failedRouteViewports: failedCombos,
    failureCount: failures.length,
    consoleErrorCount,
    durationMs: Date.now() - startedAt,
    routes: ROUTES.map((route) => route.path),
    viewports: VIEWPORTS.map((viewport) => ({
      name: viewport.name,
      width: viewport.width,
      height: viewport.height,
    })),
    routeSpecificViewports: {
      Weather: WEATHER_OVERFLOW_VIEWPORTS.map((viewport) => ({
        name: viewport.name,
        width: viewport.width,
        height: viewport.height,
      })),
    },
    checks: [
      'main',
      'h1',
      'skip-link',
      'horizontal-overflow',
      'console-errors',
      'active-navigation',
      'tablists',
      'forms',
      'dialogs',
      'route-specific-smoke',
      'reduced-motion',
    ],
    limitations: [
      'axe is intentionally not integrated in Stage 19',
      'business workflows remain smoke-level only',
      'Vite chunk-size warnings are build-time P2 follow-up items',
    ],
    results,
    failures,
  }

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(summary, null, 2))
  } else if (failures.length > 0) {
    writeError(`\nFAIL route accessibility regression baseline (${passedCombos}/${total} route-viewports passed, ${failures.length} failure(s))`)
    for (const failure of failures) {
      const selector = failure.selector ? ` :: ${failure.selector}` : ''
      writeError(`- [${failure.viewport}] ${failure.route} ${failure.path} :: ${failure.check} :: ${failure.reason}${selector}`)
    }
  } else {
    writeInfo(`\nPASS route accessibility regression baseline (${passedCombos}/${total} route-viewports, ${summary.durationMs} ms)`)
    writeInfo(`Console errors: ${consoleErrorCount}`)
  }

  writeSummaryFile(summary, OUTPUT_PATH)

  if (failures.length > 0) process.exitCode = 1
}

process.once('SIGINT', () => {
  stopPreview()
  process.exit(130)
})
process.once('SIGTERM', () => {
  stopPreview()
  process.exit(143)
})

run().catch((error) => {
  stopPreview()
  console.error(`FAIL route accessibility regression baseline: ${error.stack || error.message}`)
  process.exit(1)
})
