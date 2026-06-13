import {
  BOOKMARKS_STORAGE_KEY,
  BOOKMARKS_STORAGE_VERSION,
} from '@/modules/bookmarks/constants/bookmarks'
import type { BookmarksStorageEnvelope } from '@/modules/bookmarks/types/bookmarks'
import { isBookmark } from '@/modules/bookmarks/utils/bookmarkValidation'

type StorageErrorKind = 'unavailable' | 'invalid-json' | 'schema' | 'quota'

export type BookmarksStorageResult =
  | { ok: true; data: BookmarksStorageEnvelope | null }
  | { ok: false; error: string; kind: StorageErrorKind }

function isEnvelope(value: unknown): value is BookmarksStorageEnvelope {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const envelope = value as Partial<BookmarksStorageEnvelope>
  return (
    envelope.version === BOOKMARKS_STORAGE_VERSION &&
    Array.isArray(envelope.bookmarks) &&
    envelope.bookmarks.every(isBookmark)
  )
}

function unavailableMessage() {
  return 'Local storage is unavailable. Bookmark changes cannot be saved in this browser.'
}

export function loadBookmarksStorage(): BookmarksStorageResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: unavailableMessage(), kind: 'unavailable' }
  }

  try {
    const stored = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY)

    if (stored === null) {
      return { ok: true, data: null }
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(stored) as unknown
    } catch {
      return {
        ok: false,
        kind: 'invalid-json',
        error: 'Saved bookmark data contains invalid JSON. It was left unchanged for recovery.',
      }
    }

    if (!isEnvelope(parsed)) {
      return {
        ok: false,
        kind: 'schema',
        error: 'Saved bookmark data does not match the supported format. It was left unchanged.',
      }
    }

    return { ok: true, data: parsed }
  } catch {
    return { ok: false, error: unavailableMessage(), kind: 'unavailable' }
  }
}

export function saveBookmarksStorage(
  envelope: BookmarksStorageEnvelope,
): BookmarksStorageResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: unavailableMessage(), kind: 'unavailable' }
  }

  try {
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(envelope))
    return { ok: true, data: envelope }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return {
        ok: false,
        kind: 'quota',
        error: 'Browser storage is full. Remove saved data or free browser storage, then retry.',
      }
    }

    return { ok: false, error: unavailableMessage(), kind: 'unavailable' }
  }
}
