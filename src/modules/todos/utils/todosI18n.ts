import type { TranslationKey } from '@/i18n/keys'
import type { Translator } from '@/i18n/types'
import {
  TASK_LABEL_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '@/modules/todos/constants/todos'
import type { TaskFilter } from '@/modules/todos/types/todos'

const errorKeys: Record<string, TranslationKey> = {
  'Enter a task title.': 'todos.error.titleRequired',
  [`Keep the title within ${TASK_TITLE_MAX_LENGTH} characters.`]:
    'todos.error.titleTooLong',
  'Choose a valid due date.': 'todos.error.dueDateInvalid',
  [`Keep the label within ${TASK_LABEL_MAX_LENGTH} characters.`]:
    'todos.error.labelTooLong',
  'Enter a countdown title.': 'todos.error.countdownTitleRequired',
  'Choose a target date.': 'todos.error.targetDateRequired',
  'Choose a valid target date.': 'todos.error.targetDateInvalid',
  'Local storage is unavailable. Planning data cannot be saved in this browser.':
    'todos.error.storageUnavailable',
  'Saved planning data contains invalid JSON. It was left unchanged for recovery.':
    'todos.error.invalidJson',
  'Saved planning data does not match the supported format. It was left unchanged.':
    'todos.error.invalidFormat',
}

const filterKeys: Record<TaskFilter, TranslationKey> = {
  today: 'todos.tasks.filter.today',
  upcoming: 'todos.tasks.filter.upcoming',
  completed: 'todos.tasks.filter.completed',
  all: 'todos.tasks.filter.all',
}

export function localizeTodosError(value: string | null, t: Translator) {
  if (!value) return null
  const key = errorKeys[value]
  if (!key) return value

  if (key === 'todos.error.titleTooLong') {
    return t(key, { count: TASK_TITLE_MAX_LENGTH })
  }
  if (key === 'todos.error.labelTooLong') {
    return t(key, { count: TASK_LABEL_MAX_LENGTH })
  }
  return t(key)
}

export function getTaskFilterLabel(filter: TaskFilter, t: Translator) {
  return t(filterKeys[filter])
}
