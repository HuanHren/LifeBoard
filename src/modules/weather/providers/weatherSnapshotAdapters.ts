import type {
  CanonicalWeatherCondition,
  ProviderWeatherCondition,
  ProviderWeatherLocation,
  ProviderWeatherSnapshot,
  WeatherCapabilityMap,
} from '@/modules/weather/providers/types'
import type {
  WeatherLocation,
  WeatherSnapshot,
} from '@/modules/weather/types/weather'
import { getWeatherCondition } from '@/modules/weather/utils/weatherCodes'

interface LegacyCompatibilityExtension {
  compatibilityKind: 'legacy-weather-snapshot'
  alerts: WeatherSnapshot['alerts']
  advice: WeatherSnapshot['advice']
  providerCapabilities: WeatherSnapshot['providerCapabilities']
  shortTermPrecipitation: WeatherSnapshot['shortTermPrecipitation']
}

function capability(value: unknown) {
  if (value === undefined) return 'missing' as const
  if (value === null) return 'null' as const
  if (Array.isArray(value)) return value.length === 0 ? 'empty-array' as const : 'available' as const
  if (typeof value === 'object') return Object.keys(value).length === 0 ? 'empty-object' as const : 'available' as const
  return 'available' as const
}

function capabilitiesFromLegacy(snapshot: WeatherSnapshot): WeatherCapabilityMap {
  return {
    current: 'available',
    hourly: capability(snapshot.hourly),
    daily: capability(snapshot.daily),
    aqi: 'missing',
    minutely: capability(snapshot.shortTermPrecipitation?.items),
    alerts: capability(snapshot.alerts),
    indices: 'missing',
    typhoon: 'missing',
    yesterday: 'missing',
    preHour: 'missing',
    sourceMaps: 'missing',
    brandInfo: 'missing',
    updateTime: 'available',
  }
}

const legacyToCanonical: Readonly<Record<number, CanonicalWeatherCondition>> = {
  0: 'clear',
  1: 'clear',
  2: 'partly-cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'sleet-freezing',
  57: 'sleet-freezing',
  61: 'light-rain',
  63: 'moderate-rain',
  65: 'heavy-rain',
  66: 'sleet-freezing',
  67: 'sleet-freezing',
  71: 'light-snow',
  73: 'moderate-snow',
  75: 'heavy-snow',
  77: 'light-snow',
  80: 'light-rain',
  81: 'moderate-rain',
  82: 'heavy-rain',
  85: 'light-snow',
  86: 'heavy-snow',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
  1003: 'cloudy',
  1045: 'haze',
  1051: 'sand-dust',
}

const canonicalToLegacy: Readonly<Record<CanonicalWeatherCondition, number>> = {
  clear: 0,
  'partly-cloudy': 2,
  cloudy: 1003,
  overcast: 3,
  fog: 45,
  haze: 1045,
  drizzle: 51,
  'light-rain': 61,
  'moderate-rain': 63,
  'heavy-rain': 65,
  thunderstorm: 95,
  'light-snow': 71,
  'moderate-snow': 73,
  'heavy-snow': 75,
  'sleet-freezing': 66,
  'sand-dust': 1051,
  unknown: -1,
}

function providerCondition(code: number): ProviderWeatherCondition {
  return {
    id: legacyToCanonical[code] ?? 'unknown',
    providerCode: String(code),
  }
}

function legacyCondition(condition: ProviderWeatherCondition) {
  return getWeatherCondition(canonicalToLegacy[condition.id])
}

