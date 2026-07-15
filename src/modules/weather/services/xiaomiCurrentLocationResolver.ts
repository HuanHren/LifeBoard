import { CurrentLocationResolutionError } from '@/modules/weather/services/bigDataCloudReverseGeocoder'
import type {
  CurrentCoordinates,
  RankedXiaomiLocationCandidate,
  ReverseGeocodedLocation,
  XiaomiCurrentLocationResolution,
} from '@/modules/weather/types/currentLocationResolution'
import type { WeatherLocation } from '@/modules/weather/types/weather'

const ADMINISTRATIVE_SUFFIXES = [
  '特别行政区',
  '自治区',
  '自治州',
  '自治县',
  '地区',
  '省',
  '市',
  '县',
  '区',
  '旗',
  '盟',
] as const

const TOO_LOCAL_SUFFIXES = ['街道', '镇', '乡', '村', '路', '街', '社区'] as const

function cleanName(value: string | undefined) {
  return value?.trim() ?? ''
}

export function normalizeChineseAdministrativeName(value: string) {
  let normalized = value.trim()
  for (const suffix of ADMINISTRATIVE_SUFFIXES) {
    if (normalized.endsWith(suffix) && normalized.length > suffix.length) {
      normalized = normalized.slice(0, -suffix.length)
      break
    }
  }
  return normalized
}

function isSuitableXiaomiQuery(value: string) {
  return value.length >= 2
    && !TOO_LOCAL_SUFFIXES.some((suffix) => value.endsWith(suffix))
    && !/^-?\d+(?:\.\d+)?(?:\s*,\s*-?\d+(?:\.\d+)?)?$/.test(value)
}

export function buildXiaomiCurrentLocationQueries(
  reverseLocation: ReverseGeocodedLocation,
): string[] {
  const administrative = [...reverseLocation.administrativeNames]
    .sort((left, right) => (right.level ?? -1) - (left.level ?? -1))
    .map((item) => cleanName(item.name))
    .filter(isSuitableXiaomiQuery)

  const fineGrained = [cleanName(reverseLocation.locality), ...administrative]
    .find((name) => name && name !== reverseLocation.city && isSuitableXiaomiQuery(name))
  const city = cleanName(reverseLocation.city)
  const queries = [fineGrained, city]
    .filter((query): query is string =>
      typeof query === 'string' && query.length > 0 && isSuitableXiaomiQuery(query),
    )

  return [...new Set(queries)].slice(0, 2)
}

function tokens(value: string | null | undefined) {
  return (value ?? '')
    .split(/[\s,，/·]+/u)
    .map((item) => item.trim())
    .filter(Boolean)
}

function includesAdministrativeName(candidate: WeatherLocation, expected: string | undefined) {
  const target = cleanName(expected)
  if (!target) return false
  const normalizedTarget = normalizeChineseAdministrativeName(target)
  return [candidate.name, candidate.admin1, candidate.country, candidate.displayLabel]
    .flatMap((value) => tokens(value))
    .some((value) => value === target || normalizeChineseAdministrativeName(value) === normalizedTarget)
}

