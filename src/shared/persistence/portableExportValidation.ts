import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
} from './constants'
import {
  containsDangerousObjectKey,
  isSafeObject,
  type ValidationModule,
  type ValidationSeverity,
} from './contracts'
import type {
  LifeBoardLocale,
  PortableBackupV1,
  PortableBookmarkV1,
  PortableBookmarksPayloadV1,
  PortableCountdownV1,
  PortableTaskV1,
  PortableTodosPayloadV1,
  PortableWeatherFavoriteCityV1,
  PortableWeatherLocationKindV1,
  PortableWeatherLocationSourceV1,
  PortableWeatherLocationV1,
  PortableWeatherPayloadV1,
  ThemeMode,
} from './types'

export type PortableExportErrorCode =
  | 'PORTABLE_STORAGE_READ_FAILED'
  | 'PORTABLE_STORAGE_PARSE_FAILED'
  | 'PORTABLE_DATA_INVALID'
  | 'PORTABLE_SERIALIZATION_FAILED'
  | 'PORTABLE_BACKUP_TOO_LARGE'
  | 'PORTABLE_DOWNLOAD_PREPARE_FAILED'

export interface PortableExportError {
  readonly code: PortableExportErrorCode
  readonly severity: ValidationSeverity
  readonly module: ValidationModule
  readonly path: string | null
  readonly message: string
  readonly userMessageKey: string
  readonly recoverable: boolean
  readonly details?: Readonly<Record<string, string | number | boolean | null>>
}

export type PortableExportResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: PortableExportError }

const TASK_TITLE_MAX_LENGTH = 120
const TASK_LABEL_MAX_LENGTH = 32
const COUNTDOWN_TITLE_MAX_LENGTH = 120
const BOOKMARK_TITLE_MAX_LENGTH = 120
const BOOKMARK_CATEGORY_MAX_LENGTH = 40
const BOOKMARK_NOTE_MAX_LENGTH = 280
const BOOKMARK_URL_MAX_LENGTH = 2_048
const RECORD_ID_MAX_LENGTH = 128
const WEATHER_TEXT_MAX_LENGTH = 512
const MAX_TASKS = 10_000
const MAX_COUNTDOWNS = 2_000
const MAX_BOOKMARKS = 10_000
const MAX_FAVORITE_CITIES = 500

const weatherLocationKinds = new Set<PortableWeatherLocationKindV1>([
  'Capital city',
  'Regional capital',
  'Country',
  'Administrative area',
  'Locality',
  'Location',
])

const weatherLocationSources = new Set<PortableWeatherLocationSourceV1>([
  'openMeteo',
  'amap',
  'amap-geolocation',
])

export const createPortableExportError = (
  code: PortableExportErrorCode,
  module: ValidationModule,
  path: string | null,
  message: string,
  options: {
    readonly recoverable?: boolean
    readonly details?: Readonly<Record<string, string | number | boolean | null>>
  } = {},
): PortableExportError =>
  Object.freeze({
    code,
    severity: options.recoverable ? 'error' : 'fatal',
    module,
    path,
    message,
    userMessageKey: `persistence.export.${code.toLowerCase()}`,
    recoverable: options.recoverable ?? false,
    ...(options.details ? { details: Object.freeze({ ...options.details }) } : {}),
  })

const success = <T>(data: T): PortableExportResult<T> => Object.freeze({ ok: true, data })

const invalid = (
  module: ValidationModule,
  path: string,
  message: string,
): PortableExportResult<never> => ({
  ok: false,
  error: createPortableExportError('PORTABLE_DATA_INVALID', module, path, message),
})

const hasOwn = (record: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(record, key)

const hasRequiredKeys = (record: Record<string, unknown>, keys: readonly string[]) =>
  keys.every((key) => hasOwn(record, key))

const hasExactKeys = (record: Record<string, unknown>, keys: readonly string[]) => {
  const actualKeys = Object.keys(record)
  return actualKeys.length === keys.length && keys.every((key) => hasOwn(record, key))
}

const hasAllowedKeys = (record: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(record).every((key) => keys.includes(key))

const isWellFormedUnicode = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false
      index += 1
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return false
    }
  }
  return true
}

const isBoundedString = (value: unknown, maximum: number, allowEmpty = false): value is string =>
  typeof value === 'string' &&
  isWellFormedUnicode(value) &&
  value.length <= maximum &&
  (allowEmpty || value.trim().length > 0)

const isNullableBoundedString = (value: unknown, maximum: number, allowEmpty = false) =>
  value === null || isBoundedString(value, maximum, allowEmpty)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isLifeBoardLocale = (value: unknown): value is LifeBoardLocale =>
  value === 'zh-CN' || value === 'en-US'

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'system' || value === 'light' || value === 'dark'