function toProviderLocation(location: WeatherLocation, provider: WeatherSnapshot['provider']): ProviderWeatherLocation {
  return {
    provider,
    providerLocationId:
      location.providerLocationIds?.[provider === 'xiaomi' ? 'xiaomi' : 'openMeteo'] ??
      String(location.id),
    name: location.name,
    ...(location.admin1 ? { administrativeArea: location.admin1 } : {}),
    ...(location.country ? { country: location.country } : {}),
    latitude: location.latitude,
    longitude: location.longitude,
    ...(location.timezone ? { timezone: location.timezone } : {}),
    kind: location.kind,
    countryCode: location.countryCode,
    elevation: location.elevation,
    ...(location.displayLabel ? { displayLabel: location.displayLabel } : {}),
    ...(location.providerLocationIds ? { providerLocationIds: { ...location.providerLocationIds } } : {}),
    localId: location.id,
    ...(location.source ? { source: location.source } : {}),
  }
}

export function adaptLegacyWeatherSnapshot(
  snapshot: WeatherSnapshot,
): ProviderWeatherSnapshot<LegacyCompatibilityExtension> {
  return {
    provider: snapshot.provider,
    location: toProviderLocation(snapshot.location, snapshot.provider),
    updatedAt: snapshot.fetchedAt,
    timezone: snapshot.timezone,
    timezoneAbbreviation: snapshot.timezoneAbbreviation,
    current: {
      observedAt: snapshot.current.time,
      temperatureC: snapshot.current.temperature,
      ...(snapshot.current.apparentTemperature !== null ? { apparentTemperatureC: snapshot.current.apparentTemperature } : {}),
      ...(snapshot.current.relativeHumidity !== null ? { humidityPercent: snapshot.current.relativeHumidity } : {}),
      ...(snapshot.current.windSpeed !== null ? { windSpeedKmh: snapshot.current.windSpeed } : {}),
      ...(snapshot.current.windDirection !== null ? { windDirectionDegrees: snapshot.current.windDirection } : {}),
      ...(snapshot.current.pressure !== null ? { pressureHpa: snapshot.current.pressure } : {}),
      ...(snapshot.current.visibility !== null ? { visibilityKm: snapshot.current.visibility } : {}),
      ...(snapshot.current.uvIndex !== null ? { uvIndex: snapshot.current.uvIndex } : {}),
      ...(snapshot.current.precipitation !== null ? { precipitationMm: snapshot.current.precipitation } : {}),
      ...(snapshot.current.rain !== null ? { rainMm: snapshot.current.rain } : {}),
      ...(snapshot.current.showers !== null ? { showersMm: snapshot.current.showers } : {}),
      ...(snapshot.current.snowfall !== null ? { snowfallCm: snapshot.current.snowfall } : {}),
      ...(snapshot.current.cloudCover !== null ? { cloudCoverPercent: snapshot.current.cloudCover } : {}),
      ...(snapshot.current.windGusts !== null ? { windGustKmh: snapshot.current.windGusts } : {}),
      ...(snapshot.current.isDay !== null ? { isDay: snapshot.current.isDay } : {}),
      condition: providerCondition(snapshot.current.condition.code),
    },
    hourly: snapshot.hourly.map((item) => ({
      time: item.time,
      temperatureC: item.temperature,
      ...(item.apparentTemperature !== null ? { apparentTemperatureC: item.apparentTemperature } : {}),
      ...(item.precipitationProbability !== null ? { precipitationProbabilityPercent: item.precipitationProbability } : {}),
      ...(item.precipitation !== null ? { precipitationMm: item.precipitation } : {}),
      ...(item.windSpeed !== null ? { windSpeedKmh: item.windSpeed } : {}),
      ...(item.windGusts !== null ? { windGustKmh: item.windGusts } : {}),
      ...(item.uvIndex !== null ? { uvIndex: item.uvIndex } : {}),
      ...(item.isDay !== null ? { isDay: item.isDay } : {}),
      condition: providerCondition(item.condition.code),
    })),
    daily: snapshot.daily.map((item) => ({
      date: item.date,
      temperatureMaxC: item.temperatureMax,
      temperatureMinC: item.temperatureMin,
      dayCondition: providerCondition(item.condition.code),
      nightCondition: providerCondition(item.condition.code),
      ...(item.sunrise ? { sunrise: item.sunrise } : {}),
      ...(item.sunset ? { sunset: item.sunset } : {}),
      ...(item.apparentTemperatureMax !== null ? { apparentTemperatureMaxC: item.apparentTemperatureMax } : {}),
      ...(item.apparentTemperatureMin !== null ? { apparentTemperatureMinC: item.apparentTemperatureMin } : {}),
      ...(item.precipitationSum !== null ? { precipitationSumMm: item.precipitationSum } : {}),
      ...(item.precipitationProbabilityMax !== null ? { precipitationProbabilityMaxPercent: item.precipitationProbabilityMax } : {}),
      ...(item.windSpeedMax !== null ? { windSpeedMaxKmh: item.windSpeedMax } : {}),
      ...(item.windDirectionDominant !== null ? { windDirectionDominantDegrees: item.windDirectionDominant } : {}),
      ...(item.windGustsMax !== null ? { windGustMaxKmh: item.windGustsMax } : {}),
      ...(item.uvIndexMax !== null ? { uvIndexMax: item.uvIndexMax } : {}),
    })),
    capabilities: capabilitiesFromLegacy(snapshot),
    units: {
      temperature: 'celsius',
      windSpeed: 'kilometres-per-hour',
      windDirection: 'degrees',
      humidity: 'percent',
      pressure: 'hectopascals',
      visibility: 'kilometres',
    },
    extensions: {
      compatibilityKind: 'legacy-weather-snapshot',
      alerts: snapshot.alerts.map((alert) => ({ ...alert })),
      advice: {
        items: snapshot.advice.items.map((item) => ({ ...item })),
        notes: [...snapshot.advice.notes],
      },
      providerCapabilities: snapshot.providerCapabilities
        ? { ...snapshot.providerCapabilities }
        : undefined,
      shortTermPrecipitation: snapshot.shortTermPrecipitation
        ? {
            ...snapshot.shortTermPrecipitation,
            items: snapshot.shortTermPrecipitation.items.map((item) => ({ ...item })),
          }
        : null,
    },
    diagnostics: [],
  }
}

