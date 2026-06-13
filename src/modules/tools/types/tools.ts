export type ToolId =
  | 'json'
  | 'timestamp'
  | 'whitespace'
  | 'deduplicate'
  | 'case'
  | 'counter'

export interface ToolDefinition {
  id: ToolId
  title: string
  shortTitle: string
  description: string
}

export interface TransformResult {
  output: string
  error: string | null
}

export type JsonIndentation = 2 | 4
export type JsonAction = 'format' | 'minify'

export interface WhitespaceOptions {
  collapseInlineWhitespace: boolean
  collapseBlankLines: boolean
}

export interface DeduplicateOptions {
  caseInsensitive: boolean
  trimForComparison: boolean
  removeBlankLines: boolean
}

export interface DeduplicateResult {
  output: string
  sourceLines: number
  resultLines: number
  removedDuplicates: number
}

export type CaseMode =
  | 'lowercase'
  | 'uppercase'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'snake'
  | 'kebab'

export interface TextMetrics {
  words: number
  characters: number
  charactersWithoutWhitespace: number
  lines: number
}

export type TimestampInputType = 'Unix seconds' | 'Unix milliseconds' | 'Date text'

export interface TimestampConversion {
  interpretedAs: TimestampInputType
  localDateTime: string
  utcDateTime: string
  iso: string
  unixSeconds: number
  unixMilliseconds: number
}

export type TimestampResult =
  | { ok: true; value: TimestampConversion }
  | { ok: false; error: string }

export type CopyStatus = 'idle' | 'copying' | 'copied' | 'error'