export function haversineDistanceKm(
  from: CurrentCoordinates,
  to: CurrentCoordinates,
) {
  const radiusKm = 6371
  const radians = (degrees: number) => degrees * Math.PI / 180
  const latitudeDelta = radians(to.latitude - from.latitude)
  const longitudeDelta = radians(to.longitude - from.longitude)
  const latitudeA = radians(from.latitude)
  const latitudeB = radians(to.latitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2
  return radiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function candidateScore(
  candidate: WeatherLocation,
  reverseLocation: ReverseGeocodedLocation,
  query: string,
) {
  let score = 0
  const candidateCountryCode = candidate.countryCode.trim().toUpperCase()
  if (candidateCountryCode === reverseLocation.countryCode) score += 120
  else if (includesAdministrativeName(candidate, reverseLocation.countryName)) score += 80

  if (includesAdministrativeName(candidate, reverseLocation.principalSubdivision)) score += 70
  if (includesAdministrativeName(candidate, reverseLocation.city)) score += 60
  if (candidate.name.trim() === query.trim()) score += 90
  else if (
    normalizeChineseAdministrativeName(candidate.name)
    === normalizeChineseAdministrativeName(query)
  ) score += 75

  for (const administrative of reverseLocation.administrativeNames) {
    if (includesAdministrativeName(candidate, administrative.name)) score += 12
  }

  return score
}

function isAcceptableCandidate(
  candidate: WeatherLocation,
  reverseLocation: ReverseGeocodedLocation,
  query: string,
) {
  const countryMatches = candidate.countryCode.trim().toUpperCase() === 'CN'
    || includesAdministrativeName(candidate, reverseLocation.countryName)
  const nameMatches = candidate.name.trim() === query.trim()
    || normalizeChineseAdministrativeName(candidate.name)
      === normalizeChineseAdministrativeName(query)
  const administrationMatches = includesAdministrativeName(
    candidate,
    reverseLocation.principalSubdivision,
  ) || includesAdministrativeName(candidate, reverseLocation.city)
  return countryMatches && (nameMatches || administrationMatches)
}

export function rankXiaomiCurrentLocationCandidates(
  candidates: WeatherLocation[],
  reverseLocation: ReverseGeocodedLocation,
  query: string,
): RankedXiaomiLocationCandidate[] {
  const deduped = new Map<string, WeatherLocation>()
  for (const candidate of candidates) {
    const locationKey = candidate.providerLocationIds?.xiaomi?.trim()
    if (!locationKey || deduped.has(locationKey)) continue
    deduped.set(locationKey, candidate)
  }

  const ranked = [...deduped.values()].map((location) => ({
    location,
    distanceKm: haversineDistanceKm(reverseLocation, location),
    score: candidateScore(location, reverseLocation, query),
    recommended: false,
  })).sort((left, right) => right.score - left.score
    || (left.distanceKm ?? Number.POSITIVE_INFINITY)
      - (right.distanceKm ?? Number.POSITIVE_INFINITY))

  return ranked.slice(0, 5).map((candidate, index) => ({
    ...candidate,
    recommended: index === 0,
  }))
}

export interface XiaomiCurrentLocationResolverDependencies {
  reverseGeocode: (
    coordinates: CurrentCoordinates,
    options: { signal?: AbortSignal },
  ) => Promise<ReverseGeocodedLocation>
  searchXiaomi: (query: string, signal?: AbortSignal) => Promise<WeatherLocation[]>
}

export async function resolveXiaomiCurrentLocation(
  coordinates: CurrentCoordinates,
  dependencies: XiaomiCurrentLocationResolverDependencies,
  signal?: AbortSignal,
): Promise<XiaomiCurrentLocationResolution> {
  const reverseLocation = await dependencies.reverseGeocode(coordinates, { signal })
  if (reverseLocation.countryCode !== 'CN') {
    throw new CurrentLocationResolutionError(
      'outside-xiaomi-region',
      'The current location is outside the verified Xiaomi Weather region.',
    )
  }

  const queries = buildXiaomiCurrentLocationQueries(reverseLocation)
  if (queries.length === 0) {
    throw new CurrentLocationResolutionError(
      'reverse-contract',
      'The current administrative area could not be identified.',
    )
  }

  const combined: WeatherLocation[] = []
  let searchCount = 0
  let ranked: RankedXiaomiLocationCandidate[] = []
  let hasAcceptableCandidate = false

  for (const query of queries) {
    if (signal?.aborted) {
      throw new CurrentLocationResolutionError('aborted', 'The location request was cancelled.')
    }
    const results = await dependencies.searchXiaomi(query, signal)
    searchCount += 1
    combined.push(...results)
    ranked = rankXiaomiCurrentLocationCandidates(combined, reverseLocation, query)
    hasAcceptableCandidate = results.some((candidate) =>
      isAcceptableCandidate(candidate, reverseLocation, query),
    )
    if (hasAcceptableCandidate) {
      break
    }
  }

  if (!hasAcceptableCandidate || ranked.length === 0) {
    throw new CurrentLocationResolutionError(
      'xiaomi-no-candidate',
      'No trustworthy Xiaomi Weather location matched the current area.',
    )
  }

  return { reverseLocation, queries, searchCount, candidates: ranked }
}

export function createConfirmedXiaomiCurrentLocation(
  candidate: WeatherLocation,
  coordinates: CurrentCoordinates,
): WeatherLocation {
  const locationKey = candidate.providerLocationIds?.xiaomi?.trim()
  if (!locationKey) {
    throw new CurrentLocationResolutionError(
      'xiaomi-no-candidate',
      'The Xiaomi Weather candidate did not contain a valid location identity.',
    )
  }

  return {
    ...candidate,
    id: `current-location-${coordinates.longitude.toFixed(5)}-${coordinates.latitude.toFixed(5)}`,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    providerLocationIds: { xiaomi: locationKey },
    displayLabel: candidate.displayLabel
      ?? [candidate.name, candidate.admin1, candidate.country].filter(Boolean).join(', '),
    source: 'xiaomi',
  }
}
