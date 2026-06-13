<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import TodosWorkspace from '@/modules/todos/components/TodosWorkspace.vue'
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Todos"
      description="Plan small daily tasks and keep meaningful dates in view, all stored locally in this browser."
    />
    <TodosWorkspace />
  </div>
</template>
