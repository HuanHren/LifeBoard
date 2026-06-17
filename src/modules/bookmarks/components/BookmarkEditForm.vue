<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import {
  BOOKMARK_CATEGORY_MAX_LENGTH,
  BOOKMARK_NOTE_MAX_LENGTH,
  BOOKMARK_TITLE_MAX_LENGTH,
  BOOKMARK_URL_MAX_LENGTH,
} from '@/modules/bookmarks/constants/bookmarks'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import type {
  Bookmark,
  BookmarkDraft,
  BookmarkValidation,
} from '@/modules/bookmarks/types/bookmarks'
import {
  hasBookmarkValidationErrors,
  prepareBookmarkDraft,
} from '@/modules/bookmarks/utils/bookmarkValidation'
import { localizeBookmarkError } from '@/modules/bookmarks/utils/bookmarksI18n'

interface Props {
  bookmark: Bookmark
}

interface Emits {
  saved: []
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const bookmarksStore = useBookmarksStore()
const title = shallowRef(props.bookmark.title)
const url = shallowRef(props.bookmark.url)
const category = shallowRef(props.bookmark.category ?? '')
const note = shallowRef(props.bookmark.note ?? '')
const errors = shallowRef<BookmarkValidation>({
  title: null,
  url: null,
  category: null,
  note: null,
})
const announcement = shallowRef('')

const fieldId = (field: string) => `bookmark-edit-${field}-${props.bookmark.id}`
const describedBy = (field: keyof BookmarkValidation) =>
  computed(() => (errors.value[field] ? `${fieldId(field)}-error` : undefined))

const titleDescribedBy = describedBy('title')
const urlDescribedBy = describedBy('url')
const categoryDescribedBy = describedBy('category')
const noteDescribedBy = describedBy('note')

function saveBookmark() {
  const draft: BookmarkDraft = {
    title: title.value,
    url: url.value,
    category: category.value || null,
    note: note.value || null,
  }
  const prepared = prepareBookmarkDraft(draft)
  errors.value = prepared.validation

  if (hasBookmarkValidationErrors(prepared.validation)) {
    announcement.value = t('bookmarks.composer.announcement.checkForm')
    return
  }

  if (!bookmarksStore.updateBookmark(props.bookmark.id, prepared.draft)) {
    announcement.value = t('bookmarks.composer.announcement.notSaved')
    return
  }

  announcement.value = t('bookmarks.composer.announcement.updated')
  emit('saved')
}
</script>

<template>
  <form class="space-y-4 py-1" novalidate @submit.prevent="saveBookmark">
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" :for="fieldId('title')">
          {{ t('bookmarks.form.titleLabel') }}
        </label>
        <input
          :id="fieldId('title')"
          v-model="title"
          :aria-describedby="titleDescribedBy"
          :aria-invalid="errors.title ? 'true' : 'false'"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
          :maxlength="BOOKMARK_TITLE_MAX_LENGTH"
          type="text"
        />
        <p
          v-if="errors.title"
          :id="`${fieldId('title')}-error`"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeBookmarkError(errors.title, t) }}
        </p>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-semibold" :for="fieldId('url')">
          {{ t('bookmarks.form.urlLabel') }}
        </label>
        <input
          :id="fieldId('url')"
          v-model="url"
          :aria-describedby="urlDescribedBy"
          :aria-invalid="errors.url ? 'true' : 'false'"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
          :maxlength="BOOKMARK_URL_MAX_LENGTH + 1"
          type="url"
        />
        <p
          v-if="errors.url"
          :id="`${fieldId('url')}-error`"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeBookmarkError(errors.url, t) }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" :for="fieldId('category')">
          {{ t('bookmarks.form.categoryLabel') }}
        </label>
        <input
          :id="fieldId('category')"
          v-model="category"
          :aria-describedby="categoryDescribedBy"
          :aria-invalid="errors.category ? 'true' : 'false'"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
          :maxlength="BOOKMARK_CATEGORY_MAX_LENGTH"
          type="text"
        />
        <p
          v-if="errors.category"
          :id="`${fieldId('category')}-error`"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeBookmarkError(errors.category, t) }}
        </p>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-semibold" :for="fieldId('note')">
          {{ t('bookmarks.form.noteLabel') }}
        </label>
        <textarea
          :id="fieldId('note')"
          v-model="note"
          :aria-describedby="noteDescribedBy"
          :aria-invalid="errors.note ? 'true' : 'false'"
          class="min-h-20 w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 py-2"
          :maxlength="BOOKMARK_NOTE_MAX_LENGTH"
          rows="2"
        />
        <p
          v-if="errors.note"
          :id="`${fieldId('note')}-error`"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeBookmarkError(errors.note, t) }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-2">
      <BaseButton size="sm" variant="ghost" @click="emit('cancel')">
        {{ t('bookmarks.form.cancelAction') }}
      </BaseButton>
      <BaseButton size="sm" type="submit" variant="primary">
        {{ t('bookmarks.form.saveAction') }}
      </BaseButton>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </form>
</template>
