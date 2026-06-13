<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseError from '@/components/base/BaseError.vue'
import CountdownSection from '@/modules/todos/components/CountdownSection.vue'
import TaskComposer from '@/modules/todos/components/TaskComposer.vue'
import TaskFilterBar from '@/modules/todos/components/TaskFilterBar.vue'
import TaskList from '@/modules/todos/components/TaskList.vue'
import { useTodosStore } from '@/modules/todos/stores/todos'

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
      action-label="Retry saving"
      :message="persistenceError"
      title="Planning data could not be saved"
      @action="retryPersistence"
    />

    <div class="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.75fr)]">
      <section class="min-w-0 space-y-4" aria-labelledby="task-list-title">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="task-list-title" class="text-section-title text-[var(--color-text-primary)]">
              Tasks
            </h2>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
              Today also includes unfinished tasks whose due date has passed.
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