function isLegacyCompatibilityExtension(value: unknown): value is LegacyCompatibilityExtension {
  return typeof value === 'object' && value !== null &&
    'compatibilityKind' in value && value.compatibilityKind === 'legacy-weather-snapshot'
}

export function providerLocationToWeatherLocation(location: ProviderWeatherLocation): WeatherLocation {
  return {
    id: location.localId ?? (location.provider === 'xiaomi'
      ? `xiaomi:${location.providerLocationId}`
      : location.providerLocationId),
    name: location.name,
    kind: location.kind ?? 'Location',
    admin1: location.administrativeArea ?? null,
    country: location.country ?? '',
    countryCode: location.countryCode ?? '',
    latitude: location.latitude,
    longitude: location.longitude,
    elevation: location.elevation ?? null,
    timezone: location.timezone ?? 'auto',
    ...(location.displayLabel
      ? { displayLabel: location.displayLabel }
      : location.administrativeArea || location.country
        ? { displayLabel: [location.name, location.administrativeArea, location.country].filter(Boolean).join(', ') }
        : {}),
    ...(location.provider === 'xiaomi'
      ? { providerLocationIds: { xiaomi: location.providerLocationId } }
      : location.providerLocationIds
        ? { providerLocationIds: { ...location.providerLocationIds } }
        : {}),
    ...(location.provider !== 'xiaomi' && location.source ? { source: location.source } : {}),
  }
}

function deriveIsDay(snapshot: ProviderWeatherSnapshot) {
  if (snapshot.current.isDay !== undefined) return snapshot.current.isDay

  const today = snapshot.daily[0]
  if (!today?.sunrise || !today.sunset) return null

  const current = Date.parse(snapshot.current.observedAt)
  const sunrise = Date.parse(today.sunrise)
  const sunset = Date.parse(today.sunset)
  if (![current, sunrise, sunset].every(Number.isFinite)) return null
  return current >= sunrise && current < sunset
}

