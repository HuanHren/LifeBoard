import type { WhitespaceOptions } from '@/modules/tools/types/tools'

export function normalizeLineEndings(input: string) {
  return input.replace(/\r\n?/g, '\n')
}

export function cleanWhitespace(input: string, options: WhitespaceOptions) {
  let output = normalizeLineEndings(input).trim()

  if (options.collapseInlineWhitespace) {
    output = output
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
      .join('\n')
  }

  if (options.collapseBlankLines) {
    output = output.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n')
  }

  return output
}
