import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  DEVELOPMENT_ONLY_STORAGE_KEYS,
  PRODUCT_STORAGE_KEYS,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
} from './constants'
import type {
  PersistenceCategory,
  PersistenceEntryId,
  PersistenceOwner,
  PersistenceRegistryEntry,
} from './types'

const registryDefinition = [
  {
    id: 'theme-mode',
    owner: 'theme',
    storageKey: 'lifeboard-theme',
    category: 'preference',
    sensitivity: 'public-preference',
    portable: true,
    portableNamespace: 'settings',
    schemaVersion: SETTINGS_PORTABLE_SCHEMA_VERSION,
    storageSchemaVersion: null,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Raw theme preference; portable through the future Settings serializer.',
    clearOrder: 80,
    writeOrder: 50,
    summaryKind: 'preference',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'language',
    owner: 'language',
    storageKey: 'lifeboard.language',
    category: 'preference',
    sensitivity: 'public-preference',
    portable: true,
    portableNamespace: 'settings',
    schemaVersion: SETTINGS_PORTABLE_SCHEMA_VERSION,
    storageSchemaVersion: null,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Raw locale preference; target contract includes export, restore, and factory reset.',
    clearOrder: 81,
    writeOrder: 60,
    summaryKind: 'preference',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-location',
    owner: 'weather',
    storageKey: 'lifeboard-weather-location',
    category: 'preference',
    sensitivity: 'personal-data',
    portable: true,
    portableNamespace: 'weather',
    schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION,
    storageSchemaVersion: null,
    contentClear: true,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Saved location is portable; Weather implementation remains frozen.',
    clearOrder: 30,
    writeOrder: 40,
    summaryKind: 'content',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-forecast-cache',
    owner: 'weather',
    storageKey: 'lifeboard.weather.forecastCache.v1',
    category: 'cache',
    sensitivity: 'device-local',
    portable: false,
    portableNamespace: null,
    schemaVersion: 1,
    storageSchemaVersion: 1,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Rebuildable Weather forecast cache; never included in portable backups.',
    clearOrder: 70,
    writeOrder: 100,
    summaryKind: 'excluded',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-favorite-cities',
    owner: 'weather',
    storageKey: 'lifeboard-weather-favorite-cities',
    category: 'durable-data',
    sensitivity: 'personal-data',
    portable: true,
    portableNamespace: 'weather',
    schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION,
    storageSchemaVersion: 1,
    contentClear: true,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: true,
    notes: 'Versioned saved-city envelope; portable without changing Weather internals.',
    legacyVersions: Object.freeze([1] as const),
    clearOrder: 31,
    writeOrder: 30,
    summaryKind: 'content',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-provider',
    owner: 'weather',
    storageKey: 'lifeboard.weather.provider',
    category: 'preference',
    sensitivity: 'device-local',
    portable: false,
    portableNamespace: null,
    schemaVersion: null,
    storageSchemaVersion: null,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Device-local provider choice is excluded from portable backup v1.',
    clearOrder: 82,
    writeOrder: 100,
    summaryKind: 'excluded',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-caiyun-token',
    owner: 'weather',
    storageKey: 'lifeboard.weather.caiyunToken',
    category: 'secret',
    sensitivity: 'secret',
    portable: false,
    portableNamespace: null,
    schemaVersion: null,
    storageSchemaVersion: null,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Credential is factory-resettable but must never enter a portable backup.',
    clearOrder: 90,
    writeOrder: 100,
    summaryKind: 'excluded',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-amap-key',
    owner: 'weather',
    storageKey: 'lifeboard.weather.amapKey',
    category: 'secret',
    sensitivity: 'secret',
    portable: false,
    portableNamespace: null,
    schemaVersion: null,
    storageSchemaVersion: null,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Credential is factory-resettable but must never enter a portable backup.',
    clearOrder: 91,
    writeOrder: 100,
    summaryKind: 'excluded',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'weather-auto-location-on-home',
    owner: 'weather',
    storageKey: 'lifeboard.weather.autoLocationOnHome',
    category: 'preference',
    sensitivity: 'device-local',
    portable: false,
    portableNamespace: null,
    schemaVersion: null,
    storageSchemaVersion: null,
    contentClear: false,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: false,
    notes: 'Device permission context is local and excluded from portable backup v1.',
    clearOrder: 83,
    writeOrder: 100,
    summaryKind: 'excluded',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'todos',
    owner: 'todos',
    storageKey: 'lifeboard.todos',
    category: 'durable-data',
    sensitivity: 'personal-data',
    portable: true,
    portableNamespace: 'todos',
    schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION,
    storageSchemaVersion: 1,
    contentClear: true,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: true,
    notes: 'Versioned task and countdown envelope.',
    legacyVersions: Object.freeze([1] as const),
    clearOrder: 10,
    writeOrder: 10,
    summaryKind: 'content',
    implementationStatus: 'metadata-only',
  },
  {
    id: 'bookmarks',
    owner: 'bookmarks',
    storageKey: 'lifeboard.bookmarks',
    category: 'durable-data',
    sensitivity: 'personal-data',
    portable: true,
    portableNamespace: 'bookmarks',
    schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION,
    storageSchemaVersion: 1,
    contentClear: true,
    factoryReset: true,
    validationRequired: true,
    migrationRequired: true,
    notes: 'Versioned bookmark envelope.',
    legacyVersions: Object.freeze([1] as const),
    clearOrder: 20,
    writeOrder: 20,
    summaryKind: 'content',
    implementationStatus: 'metadata-only',
  },
] as const satisfies readonly PersistenceRegistryEntry[]

