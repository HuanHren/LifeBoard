import type { TranslationKey } from '@/i18n/keys'
import type { Translator } from '@/i18n/types'
import type {
  AdviceItem,
  WeatherCondition,
  WeatherLocationKind,
} from '@/modules/weather/types/weather'
import type { CurrentLocationResolutionErrorCode } from '@/modules/weather/types/currentLocationResolution'
import { WEATHER_CONDITION_CODES } from '@/modules/weather/constants/weatherConditionCodes'

const knownConditionCodes = new Set([
  0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75,
  77, 80, 81, 82, 85, 86, 95, 96, 99,
  WEATHER_CONDITION_CODES.cloudy,
  WEATHER_CONDITION_CODES.haze,
  WEATHER_CONDITION_CODES.sandDust,
])

const locationKindKeys: Record<WeatherLocationKind, TranslationKey> = {
  'Capital city': 'weather.location.capitalCity',
  'Regional capital': 'weather.location.regionalCapital',
  Country: 'weather.location.country',
  'Administrative area': 'weather.location.administrativeArea',
  Locality: 'weather.location.locality',
  Location: 'weather.location.location',
}

const adviceTextKeys: Record<string, TranslationKey> = {
  Umbrella: 'weather.advice.umbrella.title',
  'Taking an umbrella would be sensible.':
    'weather.advice.umbrella.takeSummary',
  'Rain is occurring or has a meaningful chance during the next several hours.':
    'weather.advice.umbrella.takeDetail',
  'Consider carrying a compact umbrella.':
    'weather.advice.umbrella.considerSummary',
  'Some precipitation is possible later, although the signal is not strong.':
    'weather.advice.umbrella.considerDetail',
  'An umbrella does not look necessary right now.':
    'weather.advice.umbrella.clearSummary',
  'The next 12 hours show little meaningful precipitation.':
    'weather.advice.umbrella.clearDetail',
  Clothing: 'weather.advice.clothing.title',
  'Light, comfortable clothing should suit the conditions.':
    'weather.advice.clothing.defaultSummary',
  'Wear an insulated outer layer and protect exposed skin.':
    'weather.advice.clothing.veryColdSummary',
  'A warm layer or jacket would be useful.':
    'weather.advice.clothing.coolSummary',
  'A light layer should be comfortable.':
    'weather.advice.clothing.mildSummary',
  'Choose breathable clothing and limit heat buildup.':
    'weather.advice.clothing.hotSummary',
  'Light, breathable clothing should be comfortable.':
    'weather.advice.clothing.warmSummary',
  'A wind-resistant layer may help.':
    'weather.advice.clothing.windModifier',
  'A water-resistant outer layer may be useful.':
    'weather.advice.clothing.rainModifier',
  'Temperatures change enough that an extra layer may be useful.':
    'weather.advice.clothing.rangeModifier',
  'Outdoor plans': 'weather.advice.outdoor.title',
  'Consider moving strenuous outdoor activity to another time.':
    'weather.advice.outdoor.cautionSummary',
  'The near-term forecast includes conditions that may make exercise uncomfortable.':
    'weather.advice.outdoor.cautionDetail',
  'Outdoor activity may be suitable with a little preparation.':
    'weather.advice.outdoor.considerSummary',
  'Conditions look generally suitable for going out.':
    'weather.advice.outdoor.clearSummary',
  'No major short-term weather limitation is apparent in the forecast.':
    'weather.advice.outdoor.clearDetail',
}

const weatherErrorKeys: Record<string, TranslationKey> = {
  'The selected city could not be saved in this browser. Check local storage access and try again.':
    'weather.error.saveCity',
  'The selected city could not be cleared from this browser. Check local storage access and try again.':
    'weather.error.clearCity',
  'The saved city could not be read from this browser. Check local storage access and reload.':
    'weather.error.readCity',
  'The forecast could not be loaded. Please try again.':
    'weather.error.forecastFallback',
  'City search is unavailable. Please try again.':
    'weather.error.searchFallback',
  'Unable to reach Open-Meteo. The browser received no response; check your connection or network policy.':
    'weather.error.network',
  'Caiyun Weather is selected, but no token is saved. Add one in Settings before loading Caiyun forecasts.':
    'weather.error.caiyunMissingToken',
  'Unable to reach Caiyun Weather. Check your connection, browser policy, or switch back to Open-Meteo.':
    'weather.error.caiyunNetwork',
  'Caiyun Weather rejected the request. Check the saved token or switch back to Open-Meteo.':
    'weather.error.caiyunAuth',
  'Caiyun Weather could not use the selected city coordinates.':
    'weather.error.caiyunCoordinates',
  'Caiyun Weather returned an unreadable response.':
    'weather.error.caiyunUnreadableResponse',
  'Caiyun Weather returned an incomplete forecast.':
    'weather.error.caiyunIncompleteForecast',
  'LifeBoard could not reach the Caiyun Weather proxy. Check the deployment or switch back to Open-Meteo.':
    'weather.error.caiyunProxyUnavailable',
  'LifeBoard could not prepare the Caiyun Weather request.':
    'weather.error.caiyunProxyRequest',
  'The weather service returned an unreadable response.':
    'weather.error.unreadableResponse',
  'The weather service returned an incomplete forecast.':
    'weather.error.incompleteForecast',
  'The weather request timed out. Check your connection and try again.':
    'weather.error.timeout',
}

