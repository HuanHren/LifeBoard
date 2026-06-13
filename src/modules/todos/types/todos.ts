export interface Task {
  id: string
  title: string
  dueDate: string | null
  label: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Countdown {
  id: string
  title: string
  targetDate: string
  createdAt: string
  updatedAt: string
}

export type TaskFilter = 'today' | 'upcoming' | 'completed' | 'all'

export interface TaskDraft {
  title: string
  dueDate: string | null
  label: string | null
}

export interface TaskUpdate extends TaskDraft {}

export interface CountdownDraft {
  title: string
  targetDate: string
}

export interface TodosStorageEnvelope {
  version: 1
  tasks: Task[]
  countdowns: Countdown[]
}

export interface ValidationResult {
  title: string | null
  date: string | null
  label: string | null
}

export interface CountdownStatus {
  difference: number
  label: string
  state: 'future' | 'today' | 'reached'
}
