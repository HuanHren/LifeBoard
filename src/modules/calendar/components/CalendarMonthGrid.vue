<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { AppLocale } from '@/i18n/types'
import type { CalendarMonthDay, LocalDateString } from '@/modules/calendar/types/calendar'
import { resolveCalendarKeyboardDate } from '@/modules/calendar/utils/calendarKeyboard'
import { localDateToDisplayDate } from '@/modules/calendar/utils/localCalendarDate'

interface Props {
  days: readonly CalendarMonthDay[]
  focusedDate: LocalDateString
  selectedDate: LocalDateString
  locale: AppLocale
}

interface Emits {
  focusDate: [date: LocalDateString]
  selectDate: [date: LocalDateString]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { formatDate, t } = useI18n()
const grid = ref<HTMLElement | null>(null)

const rows = computed(() =>
  Array.from({ length: Math.ceil(props.days.length / 7) }, (_, index) =>
    props.days.slice(index * 7, index * 7 + 7),
  ),
)

const weekdayLabels = computed(() =>
  props.days.slice(0, 7).map((day) => ({
    date: day.date,
    short: formatDate(localDateToDisplayDate(day.date), { weekday: 'short' }),
    long: formatDate(localDateToDisplayDate(day.date), { weekday: 'long' }),
  })),
)

function itemCountLabel(day: CalendarMonthDay) {
  return t(
    day.itemCount === 0
      ? 'calendar.day.itemsZero'
      : day.itemCount === 1
        ? 'calendar.day.itemsOne'
        : 'calendar.day.itemsMany',
    { count: day.itemCount },
  )
}

function sourceCountLabel(day: CalendarMonthDay) {
  return [
    t(day.todoCount === 1 ? 'calendar.day.todosOne' : 'calendar.day.todosMany', {
      count: day.todoCount,
    }),
    t(
      day.countdownCount === 1
        ? 'calendar.day.countdownsOne'
        : 'calendar.day.countdownsMany',
      { count: day.countdownCount },
    ),
  ].join(', ')
}

function dayAccessibleName(day: CalendarMonthDay) {
  const labels = [
    formatDate(localDateToDisplayDate(day.date), {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  ]

  if (day.isToday) labels.push(t('calendar.day.today'))
  if (day.date === props.selectedDate) labels.push(t('calendar.day.selected'))
  labels.push(itemCountLabel(day), sourceCountLabel(day))
  return labels.join('. ')
}

function selectDate(date: LocalDateString) {
  emit('focusDate', date)
  emit('selectDate', date)
}

function handleKeydown(event: KeyboardEvent, date: LocalDateString) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('selectDate', date)
    return
  }

  const nextDate = resolveCalendarKeyboardDate(date, event.key, props.locale)
  if (!nextDate) return

  event.preventDefault()
  emit('focusDate', nextDate)
}

watch(
  () => props.focusedDate,
  async (date) => {
    await nextTick()
    grid.value
      ?.querySelector<HTMLButtonElement>(`[data-calendar-date="${date}"]`)
      ?.focus()
  },
)
</script>

<template>
  <div
    ref="grid"
    class="calendar-grid"
    role="grid"
    :aria-label="t('calendar.grid.label')"
    aria-labelledby="calendar-month-title"
  >
    <div class="calendar-grid__weekdays" role="row">
      <div
        v-for="weekday in weekdayLabels"
        :key="weekday.date"
        class="calendar-grid__weekday"
        role="columnheader"
        :aria-label="weekday.long"
      >
        {{ weekday.short }}
      </div>
    </div>

    <div v-for="row in rows" :key="row[0]?.date" class="calendar-grid__week" role="row">
      <div
        v-for="day in row"
        :key="day.date"
        class="calendar-grid__cell"
        role="gridcell"
        :aria-selected="day.date === selectedDate"
      >
        <button
          class="calendar-grid__day control-focus"
          :class="{
            'is-outside': !day.inCurrentMonth,
            'is-selected': day.date === selectedDate,
            'is-today': day.isToday,
          }"
          type="button"
          :aria-current="day.isToday ? 'date' : undefined"
          :aria-label="dayAccessibleName(day)"
          :aria-selected="day.date === selectedDate"
          :data-calendar-date="day.date"
          :tabindex="day.date === focusedDate ? 0 : -1"
          @click="selectDate(day.date)"
          @focus="emit('focusDate', day.date)"
          @keydown="handleKeydown($event, day.date)"
        >
          <span class="calendar-grid__number">{{ day.dayNumber }}</span>
          <span v-if="day.itemCount > 0" class="calendar-grid__summary" aria-hidden="true">
            <span v-if="day.todoCount > 0" class="calendar-grid__dot calendar-grid__dot--todo" />
            <span
              v-if="day.countdownCount > 0"
              class="calendar-grid__dot calendar-grid__dot--countdown"
            />
            <span class="calendar-grid__count">{{ day.itemCount }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid {
  min-width: 0;
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-border-soft);
}

.calendar-grid__weekdays,
.calendar-grid__week {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
}

.calendar-grid__weekday {
  min-width: 0;
  padding: 0.55rem 0.25rem;
  overflow: hidden;
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-grid__cell {
  min-width: 0;
  background: var(--color-surface-raised);
}

.calendar-grid__day {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.35rem;
  border: 0;
  border-radius: 0;
  padding: 0.65rem;
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  text-align: left;
}

.calendar-grid__day:hover {
  background: var(--color-surface-interactive);
}

.calendar-grid__day.is-outside {
  color: var(--color-text-tertiary);
  background: color-mix(in srgb, var(--color-surface-muted) 74%, var(--color-surface-raised));
}

.calendar-grid__day.is-selected {
  box-shadow: inset 0 0 0 2px var(--color-accent);
  background: var(--color-accent-wash);
}

.calendar-grid__day.is-today .calendar-grid__number {
  display: inline-flex;
  min-width: 1.75rem;
  min-height: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.calendar-grid__number {
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  line-height: 1.75rem;
}

.calendar-grid__summary {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-top: 0.4rem;
}

.calendar-grid__dot {
  width: 0.45rem;
  height: 0.45rem;
  flex: none;
  border-radius: var(--radius-pill);
}

.calendar-grid__dot--todo {
  background: var(--color-accent);
}

.calendar-grid__dot--countdown {
  background: var(--color-info);
}

.calendar-grid__count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 680px) {
  .calendar-grid__day {
    min-height: 3.75rem;
    flex-direction: column;
    padding: 0.4rem;
  }

  .calendar-grid__summary {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0;
  }
}

@media (max-width: 410px) {
  .calendar-grid__day {
    min-height: 3.35rem;
    padding: 0.3rem;
  }

  .calendar-grid__number {
    font-size: 0.75rem;
    line-height: 1.5rem;
  }

  .calendar-grid__day.is-today .calendar-grid__number {
    min-width: 1.5rem;
    min-height: 1.5rem;
  }

  .calendar-grid__count {
    display: none;
  }
}
</style>
