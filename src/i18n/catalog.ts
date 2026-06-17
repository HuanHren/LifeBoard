import type { TranslationCatalog, TranslationKey } from '@/i18n/keys'
import { translationKeys } from '@/i18n/keys'
import { enUS } from '@/i18n/locales/en-US'
import { zhCN } from '@/i18n/locales/zh-CN'
import type {
  AppLocale,
  TranslationParameters,
} from '@/i18n/types'

export const catalogs: Record<AppLocale, TranslationCatalog> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

function placeholderNames(value: string) {
  return Array.from(value.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g), (match) => match[1])
    .filter((name): name is string => Boolean(name))
    .sort()
}

function assertCatalogParity() {
  for (const key of translationKeys) {
    const chinesePlaceholders = placeholderNames(zhCN[key])
    const englishPlaceholders = placeholderNames(enUS[key])

    if (chinesePlaceholders.join('|') !== englishPlaceholders.join('|')) {
      throw new Error(`Translation placeholders do not match for "${key}".`)
    }
  }
}

assertCatalogParity()

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  parameters: TranslationParameters = {},
) {
  const template = catalogs[locale][key]

  return template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_match, name: string) => {
    const value = parameters[name]

    if (value === undefined) {
      throw new Error(`Missing translation parameter "${name}" for "${key}".`)
    }

    return String(value)
  })
}
