<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FormField from '@/components/base/FormField.vue'
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
const isExpanded = shallowRef(false)
const errors = shallowRef<ValidationResult>({ title: null, date: null, label: null })
const announcement = shallowRef('')
const titleInput = useTemplateRef<HTMLInputElement>('titleInput')

const titleDescribedBy = computed(() =>
  errors.value.title ? 'task-title-description task-title-error' : 'task-title-description',
)
const labelDescribedBy = computed(() =>
  errors.value.label ? 'task-label-helper task-label-error' : 'task-label-helper',
)

function focusTitle() {
  void nextTick(() => {
    titleInput.value?.focus()
  })
}

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
  isExpanded.value = false
  errors.value = { title: null, date: null, label: null }
  announcement.value = t('todos.tasks.announcement.added')
  focusTitle()
}

function handleTitleEnter(event: KeyboardEvent) {
  if (event.isComposing) {
    return
  }

  submitTask()
}
</script>

<template>
  <form
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-4 sm:p-5"
    novalidate
    @submit.prevent="submitTask"
  >
    <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('todos.tasks.addTitle') }}
        </h2>
        <p id="task-title-description" class="mt-1 text-caption text-[var(--color-text-secondary)]">
          {{ t('todos.tasks.addDescription') }}
        </p>
      </div>
      <BaseButton
        size="sm"
        type="button"
        variant="ghost"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? t('todos.tasks.collapseDetails') : t('todos.tasks.expandDetails') }}
      </BaseButton>
    </div>

    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div class="space-y-2">
        <label class="sr-only" for="task-title">
          {{ t('todos.tasks.titleLabel') }}
        </label>
        <input
          id="task-title"
          ref="titleInput"
          v-model="title"
          :aria-describedby="titleDescribedBy"
          :aria-invalid="errors.title ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
          :maxlength="TASK_TITLE_MAX_LENGTH"
          name="task-title"
          :placeholder="t('todos.tasks.titlePlaceholder')"
          type="text"
          @keydown.enter.prevent="handleTitleEnter"
        />
        <p
          v-if="errors.title"
          id="task-title-error"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeTodosError(errors.title, t) }}
        </p>
      </div>

      <BaseButton class="w-full lg:w-auto" type="submit" variant="primary">
        {{ t('todos.tasks.addAction') }}
      </BaseButton>
    </div>

    <div v-if="isExpanded" class="mt-4 grid gap-4 border-t border-[var(--color-border-soft)] pt-4 sm:grid-cols-2">
      <FormField
        id="task-due-date"
        :error="localizeTodosError(errors.date, t)"
        :label="t('todos.tasks.dueDateLabel')"
      >
        <template #default="{ ariaDescribedby, ariaInvalid }">
          <input
            id="task-due-date"
            v-model="dueDate"
            :aria-describedby="ariaDescribedby"
            :aria-invalid="ariaInvalid === 'true' ? 'true' : undefined"
            class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
            name="task-due-date"
            type="date"
          />
        </template>
      </FormField>

      <FormField
        id="task-label"
        :description="t('todos.tasks.labelHelper')"
        :error="localizeTodosError(errors.label, t)"
        :label="t('todos.tasks.labelLabel')"
      >
        <template #default="{ ariaDescribedby, ariaInvalid }">
          <input
            id="task-label"
            v-model="label"
            :aria-describedby="ariaDescribedby || labelDescribedBy"
            :aria-invalid="ariaInvalid === 'true' ? 'true' : undefined"
            autocomplete="off"
            class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)]"
            :maxlength="TASK_LABEL_MAX_LENGTH"
            name="task-label"
            :placeholder="t('todos.tasks.labelPlaceholder')"
            type="text"
          />
        </template>
      </FormField>
    </div>

    <p
      v-if="!isExpanded"
      id="task-label-helper"
      class="mt-2 text-caption text-[var(--color-text-secondary)]"
    >
      {{ t('todos.tasks.titleHelper') }}
    </p>
    <p
      v-else
      id="task-label-helper"
      class="sr-only"
    >
      {{ t('todos.tasks.labelHelper') }}
    </p>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </form>
</template>