const currentLocationErrorKeys: Record<
  Exclude<CurrentLocationResolutionErrorCode, 'aborted'>,
  TranslationKey
> = {
  'permission-denied': 'weather.currentLocation.error.permissionDenied',
  'position-unavailable': 'weather.currentLocation.error.positionUnavailable',
  'geolocation-timeout': 'weather.currentLocation.error.timeout',
  'reverse-network': 'weather.currentLocation.error.reverseNetwork',
  'reverse-http': 'weather.currentLocation.error.reverseHttp',
  'reverse-contract': 'weather.currentLocation.error.reverseContract',
  'outside-xiaomi-region': 'weather.currentLocation.error.outsideRegion',
  'xiaomi-no-candidate': 'weather.currentLocation.error.noCandidate',
  'xiaomi-ambiguous': 'weather.currentLocation.error.ambiguous',
}

export function localizeCurrentLocationResolutionError(
  code: CurrentLocationResolutionErrorCode | null,
  t: Translator,
) {
  if (!code || code === 'aborted') return null
  return t(currentLocationErrorKeys[code])
}

export function localizeWeatherCondition(
  condition: WeatherCondition,
  t: Translator,
  short = false,
) {
  const code = knownConditionCodes.has(condition.code)
    ? String(condition.code)
    : 'unavailable'
  return t(
    `weather.condition.${code}.${short ? 'short' : 'label'}` as TranslationKey,
  )
}

export function localizeLocationKind(kind: WeatherLocationKind, t: Translator) {
  return t(locationKindKeys[kind])
}

function localizeCautions(value: string, t: Translator) {
  const cautions = value.split(', ').map((caution) => {
    if (caution === 'rain risk') return t('weather.advice.caution.rainRisk')
    if (caution === 'elevated UV') return t('weather.advice.caution.elevatedUv')
    return t('weather.advice.caution.gustyWind')
  })

  if (cautions.length === 2) {
    return t('weather.advice.caution.joinTwo', {
      first: cautions[0] ?? '',
      second: cautions[1] ?? '',
    })
  }

  if (cautions.length === 3) {
    return t('weather.advice.caution.joinThree', {
      first: cautions[0] ?? '',
      second: cautions[1] ?? '',
      third: cautions[2] ?? '',
    })
  }

  return cautions[0] ?? ''
}

export function localizeAdviceText(value: string, t: Translator) {
  const knownKey = adviceTextKeys[value]
  if (knownKey) return t(knownKey)

  const feelsLikeMatch = value.match(/^Feels like (-?\d+)°C during the current conditions\.$/)
  if (feelsLikeMatch) {
    return t('weather.advice.clothing.feelsLikeDetail', {
      temperature: `${feelsLikeMatch[1]}°C`,
    })
  }

  const cautionsMatch = value.match(
    /^Keep an eye on (.+) during the next several hours\.$/,
  )
  if (cautionsMatch) {
    return t('weather.advice.outdoor.considerDetail', {
      cautions: localizeCautions(cautionsMatch[1] ?? '', t),
    })
  }

  return t('weather.error.serviceRejected')
}

export function localizeAdviceItem(item: AdviceItem, t: Translator) {
  return {
    title: localizeAdviceText(item.title, t),
    summary: localizeAdviceText(item.summary, t),
    detail: localizeAdviceText(item.detail, t),
  }
}

export function localizeWeatherNote(value: string, t: Translator) {
  const gustMatch = value.match(/^Gusts may reach about (.+) within 12 hours\.$/)
  if (gustMatch) {
    return t('weather.advice.note.gusts', { speed: gustMatch[1] ?? '' })
  }

  const apparentMatch = value.match(
    /^It currently feels about (.+) different from the measured temperature\.$/,
  )
  if (apparentMatch) {
    return t('weather.advice.note.apparentDifference', {
      difference: apparentMatch[1] ?? '',
    })
  }

  const rangeMatch = value.match(
    /^Temperature may vary by about (.+) over the next 12 hours\.$/,
  )
  if (rangeMatch) {
    return t('weather.advice.note.temperatureRange', {
      range: rangeMatch[1] ?? '',
    })
  }

  return value
}

export function localizeWeatherError(value: string | null, t: Translator) {
  if (!value) return null

  const knownKey = weatherErrorKeys[value]
  if (knownKey) return t(knownKey)

  const statusMatch = value.match(/^The weather service returned status (\d+)\.$/)
  if (statusMatch) {
    return t('weather.error.status', { status: statusMatch[1] ?? '' })
  }

  const caiyunStatusMatch = value.match(/^Caiyun Weather returned status (\d+)\.$/)
  if (caiyunStatusMatch) {
    return t('weather.error.caiyunStatus', { status: caiyunStatusMatch[1] ?? '' })
  }

  const caiyunProxyStatusMatch = value.match(
    /^LifeBoard's Caiyun Weather proxy returned status (\d+)\.$/,
  )
  if (caiyunProxyStatusMatch) {
    return t('weather.error.caiyunProxyStatus', {
      status: caiyunProxyStatusMatch[1] ?? '',
    })
  }

  if (value.startsWith('Caiyun Weather returned an incomplete forecast for ')) {
    return t('weather.error.caiyunIncompleteForecast')
  }

  return t('weather.error.serviceRejected')
}
