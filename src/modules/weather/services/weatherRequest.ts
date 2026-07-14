export class WeatherRequestTimeoutError extends Error {
  constructor(message = 'The weather request timed out. Check your connection and try again.') {
    super(message)
    this.name = 'WeatherRequestTimeoutError'
  }
}

export function parseRetryAfterMs(value: string | null, now = Date.now()) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) {
    const milliseconds = Number(trimmed) * 1_000
    return Number.isFinite(milliseconds) && milliseconds <= 3_600_000
      ? milliseconds
      : undefined
  }
  const retryAt = Date.parse(trimmed)
  if (!Number.isFinite(retryAt)) return undefined
  const milliseconds = Math.max(0, retryAt - now)
  return milliseconds <= 3_600_000 ? milliseconds : undefined
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function isTransientNetworkError(error: unknown) {
  return error instanceof TypeError || error instanceof WeatherRequestTimeoutError
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number,
) {
  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(() => {
    timeoutController.abort()
  }, timeoutMs)
  const externalSignal = init.signal

  if (externalSignal?.aborted) {
    window.clearTimeout(timeoutId)
    throw new DOMException('The request was aborted.', 'AbortError')
  }

  const abortExternalRequest = () => {
    timeoutController.abort()
  }

  externalSignal?.addEventListener('abort', abortExternalRequest, { once: true })

  try {
    return await fetch(input, {
      ...init,
      signal: timeoutController.signal,
    })
  } catch (error) {
    if (externalSignal?.aborted) {
      throw new DOMException('The request was aborted.', 'AbortError')
    }

    if (isAbortError(error)) {
      throw new WeatherRequestTimeoutError()
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', abortExternalRequest)
  }
}

export async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number,
) {
  try {
    return await fetchWithTimeout(input, init, timeoutMs)
  } catch (error) {
    if (init.signal?.aborted || !isTransientNetworkError(error)) {
      throw error
    }

    return fetchWithTimeout(input, init, timeoutMs)
  }
}
