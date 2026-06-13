import {
  TODOS_STORAGE_KEY,
  TODOS_STORAGE_VERSION,
} from '@/modules/todos/constants/todos'
import type { TodosStorageEnvelope } from '@/modules/todos/types/todos'
import { isCountdown, isTask } from '@/modules/todos/utils/todoValidation'

export type TodosStorageResult =
  | { ok: true; data: TodosStorageEnvelope | null }
  | { ok: false; error: string }

function isEnvelope(value: unknown): value is TodosStorageEnvelope {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const envelope = value as Partial<TodosStorageEnvelope>
  return (
    envelope.version === TODOS_STORAGE_VERSION &&
    Array.isArray(envelope.tasks) &&
    envelope.tasks.every(isTask) &&
    Array.isArray(envelope.countdowns) &&
    envelope.countdowns.every(isCountdown)
  )
}

function storageUnavailableMessage() {
  return 'Local storage is unavailable. Your planning changes cannot be saved in this browser.'
}

export function loadTodosStorage(): TodosStorageResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: storageUnavailableMessage() }
  }

  try {
    const stored = window.localStorage.getItem(TODOS_STORAGE_KEY)

    if (stored === null) {
      return { ok: true, data: null }
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(stored) as unknown
    } catch {
      return {
        ok: false,
        error: 'Saved planning data contains invalid JSON. It was left unchanged for recovery.',
      }
    }

    if (!isEnvelope(parsed)) {
      return {
        ok: false,
        error: 'Saved planning data does not match the supported format. It was left unchanged.',
      }
    }

    return { ok: true, data: parsed }
  } catch {
    return { ok: false, error: storageUnavailableMessage() }
  }
}

export function saveTodosStorage(envelope: TodosStorageEnvelope): TodosStorageResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: storageUnavailableMessage() }
  }

  try {
    window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(envelope))
    return { ok: true, data: envelope }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return {
        ok: false,
        error: 'Browser storage is full. Remove some saved items or free browser storage, then retry.',
      }
    }

    return { ok: false, error: storageUnavailableMessage() }
  }
}
