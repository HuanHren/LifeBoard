<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseError from '@/components/base/BaseError.vue'
import { useI18n } from '@/i18n/useI18n'
import CountdownSection from '@/modules/todos/components/CountdownSection.vue'
import TaskComposer from '@/modules/todos/components/TaskComposer.vue'
import TaskFilterBar from '@/modules/todos/components/TaskFilterBar.vue'
import TaskList from '@/modules/todos/components/TaskList.vue'
import { useTodosStore } from '@/modules/todos/stores/todos'
import { localizeTodosError } from '@/modules/todos/utils/todosI18n'

const { t } = useI18n()
const todosStore = useTodosStore()
const {
  activeFilter,
  visibleTasks,
  sortedCountdowns,
  persistenceError,
  localToday,
} = storeToRefs(todosStore)
const { initializeTodos, retryPersistence, setFilter } = todosStore

onMounted(() => {
  initializeTodos()
})
</script>

<template>
  <div class="space-y-6">
    <TaskComposer />

    <BaseError
      v-if="persistenceError"
      :action-label="t('todos.error.persistenceRetry')"
      :message="localizeTodosError(persistenceError, t) ?? ''"
      :title="t('todos.error.persistenceTitle')"
      @action="retryPersistence"
    />

    <div class="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)]">
      <section class="min-w-0 space-y-4" aria-labelledby="task-list-title">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="task-list-title" class="text-section-title text-[var(--color-text-primary)]">
              {{ t('todos.tasks.sectionTitle') }}
            </h2>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
              {{ t('todos.tasks.sectionDescription') }}
            </p>
          </div>
          <TaskFilterBar :active-filter="activeFilter" @change="setFilter" />
        </div>
        <TaskList
          :filter="activeFilter"
          :tasks="visibleTasks"
          :today="localToday"
        />
      </section>

      <CountdownSection :countdowns="sortedCountdowns" :today="localToday" />
    </div>
  </div>
</template>
