<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseError from '@/components/base/BaseError.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import type { CountdownSummaryItem } from '@/modules/home/composables/useHomeDashboard'
import type { Task } from '@/modules/todos/types/todos'
import { formatReadableDate } from '@/modules/todos/utils/todoDates'

interface Props {
  upcomingTasks: Task[]
  countdowns: CountdownSummaryItem[]
  initialized: boolean
  persistenceError: string | null
}

defineProps<Props>()
const { locale, t, formatNumber } = useI18n()
</script>

<template>
  <section aria-labelledby="home-next-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-caption font-semibold text-[var(--color-accent-text)]">
          {{ t('home.next.eyebrow') }}
        </p>
        <h2 id="home-next-title" class="mt-1 text-section-title text-[var(--color-text-primary)]">
          {{ t('home.next.title') }}
        </h2>
      </div>
      <RouterLink
        class="interactive-surface inline-flex min-h-10 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'todos' }"
      >
        {{ t('home.next.manage') }}
      </RouterLink>
    </div>

    <BaseSkeleton v-if="!initialized" :label="t('home.todos.loading')" />

    <BaseError
      v-else-if="persistenceError"
      :action-label="t('home.todos.review')"
      :message="persistenceError"
      :title="t('home.todos.errorTitle')"
    />

    <div v-else class="home-next-grid">
      <BaseSurface as="article" padding="none" variant="plain">
        <div class="home-next-panel-header">
          <BaseIcon name="todos" size="sm" />
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('home.next.tasksTitle') }}
          </h3>
        </div>
        <ul v-if="upcomingTasks.length > 0" class="divide-y divide-[var(--color-border-soft)]">
          <li v-for="task in upcomingTasks" :key="task.id" class="home-next-row">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {{ task.title }}
              </p>
              <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
                <time v-if="task.dueDate" :datetime="task.dueDate">
                  {{ formatReadableDate(task.dueDate, locale) }}
                </time>
                <span v-if="task.label"> · {{ task.label }}</span>
              </p>
            </div>
          </li>
        </ul>
        <div v-else class="home-next-empty">
          <p class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ t('home.next.noUpcomingTasks') }}
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ t('home.next.noUpcomingTasksDetail') }}
          </p>
        </div>
      </BaseSurface>

      <BaseSurface as="article" padding="none" variant="plain">
        <div class="home-next-panel-header">
          <BaseIcon name="check" size="sm" />
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ t('home.next.countdownsTitle') }}
          </h3>
        </div>
        <ul v-if="countdowns.length > 0" class="divide-y divide-[var(--color-border-soft)]">
          <li v-for="item in countdowns" :key="item.countdown.id" class="home-countdown-row">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {{ item.countdown.title }}
              </p>
              <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
                <time :datetime="item.countdown.targetDate">
                  {{ formatReadableDate(item.countdown.targetDate, locale) }}
                </time>
              </p>
            </div>
            <p
              class="home-countdown-row__days"
              :class="item.state === 'reached' ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-accent-text)]'"
            >
              {{
                item.state === 'today'
                  ? t('home.next.countdownToday')
                  : item.state === 'reached'
                    ? t('home.next.countdownReached')
                    : t(item.days === 1 ? 'home.next.countdownDay' : 'home.next.countdownDays', { count: formatNumber(item.days) })
              }}
            </p>
          </li>
        </ul>
        <div v-else class="home-next-empty">
          <p class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ t('home.next.noCountdowns') }}
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ t('home.next.noCountdownsDetail') }}
          </p>
        </div>
      </BaseSurface>
    </div>
  </section>
</template>

<style scoped>
.home-next-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.home-next-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-soft);
  color: var(--color-accent-text);
}

.home-next-row,
.home-countdown-row {
  padding: 0.95rem 1.25rem;
}

.home-countdown-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
}

.home-countdown-row__days {
  max-width: 7rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.home-next-empty {
  padding: 1rem 1.25rem 1.25rem;
}

@media (max-width: 767px) {
  .home-next-grid {
    grid-template-columns: 1fr;
  }

  .home-countdown-row {
    grid-template-columns: 1fr;
  }

  .home-countdown-row__days {
    max-width: none;
    text-align: left;
  }
}
</style>
