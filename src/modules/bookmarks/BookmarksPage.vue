<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import BookmarksWorkspace from '@/modules/bookmarks/components/BookmarksWorkspace.vue'
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Bookmarks"
      description="Keep useful websites, project links, documents, and references in a private local workspace."
    />
    <BookmarksWorkspace />
  </div>
</template>
