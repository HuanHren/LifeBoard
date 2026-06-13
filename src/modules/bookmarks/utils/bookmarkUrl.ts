import { BOOKMARK_URL_MAX_LENGTH } from '@/modules/bookmarks/constants/bookmarks'
import type { BookmarkUrlResult } from '@/modules/bookmarks/types/bookmarks'

const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/

export function normalizeBookmarkUrl(value: string): BookmarkUrlResult {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return { ok: false, error: 'Enter a URL.' }
  }

  if (trimmed.length > BOOKMARK_URL_MAX_LENGTH) {
    return {
      ok: false,
      error: `Keep the URL within ${BOOKMARK_URL_MAX_LENGTH.toLocaleString()} characters.`,
    }
  }

  const candidate = SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`

  let parsed: URL

  try {
    parsed = new URL(candidate)
  } catch {
    return { ok: false, error: 'Enter a valid website URL.' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Use an HTTP or HTTPS website URL.' }
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: 'Remove the username and password from the URL.' }
  }

  if (!parsed.hostname) {
    return { ok: false, error: 'Enter a URL with a valid hostname.' }
  }

  const normalized = parsed.toString()

  if (normalized.length > BOOKMARK_URL_MAX_LENGTH) {
    return {
      ok: false,
      error: `Keep the normalized URL within ${BOOKMARK_URL_MAX_LENGTH.toLocaleString()} characters.`,
    }
  }

  return { ok: true, url: normalized }
}

export function formatBookmarkUrl(value: string) {
  try {
    const parsed = new URL(value)
    return `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return value
  }
}
