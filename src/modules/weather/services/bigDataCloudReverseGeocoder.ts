import type {
  CurrentCoordinates,
  CurrentLocationResolutionErrorCode,
  ReverseAdministrativeName,
  ReverseGeocodedLocation,
} from '@/modules/weather/types/currentLocationResolution'

export const BIG_DATA_CLOUD_REVERSE_GEOCODE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client'

export class CurrentLocationResolutionError extends Error {
  readonly code: CurrentLocationResolutionErrorCode
  readonly status?: number

  constructor(
    code: CurrentLocationResolutionErrorCode,
    message: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'CurrentLocationResolutionError'
    this.code = code
    this.status = options.status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanString(value: unknown) {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim()
  return cleaned.length > 0 ? cleaned : undefined
}

export function isValidCurrentCoordinates(
  coordinates: CurrentCoordinates,
): boolean {
  return Number.isFinite(coordinates.latitude)
    && coordinates.latitude >= -90
    && coordinates.latitude <= 90
    && Number.isFinite(coordinates.longitude)
    && coordinates.longitude >= -180
    && coordinates.longitude <= 180
}

function cleanAdministrativeNames(value: unknown): ReverseAdministrativeName[] {
  if (!isRecord(value) || !Array.isArray(value.administrative)) return []

  const seen = new Set<string>()
  const names: ReverseAdministrativeName[] = []

  for (const item of value.administrative) {
    if (!isRecord(item)) continue
    const name = cleanString(item.name)
    if (!name || seen.has(name)) continue
    seen.add(name)

    const level = typeof item.adminLevel === 'number' && Number.isFinite(item.adminLevel)
      ? item.adminLevel
      : undefined
    const isoCode = cleanString(item.isoCode)
    const chinaAdminCode = cleanString(item.chinaAdminCode)

    names.push({
      name,
      ...(level === undefined ? {} : { level }),
      ...(isoCode ? { isoCode } : {}),
      ...(chinaAdminCode ? { chinaAdminCode } : {}),
    })
  }

  return names
}

export function normalizeBigDataCloudReverseResponse(
  payload: unknown,
  coordinates: CurrentCoordinates,
): ReverseGeocodedLocation {
  if (!isValidCurrentCoordinates(coordinates) || !isRecord(payload)) {
    throw new CurrentLocationResolutionError(
      'reverse-contract',
      'The reverse-geocoding response could not be safely validated.',
    )
  }

  const countryCode = cleanString(payload.countryCode)?.toUpperCase()
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
    throw new CurrentLocationResolutionError(
      'reverse-contract',
      'The reverse-geocoding response did not include a valid country code.',
    )
  }

  const administrativeNames = cleanAdministrativeNames(payload.localityInfo)
  const directChinaAdminCode = cleanString(payload.chinaAdminCode)
  const administrativeChinaCode = administrativeNames
    .map((item) => item.chinaAdminCode)
    .find((item): item is string => Boolean(item))

  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    countryCode,
    ...(cleanString(payload.countryName) ? { countryName: cleanString(payload.countryName) } : {}),
    ...(cleanString(payload.principalSubdivision)
      ? { principalSubdivision: cleanString(payload.principalSubdivision) }
      : {}),
    ...(cleanString(payload.principalSubdivisionCode)
      ? { principalSubdivisionCode: cleanString(payload.principalSubdivisionCode) }
      : {}),
    ...(cleanString(payload.city) ? { city: cleanString(payload.city) } : {}),
    ...(cleanString(payload.locality) ? { locality: cleanString(payload.locality) } : {}),
    ...(cleanString(payload.postcode) ? { postcode: cleanString(payload.postcode) } : {}),
    ...(directChinaAdminCode || administrativeChinaCode
      ? { chinaAdminCode: directChinaAdminCode ?? administrativeChinaCode }
      : {}),
    administrativeNames,
    lookupSource: 'bigdatacloud',
  }
}

export async function reverseGeocodeCurrentCoordinates(
  coordinates: CurrentCoordinates,
  options: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
): Promise<ReverseGeocodedLocation> {
  if (!isValidCurrentCoordinates(coordinates)) {
    throw new CurrentLocationResolutionError(
      'reverse-contract',
      'The current coordinates are outside the supported range.',
    )
  }

  const url = new URL(BIG_DATA_CLOUD_REVERSE_GEOCODE_URL)
  url.searchParams.set('latitude', String(coordinates.latitude))
  url.searchParams.set('longitude', String(coordinates.longitude))
  url.searchParams.set('localityLanguage', 'zh')

  let response: Response
  try {
    response = await (options.fetchImpl ?? fetch)(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new CurrentLocationResolutionError('aborted', 'The location request was cancelled.')
    }
    throw new CurrentLocationResolutionError(
      'reverse-network',
      'The location name service is unavailable.',
      { cause: error },
    )
  }

  if (!response.ok) {
    throw new CurrentLocationResolutionError(
      'reverse-http',
      'The location name service returned an error.',
      { status: response.status },
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    throw new CurrentLocationResolutionError(
      'reverse-contract',
      'The location name response was not valid JSON.',
      { cause: error },
    )
  }

  return normalizeBigDataCloudReverseResponse(payload, coordinates)
}
