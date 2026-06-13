import type { TaskFilter } from '@/modules/todos/types/todos'

export const TODOS_STORAGE_KEY = 'lifeboard.todos'
export const TODOS_STORAGE_VERSION = 1
export const TASK_TITLE_MAX_LENGTH = 120
export const TASK_LABEL_MAX_LENGTH = 32
export const COUNTDOWN_TITLE_MAX_LENGTH = 120

export const TASK_FILTERS: ReadonlyArray<{ value: TaskFilter; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
]
