<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import BookmarkComposer from '@/modules/bookmarks/components/BookmarkComposer.vue'
import BookmarkControls from '@/modules/bookmarks/components/BookmarkControls.vue'
import BookmarkSection from '@/modules/bookmarks/components/BookmarkSection.vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'

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

    <BaseSkeleton v-if="!isInitialized" label="Loading your bookmarks" />

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
        :message="persistenceError"
        title="Bookmarks could not be saved or loaded"
      />

      <BaseEmpty
        v-if="!hasBookmarks"
        action-label="Add your first bookmark"
        description="Save a useful website, project link, document, or reference. It will stay in this browser."
        title="No bookmarks saved yet"
        @action="focusComposer"
      />

      <BaseEmpty
        v-else-if="!hasVisibleBookmarks"
        action-label="Clear filters"
        description="No saved bookmarks match the current search and category."
        title="No matching bookmarks"
        @action="clearFilters"
      />

      <template v-else>
        <BookmarkSection
          v-if="filteredPinnedBookmarks.length > 0"
          :bookmarks="filteredPinnedBookmarks"
          description="Pinned references stay close while respecting the current filters."
          title="Pinned"
          tone="pinned"
        />

        <BookmarkSection
          v-if="filteredBookmarks.length > 0"
          :bookmarks="filteredBookmarks"
          :description="
            filtersActive
              ? 'Saved references matching the current filters.'
              : 'Your saved references, ordered by the most recently updated.'
          "
          title="Bookmarks"
        />
      </template>
    </template>
  </div>
</template>