export function adaptProviderSnapshotForDisplay(
  snapshot: ProviderWeatherSnapshot,
): WeatherSnapshot {
  const compatibility = isLegacyCompatibilityExtension(snapshot.extensions)
    ? snapshot.extensions
    : null

  return {
    provider: snapshot.provider,
    location: providerLocationToWeatherLocation(snapshot.location),
    timezone: snapshot.timezone ?? snapshot.location.timezone ?? 'auto',
    timezoneAbbreviation: snapshot.timezoneAbbreviation ?? '',
    fetchedAt: snapshot.updatedAt,
    current: {
      time: snapshot.current.observedAt,
      temperature: snapshot.current.temperatureC,
      apparentTemperature: snapshot.current.apparentTemperatureC ?? null,
      relativeHumidity: snapshot.current.humidityPercent ?? null,
      precipitation: snapshot.current.precipitationMm ?? null,
      rain: snapshot.current.rainMm ?? null,
      showers: snapshot.current.showersMm ?? null,
      snowfall: snapshot.current.snowfallCm ?? null,
      cloudCover: snapshot.current.cloudCoverPercent ?? null,
      windSpeed: snapshot.current.windSpeedKmh ?? null,
      windDirection: snapshot.current.windDirectionDegrees ?? null,
      windGusts: snapshot.current.windGustKmh ?? null,
      uvIndex: snapshot.current.uvIndex ?? null,
      pressure: snapshot.current.pressureHpa ?? null,
      visibility: snapshot.current.visibilityKm ?? null,
      isDay: deriveIsDay(snapshot),
      condition: legacyCondition(snapshot.current.condition),
    },
    hourly: snapshot.hourly.map((item) => ({
      time: item.time,
      temperature: item.temperatureC,
      apparentTemperature: item.apparentTemperatureC ?? null,
      precipitationProbability: item.precipitationProbabilityPercent ?? null,
      precipitation: item.precipitationMm ?? null,
      windSpeed: item.windSpeedKmh ?? null,
      windGusts: item.windGustKmh ?? null,
      uvIndex: item.uvIndex ?? null,
      isDay: item.isDay ?? null,
      condition: legacyCondition(item.condition),
    })),
    daily: snapshot.daily.map((item) => ({
      date: item.date,
      temperatureMax: item.temperatureMaxC,
      temperatureMin: item.temperatureMinC,
      apparentTemperatureMax: item.apparentTemperatureMaxC ?? null,
      apparentTemperatureMin: item.apparentTemperatureMinC ?? null,
      precipitationSum: item.precipitationSumMm ?? null,
      precipitationProbabilityMax: item.precipitationProbabilityMaxPercent ?? null,
      windSpeedMax: item.windSpeedMaxKmh ?? null,
      windDirectionDominant: item.windDirectionDominantDegrees ?? null,
      windGustsMax: item.windGustMaxKmh ?? null,
      uvIndexMax: item.uvIndexMax ?? null,
      sunrise: item.sunrise ?? null,
      sunset: item.sunset ?? null,
      condition: legacyCondition(item.dayCondition),
    })),
    shortTermPrecipitation: compatibility?.shortTermPrecipitation ?? null,
    alerts: compatibility?.alerts.map((alert) => ({ ...alert })) ?? [],
    providerCapabilities: compatibility?.providerCapabilities ?? {
      // W4 owns Xiaomi alert and minutely rendering. The provider snapshot still
      // retains their five-state capabilities and extension payloads.
      alerts: false,
      visibility: snapshot.current.visibilityKm !== undefined,
      airQuality: snapshot.airQuality !== undefined,
      shortTermPrecipitation: false,
    },
    units: {
      temperature: '°C',
      precipitation: 'mm',
      probability: '%',
      windSpeed: 'km/h',
      humidity: '%',
      uvIndex: '',
      pressure: 'hPa',
      visibility: 'km',
    },
    advice: compatibility?.advice ?? { items: [], notes: [] },
  }
}
