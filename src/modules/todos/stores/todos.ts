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

  function isDeleted(task: Task) {
    return task.deletedAt !== undefined && task.deletedAt !== null
  }

  function isActive(task: Task) {
    return task.completedAt === null && !isDeleted(task)
  }

  function compareTaskDueDate(left: Task, right: Task) {
    return (
      compareDateStrings(left.dueDate ?? '', right.dueDate ?? '') ||
      left.createdAt.localeCompare(right.createdAt)
    )
  }

  const todayTasks = computed(() =>
    tasks.value
      .filter(
        (task) =>
          isActive(task) &&
          task.dueDate !== null &&
          compareDateStrings(task.dueDate, localToday.value) <= 0,
      )
      .sort(compareTaskDueDate),
  )

  const upcomingTasks = computed(() =>
    tasks.value
      .filter(
        (task) =>
          isActive(task) &&
          task.dueDate !== null &&
          compareDateStrings(task.dueDate, localToday.value) > 0,
      )
      .sort(compareTaskDueDate),
  )

  const completedTasks = computed(() =>
    tasks.value
      .filter((task) => task.completedAt !== null && !isDeleted(task))
      .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
  )

  const allTasks = computed(() =>
    tasks.value.filter((task) => !isDeleted(task)).sort((left, right) => {
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

  const deletedTasks = computed(() =>
    tasks.value
      .filter(isDeleted)
      .sort((left, right) => (right.deletedAt ?? '').localeCompare(left.deletedAt ?? '')),
  )

  const visibleTasks = computed(() => {
    if (activeFilter.value === 'today') return todayTasks.value
    if (activeFilter.value === 'upcoming') return upcomingTasks.value
    if (activeFilter.value === 'all') return allTasks.value
    if (activeFilter.value === 'completed') return completedTasks.value
    return deletedTasks.value
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
      allTasks.value.find((task) => task.completedAt === null && !isDeleted(task)) ??
      null,
  )
  const activeTaskCountForToday = computed(() => todayTasks.value.length)
  const hasTasks = computed(() => tasks.value.some((task) => !isDeleted(task)))
  const hasDeletedTasks = computed(() => deletedTasks.value.length > 0)
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
      deletedAt: null,
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
      task.id === id && !isDeleted(task)
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
    const now = new Date().toISOString()
    const nextTasks = tasks.value.map((task) =>
      task.id === id
        ? {
            ...task,
            deletedAt: now,
            updatedAt: now,
          }
        : task,
    )
    return persistNext(nextTasks, countdowns.value)
  }

  function restoreTask(id: string) {
    const now = new Date().toISOString()
    const nextTasks = tasks.value.map((task) =>
      task.id === id
        ? {
            ...task,
            deletedAt: null,
            updatedAt: now,
          }
        : task,
    )
    return persistNext(nextTasks, countdowns.value)
  }

  function permanentlyDeleteTask(id: string) {
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
    deletedTasks,
    visibleTasks,
    sortedCountdowns,
    nextCountdown,
    nextActiveTask,
    activeTaskCountForToday,
    hasTasks,
    hasDeletedTasks,
    hasCountdowns,
    initializeTodos,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
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
