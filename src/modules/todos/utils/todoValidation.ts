import {
  COUNTDOWN_TITLE_MAX_LENGTH,
  TASK_LABEL_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '@/modules/todos/constants/todos'
import type {
  Countdown,
  CountdownDraft,
  Task,
  TaskDraft,
  ValidationResult,
} from '@/modules/todos/types/todos'
import { isDateOnly, isIsoTimestamp } from '@/modules/todos/utils/todoDates'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeTaskDraft(draft: TaskDraft): TaskDraft {
  return {
    title: draft.title.trim(),
    dueDate: draft.dueDate || null,
    label: draft.label?.trim() || null,
  }
}

export function validateTaskDraft(draft: TaskDraft): ValidationResult {
  const normalized = normalizeTaskDraft(draft)

  return {
    title:
      normalized.title.length === 0
        ? 'Enter a task title.'
        : normalized.title.length > TASK_TITLE_MAX_LENGTH
          ? `Keep the title within ${TASK_TITLE_MAX_LENGTH} characters.`
          : null,
    date:
      normalized.dueDate !== null && !isDateOnly(normalized.dueDate)
        ? 'Choose a valid due date.'
        : null,
    label:
      normalized.label !== null && normalized.label.length > TASK_LABEL_MAX_LENGTH
        ? `Keep the label within ${TASK_LABEL_MAX_LENGTH} characters.`
        : null,
  }
}

export function normalizeCountdownDraft(draft: CountdownDraft): CountdownDraft {
  return {
    title: draft.title.trim(),
    targetDate: draft.targetDate,
  }
}

export function validateCountdownDraft(draft: CountdownDraft): ValidationResult {
  const normalized = normalizeCountdownDraft(draft)

  return {
    title:
      normalized.title.length === 0
        ? 'Enter a countdown title.'
        : normalized.title.length > COUNTDOWN_TITLE_MAX_LENGTH
          ? `Keep the title within ${COUNTDOWN_TITLE_MAX_LENGTH} characters.`
          : null,
    date:
      normalized.targetDate.length === 0
        ? 'Choose a target date.'
        : !isDateOnly(normalized.targetDate)
          ? 'Choose a valid target date.'
          : null,
    label: null,
  }
}

export function hasValidationErrors(result: ValidationResult) {
  return Object.values(result).some((value) => value !== null)
}

export function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    value.title.length <= TASK_TITLE_MAX_LENGTH &&
    (value.dueDate === null || isDateOnly(value.dueDate)) &&
    (value.label === null ||
      (typeof value.label === 'string' && value.label.length <= TASK_LABEL_MAX_LENGTH)) &&
    (value.completedAt === null || isIsoTimestamp(value.completedAt)) &&
    (value.deletedAt === undefined ||
      value.deletedAt === null ||
      isIsoTimestamp(value.deletedAt)) &&
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt)
  )
}

export function isCountdown(value: unknown): value is Countdown {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    value.title.length <= COUNTDOWN_TITLE_MAX_LENGTH &&
    isDateOnly(value.targetDate) &&
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt)
  )
}
