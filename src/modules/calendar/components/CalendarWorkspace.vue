<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseError from '@/components/base/BaseError.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import CalendarAgenda from '@/modules/calendar/components/CalendarAgenda.vue'
import CalendarMonthGrid from '@/modules/calendar/components/CalendarMonthGrid.vue'
import CalendarMonthHeader from '@/modules/calendar/components/CalendarMonthHeader.vue'
import { aggregateCalendarItems } from '@/modules/calendar/utils/calendarAggregation'
import { buildCalendarMonthGrid } from '@/modules/calendar/utils/calendarMonthGrid'
import {
  addCalendarMonths,
  calendarMonthStart,
  localDateToDisplayDate,
} from '@/modules/calendar/utils/localCalendarDate'
import { useTodosStore } from '@/modules/todos/stores/todos'
import { localizeTodosError } from '@/modules/todos/utils/todosI18n'

const { formatDate, locale, t } = useI18n()
const todosStore = useTodosStore()
const { countdowns, localToday, persistenceError, tasks } = storeToRefs(todosStore)
const { initializeTodos } = todosStore

const selectedDate = shallowRef(localToday.value)
const focusedDate = shallowRef(localToday.value)
const visibleMonth = shallowRef(calendarMonthStart(localToday.value))

const aggregation = computed(() =>
  aggregateCalendarItems(tasks.value, countdowns.value, localToday.value),
)
const monthDays = computed(() =>
  buildCalendarMonthGrid(
    visibleMonth.value,
    locale.value,
    localToday.value,
    aggregation.value.itemsByDate,
  ),
)
const selectedItems = computed(
  () => aggregation.value.itemsByDate.get(selectedDate.value) ?? [],
)
const monthLabel = computed(() =>
  formatDate(localDateToDisplayDate(visibleMonth.value), {
    year: 'numeric',
    month: 'long',
  }),
)
const localizedPersistenceError = computed(() =>
  localizeTodosError(persistenceError.value, t),
)

function showDate(date: string, select: boolean) {
  focusedDate.value = date
  if (select) selectedDate.value = date
  visibleMonth.value = calendarMonthStart(date)
}

function showAdjacentMonth(amount: number) {
  showDate(addCalendarMonths(selectedDate.value, amount), true)
}

function showToday() {
  showDate(localToday.value, true)
}

function focusDate(date: string) {
  showDate(date, false)
}

function selectDate(date: string) {
  showDate(date, true)
}

onMounted(initializeTodos)
</script>

<template>
  <div class="calendar-workspace">
    <BaseSurface as="header" class="calendar-workspace__hero" padding="lg" variant="raised">
      <p class="calendar-workspace__eyebrow">{{ t('calendar.page.eyebrow') }}</p>
      <h1 class="calendar-workspace__title">{{ t('calendar.page.title') }}</h1>
      <p class="calendar-workspace__description">{{ t('calendar.page.description') }}</p>
      <p class="calendar-workspace__boundary">{{ t('calendar.page.readOnly') }}</p>
    </BaseSurface>

    <BaseError
      v-if="localizedPersistenceError"
      :message="localizedPersistenceError"
      :title="t('calendar.error.sourceTitle')"
    />

    <div class="calendar-workspace__grid">
      <BaseSurface as="section" class="calendar-workspace__month" padding="md" variant="plain">
        <CalendarMonthHeader
          :month-label="monthLabel"
          @next="showAdjacentMonth(1)"
          @previous="showAdjacentMonth(-1)"
          @today="showToday"
        />
        <CalendarMonthGrid
          :days="monthDays"
          :focused-date="focusedDate"
          :locale="locale"
          :selected-date="selectedDate"
          @focus-date="focusDate"
          @select-date="selectDate"
        />
      </BaseSurface>

      <BaseSurface as="aside" class="calendar-workspace__agenda" padding="md" variant="muted">
        <CalendarAgenda
          :invalid-countdown-count="aggregation.invalidCountdownCount"
          :invalid-todo-count="aggregation.invalidTodoCount"
          :items="selectedItems"
          :selected-date="selectedDate"
        />
      </BaseSurface>
    </div>
  </div>
</template>

<style scoped>
.calendar-workspace {
  min-width: 0;
  display: grid;
  gap: var(--space-5);
}

.calendar-workspace__hero {
  overflow: hidden;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-accent-wash) 68%, transparent), transparent 62%),
    var(--color-surface-raised);
}

.calendar-workspace__eyebrow,
.calendar-workspace__boundary {
  color: var(--color-accent-text);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}

.calendar-workspace__title {
  margin-top: var(--space-1);
  color: var(--color-text-primary);
  font-size: clamp(2rem, 4vw, 3.4rem);
  font-weight: 720;
  line-height: 1;
}

.calendar-workspace__description {
  max-width: 46rem;
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  line-height: 1.65;
}

.calendar-workspace__boundary {
  margin-top: var(--space-3);
}

.calendar-workspace__grid {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(19rem, 0.65fr);
  gap: var(--space-5);
  align-items: start;
}

.calendar-workspace__month {
  min-width: 0;
  display: grid;
  gap: var(--space-4);
  box-shadow: var(--shadow-soft);
}

.calendar-workspace__agenda {
  min-width: 0;
  position: sticky;
  top: calc(var(--app-top-navigation-height, 4.5rem) + 1rem);
}

@media (max-width: 1050px) {
  .calendar-workspace__grid {
    grid-template-columns: 1fr;
  }

  .calendar-workspace__agenda {
    position: static;
  }
}

@media (max-width: 680px) {
  .calendar-workspace {
    gap: var(--space-4);
  }

  .calendar-workspace__title {
    font-size: 1.8rem;
    line-height: 1.05;
  }

  .calendar-workspace__description {
    font-size: 0.9rem;
    line-height: 1.5;
  }
}
</style>
