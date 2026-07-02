import type { TranslationCatalog } from '@/i18n/keys'
import { enUSModules } from '@/i18n/locales/en-US-modules'

export const enUS = {
  'shell.skipToMain': 'Skip to main content',
  'shell.sidebar.primaryLabel': 'Primary',
  'shell.sidebar.mainSectionsLabel': 'Main sections',
  'shell.sidebar.tagline': 'Personal daily workspace',
  'shell.sidebar.footer': 'Local-first by design. Saved data stays in this browser.',
  'shell.app.primaryLabel': 'Application sections',
  'shell.landing.primaryLabel': 'Product entry points',
  'shell.landing.openMenu': 'Open navigation menu',
  'shell.landing.closeMenu': 'Close navigation menu',
  'shell.landing.menuLabel': 'LifeBoard navigation',
  'shell.mobile.primaryLabel': 'Mobile primary',
  'shell.theme.appearance': 'Appearance',
  'shell.theme.system': 'System',
  'shell.theme.light': 'Light',
  'shell.theme.dark': 'Dark',
  'shell.theme.changeLabel': 'Theme mode: {mode}. Change theme mode',
  'navigation.home.label': 'Home',
  'navigation.home.description': 'Daily overview',
  'navigation.landing.label': 'Product',
  'navigation.landing.description': 'LifeBoard introduction',
  'navigation.workspace.label': 'Workspace',
  'navigation.workspace.description': 'Daily overview',
  'navigation.weather.label': 'Weather',
  'navigation.weather.description': 'Local conditions',
  'navigation.todos.label': 'Todos',
  'navigation.todos.description': 'Task planning',
  'navigation.tools.label': 'Tools',
  'navigation.tools.description': 'Everyday utilities',
  'navigation.bookmarks.label': 'Bookmarks',
  'navigation.bookmarks.description': 'Saved references',
  'navigation.settings.label': 'Settings',
  'navigation.settings.description': 'Appearance and layout',
  'navigation.more.label': 'More',
  'navigation.more.appearanceLanguage': 'Appearance and language',
  'navigation.more.dataManagement': 'Data management',
  'navigation.more.about': 'About LifeBoard',
  'settings.page.title': 'Settings',
  'settings.page.description':
    "Manage this browser's appearance, language, local data, privacy, and portable LifeBoard backup.",
  'settings.section.appearance.title': 'Appearance',
  'settings.section.appearance.description':
    'A browser-local preference that follows you only on this device.',
  'settings.section.language.title': 'Language',
  'settings.section.language.description':
    'Choose the interface language and download the built-in translation source.',
  'settings.section.weatherProvider.title': 'Weather preferences',
  'settings.section.weatherProvider.description':
    'Choose a preferred weather source and manage browser-local Caiyun token storage.',
  'settings.section.locationServices.title': 'Weather location services',
  'settings.section.locationServices.description':
    'Manage optional AMap geocoding and current-location behavior for Weather.',
  'settings.section.dataSources.title': 'Weather data sources',
  'settings.section.dataSources.description':
    'Review which services LifeBoard uses for weather, location lookup, air quality, and attribution.',
  'settings.section.localData.title': 'Local data',
  'settings.section.localData.description':
    'A direct view of what LifeBoard currently keeps in this browser.',
  'settings.section.backup.title': 'Backup and restore',
  'settings.section.backup.description':
    'Move your local LifeBoard data with a file you control.',
  'settings.section.exports.title': 'Portable exports',
  'settings.section.exports.description':
    'Create readable local files for archiving, printing, notes, spreadsheets, and manual moves.',
  'settings.section.privacy.title': 'Privacy',
  'settings.section.privacy.description':
    'LifeBoard keeps its local boundary explicit.',
  'settings.section.clearData.title': 'Clear local data',
  'settings.section.clearData.description':
    'Remove only the LifeBoard data you choose. Each destructive action asks first.',
  'settings.theme.legend': 'Theme mode',
  'settings.theme.helper': 'Choose how LifeBoard appears on this browser.',
  'settings.theme.systemDescription': 'Follow this device preference.',
  'settings.theme.lightDescription': 'Use the light LifeBoard palette.',
  'settings.theme.darkDescription': 'Use the dark LifeBoard palette.',
  'settings.theme.storageError':
    'The theme preference could not be saved in this browser.',
  'settings.language.legend': 'Interface language',
  'settings.language.helper':
    'This preference is stored only in this browser and applies immediately.',
  'settings.language.chineseName': 'Simplified Chinese',
  'settings.language.englishName': 'English (United States)',
  'settings.language.chineseDescription': 'Use the Simplified Chinese interface.',
  'settings.language.englishDescription': 'Use the United States English interface.',
  'settings.language.saved': 'Language changed to {language}.',
  'settings.language.storageError':
    'The language preference could not be saved in this browser.',
  'settings.translationExport.title': 'Translation source',
  'settings.translationExport.description':
    'Download the built-in Chinese and English interface strings as JSON.',
  'settings.translationExport.privacy':
    'The file contains static application copy only. It does not include tasks, bookmarks, URLs, notes, weather data, or backups.',
  'settings.translationExport.action': 'Download translation source',
  'settings.translationExport.success': 'Translation source downloaded.',
  'settings.translationExport.error':
    'The translation source could not be created or downloaded.',
  'settings.weatherProvider.legend': 'Forecast provider preference',
  'settings.weatherProvider.helper':
    'Choose whether Weather loads forecasts from Open-Meteo or Caiyun Weather on this browser.',
  'settings.weatherProvider.openMeteoLabel': 'Open-Meteo',
  'settings.weatherProvider.openMeteoDescription':
    'No token required. City search and forecasts can use Open-Meteo.',
  'settings.weatherProvider.caiyunLabel': 'Caiyun Weather',
  'settings.weatherProvider.caiyunDescription':
    'Requires a token you provide. Forecast requests use the selected city coordinates.',
  'settings.weatherProvider.tokenLabel': 'Caiyun token',
  'settings.weatherProvider.tokenHelper':
    'Enter a token only if you already have one. It is saved only in this browser and is never shown in full.',
  'settings.weatherProvider.saveToken': 'Save token',
  'settings.weatherProvider.clearToken': 'Clear token',
  'settings.weatherProvider.tokenSavedState': 'A Caiyun token is saved in this browser.',
  'settings.weatherProvider.tokenMissingState': 'No Caiyun token is saved.',
  'settings.weatherProvider.privacy':
    'The token is excluded from LifeBoard backup files, portable exports, and translation source exports. LifeBoard is frontend-only, so a browser-used token can be visible to this browser user through DevTools Network.',
  'settings.weatherProvider.dismiss': 'Dismiss',
  'settings.weatherProvider.message.providerSaved': 'Weather provider preference saved.',
  'settings.weatherProvider.message.tokenSaved': 'Caiyun token saved in this browser.',
  'settings.weatherProvider.message.tokenCleared': 'Caiyun token cleared from this browser.',
  'settings.weatherProvider.error.storage':
    'Weather provider preferences could not be saved in this browser. Check local storage access and try again.',
  'settings.weatherProvider.error.emptyToken': 'Enter a Caiyun token before saving.',
  'settings.weatherProvider.error.invalidProvider':
    'The saved weather provider preference is invalid. Open-Meteo is being used.',
  'settings.locationServices.amapKeyLabel': 'AMap Web Service Key',
  'settings.locationServices.amapKeyHelper':
    'Enter an AMap Web Service Key only if you already have one. It is saved only in this browser and is never displayed in full.',
  'settings.locationServices.saveAmapKey': 'Save AMap key',
  'settings.locationServices.clearAmapKey': 'Clear AMap key',
  'settings.locationServices.amapKeySavedState': 'An AMap key is saved in this browser.',
  'settings.locationServices.amapKeyMissingState': 'No AMap key is saved.',
  'settings.locationServices.autoLocationLabel': 'Use current location on Home',
  'settings.locationServices.autoLocationHelper':
    'When enabled, Home may ask once for browser location permission to load local weather. LifeBoard does not use background tracking.',
  'settings.locationServices.privacy':
    'The AMap key stays in this browser and is sent only to LifeBoard same-origin API routes when geocoding or reverse geocoding is used. It is excluded from backups, Markdown/CSV exports, and translation source exports.',
  'settings.locationServices.message.amapKeySaved': 'AMap key saved in this browser.',
  'settings.locationServices.message.amapKeyCleared': 'AMap key cleared from this browser.',
  'settings.locationServices.message.autoLocationSaved':
    'Home current-location preference saved.',
  'settings.locationServices.error.storage':
    'Weather location service preferences could not be saved in this browser.',
  'settings.locationServices.error.emptyAmapKey': 'Enter an AMap key before saving.',
  'settings.dataSources.pageTitle': 'Weather data sources',
  'settings.dataSources.pageDescription':
    'See the weather services LifeBoard currently uses, what each one provides, and which optional credentials are configured.',
  'settings.dataSources.backToSettings': 'Back to Settings',
  'settings.dataSources.entryTitle': 'Weather source details',
  'settings.dataSources.entryDescription':
    'Open a source and status view for forecast providers, air quality, location lookup, alert capability, and attribution.',
  'settings.dataSources.entryAction': 'View data sources',
  'settings.dataSources.weatherAttributionPrefix': ' Source details:',
  'settings.dataSources.weatherAttributionLink': 'Data sources',
  'settings.dataSources.privacyTitle': 'Local-first source status',
  'settings.dataSources.privacyDescription':
    'This page reads the current Settings and Weather state only. It does not ping providers, store credentials, expose tokens or keys, or add backup and export fields.',
  'settings.dataSources.section.active': 'Active configuration',
  'settings.dataSources.section.activeDescription':
    'Preferred provider and loaded provider are shown separately because fallback can happen.',
  'settings.dataSources.section.forecast': 'Weather and forecast',
  'settings.dataSources.section.forecastDescription':
    'Only implemented forecast sources are listed here. Returned daily length comes from the currently loaded snapshot.',
  'settings.dataSources.section.airQuality': 'Air quality',
  'settings.dataSources.section.airQualityDescription':
    'LifeBoard uses Open-Meteo as the Air Quality API surface and shows CAMS as the underlying model provider.',
  'settings.dataSources.section.location': 'Location services',
  'settings.dataSources.section.locationDescription':
    'AMap is used only for geocoding, reverse geocoding, and current-location display-name resolution when configured.',
  'settings.dataSources.section.alerts': 'Alert availability',
  'settings.dataSources.section.alertsDescription':
    'Alert status is shown only from current in-memory state. This page does not verify alert entitlement.',
  'settings.dataSources.section.licences': 'Licences and attribution',
  'settings.dataSources.summary.preferredForecastProvider': 'Preferred forecast provider',
  'settings.dataSources.summary.loadedForecastProvider': 'Loaded forecast provider',
  'settings.dataSources.summary.selectedLocation': 'Selected weather location',
  'settings.dataSources.summary.caiyunConfiguration': 'Caiyun configuration',
  'settings.dataSources.summary.amapConfiguration': 'AMap configuration',
  'settings.dataSources.summary.airQualitySource': 'Air-quality source',
  'settings.dataSources.summary.alertCapability': 'Alert capability',
  'settings.dataSources.summary.longRangeLength': 'Long-range forecast length',
  'settings.dataSources.status.active': 'Active',
  'settings.dataSources.status.available': 'Available',
  'settings.dataSources.status.configured': 'Configured',
  'settings.dataSources.status.notConfigured': 'Not configured',
  'settings.dataSources.status.currentlyLoaded': 'Currently loaded',
  'settings.dataSources.status.fallbackActive': 'Fallback active',
  'settings.dataSources.status.notChecked': 'Not checked',
  'settings.dataSources.status.permissionUnavailable': 'Permission unavailable',
  'settings.dataSources.status.noActiveAlert': 'No active alert',
  'settings.dataSources.status.dataUnavailable': 'Data unavailable',
  'settings.dataSources.status.caiyunNotConfigured': 'Caiyun not configured',
  'settings.dataSources.status.currentResponseDays':
    'Current response returned {count} days',
  'settings.dataSources.status.observedAt': 'Observed {time} {timezone}',
  'settings.dataSources.domain.forecast': 'Forecast',
  'settings.dataSources.domain.current': 'Current weather',
  'settings.dataSources.domain.precipitationNowcast': 'Short-term precipitation',
  'settings.dataSources.domain.airQuality': 'Air-quality API surface',
  'settings.dataSources.domain.alerts': 'Weather alerts',
  'settings.dataSources.domain.longRange': 'Long-range forecast',
  'settings.dataSources.domain.temperatureNormal': 'Temperature normals',
  'settings.dataSources.domain.location': 'Location lookup',
  'settings.dataSources.detail.role': 'Role',
  'settings.dataSources.detail.domains': 'Provided data',
  'settings.dataSources.detail.forecastStatus': 'Forecast status',
  'settings.dataSources.detail.longRange': 'Long-range data',
  'settings.dataSources.detail.credential': 'Credential state',
  'settings.dataSources.detail.apiSurface': 'API surface',
  'settings.dataSources.detail.underlyingModel': 'Underlying model provider',
  'settings.dataSources.detail.status': 'Status',
  'settings.dataSources.detail.currentScale': 'Current scale',
  'settings.dataSources.detail.availableScales': 'Available scales',
  'settings.dataSources.detail.observedAt': 'Last observation',
  'settings.dataSources.detail.source': 'Source',
  'settings.dataSources.detail.note': 'Note',
  'settings.dataSources.openMeteo.description':
    'No token is required. LifeBoard uses Open-Meteo for fallback or active forecasts, city search fallback, long-range daily entries, and the air-quality API surface.',
  'settings.dataSources.openMeteo.role':
    'Forecast fallback or active provider, city-search fallback, long-range daily forecast, and air-quality API surface.',
  'settings.dataSources.caiyun.description':
    'Used for forecasts when selected and configured. The current loaded response may return fewer long-range days than Open-Meteo.',
  'settings.dataSources.caiyun.role':
    'Forecast provider when selected and configured, including current weather, hourly and daily forecasts, and short-term precipitation.',
  'settings.dataSources.airQuality.description':
    'AQI values are requested through Open-Meteo Air Quality. CAMS is shown as the underlying model provider; LifeBoard does not call CAMS directly.',
  'settings.dataSources.amap.description':
    'Used only for city-name geocoding, reverse geocoding, and current-location display-name resolution when an AMap key is saved.',
  'settings.dataSources.amap.role':
    'Location lookup only. AMap is not a forecast, AQI, or alert provider in LifeBoard.',
  'settings.dataSources.alert.title': 'Caiyun Weather alerts',
  'settings.dataSources.alert.description':
    'Caiyun alert availability depends on the saved token and the current provider response.',
  'settings.dataSources.alert.note':
    'No alert entitlement result is stored in the current Weather store, so this page does not claim alert availability.',
  'settings.dataSources.officialSource': 'Official source',
  'settings.dataSources.openMeteoAirQualitySource': 'Open-Meteo Air Quality',
  'settings.dataSources.camsOfficialSource': 'CAMS official source',
  'settings.dataSources.licenceDescription':
    'Open-Meteo attribution includes CC BY 4.0 where required. Provider names and licence labels are shown as source names, not translated.',
  'settings.dataSources.configureService': 'Configure service',
  'settings.dataSources.viewLongRange': 'View long-range forecast',
  'settings.dataSources.externalLabel': 'Open {provider} official source in a new tab',
  'settings.dataSources.licenceLinkLabel': 'Open {licence} licence in a new tab',
  'settings.common.weather': 'Weather',
  'settings.common.todos': 'Todos',
  'settings.common.bookmarks': 'Bookmarks',
  'settings.common.tools': 'Tools',
  'settings.common.cancel': 'Cancel',
  'settings.localData.selectedCity': 'Selected city: {city}',
  'settings.localData.noCity': 'No selected city saved.',
  'settings.localData.taskOneCountdownOne': '1 task and 1 countdown saved.',
  'settings.localData.taskOneCountdownMany':
    '1 task and {countdownCount} countdowns saved.',
  'settings.localData.taskManyCountdownOne':
    '{taskCount} tasks and 1 countdown saved.',
  'settings.localData.taskManyCountdownMany':
    '{taskCount} tasks and {countdownCount} countdowns saved.',
  'settings.localData.bookmarkOne': '1 bookmark saved.',
  'settings.localData.bookmarkMany': '{count} bookmarks saved.',
  'settings.localData.toolsNotSaved': 'Tool input is not saved.',
  'settings.backup.exportTitle': 'Export backup',
  'settings.backup.exportDescription':
    'Download theme, selected city, favorite cities, tasks, countdowns, and bookmarks as JSON.',
  'settings.backup.exportAction': 'Export LifeBoard data',
  'settings.backup.importTitle': 'Import backup',
  'settings.backup.importDescription':
    'Select a LifeBoard JSON backup up to 1MB. The file is read only in this browser.',
  'settings.backup.fileAction': 'Choose backup file',
  'settings.backup.reviewAction': 'Review replacement',
  'settings.backup.discardAction': 'Discard file',
  'settings.backupSummary.title': 'Backup ready to review',
  'settings.backupSummary.exported': 'Exported',
  'settings.backupSummary.theme': 'Theme',
  'settings.backupSummary.weatherCity': 'Weather city',
  'settings.backupSummary.none': 'None',
  'settings.backupSummary.planningData': 'Planning data',
  'settings.backupSummary.bookmarks': 'Bookmarks',
  'settings.backupSummary.taskOne': '1 task',
  'settings.backupSummary.taskMany': '{count} tasks',
  'settings.backupSummary.countdownOne': '1 countdown',
  'settings.backupSummary.countdownMany': '{count} countdowns',
  'settings.backupSummary.planningCounts': '{tasks}, {countdowns}',
  'settings.exports.description':
    'Export selected LifeBoard data as Markdown or CSV without changing your backup file format.',
  'settings.exports.privacy':
    'Files are generated in this browser after you choose an export. Tools input and weather forecast responses are not included.',
  'settings.exports.todosTitle': 'Todos and Countdowns',
  'settings.exports.todosDescription':
    'Archive tasks and important dates as readable Markdown or spreadsheet-friendly CSV.',
  'settings.exports.bookmarksTitle': 'Bookmarks',
  'settings.exports.bookmarksDescription':
    'Export saved links as Markdown or CSV while preserving titles, URLs, notes, and categories.',
  'settings.exports.summaryTitle': 'LifeBoard Summary',
  'settings.exports.summaryDescription':
    'Create a compact Markdown overview with selected city, active tasks, upcoming countdowns, and pinned bookmarks.',
  'settings.exports.markdownAction': 'Export Markdown',
  'settings.exports.csvAction': 'Export CSV',
  'settings.exports.emptyTodosCsv':
    'CSV export is available after at least one task or countdown is saved. Markdown still includes honest empty sections.',
  'settings.exports.emptyBookmarksCsv':
    'CSV export is available after at least one bookmark is saved. Markdown still includes honest empty sections.',
  'settings.exports.success': 'Export file prepared. Your browser should start the download.',
  'settings.exports.error':
    'The export file could not be created or downloaded in this browser.',
  'settings.exports.markdown.todosTitle': 'Todos and Countdowns',
  'settings.exports.markdown.bookmarksTitle': 'Bookmarks',
  'settings.exports.markdown.summaryTitle': 'LifeBoard Summary',
  'settings.exports.markdown.generatedAt': 'Generated at',
  'settings.exports.markdown.activeTasks': 'Active tasks',
  'settings.exports.markdown.completedTasks': 'Completed tasks',
  'settings.exports.markdown.countdowns': 'Countdowns',
  'settings.exports.markdown.upcomingCountdowns': 'Upcoming countdowns',
  'settings.exports.markdown.pinnedBookmarks': 'Pinned bookmarks',
  'settings.exports.markdown.bookmarksByCategory': 'Bookmarks by category',
  'settings.exports.markdown.uncategorized': 'Uncategorized',
  'settings.exports.markdown.emptyActiveTasks': 'No active tasks saved.',
  'settings.exports.markdown.emptyCompletedTasks': 'No completed tasks saved.',
  'settings.exports.markdown.emptyCountdowns': 'No countdowns saved.',
  'settings.exports.markdown.emptyPinnedBookmarks': 'No pinned bookmarks saved.',
  'settings.exports.markdown.emptyBookmarks': 'No bookmarks saved.',
  'settings.exports.markdown.noDate': 'No date',
  'settings.exports.markdown.due': 'Due',
  'settings.exports.markdown.target': 'Target',
  'settings.exports.markdown.label': 'Label',
  'settings.exports.markdown.pinned': 'Pinned',
  'settings.exports.markdown.weatherCity': 'Selected weather city',
  'settings.exports.markdown.noWeatherCity': 'No selected weather city saved.',
  'settings.exports.markdown.privacyTitle': 'Privacy note',
  'settings.exports.markdown.privacyLocal':
    'This file was generated locally from LifeBoard data in this browser.',
  'settings.exports.markdown.privacyNoTools':
    'Tools input is not included because LifeBoard does not save it.',
  'settings.exports.markdown.privacyNoForecast':
    'Weather forecast response data is not included.',
  'settings.privacy.weatherTitle': 'Weather requests',
  'settings.privacy.weatherDescription':
    'Forecast and city search requests go directly to Open-Meteo.',
  'settings.privacy.localTitle': 'Local planning',
  'settings.privacy.localDescription':
    'The selected city, favorite cities, todos, countdowns, and bookmarks stay in this browser.',
  'settings.privacy.toolsTitle': 'Tools input',
  'settings.privacy.toolsDescription':
    'Text entered in Tools is processed locally and is not saved.',
  'settings.privacy.backupTitle': 'Backup files',
  'settings.privacy.backupDescription':
    'Exports are downloaded locally. Imports are read only after selection and are never uploaded.',
  'settings.clearData.weatherDescription':
    'Remove the selected city, favorite cities, and current in-memory forecast.',
  'settings.clearData.todosOneOne': 'Remove 1 task and 1 countdown.',
  'settings.clearData.todosOneMany':
    'Remove 1 task and {countdownCount} countdowns.',
  'settings.clearData.todosManyOne':
    'Remove {taskCount} tasks and 1 countdown.',
  'settings.clearData.todosManyMany':
    'Remove {taskCount} tasks and {countdownCount} countdowns.',
  'settings.clearData.bookmarkOne': 'Remove 1 saved bookmark.',
  'settings.clearData.bookmarkMany': 'Remove {count} saved bookmarks.',
  'settings.clearData.toolsDescription': 'No saved tool input to clear.',
  'settings.clearData.clearWeather': 'Clear Weather',
  'settings.clearData.clearTodos': 'Clear Todos',
  'settings.clearData.clearBookmarks': 'Clear Bookmarks',
  'settings.clearData.nothingSaved': 'Nothing saved',
  'settings.clearData.allTitle': 'Clear all LifeBoard data',
  'settings.clearData.allDescription':
    'Remove the theme preference, selected city, favorite cities, tasks, countdowns, and bookmarks stored by LifeBoard.',
  'settings.clearData.allAction': 'Clear all data',
  'settings.dialog.importTitle': 'Replace local LifeBoard data?',
  'settings.dialog.importDescription':
    'This will replace the current theme preference, selected city, favorite cities, tasks, countdowns, and bookmarks with the reviewed backup.',
  'settings.dialog.importConfirm': 'Import and replace',
  'settings.dialog.weatherTitle': 'Clear Weather data?',
  'settings.dialog.weatherDescription':
    'This removes the selected city, favorite cities, and current in-memory forecast.',
  'settings.dialog.todosTitle': 'Clear Todos data?',
  'settings.dialog.todosDescription':
    'This removes every saved task and countdown from this browser.',
  'settings.dialog.bookmarksTitle': 'Clear Bookmarks data?',
  'settings.dialog.bookmarksDescription':
    'This removes every saved bookmark from this browser.',
  'settings.dialog.allTitle': 'Clear all LifeBoard data?',
  'settings.dialog.allDescription':
    'This removes the theme preference, selected city, favorite cities, current forecast, tasks, countdowns, and bookmarks. Tools input is not saved.',
  'settings.dialog.allConfirm': 'Clear all data',
  'settings.dialog.allAcknowledgement':
    'I understand that this removes all LifeBoard data stored in this browser.',
  'settings.message.backupDownloaded': 'Backup downloaded to this device.',
  'settings.message.backupDownloadFailed':
    'The backup could not be created or downloaded.',
  'settings.message.backupImported':
    'Backup imported. Current local LifeBoard data was replaced.',
  'settings.message.weatherCleared': 'Weather data cleared.',
  'settings.message.todosCleared': 'Todos and countdowns cleared.',
  'settings.message.bookmarksCleared': 'Bookmarks cleared.',
  'settings.message.allCleared':
    'All LifeBoard local data cleared. Theme mode reset to System.',
  'settings.error.storageUnavailable':
    'Browser storage is unavailable. No LifeBoard data was changed.',
  'settings.error.themeInvalid':
    'The saved theme preference is invalid. It was left unchanged for recovery.',
  'settings.error.weatherInvalid':
    'The saved weather location is invalid. It was left unchanged for recovery.',
  'settings.error.weatherInvalidJson':
    'The saved weather location contains invalid JSON. It was left unchanged for recovery.',
  'settings.error.weatherFavoritesInvalid':
    'Saved favorite weather cities could not be read. They were left unchanged for recovery.',
  'settings.error.backupTooLarge':
    'This backup is larger than 1MB. Choose a smaller LifeBoard JSON backup.',
  'settings.error.fileUnreadable': 'The selected file could not be read.',
  'settings.error.fileInvalidJson':
    'The selected file does not contain valid JSON.',
  'settings.error.storageOperationRestored':
    'The storage operation failed. Existing LifeBoard data was restored.',
  'settings.error.storageOperationRestoreFailed':
    'The storage operation failed and the browser could not fully restore the previous data.',
  'settings.error.backupIncomplete':
    'This file is not a complete LifeBoard backup.',
  'settings.error.backupVersionUnsupported':
    'This backup version is not supported. LifeBoard currently accepts versions 1 and 2.',
  'settings.error.backupDateInvalid':
    'The backup export date is missing or invalid.',
  'settings.error.backupThemeInvalid':
    'The backup contains an invalid theme preference.',
  'settings.error.backupWeatherInvalid':
    'The backup contains an invalid weather location.',
  'settings.error.backupTodosInvalid':
    'The backup contains invalid Todos data.',
  'settings.error.backupBookmarksInvalid':
    'The backup contains invalid Bookmarks data.',
  'settings.error.planningStorageUnavailable':
    'Local storage is unavailable. Planning data cannot be read in this browser.',
  'settings.error.planningInvalidJson':
    'Saved planning data contains invalid JSON. It was left unchanged for recovery.',
  'settings.error.planningFormatInvalid':
    'Saved planning data does not match the supported format. It was left unchanged.',
  'settings.error.bookmarkStorageUnavailable':
    'Local storage is unavailable. Bookmark data cannot be read in this browser.',
  'settings.error.bookmarkInvalidJson':
    'Saved bookmark data contains invalid JSON. It was left unchanged for recovery.',
  'settings.error.bookmarkFormatInvalid':
    'Saved bookmark data does not match the supported format. It was left unchanged.',
  'notFound.routeTitle': 'Page not found',
  'notFound.eyebrow': 'Page not found',
  'notFound.title': 'This place is not on LifeBoard.',
  'notFound.description':
    'The address may be outdated or mistyped. Return to your daily overview to keep going.',
  'notFound.action': 'Return to Home',
  'notFound.landingAction': 'Return to Product',
  'notFound.workspaceAction': 'Enter Workspace',
  'landing.hero.kicker': 'LIFEBOARD · Personal Life OS',
  'landing.hero.title': "Keep today's essentials close.",
  'landing.hero.titleLineOne': "Keep today's",
  'landing.hero.titleLineTwo': 'essentials close.',
  'landing.hero.description':
    'Weather, plans, bookmarks, and everyday tools share one quiet space for the day ahead.',
  'landing.hero.actionsLabel': 'Start with LifeBoard',
  'landing.cta.enterWorkspace': 'Enter Workspace',
  'landing.cta.explore': 'See how it works',
  'landing.cta.viewWeather': 'View Weather',
  'landing.preview.weatherNow': 'Now outside',
  'landing.preview.weatherDetail': 'Bright, light wind',
  'landing.preview.today': 'Today',
  'landing.preview.focusTitle': 'Focus',
  'landing.preview.focusTask': 'Finish the morning plan',
  'landing.preview.focusSecond': 'Review travel window',
  'landing.preview.countdownTitle': 'Next date',
  'landing.preview.countdownMetric': '3 days',
  'landing.preview.toolsLine': 'Count words in a note',
  'landing.preview.bookmarkLine': 'Keep the useful link nearby',
  'landing.story.kicker': 'From sky to desk',
  'landing.story.title': 'The day starts with weather, then settles into your workspace.',
  'landing.story.description':
    'A clear forecast becomes a calm daily board, with tasks, dates, links, and tools arranged around what matters now.',
  'landing.story.weather.eyebrow': 'Weather first',
  'landing.story.weather.title': 'Read the shape of the day.',
  'landing.story.weather.description':
    'Temperature, sky, and conditions set the tone before the rest of the day comes into view.',
  'landing.story.workspace.eyebrow': 'Daily board',
  'landing.story.workspace.title': 'Bring the day into one surface.',
  'landing.story.workspace.description':
    'The forecast narrows into a useful card while planning, links, and tools take their place around it.',
  'landing.story.todos.eyebrow': 'Plans and countdowns',
  'landing.story.todos.title': 'Turn intent into the next visible action.',
  'landing.story.todos.description':
    'Todos and important dates sit close to weather and workspace context, without requiring a separate project system.',
  'landing.story.countdown.eyebrow': 'Dates in sight',
  'landing.story.countdown.title': 'Keep important dates beside the work.',
  'landing.story.countdown.description':
    'Countdowns stay visible as part of the daily surface, so time-sensitive plans do not become background noise.',
  'landing.story.bookmarks.eyebrow': 'Saved references',
  'landing.story.bookmarks.title': 'Keep the useful links in reach.',
  'landing.story.bookmarks.description':
    'Bookmarks are presented as part of the day, not as a detached archive of tabs.',
  'landing.story.tools.eyebrow': 'Private tools',
  'landing.story.tools.title': 'Use small utilities without giving them your data.',
  'landing.story.tools.description':
    'Tool inputs stay local and temporary, matching LifeBoard’s long-term, low-fatigue rhythm.',
  'landing.scene.weather': 'Local conditions set the tone.',
  'landing.scene.workspace': 'A calm board forms around the day.',
  'landing.scene.workspaceWeatherLabel': 'Outside',
  'landing.scene.workspaceWeatherValue': '24°C steady',
  'landing.scene.workspaceFocusLabel': 'Focus',
  'landing.scene.workspaceFocusValue': '2 tasks',
  'landing.scene.workspaceToolLabel': 'Tool',
  'landing.scene.workspaceToolValue': 'Text count',
  'landing.scene.todosMetric': '3 next',
  'landing.scene.todos': 'Tasks and countdowns stay visible.',
  'landing.scene.countdownMetric': '3 days',
  'landing.scene.countdown': 'A date remains in view without becoming noise.',
  'landing.scene.bookmarksMetric': '8 saved',
  'landing.scene.bookmarks': 'References remain close to the work.',
  'landing.scene.toolsMetric': 'Local',
  'landing.scene.tools': 'Utilities work without account friction.',
  'landing.entry.kicker': 'Direct entry',
  'landing.entry.title': 'Go directly to what you need',
  'landing.entry.description':
    'Open the full workspace, check the weather, or jump straight to the small tool you need.',
  'landing.entry.workspace': 'Open the daily board and continue from there.',
  'landing.entry.weather': 'Check the outside conditions before planning.',
  'landing.entry.todos': 'Capture tasks, dates, and next actions.',
  'landing.entry.bookmarks': 'Return to saved links without searching again.',
  'landing.entry.tools': 'Use small utilities for quick local work.',
  'landing.demo.kicker': 'Small real interactions',
  'landing.demo.title': 'Preview the workflow without leaving the story.',
  'landing.demo.description':
    'Try a few small moments from the daily flow before entering your own workspace.',
  'landing.demo.tabLabel': 'Product preview modules',
  'landing.demo.weather.title': 'A weather-aware start',
  'landing.demo.weather.description':
    'A compact weather preview keeps the atmosphere close without leaving this page.',
  'landing.demo.weather.action': 'Open Weather',
  'landing.demo.weather.card': 'Clear enough to plan the next step.',
  'landing.demo.weather.detail': 'Feels steady for a focused morning',
  'landing.demo.weather.now': 'Now outside',
  'landing.demo.weather.condition': 'Bright with light wind',
  'landing.demo.weather.highLow': 'High / Low',
  'landing.demo.weather.humidity': 'Humidity',
  'landing.demo.weather.wind': 'Wind',
  'landing.demo.weather.trendTitle': 'Today at a glance',
  'landing.demo.weather.hourMorning': '09:00',
  'landing.demo.weather.hourNoon': '12:00',
  'landing.demo.weather.hourAfternoon': '15:00',
  'landing.demo.weather.hourEvening': '18:00',
  'landing.demo.weather.trendMorning': 'Clear',
  'landing.demo.weather.trendNoon': 'Warm',
  'landing.demo.weather.trendAfternoon': 'Light cloud',
  'landing.demo.weather.trendEvening': 'Cooler',
  'landing.demo.todos.title': 'A task can be resolved in place',
  'landing.demo.todos.description':
    'A simple check shows how a task can move from intention to completion.',
  'landing.demo.todos.action': 'Open Todos',
  'landing.demo.todos.sample': 'Prepare the afternoon focus block',
  'landing.demo.todos.open': 'Open: the task remains in today’s flow.',
  'landing.demo.todos.done': 'Done: the demo state changed locally.',
  'landing.demo.todos.second': 'Countdown: presentation review in 3 days',
  'landing.demo.todos.third': 'Next: choose the quietest work window',
  'landing.demo.tools.title': 'Private utility space',
  'landing.demo.tools.description':
    'The text area feels like a small utility surface for quick everyday checks.',
  'landing.demo.tools.action': 'Open Tools',
  'landing.demo.tools.inputLabel': 'Scratch input',
  'landing.demo.tools.placeholder': 'Paste a few words to feel the quiet tool surface...',
  'landing.demo.tools.characters': 'Characters',
  'landing.demo.tools.words': 'Words',
  'landing.demo.tools.lines': 'Lines',
  'landing.final.kicker': 'Ready when you are',
  'landing.final.title': 'Open the workspace, or jump straight into the module you need.',
  'landing.final.description':
    'Come back for the guided overview, or open your workspace directly whenever the day is already moving.',
  'landing.final.weatherAction': 'Open Weather',
  'landing.footer.localFirst': 'Local-first. No account required.',
  'home.hero.title': 'Your day, in one place.',
  'home.hero.description':
    'Start with local weather, saved plans, private tools, and useful references.',
  'home.hero.contextTitle': 'Useful, without pretense',
  'home.hero.contextDescription':
    'Weather follows your selected city. Todos and countdowns reflect what you save locally, Tools keeps private input off Home, and Bookmarks shows only the references you save.',
  'home.settings.title': 'Workspace settings',
  'home.settings.description':
    'Keep appearance and browser-local data controls in one clear place.',
  'home.settings.cardDescription':
    'Manage appearance, review local data, create or restore a backup, understand privacy, and clear saved information.',
  'home.settings.action': 'Open settings',
  'home.settings.status': 'Local controls',
  ...enUSModules,
} satisfies TranslationCatalog
