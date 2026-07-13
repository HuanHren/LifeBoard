import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseXiaomiAllSuccess, parseXiaomiSearchSuccess } from '@/modules/weather/providers/xiaomi/xiaomiGuards'
import type {
  XiaomiSearchResultRaw,
  XiaomiWeatherAllRaw,
} from '@/modules/weather/providers/xiaomi/xiaomiRawTypes'

function readJson(name: string): unknown {
  const path = fileURLToPath(new URL(`../weather-xiaomi/fixtures/${name}`, import.meta.url))
  return JSON.parse(readFileSync(path, 'utf8')) as unknown
}

export function loadAllFixture(): XiaomiWeatherAllRaw {
  const parsed = parseXiaomiAllSuccess({
    ok: true,
    provider: 'xiaomi',
    operation: 'all',
    data: readJson('all.success.json'),
    meta: { receivedAt: '2026-01-01T00:00:00.000Z', upstreamStatus: 200 },
  })
  if (!parsed) throw new Error('The W1 all-weather fixture no longer matches its proxy envelope.')
  return parsed.data
}

export function loadSearchFixture(name = 'search.success.json'): XiaomiSearchResultRaw[] {
  const parsed = parseXiaomiSearchSuccess({
    ok: true,
    provider: 'xiaomi',
    operation: 'search',
    data: { results: readJson(name) },
    meta: { receivedAt: '2026-01-01T00:00:00.000Z', upstreamStatus: 200 },
  })
  if (!parsed) throw new Error('The W1 search fixture no longer matches its proxy envelope.')
  return parsed.data.results
}

export const xiaomiLocation = {
  provider: 'xiaomi' as const,
  providerLocationId: 'sanitized-location-key',
  name: 'Sanitized City',
  administrativeArea: 'Sanitized Region,Sanitized Country',
  latitude: 0,
  longitude: 0,
}

export function allEnvelope(data: XiaomiWeatherAllRaw = loadAllFixture()) {
  return {
    ok: true,
    provider: 'xiaomi',
    operation: 'all',
    data,
    meta: { receivedAt: '2026-01-01T00:00:00.000Z', upstreamStatus: 200 },
  }
}

export function searchEnvelope(results: XiaomiSearchResultRaw[] = loadSearchFixture()) {
  return {
    ok: true,
    provider: 'xiaomi',
    operation: 'search',
    data: { results },
    meta: { receivedAt: '2026-01-01T00:00:00.000Z', upstreamStatus: 200 },
  }
}
