export interface Bookmark {
  id: string
  title: string
  url: string
  category: string | null
  note: string | null
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface BookmarkDraft {
  title: string
  url: string
  category: string | null
  note: string | null
}

export interface BookmarkValidation {
  title: string | null
  url: string | null
  category: string | null
  note: string | null
}

export interface BookmarksStorageEnvelope {
  version: 1
  bookmarks: Bookmark[]
}

export interface PreparedBookmarkDraft {
  draft: BookmarkDraft
  validation: BookmarkValidation
}

export type BookmarkUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }
