import {
  BOOKMARKS_PORTABLE_SCHEMA_VERSION,
  LEGACY_BACKUP_ROOT_VERSION_1,
  LEGACY_BACKUP_ROOT_VERSION_2,
  LIFEBOARD_BACKUP_FORMAT,
  LIFEBOARD_BACKUP_SCHEMA_VERSION,
  SETTINGS_PORTABLE_SCHEMA_VERSION,
  TODOS_PORTABLE_SCHEMA_VERSION,
  WEATHER_PORTABLE_SCHEMA_VERSION,
  type PortableBackupV1,
} from '@/shared/persistence'

export const validPortableBackupV1 = Object.freeze({
  format: LIFEBOARD_BACKUP_FORMAT,
  schemaVersion: LIFEBOARD_BACKUP_SCHEMA_VERSION,
  exportedAt: '2026-07-10T12:00:00.000Z',
  app: Object.freeze({ name: 'LifeBoard', version: 'fixture' }),
  locale: 'zh-CN',
  data: Object.freeze({
    settings: Object.freeze({
      schemaVersion: SETTINGS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({ themeMode: 'system', language: 'zh-CN' }),
    }),
    weather: Object.freeze({
      schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({
        selectedLocation: Object.freeze({ name: 'Fixture City', latitude: 0, longitude: 0 }),
        favoriteCities: Object.freeze([]),
      }),
    }),
    todos: Object.freeze({
      schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({
        tasks: Object.freeze([Object.freeze({ id: 'fixture-task', title: 'Fixture task' })]),
        countdowns: Object.freeze([]),
      }),
    }),
    bookmarks: Object.freeze({
      schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({
        bookmarks: Object.freeze([
          Object.freeze({ id: 'fixture-bookmark', title: 'Fixture', url: 'https://example.com' }),
        ]),
      }),
    }),
  }),
} as const satisfies PortableBackupV1)

export const emptyPortableBackupV1 = Object.freeze({
  ...validPortableBackupV1,
  exportedAt: '2026-07-10T12:01:00.000Z',
  data: Object.freeze({
    settings: validPortableBackupV1.data.settings,
    weather: Object.freeze({
      schemaVersion: WEATHER_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({ selectedLocation: null, favoriteCities: Object.freeze([]) }),
    }),
    todos: Object.freeze({
      schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({ tasks: Object.freeze([]), countdowns: Object.freeze([]) }),
    }),
    bookmarks: Object.freeze({
      schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({ bookmarks: Object.freeze([]) }),
    }),
  }),
} as const satisfies PortableBackupV1)

export const legacyRootV1Metadata = Object.freeze({
  version: LEGACY_BACKUP_ROOT_VERSION_1,
  exportedAt: '2026-07-10T11:00:00.000Z',
})

export const legacyRootV2Metadata = Object.freeze({
  version: LEGACY_BACKUP_ROOT_VERSION_2,
  exportedAt: '2026-07-10T11:30:00.000Z',
})

export const futureRootMetadata = Object.freeze({
  format: LIFEBOARD_BACKUP_FORMAT,
  schemaVersion: LIFEBOARD_BACKUP_SCHEMA_VERSION + 1,
  exportedAt: '2026-07-10T13:00:00.000Z',
})
