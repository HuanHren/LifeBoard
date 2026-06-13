import type { CaseMode, ToolDefinition } from '@/modules/tools/types/tools'

export const TOOL_INPUT_LIMIT = 200_000

export const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  {
    id: 'json',
    title: 'JSON formatter and minifier',
    shortTitle: 'JSON',
    description: 'Validate JSON, make it readable, or compress it without sending it anywhere.',
  },
  {
    id: 'timestamp',
    title: 'Timestamp converter',
    shortTitle: 'Timestamp',
    description: 'Translate Unix timestamps and date text into clear local and UTC values.',
  },
  {
    id: 'whitespace',
    title: 'Whitespace cleaner',
    shortTitle: 'Whitespace',
    description: 'Trim text and normalize spacing while keeping line structure under your control.',
  },
  {
    id: 'deduplicate',
    title: 'Deduplicate lines',
    shortTitle: 'Deduplicate',
    description: 'Remove repeated lines while preserving the first occurrence and original order.',
  },
  {
    id: 'case',
    title: 'Case converter',
    shortTitle: 'Case',
    description: 'Convert text between common letter and identifier case styles.',
  },
  {
    id: 'counter',
    title: 'Word and character counter',
    shortTitle: 'Counter',
    description: 'Measure words, characters, non-whitespace characters, and lines as you type.',
  },
]

export const CASE_MODES: readonly { value: CaseMode; label: string }[] = [
  { value: 'lowercase', label: 'lowercase' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'title', label: 'Title Case' },
  { value: 'sentence', label: 'Sentence case' },
  { value: 'camel', label: 'camelCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' },
]

export function isToolId(value: unknown): value is ToolDefinition['id'] {
  return TOOL_DEFINITIONS.some((tool) => tool.id === value)
}

export function getInputLimitError(input: string) {
  return input.length > TOOL_INPUT_LIMIT
    ? `Input is too large. Keep it within ${TOOL_INPUT_LIMIT.toLocaleString()} characters.`
    : null
}
