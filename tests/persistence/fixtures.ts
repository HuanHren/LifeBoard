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
        selectedLocation: Object.freeze({
          id: 'fixture-city',
          name: 'Fixture City',
          kind: 'Locality',
          admin1: 'Fixture Region',
          country: 'Fixture Country',
          countryCode: 'FC',
          latitude: 0,
          longitude: 0,
          elevation: null,
          timezone: 'UTC',
        }),
        favoriteCities: Object.freeze([]),
      }),
    }),
    todos: Object.freeze({
      schemaVersion: TODOS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({
        tasks: Object.freeze([
          Object.freeze({
            id: 'fixture-task',
            title: 'Fixture task',
            dueDate: null,
            label: null,
            completedAt: null,
            deletedAt: null,
            createdAt: '2026-07-10T10:00:00.000Z',
            updatedAt: '2026-07-10T10:00:00.000Z',
          }),
        ]),
        countdowns: Object.freeze([]),
      }),
    }),
    bookmarks: Object.freeze({
      schemaVersion: BOOKMARKS_PORTABLE_SCHEMA_VERSION,
      payload: Object.freeze({
        bookmarks: Object.freeze([
          Object.freeze({
            id: 'fixture-bookmark',
            title: 'Fixture',
            url: 'https://example.com/',
            category: null,
            note: null,
            pinned: false,
            createdAt: '2026-07-10T10:00:00.000Z',
            updatedAt: '2026-07-10T10:00:00.000Z',
          }),
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

export const portableFixtureTimestamp = '2026-07-12T06:30:00.000Z'

const fixtureLocation = {
  id: 'fixture-shanghai',
  name: '上海',
  kind: 'Locality',
  admin1: '上海',
  country: '中国',
  countryCode: 'CN',
  latitude: 31.2304,
  longitude: 121.4737,
  elevation: 4,
  timezone: 'Asia/Shanghai',
  displayLabel: '上海，中国',
  source: 'openMeteo',
  internalOnly: 'OMIT_LOCATION_INTERNAL',
}

const fixtureFavorite = {
  id: 'favorite-shanghai',
  name: '上海',
  region: '上海',
  country: '中国',
  latitude: 31.2304,
  longitude: 121.4737,
  displayLabel: '上海，中国',
  createdAt: '2026-07-10T08:00:00.000Z',
  updatedAt: '2026-07-11T08:00:00.000Z',
  internalOnly: 'OMIT_FAVORITE_INTERNAL',
}

const fixtureTask = {
  id: 'task-alpha',
  title: '整理照片',
  dueDate: '2026-07-20',
  label: '生活',
  completedAt: null,
  deletedAt: null,
  createdAt: '2026-07-10T09:00:00.000Z',
  updatedAt: '2026-07-11T09:00:00.000Z',
  internalOnly: 'OMIT_TASK_INTERNAL',
}

const fixtureCountdown = {
  id: 'countdown-alpha',
  title: '项目节点',
  targetDate: '2026-08-01',
  createdAt: '2026-07-10T09:30:00.000Z',
  updatedAt: '2026-07-11T09:30:00.000Z',
  internalOnly: 'OMIT_COUNTDOWN_INTERNAL',
}

const fixtureBookmark = {
  id: 'bookmark-alpha',
  title: '示例资料',
  url: 'https://example.com/reference',
  category: '资料',
  note: '用于单元测试的公开示例。',
  pinned: true,
  createdAt: '2026-07-10T10:00:00.000Z',
  updatedAt: '2026-07-11T10:00:00.000Z',
  internalOnly: 'OMIT_BOOKMARK_INTERNAL',
}

export const validPortableExportStorage: Readonly<Record<string, string>> = Object.freeze({
  'lifeboard-theme': 'dark',
  'lifeboard.language': 'zh-CN',
  'lifeboard-weather-location': JSON.stringify(fixtureLocation),
  'lifeboard-weather-favorite-cities': JSON.stringify({
    version: 1,
    favoriteCities: [fixtureFavorite],
    internalOnly: 'OMIT_FAVORITES_ENVELOPE_INTERNAL',
  }),
  'lifeboard.todos': JSON.stringify({
    version: 1,
    tasks: [fixtureTask],
    countdowns: [fixtureCountdown],
    internalOnly: 'OMIT_TODOS_ENVELOPE_INTERNAL',
  }),
  'lifeboard.bookmarks': JSON.stringify({
    version: 1,
    bookmarks: [fixtureBookmark],
    internalOnly: 'OMIT_BOOKMARKS_ENVELOPE_INTERNAL',
  }),
})

export const emptyPortableExportStorage: Readonly<Record<string, string>> = Object.freeze({})

export const allPortableAndExcludedStorage: Readonly<Record<string, string>> = Object.freeze({
  ...validPortableExportStorage,
  'lifeboard.weather.forecastCache.v1': 'EXCLUDED_FORECAST_CACHE',
  'lifeboard.weather.provider': 'EXCLUDED_PROVIDER_VALUE',
  'lifeboard.weather.caiyunToken': 'EXCLUDED_CAIYUN_TOKEN',
  'lifeboard.weather.amapKey': 'EXCLUDED_AMAP_KEY',
  'lifeboard.weather.autoLocationOnHome': 'EXCLUDED_AUTO_LOCATION',
  __lifeboard_weather_runtime_debug: 'EXCLUDED_DEBUG_FLAG',
})

export const corruptTodosStorage = Object.freeze({
  ...validPortableExportStorage,
  'lifeboard.todos': '{',
})

export const corruptBookmarksStorage = Object.freeze({
  ...validPortableExportStorage,
  'lifeboard.bookmarks': JSON.stringify({ version: 1, bookmarks: 'invalid' }),
})

export const invalidLanguageStorage = Object.freeze({
  ...validPortableExportStorage,
  'lifeboard.language': 'fr-FR',
})

export const duplicateTaskIdStorage = Object.freeze({
  ...validPortableExportStorage,
  'lifeboard.todos': JSON.stringify({
    version: 1,
    tasks: [fixtureTask, { ...fixtureTask, title: '重复任务' }],
    countdowns: [],
  }),
})

export const createOversizedPortableExportStorage = (): Readonly<Record<string, string>> => {
  const bookmarks = Array.from({ length: 1_500 }, (_, index) => ({
    id: `oversized-bookmark-${index}`,
    title: `Fixture ${index}`,
    url: `https://example.com/${index}`,
    category: 'fixture',
    note: '数'.repeat(280),
    pinned: false,
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
  }))

  return Object.freeze({
    ...validPortableExportStorage,
    'lifeboard.bookmarks': JSON.stringify({ version: 1, bookmarks }),
  })
}

const portableLocation = validPortableBackupV1.data.weather.payload.selectedLocation

export const validLegacyBackupV1 = Object.freeze({
  version: LEGACY_BACKUP_ROOT_VERSION_1,
  exportedAt: '2026-07-10T11:00:00.000Z',
  preferences: Object.freeze({ themeMode: 'light' }),
  weather: Object.freeze({ selectedLocation: portableLocation }),
  todos: Object.freeze({
    version: 1,
    tasks: validPortableBackupV1.data.todos.payload.tasks,
    countdowns: validPortableBackupV1.data.todos.payload.countdowns,
  }),
  bookmarks: Object.freeze({
    version: 1,
    bookmarks: validPortableBackupV1.data.bookmarks.payload.bookmarks,
  }),
} as const)

export const validLegacyBackupV2 = Object.freeze({
  ...validLegacyBackupV1,
  version: LEGACY_BACKUP_ROOT_VERSION_2,
  exportedAt: '2026-07-10T11:30:00.000Z',
  weather: Object.freeze({
    selectedLocation: portableLocation,
    favoriteCities: Object.freeze([
      Object.freeze({
        id: 'legacy-favorite',
        name: 'Fixture City',
        region: 'Fixture Region',
        country: 'Fixture Country',
        latitude: 0,
        longitude: 0,
        displayLabel: 'Fixture City, Fixture Country',
        createdAt: '2026-07-10T08:00:00.000Z',
        updatedAt: '2026-07-10T08:00:00.000Z',
      }),
    ]),
  }),
} as const)

export const nonPortableSentinelStorage = Object.freeze({
  'lifeboard.weather.forecastCache.v1': 'SENTINEL_FORECAST_CACHE',
  'lifeboard.weather.provider': 'SENTINEL_PROVIDER',
  'lifeboard.weather.caiyunToken': 'SENTINEL_CAIYUN_TOKEN',
  'lifeboard.weather.amapKey': 'SENTINEL_AMAP_KEY',
  'lifeboard.weather.autoLocationOnHome': 'SENTINEL_AUTO_LOCATION',
  __lifeboard_weather_runtime_debug: 'SENTINEL_DEBUG',
})

export const originalPortableStorage = Object.freeze({
  'lifeboard-theme': 'system',
  'lifeboard.language': 'en-US',
  'lifeboard-weather-location': '{"old":"location"}',
  'lifeboard-weather-favorite-cities': '{"old":"favorites"}',
  'lifeboard.todos': '{"old":"todos"}',
  'lifeboard.bookmarks': '{"old":"bookmarks"}',
  ...nonPortableSentinelStorage,
})
