import type { TranslationCatalog } from '@/i18n/keys'
import { enUSModules } from '@/i18n/locales/en-US-modules'

export const enUS = {
  'shell.skipToMain': 'Skip to main content',
  'shell.sidebar.primaryLabel': 'Primary',
  'shell.sidebar.mainSectionsLabel': 'Main sections',
  'shell.sidebar.tagline': 'Personal daily workspace',
  'shell.sidebar.footer': 'Local-first by design. Saved data stays in this browser.',
  'shell.mobile.primaryLabel': 'Mobile primary',
  'shell.theme.appearance': 'Appearance',
  'shell.theme.system': 'System',
  'shell.theme.light': 'Light',
  'shell.theme.dark': 'Dark',
  'shell.theme.changeLabel': 'Theme mode: {mode}. Change theme mode',
  'navigation.home.label': 'Home',
  'navigation.home.description': 'Daily overview',
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
  'settings.page.title': 'Settings',
  'settings.page.description':
    "Manage this browser's appearance, language, local data, privacy, and portable LifeBoard backup.",
  'settings.section.appearance.title': 'Appearance',
  'settings.section.appearance.description':
    'A browser-local preference that follows you only on this device.',
  'settings.section.language.title': 'Language',
  'settings.section.language.description':
    'Choose the interface language and download the built-in translation source.',
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
