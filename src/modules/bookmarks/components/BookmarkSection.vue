<script setup lang="ts">
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
  <section
    :class="[
      'bookmark-section',
      tone === 'pinned'
        ? 'bookmark-section--pinned'
        : 'bookmark-section--standard',
    ]"
    :aria-labelledby="`bookmark-section-${tone}`"
  >
    <div class="bookmark-section__header">
      <h2
        :id="`bookmark-section-${tone}`"
        class="bookmark-section__title"
      >
        {{ title }}
      </h2>
      <p class="bookmark-section__description">
        {{ description }}
      </p>
    </div>
    <div class="bookmark-section__body">
      <BookmarkList :bookmarks="bookmarks" />
    </div>
  </section>
</template>

<style scoped>
.bookmark-section {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.bookmark-section--standard {
  background: var(--color-surface-raised);
}

.bookmark-section--pinned {
  border-color: var(--color-border);
  background: var(--color-accent-wash);
}

.bookmark-section__header {
  border-bottom: 1px solid var(--color-border-soft);
  padding: var(--space-4);
}

.bookmark-section__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.bookmark-section__description {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
  line-height: 1.55;
}

.bookmark-section__body {
  padding: 0 var(--space-4);
}
</style>
