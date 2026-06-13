import type {
  DeduplicateOptions,
  DeduplicateResult,
} from '@/modules/tools/types/tools'
import { normalizeLineEndings } from '@/modules/tools/utils/whitespaceTools'

export function deduplicateLines(
  input: string,
  options: DeduplicateOptions,
): DeduplicateResult {
  const lines = input.length === 0 ? [] : normalizeLineEndings(input).split('\n')
  const seen = new Set<string>()
  const result: string[] = []
  let removedDuplicates = 0

  for (const line of lines) {
    const comparisonLine = options.trimForComparison ? line.trim() : line

    if (options.removeBlankLines && comparisonLine.length === 0) {
      continue
    }

    const key = options.caseInsensitive ? comparisonLine.toLocaleLowerCase() : comparisonLine

    if (seen.has(key)) {
      removedDuplicates += 1
      continue
    }

    seen.add(key)
    result.push(line)
  }

  return {
    output: result.join('\n'),
    sourceLines: lines.length,
    resultLines: result.length,
    removedDuplicates,
  }
}
