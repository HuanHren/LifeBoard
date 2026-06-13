import type { CaseMode } from '@/modules/tools/types/tools'

const WORD_PATTERN = /[\p{L}\p{N}]+/gu

function getWords(input: string) {
  return input.match(WORD_PATTERN) ?? []
}

function capitalize(value: string) {
  const characters = Array.from(value.toLocaleLowerCase())
  const first = characters.shift()
  return first ? `${first.toLocaleUpperCase()}${characters.join('')}` : ''
}

function toTitleCase(input: string) {
  return input.toLocaleLowerCase().replace(WORD_PATTERN, (word) => capitalize(word))
}

function toSentenceCase(input: string) {
  const lower = input.toLocaleLowerCase()
  return lower.replace(
    /(^|[.!?]\s+)(\p{L})/gu,
    (_match, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase()}`,
  )
}

function toDelimitedCase(input: string, separator: '_' | '-') {
  return getWords(input)
    .map((word) => word.toLocaleLowerCase())
    .join(separator)
}

function toCamelCase(input: string) {
  const words = getWords(input)
  return words
    .map((word, index) =>
      index === 0 ? word.toLocaleLowerCase() : capitalize(word),
    )
    .join('')
}

export function convertCase(input: string, mode: CaseMode) {
  if (mode === 'lowercase') return input.toLocaleLowerCase()
  if (mode === 'uppercase') return input.toLocaleUpperCase()
  if (mode === 'title') return toTitleCase(input)
  if (mode === 'sentence') return toSentenceCase(input)
  if (mode === 'camel') return toCamelCase(input)
  if (mode === 'snake') return toDelimitedCase(input, '_')
  return toDelimitedCase(input, '-')
}
