import type { TranslationKey } from '@/i18n/keys'

const explicitNotes: Partial<Record<TranslationKey, string>> = {
  'shell.theme.changeLabel':
    'Accessible label for the theme control. Keep the {mode} placeholder.',
  'settings.theme.storageError':
    'Shown when the browser cannot persist the selected theme mode.',
  'settings.language.saved':
    'Polite status announcement after changing language. Keep the {language} placeholder.',
  'settings.translationExport.privacy':
    'Privacy boundary for the translation export. Do not imply that personal data is included.',
  'settings.localData.selectedCity':
    'The {city} placeholder is an Open-Meteo city name and must remain verbatim.',
  'settings.localData.taskOneCountdownMany':
    'Keep the {countdownCount} placeholder.',
  'settings.localData.taskManyCountdownOne':
    'Keep the {taskCount} placeholder.',
  'settings.localData.taskManyCountdownMany':
    'Keep the {taskCount} and {countdownCount} placeholders.',
  'settings.localData.bookmarkMany': 'Keep the {count} placeholder.',
  'settings.backupSummary.planningCounts':
    'Keep the {tasks} and {countdowns} placeholders. Their values are already localized.',
  'settings.exports.privacy':
    'Privacy boundary for portable exports. Do not imply upload, sync, or server processing.',
  'settings.exports.emptyTodosCsv':
    'Explains that CSV requires at least one task or countdown while Markdown remains available.',
  'settings.exports.emptyBookmarksCsv':
    'Explains that CSV requires at least one bookmark while Markdown remains available.',
  'settings.exports.markdown.generatedAt':
    'Markdown label for a generated timestamp.',
  'settings.exports.markdown.uncategorized':
    'Markdown grouping label for bookmarks without a user-created category.',
  'settings.exports.markdown.privacyLocal':
    'Combined Markdown privacy note. Do not imply data leaves the browser.',
  'settings.exports.markdown.privacyNoTools':
    'Combined Markdown privacy note. Tools input must not be included.',
  'settings.exports.markdown.privacyNoForecast':
    'Combined Markdown privacy note. Forecast response data must not be included.',
  'settings.clearData.todosOneMany':
    'Keep the {countdownCount} placeholder.',
  'settings.clearData.todosManyOne': 'Keep the {taskCount} placeholder.',
  'settings.clearData.todosManyMany':
    'Keep the {taskCount} and {countdownCount} placeholders.',
  'settings.clearData.bookmarkMany': 'Keep the {count} placeholder.',
  'home.hero.contextDescription':
    'High-level module summary only. User-created content is never translated.',
}

export function getTranslationNote(key: TranslationKey) {
  return explicitNotes[key] ?? 'Built-in LifeBoard interface copy.'
}
