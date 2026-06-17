<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import { useI18n } from '@/i18n/useI18n'
import { useCountdownStatus } from '@/modules/todos/composables/useCountdownStatus'
import { useTodosStore } from '@/modules/todos/stores/todos'
import { formatReadableDate } from '@/modules/todos/utils/todoDates'
import { localizeTodosError } from '@/modules/todos/utils/todosI18n'

const { locale, t } = useI18n()
const todosStore = useTodosStore()
const {
  activeTaskCountForToday,
  hasTasks,
  hasCountdowns,
  isInitialized,
  localToday,
  nextActiveTask,
  nextCountdown,
  persistenceError,
  sortedCountdowns,
  upcomingTasks,
} = storeToRefs(todosStore)
const { initializeTodos } = todosStore

const hasPlanningData = computed(() => hasTasks.value || hasCountdowns.value)
const displayCountdown = computed(() => nextCountdown.value ?? sortedCountdowns.value[0] ?? null)
const countdownTarget = computed(
  () => displayCountdown.value?.targetDate ?? localToday.value,
)
const countdownStatus = useCountdownStatus(countdownTarget, localToday)
const todayTaskCopy = computed(() => {
  if (!hasTasks.value) {
    return t('home.todos.noTasksSaved')
  }

  if (activeTaskCountForToday.value > 0) {
    return t(
      activeTaskCountForToday.value === 1
        ? 'home.todos.activeOne'
        : 'home.todos.activeMany',
      { count: activeTaskCountForToday.value },
    )
  }

  if (upcomingTasks.value.length > 0) {
    return `${t('home.todos.noneDue')} ${t('home.todos.nextBelow')}`
  }

  return t('home.todos.noActive')
})

onMounted(() => {
  initializeTodos()
})
</script>

<template>
  <section aria-labelledby="home-todos-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          id="home-todos-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('home.todos.title') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('home.todos.description') }}
        </p>
      </div>
      <RouterLink
        class="interactive-surface inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'todos' }"
      >
        {{ t('home.todos.open') }}
        <span class="ml-2" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <BaseSkeleton v-if="!isInitialized" :label="t('home.todos.loading')" />

    <div
      v-else-if="persistenceError"
      class="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4"
      role="alert"
    >
      <p class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('home.todos.errorTitle') }}
      </p>
      <p class="mt-1 max-w-2xl text-sm leading-6 text-pretty text-[var(--color-text-primary)]">
        {{ localizeTodosError(persistenceError, t) }}
      </p>
      <RouterLink
        class="interactive-surface mt-3 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-surface-raised)]"
        :to="{ name: 'todos' }"
      >
        {{ t('home.todos.review') }}
        <span class="ml-2" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <article
      v-else-if="hasPlanningData"
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]"
    >
      <div class="p-6 sm:p-8">
        <p class="text-caption font-medium text-[var(--color-text-secondary)]">
          {{ t('home.todos.tasks') }}
        </p>
        <p class="mt-2 text-lg font-semibold text-pretty text-[var(--color-text-primary)]">
          <span class="tabular-nums">{{ todayTaskCopy }}</span>
        </p>

        <div v-if="nextActiveTask" class="mt-5 border-t border-[var(--color-border-soft)] pt-4">
          <p class="text-caption font-medium text-[var(--color-text-secondary)]">
            {{ t('home.todos.nextActiveTask') }}
          </p>
          <p class="mt-1 font-semibold text-pretty text-[var(--color-text-primary)]">
            {{ nextActiveTask.title }}
          </p>
          <time
            v-if="nextActiveTask.dueDate"
            class="mt-1 block text-caption text-[var(--color-text-secondary)]"
            :datetime="nextActiveTask.dueDate"
          >
            {{
              t('home.todos.due', {
                date: formatReadableDate(nextActiveTask.dueDate, locale),
              })
            }}
          </time>
          <p v-else class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ t('home.todos.noDueDate') }}
          </p>
        </div>

        <p v-else class="mt-4 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{
            hasTasks
              ? t('home.todos.noActiveSaved')
              : t('home.todos.addTaskPrompt')
          }}
        </p>
      </div>

      <div
        class="border-t border-[var(--color-border-soft)] bg-[var(--color-accent-wash)] p-6 sm:p-8 lg:border-t-0 lg:border-l"
      >
        <p class="text-caption font-medium text-[var(--color-text-secondary)]">
          {{ t('home.todos.nextCountdown') }}
        </p>
        <div v-if="displayCountdown" class="mt-2">
          <p class="font-semibold text-pretty text-[var(--color-text-primary)]">
            {{ displayCountdown.title }}
          </p>
          <p class="mt-2 text-sm font-medium tabular-nums text-[var(--color-accent-text)]">
            {{ countdownStatus.label }}
          </p>
          <time
            class="mt-1 block text-caption text-[var(--color-text-secondary)]"
            :datetime="displayCountdown.targetDate"
          >
            {{ formatReadableDate(displayCountdown.targetDate, locale) }}
          </time>
        </div>
        <p v-else class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('home.todos.noCountdown') }}
        </p>
      </div>
    </article>

    <article
      v-else
      class="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <h3 class="text-section-title text-balance text-[var(--color-text-primary)]">
        {{ t('home.todos.connectTitle') }}
      </h3>
      <p class="mt-2 max-w-xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('home.todos.emptyDescription') }}
      </p>
      <RouterLink
        class="interactive-surface mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
        :to="{ name: 'todos' }"
      >
        {{ t('home.todos.open') }}
      </RouterLink>
    </article>
  </section>
</template>
