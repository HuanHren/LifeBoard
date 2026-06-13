import type { TextMetrics } from '@/modules/tools/types/tools'
import { normalizeLineEndings } from '@/modules/tools/utils/whitespaceTools'

export function countTextMetrics(input: string): TextMetrics {
  const words = input.trim().length === 0 ? [] : input.trim().split(/\s+/u)
  const characters = Array.from(input)

  return {
    words: words.length,
    characters: characters.length,
    charactersWithoutWhitespace: characters.filter((character) => !/\s/u.test(character)).length,
    lines: input.length === 0 ? 0 : normalizeLineEndings(input).split('\n').length,
  }
}
