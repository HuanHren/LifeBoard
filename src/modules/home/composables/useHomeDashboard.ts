import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useBookmarksStore } from '@/modules/bookmarks/stores/bookmarks'
import type { Bookmark } from '@/modules/bookmarks/types/bookmarks'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type { Countdown, Task } from '@/modules/todos/types/todos'
import {
  compareDateStrings,
  differenceInCalendarDays,
} from '@/modules/todos/utils/todoDates'
import { TOOL_DEFINITIONS } from '@/modules/tools/constants/tools'
import type { ToolDefinition, ToolId } from '@/modules/tools/types/tools'
import { useWeatherStore } from '@/modules/weather/stores/weather'

const TODAY_TASK_LIMIT = 5
const UPCOMING_TASK_LIMIT = 4
const COUNTDOWN_LIMIT = 3
const BOOKMARK_LIMIT = 4
const TOOL_SHORTCUTS: readonly ToolId[] = ['json', 'timestamp', 'whitespace', 'deduplicate']

export interface CountdownSummaryItem {
  countdown: Countdown
  days: number
  state: 'future' | 'today' | 'reached'
}

type CountdownSummaryState = CountdownSummaryItem['state']

function compareTaskDueDate(left: Task, right: Task) {
  return (
    compareDateStrings(left.dueDate ?? '', right.dueDate ?? '') ||
    left.createdAt.localeCompare(right.createdAt)
  )
}

function compareCountdown(left: CountdownSummaryItem, right: CountdownSummaryItem) {
  if (left.state === 'reached' && right.state !== 'reached') return 1
  if (left.state !== 'reached' && right.state === 'reached') return -1
  return left.days - right.days || left.countdown.createdAt.localeCompare(right.countdown.createdAt)
}

export function useHomeDashboard() {
  const weatherStore = useWeatherStore()
  const todosStore = useTodosStore()
  const bookmarksStore = useBookmarksStore()

  const {
    todayTasks,
    upcomingTasks,
    sortedCountdowns,
    hasTasks,
    hasCountdowns,
    isInitialized: todosInitialized,
    localToday,
    persistenceError: todosPersistenceError,
  } = storeToRefs(todosStore)
  const {
    pinnedBookmarks,
    summaryBookmarks,
    hasBookmarks,
    isInitialized: bookmarksInitialized,
    persistenceError: bookmarksPersistenceError,
  } = storeToRefs(bookmarksStore)

  const todayFocusTasks = computed(() =>
    [...todayTasks.value].sort(compareTaskDueDate).slice(0, TODAY_TASK_LIMIT),
  )
  const todayTaskOverflowCount = computed(() =>
    Math.max(0, todayTasks.value.length - todayFocusTasks.value.length),
  )
  const upcomingTaskRows = computed(() =>
    [...upcomingTasks.value].sort(compareTaskDueDate).slice(0, UPCOMING_TASK_LIMIT),
  )

  const countdownRows = computed<CountdownSummaryItem[]>(() =>
    sortedCountdowns.value
      .map((countdown) => {
        const days = differenceInCalendarDays(countdown.targetDate, localToday.value)
        const state: CountdownSummaryState = days < 0 ? 'reached' : days === 0 ? 'today' : 'future'
        return {
          countdown,
          days,
          state,
        }
      })
      .sort(compareCountdown)
      .slice(0, COUNTDOWN_LIMIT),
  )

  const bookmarkRows = computed<Bookmark[]>(() => {
    const source = pinnedBookmarks.value.length > 0 ? pinnedBookmarks.value : summaryBookmarks.value
    return source.slice(0, BOOKMARK_LIMIT)
  })

  const toolShortcuts = computed<ToolDefinition[]>(() =>
    TOOL_SHORTCUTS.map((id) => TOOL_DEFINITIONS.find((tool) => tool.id === id)).filter(
      (tool): tool is ToolDefinition => Boolean(tool),
    ),
  )

  const hasTodayFocus = computed(() => todayFocusTasks.value.length > 0)
  const hasUpcomingTasks = computed(() => upcomingTaskRows.value.length > 0)
  const hasCountdownRows = computed(() => countdownRows.value.length > 0)
  const hasBookmarkRows = computed(() => bookmarkRows.value.length > 0)

  function initializeHomeDashboard() {
    void weatherStore.initializeWeather()
    todosStore.initializeTodos()
    bookmarksStore.initializeBookmarks()
  }

  return {
    todosStore,
    bookmarksStore,
    weatherStore,
    todayFocusTasks,
    todayTaskOverflowCount,
    upcomingTaskRows,
    countdownRows,
    bookmarkRows,
    toolShortcuts,
    hasTodayFocus,
    hasUpcomingTasks,
    hasCountdownRows,
    hasBookmarkRows,
    hasTasks,
    hasCountdowns,
    hasBookmarks,
    todosInitialized,
    bookmarksInitialized,
    todosPersistenceError,
    bookmarksPersistenceError,
    localToday,
    initializeHomeDashboard,
  }
}
