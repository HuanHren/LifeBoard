import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildXiaomiExtendedWeatherViewModel } from '@/modules/weather/extended/xiaomiExtendedWeatherAdapters'
import { createXiaomiSnapshot, loadExtendedFixture, locales } from './fixtures'

const root = resolve(import.meta.dirname, '../..')

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function filesUnder(relativePath: string): string[] {
  const directory = resolve(root, relativePath)
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name)
    return statSync(path).isDirectory()
      ? filesUnder(`${relativePath}/${name}`)
      : [path]
  })
}

describe('Xiaomi W4 extended region integration', () => {
  it('builds only the three evidence-backed view-model areas', () => {
    const result = buildXiaomiExtendedWeatherViewModel(createXiaomiSnapshot(), 'zh-CN')
    expect(result.viewModel).toHaveProperty('minutely')
    expect(result.viewModel).toHaveProperty('recentChanges')
    expect(result.viewModel).toHaveProperty('attribution')
    expect(Object.keys(result.viewModel ?? {})).toEqual(['minutely', 'recentChanges', 'attribution'])
  })

  it('does not create an extended region for Open-Meteo or Caiyun', () => {
    for (const provider of ['openMeteo', 'caiyun'] as const) {
      expect(buildXiaomiExtendedWeatherViewModel(createXiaomiSnapshot({ provider }), 'zh-CN').viewModel)
        .toBeUndefined()
    }
  })

  it('does not create a region from attribution alone', () => {
    const snapshot = createXiaomiSnapshot({
      capabilities: {
        ...createXiaomiSnapshot().capabilities,
        minutely: 'missing',
        preHour: 'missing',
      },
    })
    expect(buildXiaomiExtendedWeatherViewModel(snapshot, 'zh-CN').viewModel).toBeUndefined()
  })

  it.each(['appKey', 'sign', 'oaid', 'device', 'appVersion', 'romVersion'])(
    'rejects secret-shaped extension key %s',
    (key) => {
      const extensions = loadExtendedFixture()
      extensions[key] = 'safe-placeholder'
      const result = buildXiaomiExtendedWeatherViewModel(createXiaomiSnapshot({ extensions }), 'zh-CN')
      expect(result.viewModel).toBeUndefined()
      expect(result.diagnostics).toEqual([{ path: '$.extensions', code: 'secret-field' }])
    },
  )

  it('never serializes internal source metadata into the view model', () => {
    const output = JSON.stringify(buildXiaomiExtendedWeatherViewModel(createXiaomiSnapshot(), 'zh-CN').viewModel)
    for (const forbidden of ['clientInfo', 'sourceMaps', 'brandId', 'logo', 'url']) {
      expect(output).not.toContain(forbidden)
    }
  })

  it('keeps all adapters pure', () => {
    const snapshot = createXiaomiSnapshot()
    const before = structuredClone(snapshot)
    buildXiaomiExtendedWeatherViewModel(snapshot, 'zh-CN')
    expect(snapshot).toEqual(before)
  })

  it('provides complete strings for both supported UI locales', () => {
    const moduleKeys = read('src/i18n/moduleKeys.ts')
    const zh = read('src/i18n/locales/zh-CN-modules.ts')
    const en = read('src/i18n/locales/en-US-modules.ts')
    const keys = [...moduleKeys.matchAll(/'weather\.xiaomiExtended\.[^']+'/g)].map((match) => match[0])
    expect(keys.length).toBeGreaterThan(10)
    for (const key of keys) {
      expect(zh).toContain(`${key}:`)
      expect(en).toContain(`${key}:`)
    }
    expect(locales).toEqual(['zh-CN', 'en-US'])
  })

  it('gates the region by effective provider and never adds it to Home', () => {
    const workspace = read('src/modules/weather/components/WeatherWorkspace.vue')
    const home = filesUnder('src/modules/home')
      .filter((path) => path.endsWith('.vue') || path.endsWith('.ts'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    expect(workspace).toContain("effectiveProvider.value !== 'xiaomi'")
    expect(workspace.match(/<XiaomiExtendedWeatherRegion/g)).toHaveLength(1)
    expect(home).not.toContain('XiaomiExtendedWeatherRegion')
  })

  it('uses semantic headings and no interactive disclosure', () => {
    const region = read('src/modules/weather/components/XiaomiExtendedWeatherRegion.vue')
    const minutely = read('src/modules/weather/components/XiaomiMinutelySummary.vue')
    const recent = read('src/modules/weather/components/XiaomiRecentChanges.vue')
    expect(region).toContain('aria-labelledby="xiaomi-extended-weather-title"')
    expect(region).toContain('<h2')
    expect(minutely).toContain('<h3')
    expect(recent).toContain('<h3')
    expect([region, minutely, recent].join('\n')).not.toContain('aria-expanded')
  })

  it('keeps deferred capability roots out of rendering components', () => {
    const components = filesUnder('src/modules/weather/components')
      .filter((path) => path.endsWith('.vue'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    for (const field of ['sourceMaps', 'brandInfo', 'preHour', 'typhoon', 'yesterday']) {
      expect(components).not.toContain(field)
    }
  })
})
