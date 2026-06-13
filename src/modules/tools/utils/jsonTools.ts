import type {
  JsonAction,
  JsonIndentation,
  TransformResult,
} from '@/modules/tools/types/tools'

function getJsonError(error: unknown) {
  if (!(error instanceof SyntaxError)) {
    return 'The JSON could not be processed.'
  }

  const message = error.message.replace(/^JSON\.parse:\s*/i, '').trim()
  return message ? `Invalid JSON: ${message}` : 'Invalid JSON. Check the syntax and try again.'
}

export function transformJson(
  input: string,
  action: JsonAction,
  indentation: JsonIndentation,
): TransformResult {
  if (input.trim().length === 0) {
    return { output: '', error: 'Enter JSON to process.' }
  }

  try {
    const parsed: unknown = JSON.parse(input)
    return {
      output: JSON.stringify(parsed, null, action === 'format' ? indentation : 0),
      error: null,
    }
  } catch (error) {
    return { output: '', error: getJsonError(error) }
  }
}
