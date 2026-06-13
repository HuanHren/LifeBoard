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
      'rounded-[var(--radius-lg)] border p-5 sm:p-6',
      tone === 'pinned'
        ? 'border-[var(--color-border)] bg-[var(--color-accent-wash)]'
        : 'border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]',
    ]"
    :aria-labelledby="`bookmark-section-${tone}`"
  >
    <div class="border-b border-[var(--color-border-soft)] pb-4">
      <h2
        :id="`bookmark-section-${tone}`"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ title }}
      </h2>
      <p class="mt-1 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ description }}
      </p>
    </div>
    <div class="pt-5">
      <BookmarkList :bookmarks="bookmarks" />
    </div>
  </section>
</template>
