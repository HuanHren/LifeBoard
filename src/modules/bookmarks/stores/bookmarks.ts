import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { BOOKMARKS_STORAGE_VERSION } from '@/modules/bookmarks/constants/bookmarks'
import {
  loadBookmarksStorage,
  saveBookmarksStorage,
} from '@/modules/bookmarks/services/bookmarksStorage'
import type {
  Bookmark,
  BookmarkDraft,
} from '@/modules/bookmarks/types/bookmarks'
import {
  hasBookmarkValidationErrors,
  prepareBookmarkDraft,
} from '@/modules/bookmarks/utils/bookmarkValidation'

function compareBookmarks(left: Bookmark, right: Bookmark) {
  return (
    right.updatedAt.localeCompare(left.updatedAt) ||
    left.title.localeCompare(right.title, undefined, { sensitivity: 'base' })
  )
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  const bookmarks = ref<Bookmark[]>([])
  const searchQuery = shallowRef('')
  const activeCategory = shallowRef<string | null>(null)
  const isInitialized = shallowRef(false)
  const persistenceError = shallowRef<string | null>(null)
  let writesBlocked = false

  const categories = computed(() => {
    const categoryMap = new Map<string, string>()

    for (const bookmark of bookmarks.value) {
      if (bookmark.category === null) continue
      const key = bookmark.category.toLocaleLowerCase()
      if (!categoryMap.has(key)) categoryMap.set(key, bookmark.category)
    }

    return [...categoryMap.values()].sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: 'base' }),
    )
  })

  const pinnedBookmarks = computed(() =>
    bookmarks.value.filter((bookmark) => bookmark.pinned).sort(compareBookmarks),
  )

  const summaryBookmarks = computed(() =>
    [...bookmarks.value].sort(
      (left, right) =>
        Number(right.pinned) - Number(left.pinned) || compareBookmarks(left, right),
    ),
  )

  function matchesFilters(bookmark: Bookmark) {
    if (activeCategory.value === '') {
      if (bookmark.category !== null) return false
    } else if (
      activeCategory.value !== null &&
      bookmark.category?.localeCompare(activeCategory.value, undefined, {
        sensitivity: 'base',
      }) !== 0
    ) {
      return false
    }

    const query = searchQuery.value.trim().toLocaleLowerCase()
    if (!query) return true

    return [bookmark.title, bookmark.url, bookmark.category, bookmark.note].some((value) =>
      value?.toLocaleLowerCase().includes(query),
    )
  }

  const filteredPinnedBookmarks = computed(() =>
    pinnedBookmarks.value.filter(matchesFilters),
  )

  const filteredBookmarks = computed(() =>
    bookmarks.value
      .filter((bookmark) => !bookmark.pinned && matchesFilters(bookmark))
      .sort(compareBookmarks),
  )

  const hasBookmarks = computed(() => bookmarks.value.length > 0)
  const hasVisibleBookmarks = computed(
    () => filteredPinnedBookmarks.value.length > 0 || filteredBookmarks.value.length > 0,
  )

  function reconcileActiveCategory(nextBookmarks: Bookmark[]) {
    if (activeCategory.value === null) return

    if (activeCategory.value === '') {
      if (!nextBookmarks.some((bookmark) => bookmark.category === null)) {
        activeCategory.value = null
      }
      return
    }

    const categoryStillExists = nextBookmarks.some(
      (bookmark) =>
        bookmark.category?.localeCompare(activeCategory.value ?? '', undefined, {
          sensitivity: 'base',
        }) === 0,
    )

    if (!categoryStillExists) activeCategory.value = null
  }

  function persistNext(nextBookmarks: Bookmark[]) {
    if (writesBlocked) {
      return false
    }

    const result = saveBookmarksStorage({
      version: BOOKMARKS_STORAGE_VERSION,
      bookmarks: nextBookmarks,
    })

    if (!result.ok) {
      persistenceError.value = result.error
      return false
    }

    bookmarks.value.splice(0, bookmarks.value.length, ...nextBookmarks)
    reconcileActiveCategory(nextBookmarks)
    persistenceError.value = null
    return true
  }

  function initializeBookmarks() {
    if (isInitialized.value) return

    const result = loadBookmarksStorage()
    isInitialized.value = true

    if (!result.ok) {
      writesBlocked = true
      persistenceError.value = result.error
      return
    }

    if (result.data) {
      bookmarks.value = result.data.bookmarks
    }
  }

  function addBookmark(draft: BookmarkDraft) {
    const prepared = prepareBookmarkDraft(draft)
    if (hasBookmarkValidationErrors(prepared.validation)) return false

    const now = new Date().toISOString()
    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      ...prepared.draft,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }

    return persistNext([...bookmarks.value, bookmark])
  }

  function updateBookmark(id: string, draft: BookmarkDraft) {
    const prepared = prepareBookmarkDraft(draft)
    if (hasBookmarkValidationErrors(prepared.validation)) return false

    const nextBookmarks = bookmarks.value.map((bookmark) =>
      bookmark.id === id
        ? {
            ...bookmark,
            ...prepared.draft,
            updatedAt: new Date().toISOString(),
          }
        : bookmark,
    )

    return persistNext(nextBookmarks)
  }

  function deleteBookmark(id: string) {
    return persistNext(bookmarks.value.filter((bookmark) => bookmark.id !== id))
  }

  function togglePinned(id: string) {
    const nextBookmarks = bookmarks.value.map((bookmark) =>
      bookmark.id === id
        ? {
            ...bookmark,
            pinned: !bookmark.pinned,
            updatedAt: new Date().toISOString(),
          }
        : bookmark,
    )

    return persistNext(nextBookmarks)
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setActiveCategory(category: string | null) {
    activeCategory.value = category
  }

  function clearFilters() {
    searchQuery.value = ''
    activeCategory.value = null
  }

  function clearPersistenceError() {
    if (!writesBlocked) persistenceError.value = null
  }

  function synchronizeFromSettings(nextBookmarks: Bookmark[]) {
    bookmarks.value.splice(0, bookmarks.value.length, ...nextBookmarks)
    reconcileActiveCategory(nextBookmarks)
    persistenceError.value = null
    writesBlocked = false
    isInitialized.value = true
  }

  return {
    bookmarks,
    searchQuery,
    activeCategory,
    isInitialized,
    persistenceError,
    categories,
    pinnedBookmarks,
    summaryBookmarks,
    filteredPinnedBookmarks,
    filteredBookmarks,
    hasBookmarks,
    hasVisibleBookmarks,
    initializeBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    togglePinned,
    setSearchQuery,
    setActiveCategory,
    clearFilters,
    clearPersistenceError,
    synchronizeFromSettings,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBookmarksStore, import.meta.hot))
}
