import type { LocalWeatherReferenceManifest } from './types'

const MANIFEST_URL = '/__local_weather_reference/manifest.json'
const FAILED_RETRY_DELAY_MS = 30_000

let manifestPromise: Promise<LocalWeatherReferenceManifest | null> | null = null
let failedAt = 0

function isLocalReferenceEnabled() {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_LOCAL_WEATHER_REFERENCE_ASSETS === 'true'
  )
}

function isManifest(value: unknown): value is LocalWeatherReferenceManifest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === 1 &&
    'source' in value &&
    value.source === 'local-reference' &&
    'scenes' in value &&
    typeof value.scenes === 'object' &&
    value.scenes !== null
  )
}

async function fetchManifest() {
  if (!isLocalReferenceEnabled()) {
    return null
  }

  if (failedAt > 0 && Date.now() - failedAt < FAILED_RETRY_DELAY_MS) {
    return null
  }

  try {
    const response = await fetch(MANIFEST_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      failedAt = Date.now()
      return null
    }

    const payload: unknown = await response.json()

    if (!isManifest(payload)) {
      failedAt = Date.now()
      return null
    }

    failedAt = 0
    return payload
  } catch {
    failedAt = Date.now()
    return null
  } finally {
    manifestPromise = null
  }
}

export function loadLocalWeatherReferenceManifest() {
  if (!isLocalReferenceEnabled()) {
    return Promise.resolve(null)
  }

  manifestPromise ??= fetchManifest()
  return manifestPromise
}

export const localWeatherReferenceManifestTestInternals = {
  isLocalReferenceEnabled,
}