export const PERSISTENCE_REGISTRY: readonly PersistenceRegistryEntry[] = Object.freeze(
  registryDefinition.map((entry) => Object.freeze(entry)),
)

const readonlyEntries = (entries: PersistenceRegistryEntry[]) => Object.freeze(entries)

export const getPersistenceEntryById = (id: PersistenceEntryId) =>
  PERSISTENCE_REGISTRY.find((entry) => entry.id === id)

export const getPersistenceEntryByStorageKey = (storageKey: string) =>
  PERSISTENCE_REGISTRY.find((entry) => entry.storageKey === storageKey)

export const getPortableEntries = () =>
  readonlyEntries(PERSISTENCE_REGISTRY.filter((entry) => entry.portable))

export const getContentClearEntries = () =>
  readonlyEntries(PERSISTENCE_REGISTRY.filter((entry) => entry.contentClear))

export const getFactoryResetEntries = () =>
  readonlyEntries(PERSISTENCE_REGISTRY.filter((entry) => entry.factoryReset))

export const getCacheEntries = () =>
  readonlyEntries(PERSISTENCE_REGISTRY.filter((entry) => entry.category === 'cache'))

export const getSecretEntries = () =>
  readonlyEntries(PERSISTENCE_REGISTRY.filter((entry) => entry.category === 'secret'))

export const getEntriesByOwner = (owner: PersistenceOwner) =>
  readonlyEntries(PERSISTENCE_REGISTRY.filter((entry) => entry.owner === owner))

export interface RegistryIntegrityIssue {
  readonly code: string
  readonly entryId?: string
  readonly message: string
}

export interface RegistryIntegrityResult {
  readonly valid: boolean
  readonly issues: readonly RegistryIntegrityIssue[]
}

const validCategories = new Set<PersistenceCategory>([
  'durable-data',
  'preference',
  'cache',
  'runtime',
  'derived',
  'secret',
])

const addIssue = (
  issues: RegistryIntegrityIssue[],
  code: string,
  message: string,
  entryId?: string,
) => {
  issues.push(Object.freeze({ code, message, ...(entryId ? { entryId } : {}) }))
}

