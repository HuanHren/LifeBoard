<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import {
  TASK_LABEL_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '@/modules/todos/constants/todos'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type { TaskDraft, ValidationResult } from '@/modules/todos/types/todos'
import {
  hasValidationErrors,
  validateTaskDraft,
} from '@/modules/todos/utils/todoValidation'

const todosStore = useTodosStore()
const title = shallowRef('')
const dueDate = shallowRef('')
const label = shallowRef('')
const errors = shallowRef<ValidationResult>({ title: null, date: null, label: null })
const announcement = shallowRef('')

const titleDescribedBy = computed(() =>
  errors.value.title ? 'task-title-helper task-title-error' : 'task-title-helper',
)
const labelDescribedBy = computed(() =>
  errors.value.label ? 'task-label-helper task-label-error' : 'task-label-helper',
)

function submitTask() {
  const draft: TaskDraft = {
    title: title.value,
    dueDate: dueDate.value || null,
    label: label.value || null,
  }
  const nextErrors = validateTaskDraft(draft)
  errors.value = nextErrors

  if (hasValidationErrors(nextErrors)) {
    announcement.value = 'Check the task form for errors.'
    return
  }

  if (!todosStore.addTask(draft)) {
    announcement.value = 'The task was not saved.'
    return
  }

  title.value = ''
  dueDate.value = ''
  label.value = ''
  errors.value = { title: null, date: null, label: null }
  announcement.value = 'Task added.'
}
</script>

<template>
  <form
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 sm:p-5"
    novalidate
    @submit.prevent="submitTask"
  >
    <div class="mb-4">
      <h2 class="text-section-title text-[var(--color-text-primary)]">Add a task</h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        Capture one clear next step. A date and label are optional.
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem_10rem_auto] lg:items-start">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="task-title">Task title</label>
        <input
          id="task-title"
          v-model="title"
          :aria-describedby="titleDescribedBy"
          :aria-invalid="errors.title ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="TASK_TITLE_MAX_LENGTH"
          name="task-title"
          placeholder="What needs your attention?"
          type="text"
        />
        <p id="task-title-helper" class="text-caption text-[var(--color-text-secondary)]">
          Keep it specific and easy to scan.
        </p>
        <p
          v-if="errors.title"
          id="task-title-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ errors.title }}
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="task-due-date">Due date</label>
        <input
          id="task-due-date"
          v-model="dueDate"
          :aria-describedby="errors.date ? 'task-due-date-error' : undefined"
          :aria-invalid="errors.date ? 'true' : 'false'"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          name="task-due-date"
          type="date"
        />
        <p
          v-if="errors.date"
          id="task-due-date-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ errors.date }}
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="task-label">Label</label>
        <input
          id="task-label"
          v-model="label"
          :aria-describedby="labelDescribedBy"
          :aria-invalid="errors.label ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="TASK_LABEL_MAX_LENGTH"
          name="task-label"
          placeholder="Optional"
          type="text"
        />
        <p id="task-label-helper" class="text-caption text-[var(--color-text-secondary)]">
          A short context word.
        </p>
        <p
          v-if="errors.label"
          id="task-label-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ errors.label }}
        </p>
      </div>

      <BaseButton class="w-full lg:mt-7 lg:w-auto" type="submit" variant="primary">
        Add task
      </BaseButton>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </form>
</template>