export const isCanonicalUtcTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
}

const isDateOnly = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const hasSafeTree = (value: unknown) => !containsDangerousObjectKey(value)

const weatherLocationRequiredKeys = [
  'id',
  'name',
  'kind',
  'admin1',
  'country',
  'countryCode',
  'latitude',
  'longitude',
  'elevation',
  'timezone',
] as const
const weatherLocationOptionalKeys = ['displayLabel', 'source'] as const
const weatherLocationAllowedKeys = [
  ...weatherLocationRequiredKeys,
  ...weatherLocationOptionalKeys,
] as const

export const mapPortableWeatherLocation = (
  value: unknown,
  path = '/data/weather/payload/selectedLocation',
  strictKeys = false,
): PortableExportResult<PortableWeatherLocationV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    !hasRequiredKeys(value, weatherLocationRequiredKeys) ||
    (strictKeys && !hasAllowedKeys(value, weatherLocationAllowedKeys))
  ) {
    return invalid('weather', path, 'Saved Weather location has an invalid object shape.')
  }

  const validId =
    (isFiniteNumber(value.id) || isBoundedString(value.id, RECORD_ID_MAX_LENGTH)) &&
    !(typeof value.id === 'string' && value.id.length > RECORD_ID_MAX_LENGTH)
  const validKind =
    typeof value.kind === 'string' &&
    weatherLocationKinds.has(value.kind as PortableWeatherLocationKindV1)
  const validSource =
    !hasOwn(value, 'source') ||
    (typeof value.source === 'string' &&
      weatherLocationSources.has(value.source as PortableWeatherLocationSourceV1))

  if (
    !validId ||
    !isBoundedString(value.name, WEATHER_TEXT_MAX_LENGTH) ||
    !validKind ||
    !isNullableBoundedString(value.admin1, WEATHER_TEXT_MAX_LENGTH, true) ||
    !isBoundedString(value.country, WEATHER_TEXT_MAX_LENGTH, true) ||
    !isBoundedString(value.countryCode, 32, true) ||
    !isFiniteNumber(value.latitude) ||
    value.latitude < -90 ||
    value.latitude > 90 ||
    !isFiniteNumber(value.longitude) ||
    value.longitude < -180 ||
    value.longitude > 180 ||
    !(value.elevation === null || isFiniteNumber(value.elevation)) ||
    !isBoundedString(value.timezone, 128) ||
    (hasOwn(value, 'displayLabel') &&
      !isBoundedString(value.displayLabel, WEATHER_TEXT_MAX_LENGTH, true)) ||
    !validSource
  ) {
    return invalid('weather', path, 'Saved Weather location contains invalid fields.')
  }

  const location = Object.freeze({
    id: value.id as number | string,
    name: value.name,
    kind: value.kind as PortableWeatherLocationKindV1,
    admin1: value.admin1 as string | null,
    country: value.country,
    countryCode: value.countryCode,
    latitude: value.latitude,
    longitude: value.longitude,
    elevation: value.elevation as number | null,
    timezone: value.timezone,
    ...(hasOwn(value, 'displayLabel') ? { displayLabel: value.displayLabel as string } : {}),
    ...(hasOwn(value, 'source')
      ? { source: value.source as PortableWeatherLocationSourceV1 }
      : {}),
  })

  return success(location)
}

const favoriteCityKeys = [
  'id',
  'name',
  'region',
  'country',
  'latitude',
  'longitude',
  'displayLabel',
  'createdAt',
  'updatedAt',
] as const

const mapFavoriteCity = (
  value: unknown,
  path: string,
  strictKeys: boolean,
): PortableExportResult<PortableWeatherFavoriteCityV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    !hasRequiredKeys(value, favoriteCityKeys) ||
    (strictKeys && !hasExactKeys(value, favoriteCityKeys)) ||
    !isBoundedString(value.id, RECORD_ID_MAX_LENGTH) ||
    !isBoundedString(value.name, WEATHER_TEXT_MAX_LENGTH) ||
    !isNullableBoundedString(value.region, WEATHER_TEXT_MAX_LENGTH, true) ||
    !isBoundedString(value.country, WEATHER_TEXT_MAX_LENGTH) ||
    !isFiniteNumber(value.latitude) ||
    value.latitude < -90 ||
    value.latitude > 90 ||
    !isFiniteNumber(value.longitude) ||
    value.longitude < -180 ||
    value.longitude > 180 ||
    !isBoundedString(value.displayLabel, WEATHER_TEXT_MAX_LENGTH) ||
    !isCanonicalUtcTimestamp(value.createdAt) ||
    !isCanonicalUtcTimestamp(value.updatedAt)
  ) {
    return invalid('weather', path, 'A favorite Weather city contains invalid fields.')
  }

  return success(
    Object.freeze({
      id: value.id,
      name: value.name,
      region: value.region as string | null,
      country: value.country,
      latitude: value.latitude,
      longitude: value.longitude,
      displayLabel: value.displayLabel,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }),
  )
}