export const validatePersistenceRegistryDefinition = (
  entries: readonly PersistenceRegistryEntry[],
  expectedStorageKeys: readonly string[] = PRODUCT_STORAGE_KEYS,
): RegistryIntegrityResult => {
  const issues: RegistryIntegrityIssue[] = []
  const ids = new Set<string>()
  const storageKeys = new Set<string>()

  if (entries.length !== expectedStorageKeys.length) {
    addIssue(issues, 'registry.entry-count', 'Registry entry count does not match product key count.')
  }

  for (const entry of entries) {
    const entryId = entry.id as string
    const runtimeCategory = entry.category as unknown
    const runtimePortable = entry.portable as unknown
    const runtimeNamespace = entry.portableNamespace as unknown
    const runtimeSchemaVersion = entry.schemaVersion as unknown

    if (ids.has(entry.id)) {
      addIssue(issues, 'registry.duplicate-id', `Duplicate registry id: ${entry.id}.`, entry.id)
    }
    ids.add(entry.id)

    if (storageKeys.has(entry.storageKey)) {
      addIssue(
        issues,
        'registry.duplicate-storage-key',
        `Duplicate storage key: ${entry.storageKey}.`,
        entry.id,
      )
    }
    storageKeys.add(entry.storageKey)

    if (
      typeof runtimeCategory !== 'string' ||
      !validCategories.has(runtimeCategory as PersistenceCategory)
    ) {
      addIssue(issues, 'registry.invalid-category', 'Registry category is invalid.', entryId)
    }
    if (typeof runtimePortable !== 'boolean') {
      addIssue(issues, 'registry.invalid-portable-policy', 'Portable policy must be boolean.', entryId)
    }
    if (runtimePortable === true && typeof runtimeNamespace !== 'string') {
      addIssue(issues, 'registry.missing-namespace', 'Portable entry requires a namespace.', entryId)
    }
    if (
      runtimePortable === true &&
      (!Number.isInteger(runtimeSchemaVersion) || (runtimeSchemaVersion as number) < 1)
    ) {
      addIssue(issues, 'registry.missing-schema-version', 'Portable entry requires a schema version.', entryId)
    }
    if (
      runtimePortable === true &&
      typeof runtimeCategory === 'string' &&
      ['secret', 'cache', 'runtime', 'derived'].includes(runtimeCategory)
    ) {
      addIssue(
        issues,
        `registry.${runtimeCategory}-portable-conflict`,
        `${runtimeCategory} entries cannot be portable.`,
        entryId,
      )
    }
  }

  for (const storageKey of expectedStorageKeys) {
    const entry = entries.find((candidate) => candidate.storageKey === storageKey)
    if (!entry) {
      addIssue(issues, 'registry.missing-storage-key', `Missing product storage key: ${storageKey}.`)
    } else if (!entry.factoryReset) {
      addIssue(
        issues,
        'registry.factory-reset-coverage',
        `Factory reset does not cover product storage key: ${storageKey}.`,
        entry.id,
      )
    }
  }

  for (const storageKey of storageKeys) {
    if (!expectedStorageKeys.includes(storageKey)) {
      addIssue(issues, 'registry.unexpected-storage-key', `Unexpected storage key: ${storageKey}.`)
    }
  }

  const language = entries.find((entry) => entry.storageKey === 'lifeboard.language')
  if (!language || !language.portable || !language.factoryReset) {
    addIssue(issues, 'registry.language-contract', 'Language must be portable and factory-resettable.')
  }

  const weatherCache = entries.find(
    (entry) => entry.storageKey === 'lifeboard.weather.forecastCache.v1',
  )
  if (!weatherCache || weatherCache.portable || weatherCache.category !== 'cache') {
    addIssue(issues, 'registry.weather-cache-contract', 'Weather forecast cache must be non-portable cache data.')
  }

  for (const credentialKey of [
    'lifeboard.weather.caiyunToken',
    'lifeboard.weather.amapKey',
  ]) {
    const credential = entries.find((entry) => entry.storageKey === credentialKey)
    if (
      !credential ||
      credential.portable ||
      credential.category !== 'secret' ||
      credential.sensitivity !== 'secret'
    ) {
      addIssue(issues, 'registry.credential-contract', `Credential must be secret and non-portable: ${credentialKey}.`)
    }
  }

  for (const deviceLocalKey of [
    'lifeboard.weather.provider',
    'lifeboard.weather.autoLocationOnHome',
  ]) {
    const deviceLocal = entries.find((entry) => entry.storageKey === deviceLocalKey)
    if (!deviceLocal || deviceLocal.portable || deviceLocal.sensitivity !== 'device-local') {
      addIssue(
        issues,
        'registry.device-local-contract',
        `Device-local preference must be non-portable: ${deviceLocalKey}.`,
      )
    }
  }

  for (const portableWeatherKey of [
    'lifeboard-weather-location',
    'lifeboard-weather-favorite-cities',
  ]) {
    const portableWeather = entries.find((entry) => entry.storageKey === portableWeatherKey)
    if (
      !portableWeather ||
      !portableWeather.portable ||
      portableWeather.portableNamespace !== 'weather'
    ) {
      addIssue(
        issues,
        'registry.weather-portable-contract',
        `Saved Weather location data must be portable: ${portableWeatherKey}.`,
      )
    }
  }

  for (const debugKey of DEVELOPMENT_ONLY_STORAGE_KEYS) {
    if (storageKeys.has(debugKey)) {
      addIssue(issues, 'registry.development-flag', `Development flag must remain excluded: ${debugKey}.`)
    }
  }

  return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) })
}

export const assertPersistenceRegistryIntegrity = (
  entries: readonly PersistenceRegistryEntry[] = PERSISTENCE_REGISTRY,
) => {
  const result = validatePersistenceRegistryDefinition(entries)
  if (!result.valid) {
    throw new Error(result.issues.map((issue) => issue.code).join(', '))
  }
}
