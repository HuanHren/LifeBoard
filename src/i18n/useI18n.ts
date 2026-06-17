import { storeToRefs } from 'pinia'
import { translate } from '@/i18n/catalog'
import { formatDate, formatNumber } from '@/i18n/formatters'
import type { TranslationKey } from '@/i18n/keys'
import type { TranslationParameters } from '@/i18n/types'
import { useLanguageStore } from '@/stores/language'

export function useI18n() {
  const languageStore = useLanguageStore()
  const { locale } = storeToRefs(languageStore)

  function t(key: TranslationKey, parameters?: TranslationParameters) {
    return translate(locale.value, key, parameters)
  }

  function date(
    value: Date | number,
    options: Intl.DateTimeFormatOptions,
  ) {
    return formatDate(locale.value, value, options)
  }

  function number(value: number, options?: Intl.NumberFormatOptions) {
    return formatNumber(locale.value, value, options)
  }

  return {
    locale,
    t,
    formatDate: date,
    formatNumber: number,
  }
}
