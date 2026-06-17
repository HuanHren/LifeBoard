import type { TranslationKey } from '@/i18n/keys'
import type { Translator } from '@/i18n/types'
import { TOOL_INPUT_LIMIT } from '@/modules/tools/constants/tools'
import type {
  CaseMode,
  TimestampInputType,
  ToolId,
} from '@/modules/tools/types/tools'

const toolKeyParts: Record<ToolId, string> = {
  json: 'json',
  timestamp: 'timestamp',
  whitespace: 'whitespace',
  deduplicate: 'deduplicate',
  case: 'case',
  counter: 'counter',
}

const caseModeKeys: Record<CaseMode, TranslationKey> = {
  lowercase: 'tools.case.mode.lowercase',
  uppercase: 'tools.case.mode.uppercase',
  title: 'tools.case.mode.title',
  sentence: 'tools.case.mode.sentence',
  camel: 'tools.case.mode.camel',
  snake: 'tools.case.mode.snake',
  kebab: 'tools.case.mode.kebab',
}

const timestampTypeKeys: Record<TimestampInputType, TranslationKey> = {
  'Unix seconds': 'tools.timestamp.type.seconds',
  'Unix milliseconds': 'tools.timestamp.type.milliseconds',
  'Date text': 'tools.timestamp.type.dateText',
}

const errorKeys: Record<string, TranslationKey> = {
  'Enter JSON to format or minify.': 'tools.json.error.empty',
  'Enter Unix seconds, Unix milliseconds, or an ISO-compatible date value.':
    'tools.timestamp.error.empty',
  'Enter a finite numeric timestamp.': 'tools.timestamp.error.finite',
  'This numeric value is ambiguous. Use a typical Unix seconds value or a 12–13 digit millisecond value.':
    'tools.timestamp.error.ambiguous',
  'The timestamp is outside the supported date range.':
    'tools.timestamp.error.range',
  'The timestamp does not produce a valid date.':
    'tools.timestamp.error.invalidTimestamp',
  'Enter a valid ISO-compatible date, Unix seconds, or Unix milliseconds.':
    'tools.timestamp.error.invalidInput',
  'Copy failed. Select the output and copy it manually.':
    'tools.common.copyError',
}

export function getToolDefinitionCopy(id: ToolId, t: Translator) {
  const part = toolKeyParts[id]
  return {
    title: t(`tools.definition.${part}.title` as TranslationKey),
    shortTitle: t(`tools.definition.${part}.short` as TranslationKey),
    description: t(`tools.definition.${part}.description` as TranslationKey),
  }
}

export function getCaseModeLabel(mode: CaseMode, t: Translator) {
  return t(caseModeKeys[mode])
}

export function getTimestampTypeLabel(type: TimestampInputType, t: Translator) {
  return t(timestampTypeKeys[type])
}

export function localizeToolsError(value: string | null, t: Translator) {
  if (!value) return null

  if (
    value ===
    `Input is too large. Keep it within ${TOOL_INPUT_LIMIT.toLocaleString()} characters.`
  ) {
    return t('tools.error.inputTooLarge', {
      count: TOOL_INPUT_LIMIT,
    })
  }

  const jsonMatch = value.match(/^Invalid JSON: (.+)$/)
  if (jsonMatch) {
    return t('tools.json.error.invalid')
  }

  const key = errorKeys[value]
  return key ? t(key) : value
}
