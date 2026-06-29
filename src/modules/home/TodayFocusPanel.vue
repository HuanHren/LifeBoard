<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseError from '@/components/base/BaseError.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import type { Task } from '@/modules/todos/types/todos'
import { formatReadableDate } from '@/modules/todos/utils/todoDates'

interface Props {
  tasks: Task[]
  overflowCount: number
  initialized: boolean
  persistenceError: string | null
  localToday: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggleTask: [taskId: string]
}>()

const { locale, t, formatNumber } = useI18n()
const completedPreviewCount = computed(() => props.tasks.filter((task) => task.completedAt).length)

function isPastDue(task: Task) {
  return task.completedAt === null && task.dueDate !== null && task.dueDate < props.localToday
}

function toggleTask(task: Task) {
  emit('toggleTask', task.id)
}
</script>

<template>
  <section aria-labelledby="home-focus-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-caption font-semibold text-[var(--color-accent-text)]">
          {{ t('home.focus.eyebrow') }}
        </p>
        <h2 id="home-focus-title" class="mt-1 text-section-title text-[var(--color-text-primary)]">
          {{ t('home.focus.title') }}
        </h2>
      </div>
      <RouterLink
        class="interactive-surface inline-flex min-h-10 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'todos' }"
      >
        {{ t('home.focus.openTodos') }}
      </RouterLink>
    </div>

    <BaseSkeleton v-if="!initialized" :label="t('home.todos.loading')" />

    <BaseError
      v-else-if="persistenceError"
      :action-label="t('home.todos.review')"
      :message="persistenceError"
      :title="t('home.todos.errorTitle')"
    />

    <BaseSurface v-else-if="tasks.length > 0" as="article" padding="none" variant="raised">
      <div class="home-focus-summary">
        <div>
          <p class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{
              t('home.focus.taskSummary', {
                count: formatNumber(tasks.length + overflowCount),
              })
            }}
          </p>
          <p class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            {{ t('home.focus.taskDetail') }}
          </p>
        </div>
        <div class="home-focus-summary__number" aria-hidden="true">
          {{ formatNumber(tasks.length + overflowCount) }}
        </div>
      </div>

      <ul class="divide-y divide-[var(--color-border-soft)]" :aria-label="t('home.focus.listLabel')">
        <li v-for="task in tasks" :key="task.id" class="home-focus-task-row">
          <input
            :id="`home-task-${task.id}`"
            :checked="task.completedAt !== null"
            class="mt-1 size-5 shrink-0 accent-[var(--color-accent)]"
            type="checkbox"
            @change="toggleTask(task)"
          />
          <div class="min-w-0">
            <label
              :for="`home-task-${task.id}`"
              class="block cursor-pointer text-sm font-semibold leading-6"
              :class="
                task.completedAt
                  ? 'line-through text-[var(--color-text-tertiary)]'
                  : 'text-[var(--color-text-primary)]'
              "
            >
              {{ task.title }}
            </label>
            <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-caption">
              <time
                v-if="task.dueDate"
                :datetime="task.dueDate"
                :class="
                  isPastDue(task)
                    ? 'font-semibold text-[var(--color-danger)]'
                    : 'text-[var(--color-text-secondary)]'
                "
              >
                {{ isPastDue(task) ? `${t('home.focus.overdue')} · ` : ''
                }}{{ formatReadableDate(task.dueDate, locale) }}
              </time>
              <span v-if="task.label" class="text-[var(--color-text-secondary)]">
                {{ task.label }}
              </span>
            </div>
          </div>
        </li>
      </ul>

      <p
        v-if="overflowCount > 0"
        class="border-t border-[var(--color-border-soft)] px-5 py-3 text-caption text-[var(--color-text-secondary)]"
      >
        {{ t('home.focus.moreTasks', { count: formatNumber(overflowCount) }) }}
      </p>
      <p v-if="completedPreviewCount > 0" class="sr-only" aria-live="polite">
        {{ t('home.focus.completedLive', { count: formatNumber(completedPreviewCount) }) }}
      </p>
    </BaseSurface>

    <BaseSurface v-else as="article" class="home-focus-empty" padding="lg" variant="muted">
      <BaseIcon name="check" size="lg" />
      <div>
        <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
          {{ t('home.focus.emptyTitle') }}
        </h3>
        <p class="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ t('home.focus.emptyDescription') }}
        </p>
        <RouterLink
          class="interactive-surface mt-4 inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-3 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          :to="{ name: 'todos' }"
        >
          {{ t('home.focus.planAction') }}
        </RouterLink>
      </div>
    </BaseSurface>
  </section>
</template>

<style scoped>
.home-focus-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  background: var(--color-accent-wash);
}

.home-focus-summary__number {
  font-variant-numeric: tabular-nums;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1;
  font-weight: 700;
  color: var(--color-accent-text);
}

.home-focus-task-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.home-focus-empty {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 639px) {
  .home-focus-summary {
    grid-template-columns: 1fr;
  }

  .home-focus-summary__number {
    font-size: 2.25rem;
  }
}
</style>
