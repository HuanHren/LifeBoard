import type { TranslationKey } from '@/i18n/keys'
import type { Translator } from '@/i18n/types'
import {
  BOOKMARK_CATEGORY_MAX_LENGTH,
  BOOKMARK_NOTE_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
  BOOKMARK_URL_MAX_LENGTH,
} from '@/modules/bookmarks/constants/bookmarks'

const errorKeys: Record<string, TranslationKey> = {
  'Enter a bookmark title.': 'bookmarks.error.titleRequired',
  [`Keep the title within ${BOOKMARK_TITLE_MAX_LENGTH} characters.`]:
    'bookmarks.error.titleTooLong',
  'Enter a URL.': 'bookmarks.error.urlRequired',
  [`Keep the URL within ${BOOKMARK_URL_MAX_LENGTH.toLocaleString()} characters.`]:
    'bookmarks.error.urlTooLong',
  'Enter a valid website URL.': 'bookmarks.error.urlInvalid',
  'Use an HTTP or HTTPS website URL.': 'bookmarks.error.urlProtocol',
  'Remove the username and password from the URL.':
    'bookmarks.error.urlCredentials',
  'Enter a URL with a valid hostname.': 'bookmarks.error.urlHostname',
  [`Keep the normalized URL within ${BOOKMARK_URL_MAX_LENGTH.toLocaleString()} characters.`]:
    'bookmarks.error.normalizedUrlTooLong',
  [`Keep the category within ${BOOKMARK_CATEGORY_MAX_LENGTH} characters.`]:
    'bookmarks.error.categoryTooLong',
  [`Keep the note within ${BOOKMARK_NOTE_MAX_LENGTH} characters.`]:
    'bookmarks.error.noteTooLong',
  'Local storage is unavailable. Bookmark data cannot be saved in this browser.':
    'bookmarks.error.storageUnavailable',
  'Local storage is unavailable. Bookmark changes cannot be saved in this browser.':
    'bookmarks.error.storageUnavailable',
  'Saved bookmark data contains invalid JSON. It was left unchanged for recovery.':
    'bookmarks.error.invalidJson',
  'Saved bookmark data does not match the supported format. It was left unchanged.':
    'bookmarks.error.invalidFormat',
}

export function localizeBookmarkError(value: string | null, t: Translator) {
  if (!value) return null
  const key = errorKeys[value]
  if (!key) return value

  if (key === 'bookmarks.error.titleTooLong') {
    return t(key, { count: BOOKMARK_TITLE_MAX_LENGTH })
  }
  if (
    key === 'bookmarks.error.urlTooLong' ||
    key === 'bookmarks.error.normalizedUrlTooLong'
  ) {
    return t(key, { count: BOOKMARK_URL_MAX_LENGTH })
  }
  if (key === 'bookmarks.error.categoryTooLong') {
    return t(key, { count: BOOKMARK_CATEGORY_MAX_LENGTH })
  }
  if (key === 'bookmarks.error.noteTooLong') {
    return t(key, { count: BOOKMARK_NOTE_MAX_LENGTH })
  }
  return t(key)
}
