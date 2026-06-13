import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { TODOS_STORAGE_VERSION } from '@/modules/todos/constants/todos'
import { useLocalToday } from '@/modules/todos/composables/useLocalToday'
import {
  loadTodosStorage,
  saveTodosStorage,
} from '@/modules/todos/services/todosStorage'
import type {
  Countdown,
  CountdownDraft,
  Task,
  TaskDraft,
  TaskFilter,
  TaskUpdate,
} from '@/modules/todos/types/todos'
import {
  compareDateStrings,
  differenceInCalendarDays,
} from '@/modules/todos/utils/todoDates'
import {
  hasValidationErrors,
  normalizeCountdownDraft,
  normalizeTaskDraft,
  validateCountdownDraft,
  validateTaskDraft,
} from '@/modules/todos/utils/todoValidation'

export const useTodosStore = defineStore('todos', () => {
  const tasks = ref<Task[]>([])
  const countdowns = ref<Countdown[]>([])
  const activeFilter = shallowRef<TaskFilter>('today')
  const isInitialized = shallowRef(false)
  const persistenceError = shallowRef<string | null>(null)
  const localToday = useLocalToday()

  const todayTasks = computed(() =>
    tasks.value
      .filter(
        (task) =>
          task.completedAt === null &&
          task.dueDate !== null &&
          compareDateStrings(task.dueDate, localToday.value) <= 0,
      )
      .sort((left, right) => {
        const dateOrder = compareDateStrings(left.dueDate ?? '', right.dueDate ?? '')
        return dateOrder || left.createdAt.localeCompare(right.createdAt)
      }),
  )

  const upcomingTasks = computed(() =>
    tasks.value
      .filter(
        (task) =>
          task.completedAt === null &&
          task.dueDate !== null &&
          compareDateStrings(task.dueDate, localToday.value) > 0,
      )
      .sort(
        (left, right) =>
          compareDateStrings(left.dueDate ?? '', right.dueDate ?? '') ||
          left.createdAt.localeCompare(right.createdAt),
      ),
  )

  const completedTasks = computed(() =>
    tasks.value
      .filter((task) => task.completedAt !== null)
      .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
  )

  const allTasks = computed(() =>
    [...tasks.value].sort((left, right) => {
      if (left.completedAt !== null && right.completedAt === null) return 1
      if (left.completedAt === null && right.completedAt !== null) return -1
      if (left.dueDate === null && right.dueDate !== null) return 1
      if (left.dueDate !== null && right.dueDate === null) return -1
      return (
        compareDateStrings(left.dueDate ?? '', right.dueDate ?? '') ||
        right.createdAt.localeCompare(left.createdAt)
      )
    }),
  )

  const visibleTasks = computed(() => {
    if (activeFilter.value === 'today') return todayTasks.value
    if (activeFilter.value === 'upcoming') return upcomingTasks.value
    if (activeFilter.value === 'completed') return completedTasks.value
    return allTasks.value
  })

  const sortedCountdowns = computed(() =>
    [...countdowns.value].sort((left, right) => {
      const leftDifference = differenceInCalendarDays(left.targetDate, localToday.value)
      const rightDifference = differenceInCalendarDays(right.targetDate, localToday.value)
      const leftReached = leftDifference < 0
      const rightReached = rightDifference < 0

      if (leftReached !== rightReached) return leftReached ? 1 : -1
      return leftReached
        ? compareDateStrings(right.targetDate, left.targetDate)
        : compareDateStrings(left.targetDate, right.targetDate)
    }),
  )

  const nextCountdown = computed(
    () =>
      sortedCountdowns.value.find(
        (countdown) => differenceInCalendarDays(countdown.targetDate, localToday.value) >= 0,
      ) ?? null,
  )
  const nextActiveTask = computed(
    () =>
      todayTasks.value[0] ??
      upcomingTasks.value[0] ??
      allTasks.value.find((task) => task.completedAt === null) ??
      null,
  )
  const activeTaskCountForToday = computed(() => todayTasks.value.length)
  const hasTasks = computed(() => tasks.value.length > 0)
  const hasCountdowns = computed(() => countdowns.value.length > 0)

  function persistNext(nextTasks: Task[], nextCountdowns: Countdown[]) {
    const result = saveTodosStorage({
      version: TODOS_STORAGE_VERSION,
      tasks: nextTasks,
      countdowns: nextCountdowns,
    })

    if (!result.ok) {
      persistenceError.value = result.error
      return false
    }

    tasks.value.splice(0, tasks.value.length, ...nextTasks)
    countdowns.value.splice(0, countdowns.value.length, ...nextCountdowns)
    persistenceError.value = null
    return true
  }

  function initializeTodos() {
    if (isInitialized.value) {
      return
    }

    const result = loadTodosStorage()
    isInitialized.value = true

    if (!result.ok) {
      persistenceError.value = result.error
      return
    }

    if (result.data) {
      tasks.value = result.data.tasks
      countdowns.value = result.data.countdowns
    }
  }

  function addTask(draft: TaskDraft) {
    const normalized = normalizeTaskDraft(draft)
    if (hasValidationErrors(validateTaskDraft(normalized))) return false

    const now = new Date().toISOString()
    const task: Task = {
      id: crypto.randomUUID(),
      ...normalized,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }
    return persistNext([...tasks.value, task], countdowns.value)
  }

  function updateTask(id: string, update: TaskUpdate) {
    const normalized = normalizeTaskDraft(update)
    if (hasValidationErrors(validateTaskDraft(normalized))) return false

    const nextTasks = tasks.value.map((task) =>
      task.id === id
        ? { ...task, ...normalized, updatedAt: new Date().toISOString() }
        : task,
    )
    return persistNext(nextTasks, countdowns.value)
  }

  function toggleTask(id: string) {
    const now = new Date().toISOString()
    const nextTasks = tasks.value.map((task) =>
      task.id === id
        ? {
            ...task,
            completedAt: task.completedAt === null ? now : null,
            updatedAt: now,
          }
        : task,
    )
    return persistNext(nextTasks, countdowns.value)
  }

  function deleteTask(id: string) {
    return persistNext(
      tasks.value.filter((task) => task.id !== id),
      countdowns.value,
    )
  }

  function setFilter(filter: TaskFilter) {
    activeFilter.value = filter
  }

  function addCountdown(draft: CountdownDraft) {
    const normalized = normalizeCountdownDraft(draft)
    if (hasValidationErrors(validateCountdownDraft(normalized))) return false

    const now = new Date().toISOString()
    const countdown: Countdown = {
      id: crypto.randomUUID(),
      ...normalized,
      createdAt: now,
      updatedAt: now,
    }
    return persistNext(tasks.value, [...countdowns.value, countdown])
  }

  function updateCountdown(id: string, draft: CountdownDraft) {
    const normalized = normalizeCountdownDraft(draft)
    if (hasValidationErrors(validateCountdownDraft(normalized))) return false

    const nextCountdowns = countdowns.value.map((countdown) =>
      countdown.id === id
        ? { ...countdown, ...normalized, updatedAt: new Date().toISOString() }
        : countdown,
    )
    return persistNext(tasks.value, nextCountdowns)
  }

  function deleteCountdown(id: string) {
    return persistNext(
      tasks.value,
      countdowns.value.filter((countdown) => countdown.id !== id),
    )
  }

  function retryPersistence() {
    return persistNext(tasks.value, countdowns.value)
  }

  function synchronizeFromSettings(nextTasks: Task[], nextCountdowns: Countdown[]) {
    tasks.value.splice(0, tasks.value.length, ...nextTasks)
    countdowns.value.splice(0, countdowns.value.length, ...nextCountdowns)
    persistenceError.value = null
    isInitialized.value = true
  }

  return {
    tasks,
    countdowns,
    activeFilter,
    isInitialized,
    persistenceError,
    localToday,
    todayTasks,
    upcomingTasks,
    completedTasks,
    allTasks,
    visibleTasks,
    sortedCountdowns,
    nextCountdown,
    nextActiveTask,
    activeTaskCountForToday,
    hasTasks,
    hasCountdowns,
    initializeTodos,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    setFilter,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    retryPersistence,
    synchronizeFromSettings,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTodosStore, import.meta.hot))
}
