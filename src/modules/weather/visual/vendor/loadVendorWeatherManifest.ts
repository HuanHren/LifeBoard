import type { VendorWeatherManifest } from './vendorWeatherTypes'

const MANIFEST_URL = '/weather-assets/vendor/xiaomi/manifest.json'
const FAILED_RETRY_DELAY_MS = 30_000

let manifestPromise: Promise<VendorWeatherManifest | null> | null = null
let failedAt = 0

function isManifest(value: unknown): value is VendorWeatherManifest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === 1 &&
    'assetSet' in value &&
    value.assetSet === 'xiaomi-authorized-transitional' &&
    'status' in value &&
    value.status === 'authorized-vendor' &&
    'scenes' in value &&
    typeof value.scenes === 'object' &&
    value.scenes !== null
  )
}

async function fetchManifest() {
  if (failedAt > 0 && Date.now() - failedAt < FAILED_RETRY_DELAY_MS) {
    return null
  }

  try {
    const response = await fetch(MANIFEST_URL, {
      cache: 'force-cache',
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

export function loadVendorWeatherManifest() {
  manifestPromise ??= fetchManifest()
  return manifestPromise
}

export const vendorWeatherManifestTestInternals = {
  isManifest,
}
