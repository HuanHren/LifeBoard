export const supportedLocales = ['zh-CN', 'en-US'] as const

export type AppLocale = (typeof supportedLocales)[number]

export type TranslationParameter = string | number
export type TranslationParameters = Record<string, TranslationParameter>
export type Translator = (
  key: TranslationKey,
  parameters?: TranslationParameters,
) => string

export interface TranslationSourceEntry {
  key: string
  'zh-CN': string
  'en-US': string
  note: string
}

export interface TranslationSourceDocument {
  schemaVersion: 1
  generatedAt: string
  sourceLocales: AppLocale[]
  entries: TranslationSourceEntry[]
}
import type { TranslationKey } from '@/i18n/keys'
