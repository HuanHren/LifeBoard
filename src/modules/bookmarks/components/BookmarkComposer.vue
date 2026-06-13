<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import {
  BOOKMARK_CATEGORY_MAX_LENGTH,
  BOOKMARK_NOTE_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
  BOOKMARK_URL_MAX_LENGTH,
} from '@/modules/bookmarks/constants/bookmarks'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import type {
  BookmarkDraft,
  BookmarkValidation,
} from '@/modules/bookmarks/types/bookmarks'
import {
  hasBookmarkValidationErrors,
  prepareBookmarkDraft,
} from '@/modules/bookmarks/utils/bookmarkValidation'

const bookmarksStore = useBookmarksStore()
const title = shallowRef('')
const url = shallowRef('')
const category = shallowRef('')
const note = shallowRef('')
const errors = shallowRef<BookmarkValidation>({
  title: null,
  url: null,
  category: null,
  note: null,
})
const announcement = shallowRef('')
const titleInput = useTemplateRef<HTMLInputElement>('titleInput')

const titleDescribedBy = computed(() =>
  errors.value.title ? 'bookmark-title-helper bookmark-title-error' : 'bookmark-title-helper',
)
const urlDescribedBy = computed(() =>
  errors.value.url ? 'bookmark-url-helper bookmark-url-error' : 'bookmark-url-helper',
)
const categoryDescribedBy = computed(() =>
  errors.value.category
    ? 'bookmark-category-helper bookmark-category-error'
    : 'bookmark-category-helper',
)
const noteDescribedBy = computed(() =>
  errors.value.note ? 'bookmark-note-helper bookmark-note-error' : 'bookmark-note-helper',
)

function submitBookmark() {
  const draft: BookmarkDraft = {
    title: title.value,
    url: url.value,
    category: category.value || null,
    note: note.value || null,
  }
  const prepared = prepareBookmarkDraft(draft)
  errors.value = prepared.validation

  if (hasBookmarkValidationErrors(prepared.validation)) {
    announcement.value = 'Check the bookmark form for errors.'
    return
  }

  if (!bookmarksStore.addBookmark(prepared.draft)) {
    announcement.value = 'The bookmark was not saved.'
    return
  }

  title.value = ''
  url.value = ''
  category.value = ''
  note.value = ''
  errors.value = { title: null, url: null, category: null, note: null }
  announcement.value = 'Bookmark added.'
}

function focusTitle() {
  titleInput.value?.focus()
}

defineExpose({ focusTitle })
</script>

<template>
  <form
    class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-soft)] sm:p-5"
    novalidate
    @submit.prevent="submitBookmark"
  >
    <div class="mb-5">
      <h2 class="text-section-title text-balance text-[var(--color-text-primary)]">
        Add a bookmark
      </h2>
      <p class="mt-1 max-w-2xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        Save a useful link with enough context to recognize it later.
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_12rem_auto] lg:items-start">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-title">Title</label>
        <input
          id="bookmark-title"
          ref="titleInput"
          v-model="title"
          :aria-describedby="titleDescribedBy"
          :aria-invalid="errors.title ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="BOOKMARK_TITLE_MAX_LENGTH"
          name="bookmark-title"
          placeholder="Reference title"
          type="text"
        />
        <p id="bookmark-title-helper" class="text-caption text-[var(--color-text-secondary)]">
          Use a name that will scan well in a list.
        </p>
        <p
          v-if="errors.title"
          id="bookmark-title-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ errors.title }}
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-url">URL</label>
        <input
          id="bookmark-url"
          v-model="url"
          :aria-describedby="urlDescribedBy"
          :aria-invalid="errors.url ? 'true' : 'false'"
          autocomplete="url"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="BOOKMARK_URL_MAX_LENGTH + 1"
          name="bookmark-url"
          placeholder="example.com"
          type="url"
        />
        <p id="bookmark-url-helper" class="text-caption text-[var(--color-text-secondary)]">
          A missing protocol will be saved as HTTPS.
        </p>
        <p
          v-if="errors.url"
          id="bookmark-url-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ errors.url }}
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="bookmark-category">Category</label>
        <input
          id="bookmark-category"
          v-model="category"
          :aria-describedby="categoryDescribedBy"
          :aria-invalid="errors.category ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="BOOKMARK_CATEGORY_MAX_LENGTH"
          name="bookmark-category"
          placeholder="Optional"
          type="text"
        />
        <p id="bookmark-category-helper" class="text-caption text-[var(--color-text-secondary)]">
          A short grouping name.
        </p>
        <p
          v-if="errors.category"
          id="bookmark-category-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ errors.category }}
        </p>
      </div>

      <BaseButton class="w-full lg:mt-7 lg:w-auto" type="submit" variant="primary">
        Add bookmark
      </BaseButton>
    </div>

    <div class="mt-4 space-y-2">
      <label class="block text-sm font-semibold" for="bookmark-note">Note</label>
      <textarea
        id="bookmark-note"
        v-model="note"
        :aria-describedby="noteDescribedBy"
        :aria-invalid="errors.note ? 'true' : 'false'"
        class="min-h-24 w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
        :maxlength="BOOKMARK_NOTE_MAX_LENGTH"
        name="bookmark-note"
        placeholder="Why is this useful?"
        rows="3"
      />
      <p id="bookmark-note-helper" class="text-caption text-[var(--color-text-secondary)]">
        Optional context, up to {{ BOOKMARK_NOTE_MAX_LENGTH }} characters.
      </p>
      <p
        v-if="errors.note"
        id="bookmark-note-error"
        class="text-sm font-medium text-[var(--color-danger)]"
        role="alert"
      >
        {{ errors.note }}
      </p>
    </div>

    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </form>
</template>
