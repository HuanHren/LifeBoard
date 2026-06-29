<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolsWorkspace from '@/modules/tools/components/ToolsWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <PageLayout>
    <PageHeader
      :title="t('tools.page.title')"
      :description="t('tools.page.description')"
    />
    <ToolsWorkspace />
  </PageLayout>
</template>
