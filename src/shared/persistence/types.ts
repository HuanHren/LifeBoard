export type PersistenceOwner =
  | 'theme'
  | 'language'
  | 'weather'
  | 'todos'
  | 'bookmarks'

export type PersistenceCategory =
  | 'durable-data'
  | 'preference'
  | 'cache'
  | 'runtime'
  | 'derived'
  | 'secret'

export type PersistenceSensitivity =
  | 'public-preference'
  | 'personal-data'
  | 'device-local'
  | 'secret'

export type PersistenceModuleId = 'settings' | 'weather' | 'todos' | 'bookmarks'

export type PersistenceEntryId =
  | 'theme-mode'
  | 'language'
  | 'weather-location'
  | 'weather-forecast-cache'
  | 'weather-favorite-cities'
  | 'weather-provider'
  | 'weather-caiyun-token'
  | 'weather-amap-key'
  | 'weather-auto-location-on-home'
  | 'todos'
  | 'bookmarks'

export type PortablePolicy =
  | {
      readonly portable: true
      readonly portableNamespace: PersistenceModuleId
      readonly schemaVersion: number
    }
  | {
      readonly portable: false
      readonly portableNamespace: null
      readonly schemaVersion: number | null
    }

export interface ClearPolicy {
  readonly contentClear: boolean
  readonly factoryReset: boolean
}

interface PersistenceRegistryEntryBase {
  readonly id: PersistenceEntryId
  readonly owner: PersistenceOwner
  readonly storageKey: string
  readonly category: PersistenceCategory
  readonly sensitivity: PersistenceSensitivity
  readonly storageSchemaVersion: number | null
  readonly validationRequired: boolean
  readonly migrationRequired: boolean
  readonly notes: string
  readonly legacyVersions?: readonly number[]
  readonly clearOrder: number
  readonly writeOrder: number
  readonly summaryKind: 'preference' | 'content' | 'excluded'
  readonly implementationStatus: 'metadata-only'
}

export type PersistenceRegistryEntry = PersistenceRegistryEntryBase &
  PortablePolicy &
  ClearPolicy

export type LifeBoardLocale = 'zh-CN' | 'en-US'
export type ThemeMode = 'system' | 'light' | 'dark'

export interface PortableSettingsPayloadV1 {
  readonly themeMode: ThemeMode
  readonly language: LifeBoardLocale
}

export type PortableWeatherLocationKindV1 =
  | 'Capital city'
  | 'Regional capital'
  | 'Country'
  | 'Administrative area'
  | 'Locality'
  | 'Location'

export type PortableWeatherLocationSourceV1 =
  | 'openMeteo'
  | 'amap'
  | 'amap-geolocation'

export interface PortableWeatherLocationV1 {
  readonly id: number | string
  readonly name: string
  readonly kind: PortableWeatherLocationKindV1
  readonly admin1: string | null
  readonly country: string
  readonly countryCode: string
  readonly latitude: number
  readonly longitude: number
  readonly elevation: number | null
  readonly timezone: string
  readonly displayLabel?: string
  readonly source?: PortableWeatherLocationSourceV1
}

export interface PortableWeatherFavoriteCityV1 {
  readonly id: string
  readonly name: string
  readonly region: string | null
  readonly country: string
  readonly latitude: number
  readonly longitude: number
  readonly displayLabel: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface PortableWeatherPayloadV1 {
  readonly selectedLocation: PortableWeatherLocationV1 | null
  readonly favoriteCities: readonly PortableWeatherFavoriteCityV1[]
}

export interface PortableTaskV1 {
  readonly id: string
  readonly title: string
  readonly dueDate: string | null
  readonly label: string | null
  readonly completedAt: string | null
  readonly deletedAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface PortableCountdownV1 {
  readonly id: string
  readonly title: string
  readonly targetDate: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface PortableTodosPayloadV1 {
  readonly tasks: readonly PortableTaskV1[]
  readonly countdowns: readonly PortableCountdownV1[]
}

export interface PortableBookmarkV1 {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly category: string | null
  readonly note: string | null
  readonly pinned: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface PortableBookmarksPayloadV1 {
  readonly bookmarks: readonly PortableBookmarkV1[]
}

export interface PortableModuleEnvelope<TPayload, TVersion extends number = number> {
  readonly schemaVersion: TVersion
  readonly payload: TPayload
}

export interface PortableBackupData {
  readonly settings: PortableModuleEnvelope<PortableSettingsPayloadV1, 1>
  readonly weather: PortableModuleEnvelope<PortableWeatherPayloadV1, 1>
  readonly todos: PortableModuleEnvelope<PortableTodosPayloadV1, 1>
  readonly bookmarks: PortableModuleEnvelope<PortableBookmarksPayloadV1, 1>
}

export interface PortableBackupV1 {
  readonly format: 'lifeboard-backup'
  readonly schemaVersion: 1
  readonly exportedAt: string
  readonly app: {
    readonly name: 'LifeBoard'
    readonly version: string
  }
  readonly locale: LifeBoardLocale
  readonly data: PortableBackupData
}
