import type { WeatherLocation } from '@/modules/weather/types/weather'
import type {
  WeatherFavoriteCity,
  WeatherFavoriteDraft,
} from '@/modules/weather/types/weatherFavorites'

function normalizeCoordinate(value: number) {
  return value.toFixed(4)
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `weather-favorite-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getWeatherFavoriteIdentity(
  value: Pick<WeatherFavoriteCity | WeatherLocation, 'latitude' | 'longitude'>,
) {
  return `${normalizeCoordinate(value.latitude)},${normalizeCoordinate(value.longitude)}`
}

export function createWeatherFavoriteCity(
  location: WeatherFavoriteDraft,
): WeatherFavoriteCity {
  const now = new Date().toISOString()
  const displayLabel = [location.name, location.admin1, location.country]
    .filter(Boolean)
    .join(', ')

  return {
    id: createLocalId(),
    name: location.name,
    region: location.admin1,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    displayLabel,
    createdAt: now,
    updatedAt: now,
  }
}

export function favoriteCityToWeatherLocation(
  favorite: WeatherFavoriteCity,
): WeatherLocation {
  return {
    id: favorite.id,
    name: favorite.name,
    kind: 'Location',
    admin1: favorite.region,
    country: favorite.country,
    countryCode: '',
    latitude: favorite.latitude,
    longitude: favorite.longitude,
    elevation: null,
    timezone: 'auto',
  }
}
