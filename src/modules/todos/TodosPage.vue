<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import TodosWorkspace from '@/modules/todos/components/TodosWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      :title="t('todos.page.title')"
      :description="t('todos.page.description')"
    />
    <TodosWorkspace />
  </div>
</template>
