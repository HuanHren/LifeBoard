<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseError from '@/components/base/BaseError.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
import StatCard from '@/components/base/StatCard.vue'
import { useI18n } from '@/i18n/useI18n'
import CountdownSection from '@/modules/todos/components/CountdownSection.vue'
import TaskComposer from '@/modules/todos/components/TaskComposer.vue'
import TaskFilterBar from '@/modules/todos/components/TaskFilterBar.vue'
import TaskList from '@/modules/todos/components/TaskList.vue'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type { TaskFilter } from '@/modules/todos/types/todos'
import { localizeTodosError } from '@/modules/todos/utils/todosI18n'

const { formatNumber, t } = useI18n()
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

type MetricValueKind = 'numeric' | 'semantic'

type MetricValueState = {
  value: string
  valueKind: MetricValueKind
}

function createMetricValue(count: number, emptyKey: Parameters<typeof t>[0]): MetricValueState {
  return count === 0
    ? { value: t(emptyKey), valueKind: 'semantic' }
    : { value: formatNumber(count), valueKind: 'numeric' }
}

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
const activeTaskTotal = computed(() => todayTasks.value.length + upcomingTasks.value.length)
const taskCountLabel = computed(() =>
  t(
    activeTaskTotal.value === 1
      ? 'todos.tasks.overview.activeOne'
      : 'todos.tasks.overview.activeMany',
    { count: activeTaskTotal.value },
  ),
)
const countdownCountLabel = computed(() =>
  t(
    sortedCountdowns.value.length === 1
      ? 'todos.countdowns.overview.one'
      : 'todos.countdowns.overview.many',
    { count: sortedCountdowns.value.length },
  ),
)
const activeFilterLabel = computed(() => {
  const keyByFilter = {
    today: 'todos.tasks.filter.today',
    upcoming: 'todos.tasks.filter.upcoming',
    all: 'todos.tasks.filter.all',
    completed: 'todos.tasks.filter.completed',
    deleted: 'todos.tasks.filter.deleted',
  } satisfies Record<TaskFilter, Parameters<typeof t>[0]>
  return t(keyByFilter[activeFilter.value])
})
const visibleTaskCountLabel = computed(() =>
  t(
    visibleTasks.value.length === 1
      ? 'todos.tasks.overview.visibleOne'
      : 'todos.tasks.overview.visibleMany',
    { count: visibleTasks.value.length, filter: activeFilterLabel.value },
  ),
)
const todayMetricValue = computed(() =>
  createMetricValue(todayTasks.value.length, 'todos.tasks.metric.todayClear'),
)
const todayMetricDetail = computed(() =>
  todayTasks.value.length === 0
    ? t('todos.tasks.metric.todayClearDetail')
    : t(todayTasks.value.length === 1 ? 'todos.tasks.summary.todayOne' : 'todos.tasks.summary.todayMany', {
        count: formatNumber(todayTasks.value.length),
      }),
)
const overdueMetricValue = computed(() =>
  createMetricValue(overdueCount.value, 'todos.tasks.metric.overdueClear'),
)
const overdueMetricDetail = computed(() =>
  overdueCount.value === 0
    ? t('todos.tasks.metric.overdueClearDetail')
    : t(overdueCount.value === 1 ? 'todos.tasks.summary.overdueOne' : 'todos.tasks.summary.overdueMany', {
        count: formatNumber(overdueCount.value),
      }),
)
const weekMetricValue = computed(() =>
  createMetricValue(weekCount.value, 'todos.tasks.metric.weekClear'),
)
const weekMetricDetail = computed(() =>
  weekCount.value === 0
    ? t('todos.tasks.metric.weekClearDetail')
    : t(weekCount.value === 1 ? 'todos.tasks.summary.weekOne' : 'todos.tasks.summary.weekMany', {
        count: formatNumber(weekCount.value),
      }),
)
const countdownMetricValue = computed(() =>
  createMetricValue(sortedCountdowns.value.length, 'todos.countdowns.metric.clear'),
)
const countdownMetricDetail = computed(() =>
  sortedCountdowns.value.length === 0
    ? t('todos.countdowns.metric.clearDetail')
    : countdownCountLabel.value,
)

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
  <div class="todos-workspace">
    <BaseSurface as="header" class="todos-workspace__hero" padding="lg" variant="raised">
      <div class="todos-workspace__hero-copy">
        <p class="todos-workspace__eyebrow">{{ t('todos.page.eyebrow') }}</p>
        <h1 class="todos-workspace__title">
          {{ t('todos.page.title') }}
        </h1>
        <p class="todos-workspace__description">
          {{ t('todos.page.description') }}
        </p>
      </div>
      <BaseButton
        class="todos-workspace__primary-action"
        type="button"
        variant="primary"
        @click="focusQuickAdd"
      >
        {{ t('todos.tasks.headerAction') }}
      </BaseButton>

      <dl class="todos-workspace__metrics" :aria-label="t('todos.tasks.overview.label')">
        <StatCard
          :description="todayMetricDetail"
          :label="t('todos.tasks.filter.today')"
          tone="accent"
          :value="todayMetricValue.value"
          :value-kind="todayMetricValue.valueKind"
        />
        <StatCard
          :description="overdueMetricDetail"
          :label="t('todos.tasks.pastDue')"
          :tone="overdueCount > 0 ? 'danger' : 'default'"
          :value="overdueMetricValue.value"
          :value-kind="overdueMetricValue.valueKind"
        />
        <StatCard
          :description="weekMetricDetail"
          :label="t('todos.tasks.summary.weekLabel')"
          :value="weekMetricValue.value"
          :value-kind="weekMetricValue.valueKind"
        />
        <StatCard
          :description="countdownMetricDetail"
          :label="t('todos.countdowns.title')"
          :value="countdownMetricValue.value"
          :value-kind="countdownMetricValue.valueKind"
        />
      </dl>
    </BaseSurface>

    <BaseError
      v-if="persistenceError"
      :action-label="t('todos.error.persistenceRetry')"
      :message="localizeTodosError(persistenceError, t) ?? ''"
      :title="t('todos.error.persistenceTitle')"
      @action="retryPersistence"
    />

    <div class="todos-workspace__grid">
      <section class="todos-workspace__main" aria-labelledby="task-list-title">
        <TaskComposer />

        <BaseSurface as="section" class="todos-workspace__tasks" padding="none" variant="plain">
          <SectionHeader
            class="todos-workspace__section-heading"
            :description="t('todos.tasks.sectionDescription')"
            :title="t('todos.tasks.sectionTitle')"
            title-id="task-list-title"
          >
            <template #actions>
            <p class="todos-workspace__filter-summary">{{ visibleTaskCountLabel }}</p>
            </template>
          </SectionHeader>
          <TaskFilterBar
            :active-filter="activeFilter"
            :counts="filterCounts"
            @change="setFilter"
          />
          <div class="todos-workspace__list">
            <TaskList
              :filter="activeFilter"
              :tasks="visibleTasks"
              :today="localToday"
            />
          </div>
        </BaseSurface>
      </section>

      <aside class="todos-workspace__side" :aria-label="t('todos.countdowns.title')">
        <BaseSurface as="div" class="todos-workspace__side-card" padding="sm" variant="muted">
          <p class="todos-workspace__eyebrow">{{ t('todos.tasks.overview.label') }}</p>
          <p class="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
            {{ taskCountLabel }}
          </p>
          <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('todos.tasks.overview.description') }}
          </p>
        </BaseSurface>
        <CountdownSection :countdowns="sortedCountdowns" :today="localToday" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.todos-workspace {
  display: grid;
  gap: 1.25rem;
}

