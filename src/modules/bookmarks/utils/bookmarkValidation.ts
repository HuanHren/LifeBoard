import {
  BOOKMARK_CATEGORY_MAX_LENGTH,
  BOOKMARK_NOTE_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
} from '@/modules/bookmarks/constants/bookmarks'
import type {
  Bookmark,
  BookmarkDraft,
  BookmarkValidation,
  PreparedBookmarkDraft,
} from '@/modules/bookmarks/types/bookmarks'
import { normalizeBookmarkUrl } from '@/modules/bookmarks/utils/bookmarkUrl'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

export function normalizeBookmarkDraft(draft: BookmarkDraft): BookmarkDraft {
  return {
    title: draft.title.trim(),
    url: draft.url.trim(),
    category: draft.category?.trim() || null,
    note: draft.note?.trim() || null,
  }
}

export function prepareBookmarkDraft(draft: BookmarkDraft): PreparedBookmarkDraft {
  const normalized = normalizeBookmarkDraft(draft)
  const urlResult = normalizeBookmarkUrl(normalized.url)
  const validation: BookmarkValidation = {
    title:
      normalized.title.length === 0
        ? 'Enter a bookmark title.'
        : normalized.title.length > BOOKMARK_TITLE_MAX_LENGTH
          ? `Keep the title within ${BOOKMARK_TITLE_MAX_LENGTH} characters.`
          : null,
    url: urlResult.ok ? null : urlResult.error,
    category:
      normalized.category !== null &&
      normalized.category.length > BOOKMARK_CATEGORY_MAX_LENGTH
        ? `Keep the category within ${BOOKMARK_CATEGORY_MAX_LENGTH} characters.`
        : null,
    note:
      normalized.note !== null && normalized.note.length > BOOKMARK_NOTE_MAX_LENGTH
        ? `Keep the note within ${BOOKMARK_NOTE_MAX_LENGTH} characters.`
        : null,
  }

  return {
    draft: {
      ...normalized,
      url: urlResult.ok ? urlResult.url : normalized.url,
    },
    validation,
  }
}

export function hasBookmarkValidationErrors(validation: BookmarkValidation) {
  return Object.values(validation).some((value) => value !== null)
}

export function isBookmark(value: unknown): value is Bookmark {
  if (!isRecord(value)) {
    return false
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.url !== 'string' ||
    typeof value.pinned !== 'boolean' ||
    !isIsoTimestamp(value.createdAt) ||
    !isIsoTimestamp(value.updatedAt)
  ) {
    return false
  }

  const prepared = prepareBookmarkDraft({
    title: value.title,
    url: value.url,
    category: typeof value.category === 'string' ? value.category : null,
    note: typeof value.note === 'string' ? value.note : null,
  })

  return (
    !hasBookmarkValidationErrors(prepared.validation) &&
    prepared.draft.title === value.title &&
    prepared.draft.url === value.url &&
    prepared.draft.category === value.category &&
    prepared.draft.note === value.note
  )
}
