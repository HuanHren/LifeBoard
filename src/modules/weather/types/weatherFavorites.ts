import type { WeatherLocation } from '@/modules/weather/types/weather'

export interface WeatherFavoriteCity {
  id: string
  name: string
  region: string | null
  country: string
  latitude: number
  longitude: number
  displayLabel: string
  createdAt: string
  updatedAt: string
}

export interface WeatherFavoritesStorageEnvelope {
  version: 1
  favoriteCities: WeatherFavoriteCity[]
}

export type WeatherFavoriteMessage =
  | 'saved'
  | 'removed'
  | 'duplicate'
  | 'storageError'
  | 'invalidStorage'

export type WeatherFavoriteDraft = Pick<
  WeatherLocation,
  'name' | 'admin1' | 'country' | 'latitude' | 'longitude'
>