.todos-workspace__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: end;
  overflow: hidden;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-accent-wash) 68%, transparent), transparent 58%),
    var(--color-surface-raised);
}

.todos-workspace__hero-copy {
  min-width: 0;
}

.todos-workspace__eyebrow {
  color: var(--color-accent-text);
  font-size: var(--font-size-caption);
  font-weight: 700;
  letter-spacing: 0;
}

.todos-workspace__title {
  margin-top: 0.35rem;
  color: var(--color-text-primary);
  font-size: clamp(2rem, 4vw, 3.4rem);
  font-weight: 720;
  line-height: 0.98;
}

.todos-workspace__description {
  margin-top: 0.85rem;
  max-width: 44rem;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
}

.todos-workspace__primary-action {
  min-width: 8.5rem;
}

.todos-workspace__metrics {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.todos-workspace__grid {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(20rem, 0.7fr);
  gap: 1.25rem;
  align-items: start;
}

.todos-workspace__main,
.todos-workspace__side {
  min-width: 0;
  display: grid;
  gap: 1rem;
}

.todos-workspace__tasks {
  min-width: 0;
  overflow: hidden;
}

.todos-workspace__side {
  position: sticky;
  top: calc(var(--app-top-navigation-height, 4.5rem) + 1rem);
}

.todos-workspace__section-heading {
  padding: 1.1rem 1.1rem 0;
}

.todos-workspace__filter-summary {
  max-width: 14rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-weight: 650;
  line-height: 1.45;
  text-align: right;
}

.todos-workspace__tasks :deep(.task-filter-bar) {
  margin: 1rem 1.1rem 0;
}

.todos-workspace__list {
  padding: 1rem;
}

@media (max-width: 1180px) {
  .todos-workspace__grid {
    grid-template-columns: 1fr;
  }

  .todos-workspace__side {
    position: static;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  }
}

@media (max-width: 760px) {
  .todos-workspace {
    gap: 0.9rem;
  }

  .todos-workspace__hero {
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }

  .todos-workspace__title {
    font-size: 1.8rem;
    line-height: 1.04;
  }

  .todos-workspace__description {
    margin-top: 0.55rem;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .todos-workspace__primary-action {
    width: 100%;
  }

  .todos-workspace__metrics,
  .todos-workspace__side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .todos-workspace__section-heading {
    padding: 0.95rem 0.95rem 0;
  }

  .todos-workspace__filter-summary {
    max-width: none;
    text-align: left;
  }

  .todos-workspace__tasks :deep(.task-filter-bar) {
    margin: 0.85rem 0.95rem 0;
  }

  .todos-workspace__list {
    padding: 0.85rem;
  }

  .todos-workspace__tasks {
    order: 1;
  }

  .todos-workspace__main :deep(.task-composer) {
    order: 2;
  }
}

@media (max-width: 430px) {
  .todos-workspace__side {
    grid-template-columns: 1fr;
  }
}
</style>
