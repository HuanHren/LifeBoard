<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseNotice from '@/components/base/BaseNotice.vue'
import { useI18n } from '@/i18n/useI18n'
import type { TranslationKey } from '@/i18n/keys'
import type {
  AggregatedCalendarItem,
  CalendarItemStatus,
  LocalDateString,
} from '@/modules/calendar/types/calendar'
import { localDateToDisplayDate } from '@/modules/calendar/utils/localCalendarDate'

interface Props {
  selectedDate: LocalDateString
  items: readonly AggregatedCalendarItem[]
  invalidTodoCount: number
  invalidCountdownCount: number
}

const props = defineProps<Props>()
const { formatDate, t } = useI18n()

const heading = computed(() =>
  formatDate(localDateToDisplayDate(props.selectedDate), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

const invalidCount = computed(() => props.invalidTodoCount + props.invalidCountdownCount)

const statusKeys: Record<CalendarItemStatus, TranslationKey> = {
  active: 'calendar.status.active',
  overdue: 'calendar.status.overdue',
  completed: 'calendar.status.completed',
  upcoming: 'calendar.status.upcoming',
  today: 'calendar.status.today',
  elapsed: 'calendar.status.elapsed',
}

function sourceLabel(item: AggregatedCalendarItem) {
  return t(item.source === 'todo' ? 'calendar.source.todo' : 'calendar.source.countdown')
}
</script>

<template>
  <section class="calendar-agenda" aria-labelledby="calendar-agenda-title">
    <div class="calendar-agenda__heading">
      <p class="calendar-agenda__eyebrow">{{ t('calendar.agenda.eyebrow') }}</p>
      <h2 id="calendar-agenda-title" class="calendar-agenda__title">{{ heading }}</h2>
      <p class="calendar-agenda__description">
        {{
          t(
            items.length === 0
              ? 'calendar.agenda.countZero'
              : items.length === 1
                ? 'calendar.agenda.countOne'
                : 'calendar.agenda.countMany',
            { count: items.length },
          )
        }}
      </p>
    </div>

    <BaseNotice
      v-if="invalidCount > 0"
      role="status"
      tone="warning"
      :title="t('calendar.invalid.title')"
      :message="
        t('calendar.invalid.message', {
          todos: invalidTodoCount,
          countdowns: invalidCountdownCount,
        })
      "
    />

    <ul v-if="items.length > 0" class="calendar-agenda__list" :aria-label="t('calendar.agenda.listLabel')">
      <li v-for="item in items" :key="`${item.source}-${item.id}`">
        <RouterLink :to="{ name: 'todos' }" class="calendar-agenda__item control-focus">
          <span class="calendar-agenda__item-copy">
            <span class="calendar-agenda__item-title">{{ item.title }}</span>
            <span class="calendar-agenda__item-meta">
              <span class="calendar-agenda__source" :class="`is-${item.source}`">
                {{ sourceLabel(item) }}
              </span>
              <span class="calendar-agenda__status" :class="`is-${item.status}`">
                {{ t(statusKeys[item.status]) }}
              </span>
            </span>
          </span>
          <span class="calendar-agenda__open">{{ t('calendar.agenda.openSource') }}</span>
        </RouterLink>
      </li>
    </ul>

    <BaseEmpty
      v-else
      :description="t('calendar.empty.description')"
      :title="t('calendar.empty.title')"
    />
  </section>
</template>

<style scoped>
.calendar-agenda {
  min-width: 0;
  display: grid;
  gap: var(--space-4);
}

.calendar-agenda__heading {
  min-width: 0;
}

.calendar-agenda__eyebrow {
  color: var(--color-accent-text);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}

.calendar-agenda__title {
  margin-top: var(--space-1);
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
  overflow-wrap: anywhere;
}

.calendar-agenda__description {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
  line-height: 1.5;
}

.calendar-agenda__list {
  display: grid;
  gap: var(--space-2);
}

.calendar-agenda__item {
  min-width: 0;
  min-height: 4.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  background: var(--color-surface-muted);
  color: var(--color-text-primary);
  text-decoration: none;
}

.calendar-agenda__item:hover {
  border-color: var(--color-control-border);
  background: var(--color-surface-interactive);
}

.calendar-agenda__item-copy {
  min-width: 0;
  display: grid;
  gap: var(--space-2);
}

.calendar-agenda__item-title {
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  overflow-wrap: anywhere;
}

.calendar-agenda__item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.calendar-agenda__source,
.calendar-agenda__status {
  border-radius: var(--radius-pill);
  padding: 0.15rem 0.5rem;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.calendar-agenda__source.is-todo {
  background: var(--color-primary-soft);
  color: var(--color-accent-text);
}

.calendar-agenda__source.is-countdown {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.calendar-agenda__status {
  background: var(--color-surface-inset);
  color: var(--color-text-secondary);
}

.calendar-agenda__status.is-overdue,
.calendar-agenda__status.is-elapsed {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.calendar-agenda__status.is-completed {
  color: var(--color-text-tertiary);
}

.calendar-agenda__open {
  flex: none;
  color: var(--color-accent-text);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 430px) {
  .calendar-agenda__item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
