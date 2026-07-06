<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, type ComponentPublicInstance } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import BookmarkDeleteConfirmation from '@/modules/bookmarks/components/BookmarkDeleteConfirmation.vue'
import BookmarkEditForm from '@/modules/bookmarks/components/BookmarkEditForm.vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import { formatBookmarkUrl } from '@/modules/bookmarks/utils/bookmarkUrl'

interface Props {
  bookmark: Bookmark
}

const props = defineProps<Props>()
const { t } = useI18n()
const bookmarksStore = useBookmarksStore()
const isEditing = shallowRef(false)
const isConfirmingDelete = shallowRef(false)
const deleteButton = useTemplateRef<ComponentPublicInstance>('deleteButton')
const displayUrl = computed(() => formatBookmarkUrl(props.bookmark.url))

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
  <li class="bookmark-item">
    <BookmarkEditForm
      v-if="isEditing"
      :bookmark="bookmark"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />

    <div v-else class="bookmark-item__content">
      <div class="bookmark-item__top">
        <div class="bookmark-item__main">
          <div class="bookmark-item__meta">
            <span
              v-if="bookmark.pinned"
              class="bookmark-item__pin"
            >
              {{ t('bookmarks.item.pinned') }}
            </span>
            <span
              v-if="bookmark.category"
              class="bookmark-item__category"
            >
              {{ bookmark.category }}
            </span>
          </div>

          <h3 class="bookmark-item__title">
            <a
              class="interactive-surface bookmark-item__title-link"
              :href="bookmark.url"
              :aria-label="t('bookmarks.item.openNamed', { title: bookmark.title })"
              rel="noopener noreferrer"
              target="_blank"
            >
              {{ bookmark.title }}
            </a>
          </h3>

          <p class="bookmark-item__url">
            {{ displayUrl }}
          </p>

          <p
            v-if="bookmark.note"
            class="bookmark-item__note"
          >
            {{ bookmark.note }}
          </p>
        </div>

        <a
          class="interactive-surface bookmark-item__open"
          :href="bookmark.url"
          :aria-label="t('bookmarks.item.openNamed', { title: bookmark.title })"
          rel="noopener noreferrer"
          target="_blank"
        >
          {{ t('bookmarks.item.openNewTab') }}
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
          class="bookmark-item__action"
          :aria-pressed="bookmark.pinned"
          :aria-label="
            bookmark.pinned
              ? t('bookmarks.item.unpinNamed', { title: bookmark.title })
              : t('bookmarks.item.pinNamed', { title: bookmark.title })
          "
          size="sm"
          variant="ghost"
          @click="bookmarksStore.togglePinned(bookmark.id)"
        >
          {{
            bookmark.pinned
              ? t('bookmarks.item.unpin')
              : t('bookmarks.item.pin')
          }}
        </BaseButton>
        <BaseButton
          class="bookmark-item__action"
          :aria-label="t('bookmarks.item.editNamed', { title: bookmark.title })"
          size="sm"
          variant="ghost"
          @click="isEditing = true"
        >
          {{ t('bookmarks.item.edit') }}
        </BaseButton>
        <BaseButton
          ref="deleteButton"
          class="bookmark-item__action"
          :aria-label="t('bookmarks.item.deleteNamed', { title: bookmark.title })"
          size="sm"
          variant="ghost"
          @click="isConfirmingDelete = true"
        >
          {{ t('bookmarks.item.delete') }}
        </BaseButton>
      </div>
    </div>
  </li>
</template>

<style scoped>
.bookmark-item {
  min-width: 0;
  padding: var(--space-4) 0;
}

.bookmark-item + .bookmark-item {
  border-top: 1px solid var(--color-border-soft);
}

.bookmark-item__content {
  display: grid;
  gap: var(--space-3);
}

.bookmark-item__top {
  display: grid;
  gap: var(--space-3);
}

.bookmark-item__main {
  min-width: 0;
}

.bookmark-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.bookmark-item__pin,
.bookmark-item__category {
  max-width: 100%;
  border-radius: var(--radius-pill);
  padding: 0.2rem var(--space-2);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  overflow-wrap: anywhere;
}

.bookmark-item__pin {
  background: var(--color-accent-soft);
  color: var(--color-accent-text);
}

.bookmark-item__category {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.bookmark-item__title {
  min-width: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-semibold);
  line-height: 1.35;
}

.bookmark-item__title-link {
  border-radius: var(--radius-sm);
  overflow-wrap: anywhere;
}

.bookmark-item__title-link:hover {
  color: var(--color-accent-text);
}

.bookmark-item__url {
  max-width: 100%;
  margin-top: var(--space-1);
  color: var(--color-accent-text);
  font-size: var(--font-size-caption);
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-item__note {
  max-width: 52rem;
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.bookmark-item__open {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  padding: 0 var(--space-3);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
}

.bookmark-item__open:hover {
  border-color: var(--color-accent);
}

.bookmark-item__action {
  min-height: 2.75rem;
}

@media (min-width: 48rem) {
  .bookmark-item__top {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
  }
}
</style>
