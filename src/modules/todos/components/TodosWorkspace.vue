<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseError from '@/components/base/BaseError.vue'
import BaseButton from '@/components/base/BaseButton.vue'
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
  allTasks,
  completedTasks,
  deletedTasks,
  visibleTasks,
  todayTasks,
  upcomingTasks,
  sortedCountdowns,
  persistenceError,
  localToday,
} = storeToRefs(todosStore)
const { initializeTodos, retryPersistence, setFilter } = todosStore

const overdueCount = computed(
  () =>
    todayTasks.value.filter((task) => task.dueDate !== null && task.dueDate < localToday.value)
      .length,
)
const weekCount = computed(() => {
  const today = new Date(`${localToday.value}T00:00:00`)
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  const weekEndValue = [
    weekEnd.getFullYear(),
    String(weekEnd.getMonth() + 1).padStart(2, '0'),
    String(weekEnd.getDate()).padStart(2, '0'),
  ].join('-')
  return upcomingTasks.value.filter((task) => task.dueDate !== null && task.dueDate <= weekEndValue)
    .length
})

const filterCounts = computed(() => ({
  today: todayTasks.value.length,
  upcoming: upcomingTasks.value.length,
  all: allTasks.value.length,
  completed: completedTasks.value.length,
  deleted: deletedTasks.value.length,
}))

function focusQuickAdd() {
  const input = document.getElementById('task-title')
  if (input instanceof HTMLInputElement) {
    input.focus()
  }
}

onMounted(() => {
  initializeTodos()
})
</script>

<template>
  <div class="space-y-6">
    <header
      class="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
    >
      <div class="min-w-0">
        <h1 class="text-page-title text-balance text-[var(--color-text-primary)]">
          {{ t('todos.page.title') }}
        </h1>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('todos.page.description') }}
        </p>
        <dl class="mt-4 flex flex-wrap gap-2 text-caption">
          <div
            v-if="todayTasks.length > 0"
            class="rounded-[var(--radius-pill)] bg-[var(--color-accent-wash)] px-3 py-1 font-medium text-[var(--color-accent-text)]"
          >
            <dt class="sr-only">{{ t('todos.tasks.filter.today') }}</dt>
            <dd>{{ t('todos.tasks.summary.today', { count: todayTasks.length }) }}</dd>
          </div>
          <div
            v-if="overdueCount > 0"
            class="rounded-[var(--radius-pill)] bg-[var(--color-danger-soft)] px-3 py-1 font-medium text-[var(--color-danger)]"
          >
            <dt class="sr-only">{{ t('todos.tasks.pastDue') }}</dt>
            <dd>{{ t('todos.tasks.summary.overdue', { count: overdueCount }) }}</dd>
          </div>
          <div
            v-if="weekCount > 0"
            class="rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-3 py-1 font-medium text-[var(--color-text-secondary)]"
          >
            <dt class="sr-only">{{ t('todos.tasks.filter.upcoming') }}</dt>
            <dd>{{ t('todos.tasks.summary.week', { count: weekCount }) }}</dd>
          </div>
        </dl>
      </div>
      <BaseButton
        class="w-full lg:w-auto"
        type="button"
        variant="primary"
        @click="focusQuickAdd"
      >
        {{ t('todos.tasks.headerAction') }}
      </BaseButton>
    </header>

    <TaskComposer />

    <BaseError
      v-if="persistenceError"
      :action-label="t('todos.error.persistenceRetry')"
      :message="localizeTodosError(persistenceError, t) ?? ''"
      :title="t('todos.error.persistenceTitle')"
      @action="retryPersistence"
    />

    <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.8fr)]">
      <section class="min-w-0 space-y-4" aria-labelledby="task-list-title">
        <div class="flex flex-col gap-3">
          <div>
            <h2 id="task-list-title" class="text-section-title text-[var(--color-text-primary)]">
              {{ t('todos.tasks.sectionTitle') }}
            </h2>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
              {{ t('todos.tasks.sectionDescription') }}
            </p>
          </div>
          <TaskFilterBar
            :active-filter="activeFilter"
            :counts="filterCounts"
            @change="setFilter"
          />
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
