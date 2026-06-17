<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import BookmarksWorkspace from '@/modules/bookmarks/components/BookmarksWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      :title="t('bookmarks.page.title')"
      :description="t('bookmarks.page.description')"
    />
    <BookmarksWorkspace />
  </div>
</template>
