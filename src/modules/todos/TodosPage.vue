<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import TodosWorkspace from '@/modules/todos/components/TodosWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <PageLayout>
    <PageHeader
      :title="t('todos.page.title')"
      :description="t('todos.page.description')"
    />
    <TodosWorkspace />
  </PageLayout>
</template>
