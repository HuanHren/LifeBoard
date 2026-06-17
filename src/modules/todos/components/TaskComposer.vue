<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
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
import { localizeTodosError } from '@/modules/todos/utils/todosI18n'

const { t } = useI18n()
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
    announcement.value = t('todos.tasks.announcement.checkForm')
    return
  }

  if (!todosStore.addTask(draft)) {
    announcement.value = t('todos.tasks.announcement.notSaved')
    return
  }

  title.value = ''
  dueDate.value = ''
  label.value = ''
  errors.value = { title: null, date: null, label: null }
  announcement.value = t('todos.tasks.announcement.added')
}
</script>

<template>
  <form
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 sm:p-5"
    novalidate
    @submit.prevent="submitTask"
  >
    <div class="mb-4">
      <h2 class="text-section-title text-[var(--color-text-primary)]">
        {{ t('todos.tasks.addTitle') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('todos.tasks.addDescription') }}
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem_10rem_auto] lg:items-start">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="task-title">
          {{ t('todos.tasks.titleLabel') }}
        </label>
        <input
          id="task-title"
          v-model="title"
          :aria-describedby="titleDescribedBy"
          :aria-invalid="errors.title ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="TASK_TITLE_MAX_LENGTH"
          name="task-title"
          :placeholder="t('todos.tasks.titlePlaceholder')"
          type="text"
        />
        <p id="task-title-helper" class="text-caption text-[var(--color-text-secondary)]">
          {{ t('todos.tasks.titleHelper') }}
        </p>
        <p
          v-if="errors.title"
          id="task-title-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeTodosError(errors.title, t) }}
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="task-due-date">
          {{ t('todos.tasks.dueDateLabel') }}
        </label>
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
          {{ localizeTodosError(errors.date, t) }}
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-semibold" for="task-label">
          {{ t('todos.tasks.labelLabel') }}
        </label>
        <input
          id="task-label"
          v-model="label"
          :aria-describedby="labelDescribedBy"
          :aria-invalid="errors.label ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="TASK_LABEL_MAX_LENGTH"
          name="task-label"
          :placeholder="t('todos.tasks.labelPlaceholder')"
          type="text"
        />
        <p id="task-label-helper" class="text-caption text-[var(--color-text-secondary)]">
          {{ t('todos.tasks.labelHelper') }}
        </p>
        <p
          v-if="errors.label"
          id="task-label-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeTodosError(errors.label, t) }}
        </p>
      </div>

      <BaseButton class="w-full lg:mt-7 lg:w-auto" type="submit" variant="primary">
        {{ t('todos.tasks.addAction') }}
      </BaseButton>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </form>
</template>
