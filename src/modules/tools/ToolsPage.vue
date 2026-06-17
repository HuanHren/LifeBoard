<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import ToolsWorkspace from '@/modules/tools/components/ToolsWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      :title="t('tools.page.title')"
      :description="t('tools.page.description')"
    />
    <ToolsWorkspace />
  </div>
</template>
