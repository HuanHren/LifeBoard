import type { Translator } from '@/i18n/types'

export type WeatherDetailTone = 'neutral' | 'clear' | 'consider' | 'caution'

export interface WeatherDetailItem {
  id: string
  label: string
  value: string
  helper: string
  tone: WeatherDetailTone
}

export function describeUvIndex(value: number | null, t: Translator) {
  if (value === null) {
    return t('weather.details.unavailable')
  }

  if (value < 3) {
    return t('weather.details.uv.low')
  }

  if (value < 6) {
    return t('weather.details.uv.moderate')
  }

  if (value < 8) {
    return t('weather.details.uv.high')
  }

  if (value < 11) {
    return t('weather.details.uv.veryHigh')
  }

  return t('weather.details.uv.extreme')
}

export function toneForUvIndex(value: number | null): WeatherDetailTone {
  if (value === null) {
    return 'neutral'
  }

  if (value < 3) {
    return 'clear'
  }

  if (value < 8) {
    return 'consider'
  }

  return 'caution'
}

export function describeHumidity(value: number | null, t: Translator) {
  if (value === null) {
    return t('weather.details.unavailable')
  }

  if (value < 35) {
    return t('weather.details.humidity.dry')
  }

  if (value <= 65) {
    return t('weather.details.humidity.comfortable')
  }

  return t('weather.details.humidity.humid')
}

export function describeWind(speed: number | null, t: Translator) {
  if (speed === null) {
    return t('weather.details.unavailable')
  }

  if (speed < 12) {
    return t('weather.details.wind.calm')
  }

  if (speed < 30) {
    return t('weather.details.wind.breezy')
  }

  return t('weather.details.wind.windy')
}

export function toneForWind(speed: number | null): WeatherDetailTone {
  if (speed === null) {
    return 'neutral'
  }

  if (speed < 12) {
    return 'clear'
  }

  if (speed < 30) {
    return 'consider'
  }

  return 'caution'
}

export function describeVisibility(value: number | null | undefined, t: Translator) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return t('weather.details.unavailable')
  }

  if (value >= 10) {
    return t('weather.details.visibility.clear')
  }

  if (value >= 4) {
    return t('weather.details.visibility.moderate')
  }

  return t('weather.details.visibility.low')
}

export function toneForVisibility(
  value: number | null | undefined,
): WeatherDetailTone {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 'neutral'
  }

  if (value >= 10) {
    return 'clear'
  }

  if (value >= 4) {
    return 'consider'
  }

  return 'caution'
}
