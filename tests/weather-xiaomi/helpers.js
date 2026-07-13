import { readFile } from 'node:fs/promises'

export const TEST_ENVIRONMENT = Object.freeze({
  XIAOMI_WEATHER_BASE_URL: 'https://weather.example.test',
  XIAOMI_WEATHER_APP_KEY: 'test-app-key-credential',
  XIAOMI_WEATHER_SIGN: 'test-static-sign-credential',
  XIAOMI_WEATHER_APP_VERSION: 'test-app-version-credential',
  XIAOMI_WEATHER_ROM_VERSION: 'test-rom-version-credential',
  XIAOMI_WEATHER_DEVICE: 'test-device-credential',
  XIAOMI_WEATHER_OAID: '',
})

export async function loadFixture(name) {
  const url = new URL(`./fixtures/${name}`, import.meta.url)
  return JSON.parse(await readFile(url, 'utf8'))
}

export function createRequest(url, method = 'GET') {
  return { method, url }
}

export function createResponse() {
  const headers = new Map()

  return {
    body: null,
    headers,
    statusCode: null,
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value)
    },
    end(body) {
      this.body = JSON.parse(body)
    },
  }
}

export function jsonFetch(payload, status = 200) {
  return async () => new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