const taskRawKeys = [
  'id',
  'title',
  'dueDate',
  'label',
  'completedAt',
  'createdAt',
  'updatedAt',
] as const
const taskOutputKeys = [...taskRawKeys, 'deletedAt'] as const

const mapTask = (
  value: unknown,
  path: string,
  strictKeys: boolean,
): PortableExportResult<PortableTaskV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    !hasRequiredKeys(value, taskRawKeys) ||
    (strictKeys && !hasExactKeys(value, taskOutputKeys)) ||
    !isBoundedString(value.id, RECORD_ID_MAX_LENGTH) ||
    !isBoundedString(value.title, TASK_TITLE_MAX_LENGTH) ||
    !(value.dueDate === null || isDateOnly(value.dueDate)) ||
    !isNullableBoundedString(value.label, TASK_LABEL_MAX_LENGTH, true) ||
    !(value.completedAt === null || isCanonicalUtcTimestamp(value.completedAt)) ||
    !(
      !hasOwn(value, 'deletedAt') ||
      value.deletedAt === null ||
      isCanonicalUtcTimestamp(value.deletedAt)
    ) ||
    !isCanonicalUtcTimestamp(value.createdAt) ||
    !isCanonicalUtcTimestamp(value.updatedAt)
  ) {
    return invalid('todos', path, 'A task contains invalid fields.')
  }

  return success(
    Object.freeze({
      id: value.id,
      title: value.title,
      dueDate: value.dueDate as string | null,
      label: value.label as string | null,
      completedAt: value.completedAt as string | null,
      deletedAt: (value.deletedAt as string | null | undefined) ?? null,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }),
  )
}

const countdownKeys = ['id', 'title', 'targetDate', 'createdAt', 'updatedAt'] as const

const mapCountdown = (
  value: unknown,
  path: string,
  strictKeys: boolean,
): PortableExportResult<PortableCountdownV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    !hasRequiredKeys(value, countdownKeys) ||
    (strictKeys && !hasExactKeys(value, countdownKeys)) ||
    !isBoundedString(value.id, RECORD_ID_MAX_LENGTH) ||
    !isBoundedString(value.title, COUNTDOWN_TITLE_MAX_LENGTH) ||
    !isDateOnly(value.targetDate) ||
    !isCanonicalUtcTimestamp(value.createdAt) ||
    !isCanonicalUtcTimestamp(value.updatedAt)
  ) {
    return invalid('todos', path, 'A countdown contains invalid fields.')
  }

  return success(
    Object.freeze({
      id: value.id,
      title: value.title,
      targetDate: value.targetDate,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }),
  )
}

const isValidBookmarkUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > BOOKMARK_URL_MAX_LENGTH) return false
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0 &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

const bookmarkKeys = [
  'id',
  'title',
  'url',
  'category',
  'note',
  'pinned',
  'createdAt',
  'updatedAt',
] as const

const mapBookmark = (
  value: unknown,
  path: string,
  strictKeys: boolean,
): PortableExportResult<PortableBookmarkV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    !hasRequiredKeys(value, bookmarkKeys) ||
    (strictKeys && !hasExactKeys(value, bookmarkKeys)) ||
    !isBoundedString(value.id, RECORD_ID_MAX_LENGTH) ||
    !isBoundedString(value.title, BOOKMARK_TITLE_MAX_LENGTH) ||
    !isValidBookmarkUrl(value.url) ||
    !isNullableBoundedString(value.category, BOOKMARK_CATEGORY_MAX_LENGTH, true) ||
    !isNullableBoundedString(value.note, BOOKMARK_NOTE_MAX_LENGTH, true) ||
    typeof value.pinned !== 'boolean' ||
    !isCanonicalUtcTimestamp(value.createdAt) ||
    !isCanonicalUtcTimestamp(value.updatedAt)
  ) {
    return invalid('bookmarks', path, 'A bookmark contains invalid fields.')
  }

  return success(
    Object.freeze({
      id: value.id,
      title: value.title,
      url: value.url,
      category: value.category as string | null,
      note: value.note as string | null,
      pinned: value.pinned,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }),
  )
}

