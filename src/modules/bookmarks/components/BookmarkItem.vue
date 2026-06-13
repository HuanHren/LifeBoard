<script setup lang="ts">
import { nextTick, shallowRef, useTemplateRef, type ComponentPublicInstance } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BookmarkDeleteConfirmation from '@/modules/bookmarks/components/BookmarkDeleteConfirmation.vue'
import BookmarkEditForm from '@/modules/bookmarks/components/BookmarkEditForm.vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import { formatBookmarkUrl } from '@/modules/bookmarks/utils/bookmarkUrl'

interface Props {
  bookmark: Bookmark
}

const props = defineProps<Props>()
const bookmarksStore = useBookmarksStore()
const isEditing = shallowRef(false)
const isConfirmingDelete = shallowRef(false)
const deleteButton = useTemplateRef<ComponentPublicInstance>('deleteButton')

function cancelDelete() {
  isConfirmingDelete.value = false
  void nextTick(() => {
    const element = deleteButton.value?.$el
    if (element instanceof HTMLButtonElement) element.focus()
  })
}

function deleteBookmark() {
  bookmarksStore.deleteBookmark(props.bookmark.id)
}
</script>

<template>
  <li class="py-5 first:pt-0 last:pb-0">
    <BookmarkEditForm
      v-if="isEditing"
      :bookmark="bookmark"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />

    <div v-else class="space-y-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-base font-semibold text-balance text-[var(--color-text-primary)]">
              {{ bookmark.title }}
            </h3>
            <span
              v-if="bookmark.pinned"
              class="rounded-[var(--radius-sm)] bg-[var(--color-accent-soft)] px-2 py-1 text-caption font-medium text-[var(--color-accent-text)]"
            >
              Pinned
            </span>
            <span
              v-if="bookmark.category"
              class="text-caption font-medium text-[var(--color-text-secondary)]"
            >
              {{ bookmark.category }}
            </span>
          </div>

          <p class="mt-1 max-w-full break-words text-sm text-[var(--color-accent-text)]">
            {{ formatBookmarkUrl(bookmark.url) }}
          </p>

          <p
            v-if="bookmark.note"
            class="mt-3 max-w-3xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
          >
            {{ bookmark.note }}
          </p>
        </div>

        <a
          class="interactive-surface inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-3 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          :href="bookmark.url"
          rel="noopener noreferrer"
          target="_blank"
        >
          Open in new tab
        </a>
      </div>

      <BookmarkDeleteConfirmation
        v-if="isConfirmingDelete"
        :bookmark-title="bookmark.title"
        @cancel="cancelDelete"
        @confirm="deleteBookmark"
      />

      <div v-else class="flex flex-wrap justify-end gap-1">
        <BaseButton
          :aria-pressed="bookmark.pinned"
          size="sm"
          variant="ghost"
          @click="bookmarksStore.togglePinned(bookmark.id)"
        >
          {{ bookmark.pinned ? 'Unpin' : 'Pin' }}
        </BaseButton>
        <BaseButton size="sm" variant="ghost" @click="isEditing = true">Edit</BaseButton>
        <BaseButton
          ref="deleteButton"
          size="sm"
          variant="ghost"
          @click="isConfirmingDelete = true"
        >
          Delete
        </BaseButton>
      </div>
    </div>
  </li>
</template>
