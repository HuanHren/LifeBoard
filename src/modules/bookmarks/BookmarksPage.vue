<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import BookmarksWorkspace from '@/modules/bookmarks/components/BookmarksWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <PageLayout>
    <PageHeader
      :title="t('bookmarks.page.title')"
      :description="t('bookmarks.page.description')"
    />
    <BookmarksWorkspace />
  </PageLayout>
</template>