const mapUniqueCollection = <T extends { readonly id: string }>(
  values: readonly unknown[],
  maximum: number,
  path: string,
  module: ValidationModule,
  mapper: (value: unknown, path: string) => PortableExportResult<T>,
): PortableExportResult<readonly T[]> => {
  if (values.length > maximum) {
    return invalid(module, path, 'A portable collection exceeds its supported item limit.')
  }

  const ids = new Set<string>()
  const output: T[] = []
  for (let index = 0; index < values.length; index += 1) {
    const result = mapper(values[index], `${path}/${index}`)
    if (!result.ok) return result
    const id = result.data.id
    if (ids.has(id)) {
      return invalid(module, path, 'A portable collection contains duplicate IDs.')
    }
    ids.add(id)
    output.push(result.data)
  }
  return success(Object.freeze(output))
}

export const mapPortableWeatherFavoritesEnvelope = (
  value: unknown,
): PortableExportResult<readonly PortableWeatherFavoriteCityV1[]> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    value.version !== 1 ||
    !Array.isArray(value.favoriteCities)
  ) {
    return invalid('weather', '/data/weather/payload/favoriteCities', 'Saved favorite cities have an invalid envelope.')
  }

  return mapUniqueCollection(
    value.favoriteCities,
    MAX_FAVORITE_CITIES,
    '/data/weather/payload/favoriteCities',
    'weather',
    (item, path) => mapFavoriteCity(item, path, false),
  )
}

export const mapPortableTodosEnvelope = (
  value: unknown,
): PortableExportResult<PortableTodosPayloadV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    value.version !== 1 ||
    !Array.isArray(value.tasks) ||
    !Array.isArray(value.countdowns)
  ) {
    return invalid('todos', '/data/todos/payload', 'Saved planning data has an invalid envelope.')
  }

  const tasks = mapUniqueCollection(
    value.tasks,
    MAX_TASKS,
    '/data/todos/payload/tasks',
    'todos',
    (item, path) => mapTask(item, path, false),
  )
  if (!tasks.ok) return tasks

  const countdowns = mapUniqueCollection(
    value.countdowns,
    MAX_COUNTDOWNS,
    '/data/todos/payload/countdowns',
    'todos',
    (item, path) => mapCountdown(item, path, false),
  )
  if (!countdowns.ok) return countdowns

  return success(Object.freeze({ tasks: tasks.data, countdowns: countdowns.data }))
}

export const mapPortableBookmarksEnvelope = (
  value: unknown,
): PortableExportResult<PortableBookmarksPayloadV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    value.version !== 1 ||
    !Array.isArray(value.bookmarks)
  ) {
    return invalid('bookmarks', '/data/bookmarks/payload', 'Saved bookmarks have an invalid envelope.')
  }

  const bookmarks = mapUniqueCollection(
    value.bookmarks,
    MAX_BOOKMARKS,
    '/data/bookmarks/payload/bookmarks',
    'bookmarks',
    (item, path) => mapBookmark(item, path, false),
  )
  return bookmarks.ok
    ? success(Object.freeze({ bookmarks: bookmarks.data }))
    : bookmarks
}

const validateStrictWeatherPayload = (
  value: unknown,
): PortableExportResult<PortableWeatherPayloadV1> => {
  if (
    !isSafeObject(value) ||
    !hasExactKeys(value, ['selectedLocation', 'favoriteCities']) ||
    !Array.isArray(value.favoriteCities)
  ) {
    return invalid('weather', '/data/weather/payload', 'Portable Weather payload is incomplete.')
  }

  let selectedLocation: PortableWeatherLocationV1 | null = null
  if (value.selectedLocation !== null) {
    const location = mapPortableWeatherLocation(value.selectedLocation, '/data/weather/payload/selectedLocation', true)
    if (!location.ok) return location
    selectedLocation = location.data
  }

  const favorites = mapUniqueCollection(
    value.favoriteCities,
    MAX_FAVORITE_CITIES,
    '/data/weather/payload/favoriteCities',
    'weather',
    (item, path) => mapFavoriteCity(item, path, true),
  )
  if (!favorites.ok) return favorites

  return success(Object.freeze({ selectedLocation, favoriteCities: favorites.data }))
}

