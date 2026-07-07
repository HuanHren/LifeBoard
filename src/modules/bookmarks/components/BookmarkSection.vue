<script setup lang="ts">
import BaseSurface from '@/components/base/BaseSurface.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
import BookmarkList from '@/modules/bookmarks/components/BookmarkList.vue'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'

interface Props {
  title: string
  description: string
  bookmarks: Bookmark[]
  tone?: 'standard' | 'pinned'
}

withDefaults(defineProps<Props>(), {
  tone: 'standard',
})
</script>

<template>
  <BaseSurface
    as="section"
    :class="[
      'bookmark-section',
      tone === 'pinned'
        ? 'bookmark-section--pinned'
        : 'bookmark-section--standard',
    ]"
    :aria-labelledby="`bookmark-section-${tone}`"
    padding="none"
    :variant="tone === 'pinned' ? 'info' : 'plain'"
  >
    <SectionHeader
      class="bookmark-section__header"
      :description="description"
      :title="title"
      :title-id="`bookmark-section-${tone}`"
    />
    <div class="bookmark-section__body">
      <BookmarkList :bookmarks="bookmarks" />
    </div>
  </BaseSurface>
</template>

<style scoped>
.bookmark-section {
  overflow: hidden;
}

.bookmark-section__header {
  border-bottom: 1px solid var(--color-border-soft);
  padding: var(--space-4);
}

.bookmark-section__body {
  padding: 0 var(--space-4);
}
</style>
