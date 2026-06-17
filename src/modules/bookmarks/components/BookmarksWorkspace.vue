<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import { useI18n } from '@/i18n/useI18n'
import BookmarkComposer from '@/modules/bookmarks/components/BookmarkComposer.vue'
import BookmarkControls from '@/modules/bookmarks/components/BookmarkControls.vue'
import BookmarkSection from '@/modules/bookmarks/components/BookmarkSection.vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import { localizeBookmarkError } from '@/modules/bookmarks/utils/bookmarksI18n'

const { t } = useI18n()
const bookmarksStore = useBookmarksStore()
const {
  activeCategory,
  bookmarks,
  categories,
  filteredBookmarks,
  filteredPinnedBookmarks,
  hasBookmarks,
  hasVisibleBookmarks,
  isInitialized,
  persistenceError,
  searchQuery,
} = storeToRefs(bookmarksStore)
const {
  clearFilters,
  initializeBookmarks,
  setActiveCategory,
  setSearchQuery,
} = bookmarksStore
const composer = useTemplateRef<InstanceType<typeof BookmarkComposer>>('composer')

const hasUncategorized = computed(() =>
  bookmarks.value.some((bookmark) => bookmark.category === null),
)
const filtersActive = computed(
  () => searchQuery.value.trim().length > 0 || activeCategory.value !== null,
)

function focusComposer() {
  composer.value?.focusTitle()
}

onMounted(() => {
  initializeBookmarks()
})
</script>

<template>
  <div class="space-y-6">
    <BookmarkComposer ref="composer" />

    <BaseSkeleton v-if="!isInitialized" :label="t('home.bookmarks.loading')" />

    <template v-else>
      <BookmarkControls
        :active-category="activeCategory"
        :categories="categories"
        :has-uncategorized="hasUncategorized"
        :search-query="searchQuery"
        @clear="clearFilters"
        @update-category="setActiveCategory"
        @update-search="setSearchQuery"
      />

      <BaseError
        v-if="persistenceError"
        :message="localizeBookmarkError(persistenceError, t) ?? ''"
        :title="t('bookmarks.error.persistenceTitle')"
      />

      <BaseEmpty
        v-if="!hasBookmarks"
        :action-label="t('bookmarks.form.addAction')"
        :description="t('bookmarks.empty.description')"
        :title="t('bookmarks.empty.title')"
        @action="focusComposer"
      />

      <BaseEmpty
        v-else-if="!hasVisibleBookmarks"
        :action-label="t('bookmarks.controls.clear')"
        :description="t('bookmarks.empty.filteredDescription')"
        :title="t('bookmarks.empty.filteredTitle')"
        @action="clearFilters"
      />

      <template v-else>
        <BookmarkSection
          v-if="filteredPinnedBookmarks.length > 0"
          :bookmarks="filteredPinnedBookmarks"
          :description="t('bookmarks.section.pinnedDescription')"
          :title="t('bookmarks.section.pinned')"
          tone="pinned"
        />

        <BookmarkSection
          v-if="filteredBookmarks.length > 0"
          :bookmarks="filteredBookmarks"
          :description="
            filtersActive
              ? t('bookmarks.section.filteredDescription')
              : t('bookmarks.section.savedDescription')
          "
          :title="t('bookmarks.section.saved')"
        />
      </template>
    </template>
  </div>
</template>
