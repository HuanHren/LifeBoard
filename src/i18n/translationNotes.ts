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
  'settings.weatherProvider.helper':
    'Stage 16.2 boundary. Open-Meteo still powers forecasts; Caiyun is a stored preference only.',
  'settings.weatherProvider.tokenHelper':
    'Do not include or request a real token in translations. This is generic UI guidance.',
  'settings.weatherProvider.privacy':
    'Security/privacy caveat. Keep backup/export exclusion and browser DevTools visibility meaning.',
  'settings.weatherProvider.message.tokenSaved':
    'Must not include the token value or any partial token.',
  'settings.weatherProvider.error.emptyToken':
    'Validation message for an empty password-style token field.',
  'weather.providerNotice.openMeteoActive':
    'Weather page status. Must say Open-Meteo still powers forecasts in this stage.',
  'weather.providerNotice.caiyunMissingToken':
    'Weather page status for Caiyun selected without a saved token. Must not block Open-Meteo loading.',
  'settings.localData.selectedCity':
    'The {city} placeholder is an Open-Meteo city name and must remain verbatim.',
  'weather.favorites.description':
    'Privacy boundary for Weather favorites. Do not imply automatic refresh or another weather provider.',
  'weather.favorites.removeAria':
    'Accessible label for removing a favorite weather city. Keep the {city} placeholder verbatim.',
  'weather.favorites.message.storageError':
    'Shown when favorite city storage cannot be written in this browser.',
  'weather.favorites.message.invalidStorage':
    'Shown when saved favorite city storage is malformed. Do not imply that data was deleted.',
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
