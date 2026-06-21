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
    'Weather provider preference explanation. Do not imply cloud sync or accounts.',
  'settings.weatherProvider.tokenHelper':
    'Do not include or request a real token in translations. This is generic UI guidance.',
  'settings.weatherProvider.privacy':
    'Security/privacy caveat. Keep backup/export exclusion and browser DevTools visibility meaning.',
  'settings.weatherProvider.message.tokenSaved':
    'Must not include the token value or any partial token.',
  'settings.weatherProvider.error.emptyToken':
    'Validation message for an empty password-style token field.',
  'weather.providerNotice.openMeteoActive':
    'Weather page status for Open-Meteo. No token is required.',
  'weather.providerNotice.caiyunMissingToken':
    'Weather page status for Caiyun selected without a saved token. Must say no Caiyun forecast can load until a token is saved.',
  'weather.providerNotice.caiyunActive':
    'Weather page status for active Caiyun provider. Keep city search boundary clear.',
  'settings.locationServices.privacy':
    'Privacy copy for AMap key handling. Must state same-origin route usage and export exclusion.',
  'settings.dataSources.pageDescription':
    'Weather source status page. Do not imply provider pings, cloud monitoring, or new API requests.',
  'settings.dataSources.privacyDescription':
    'Must preserve local-first boundary. Do not imply credentials are displayed or exported.',
  'settings.dataSources.summary.selectedLocation':
    'The location value may be provider-returned or user-selected and must remain verbatim.',
  'settings.dataSources.status.currentResponseDays':
    'Keep {count}. Count is derived only from the currently loaded normalized forecast snapshot.',
  'settings.dataSources.openMeteo.description':
    'Keep Open-Meteo untranslated and do not imply credentials are required.',
  'settings.dataSources.caiyun.description':
    'Keep Caiyun Weather untranslated. Do not claim a permanent provider day limit.',
  'settings.dataSources.airQuality.description':
    'Do not call this Chinese national AQI. CAMS is underlying model only, not a direct LifeBoard API call.',
  'settings.dataSources.amap.role':
    'AMap is location lookup only. Do not describe it as forecast, AQI, or alert provider.',
  'settings.dataSources.alert.note':
    'Do not claim alerts are verified unless an in-memory capability result exists.',
  'settings.dataSources.externalLabel':
    'Accessible external link label. Keep {provider}; provider names are inserted and not translated.',
  'settings.dataSources.licenceLinkLabel':
    'Accessible licence link label. Keep {licence}; licence labels are inserted and not translated.',
  'home.weather.useCurrentLocation':
    'Home action label for one-time browser geolocation. Do not imply background tracking.',
  'weather.search.amapMissing':
    'Search notice shown when no AMap key is saved and Open-Meteo fallback is used.',
  'weather.state.caiyunTokenMissingDescription':
    'Shown when Caiyun is selected without a saved token. Must state no Caiyun request was sent.',
  'weather.error.caiyunMissingToken':
    'Do not include or request a real token. Direct the user to Settings.',
  'weather.error.caiyunAuth':
    'Provider error. Do not include token, partial token, request URL, or raw provider error body.',
  'weather.error.caiyunNetwork':
    'Provider network error. Do not include token-bearing request URL.',
  'weather.error.caiyunProxyUnavailable':
    'Shown when the same-origin Caiyun proxy cannot be reached. Do not include token, request body, or upstream URL.',
  'weather.error.caiyunProxyRequest':
    'Shown when LifeBoard cannot prepare a Caiyun proxy request. Do not include token or request body.',
  'weather.error.caiyunProxyStatus':
    'Shown for unexpected same-origin proxy status. Keep the {status} placeholder and never include token or request URL.',
  'weather.attribution.sourceLinkLabel':
    'Accessible label for the active forecast source link. Keep the {provider} placeholder and do not translate provider names inserted at runtime.',
  'weather.attribution.licenceLinkLabel':
    'Accessible label for source licence links. Keep the {licence} placeholder.',
  'weather.airQuality.scale.us':
    'Keep US AQI in English. Do not call this Chinese national AQI.',
  'weather.airQuality.scale.european':
    'Keep European AQI explicit. Do not merge this with US AQI.',
  'weather.airQuality.badgeSummary':
    'Accessible name for the hero AQI badge. Keep {scale}, {value}, and {category}.',
  'weather.hero.updatedForCity':
    'Polite live-region message after a committed weather snapshot change. Keep {city}; do not mention animation internals.',
  'weather.airQuality.pollutant.pm25': 'Keep PM2.5 untranslated.',
  'weather.airQuality.pollutant.pm10': 'Keep PM10 untranslated.',
  'weather.airQuality.sourcePrefix':
    'Attribution label for Open-Meteo Air Quality. Do not imply CAMS is called directly.',
  'weather.airQuality.modelPrefix':
    'Attribution label for the underlying CAMS model provider.',
  'weather.airQuality.sourceLinkLabel':
    'Accessible label. Keep the {provider} placeholder and provider names untranslated.',
  'weather.airQuality.modelLinkLabel':
    'Accessible label. Keep the {provider} placeholder and provider names untranslated.',
  'weather.airQuality.error.network':
    'Sanitized air-quality error. Do not include request URLs or raw provider responses.',
  'weather.details.sun.value':
    'Weather detail value. Keep {sunrise} and {sunset} placeholders.',
  'weather.shortTerm.openMeteoLimitation':
    'Provider limitation. Do not imply Open-Meteo minute nowcast exists.',
  'weather.shortTerm.caiyunUnavailable':
    'Shown only when Caiyun Weather did not return minutely data. Keep Caiyun Weather untranslated.',
  'weather.shortTerm.expected':
    'Keep the {count} placeholder for minute count. This is generated from provider data only.',
  'weather.precipitation.itemLabel':
    'Hourly precipitation label. Keep {chance} and {amount} placeholders.',
  'weather.longRange.title':
    'Route title for the long-range weather page. Do not imply more than the returned provider data.',
  'weather.longRange.availableDays':
    'Keep the {count} placeholder. Count is the real number of usable returned days.',
  'weather.longRange.fewerDays':
    'Keep {count} and {target}. This must honestly state partial provider data.',
  'weather.longRange.sourceLength':
    'Keep {count}. Do not mention inactive providers or provider credentials.',
  'weather.longRange.trendSummary':
    'Accessible chart summary. Keep {count}, {high}, and {low}.',
  'weather.longRange.daySummary':
    'Accessible daily column summary. Keep {day}, {date}, {condition}, {high}, and {low}. Provider-returned city names are not translated here.',
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
