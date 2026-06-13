<script setup lang="ts">
import BookmarkItem from '@/modules/bookmarks/components/BookmarkItem.vue'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'

interface Props {
  bookmarks: Bookmark[]
}

defineProps<Props>()
</script>

<template>
  <ul class="divide-y divide-[var(--color-border-soft)]">
    <BookmarkItem
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
    />
  </ul>
</template>