const validateStrictTodosPayload = (
  value: unknown,
): PortableExportResult<PortableTodosPayloadV1> => {
  if (
    !isSafeObject(value) ||
    !hasExactKeys(value, ['tasks', 'countdowns']) ||
    !Array.isArray(value.tasks) ||
    !Array.isArray(value.countdowns)
  ) {
    return invalid('todos', '/data/todos/payload', 'Portable Todos payload is incomplete.')
  }

  const tasks = mapUniqueCollection(value.tasks, MAX_TASKS, '/data/todos/payload/tasks', 'todos', (item, path) => mapTask(item, path, true))
  if (!tasks.ok) return tasks
  const countdowns = mapUniqueCollection(value.countdowns, MAX_COUNTDOWNS, '/data/todos/payload/countdowns', 'todos', (item, path) => mapCountdown(item, path, true))
  if (!countdowns.ok) return countdowns
  return success(Object.freeze({ tasks: tasks.data, countdowns: countdowns.data }))
}

const validateStrictBookmarksPayload = (
  value: unknown,
): PortableExportResult<PortableBookmarksPayloadV1> => {
  if (
    !isSafeObject(value) ||
    !hasExactKeys(value, ['bookmarks']) ||
    !Array.isArray(value.bookmarks)
  ) {
    return invalid('bookmarks', '/data/bookmarks/payload', 'Portable Bookmarks payload is incomplete.')
  }
  const bookmarks = mapUniqueCollection(value.bookmarks, MAX_BOOKMARKS, '/data/bookmarks/payload/bookmarks', 'bookmarks', (item, path) => mapBookmark(item, path, true))
  return bookmarks.ok
    ? success(Object.freeze({ bookmarks: bookmarks.data }))
    : bookmarks
}

const readModulePayload = (
  value: unknown,
  version: number,
  module: ValidationModule,
  path: string,
): PortableExportResult<unknown> => {
  if (
    !isSafeObject(value) ||
    !hasExactKeys(value, ['schemaVersion', 'payload']) ||
    value.schemaVersion !== version
  ) {
    return invalid(module, path, 'Portable module envelope is incomplete or has the wrong version.')
  }
  return success(value.payload)
}

export const validatePortableBackupV1 = (
  value: unknown,
): PortableExportResult<PortableBackupV1> => {
  if (
    !isSafeObject(value) ||
    !hasSafeTree(value) ||
    !hasExactKeys(value, ['format', 'schemaVersion', 'exportedAt', 'app', 'locale', 'data']) ||
    value.format !== LIFEBOARD_BACKUP_FORMAT ||
    value.schemaVersion !== LIFEBOARD_BACKUP_SCHEMA_VERSION ||
    !isCanonicalUtcTimestamp(value.exportedAt) ||
    !isLifeBoardLocale(value.locale)
  ) {
    return invalid('root', '/', 'Portable backup root metadata is invalid.')
  }

  if (
    !isSafeObject(value.app) ||
    !hasExactKeys(value.app, ['name', 'version']) ||
    value.app.name !== 'LifeBoard' ||
    !isBoundedString(value.app.version, 128)
  ) {
    return invalid('root', '/app', 'Portable backup application metadata is invalid.')
  }

  if (
    !isSafeObject(value.data) ||
    !hasExactKeys(value.data, ['settings', 'weather', 'todos', 'bookmarks'])
  ) {
    return invalid('root', '/data', 'Portable backup namespaces are incomplete.')
  }

  const settings = readModulePayload(value.data.settings, SETTINGS_PORTABLE_SCHEMA_VERSION, 'settings', '/data/settings')
  if (!settings.ok) return settings
  if (
    !isSafeObject(settings.data) ||
    !hasExactKeys(settings.data, ['themeMode', 'language']) ||
    !isThemeMode(settings.data.themeMode) ||
    !isLifeBoardLocale(settings.data.language) ||
    settings.data.language !== value.locale
  ) {
    return invalid('settings', '/data/settings/payload', 'Portable Settings payload is invalid.')
  }

  const weather = readModulePayload(value.data.weather, WEATHER_PORTABLE_SCHEMA_VERSION, 'weather', '/data/weather')
  if (!weather.ok) return weather
  const validatedWeather = validateStrictWeatherPayload(weather.data)
  if (!validatedWeather.ok) return validatedWeather

  const todos = readModulePayload(value.data.todos, TODOS_PORTABLE_SCHEMA_VERSION, 'todos', '/data/todos')
  if (!todos.ok) return todos
  const validatedTodos = validateStrictTodosPayload(todos.data)
  if (!validatedTodos.ok) return validatedTodos

  const bookmarks = readModulePayload(value.data.bookmarks, BOOKMARKS_PORTABLE_SCHEMA_VERSION, 'bookmarks', '/data/bookmarks')
  if (!bookmarks.ok) return bookmarks
  const validatedBookmarks = validateStrictBookmarksPayload(bookmarks.data)
  if (!validatedBookmarks.ok) return validatedBookmarks

  return success(value as unknown as PortableBackupV1)
}
