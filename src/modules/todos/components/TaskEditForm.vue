<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import {
  TASK_LABEL_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '@/modules/todos/constants/todos'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type { Task, TaskUpdate, ValidationResult } from '@/modules/todos/types/todos'
import {
  hasValidationErrors,
  validateTaskDraft,
} from '@/modules/todos/utils/todoValidation'
import { localizeTodosError } from '@/modules/todos/utils/todosI18n'

interface Props {
  task: Task
}

interface Emits {
  saved: []
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const todosStore = useTodosStore()
const title = shallowRef(props.task.title)
const dueDate = shallowRef(props.task.dueDate ?? '')
const label = shallowRef(props.task.label ?? '')
const errors = shallowRef<ValidationResult>({ title: null, date: null, label: null })
const titleDescribedBy = computed(() =>
  errors.value.title ? `edit-task-title-error-${props.task.id}` : undefined,
)

function saveTask() {
  const update: TaskUpdate = {
    title: title.value,
    dueDate: dueDate.value || null,
    label: label.value || null,
  }
  const nextErrors = validateTaskDraft(update)
  errors.value = nextErrors

  if (hasValidationErrors(nextErrors)) return
  if (todosStore.updateTask(props.task.id, update)) emit('saved')
}
</script>

<template>
  <form class="space-y-4 py-1" novalidate @submit.prevent="saveTask">
    <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10.5rem]">
      <div class="space-y-2">
        <label class="block text-sm font-semibold" :for="`edit-task-title-${task.id}`">
          {{ t('todos.tasks.titleLabel') }}
        </label>
        <input
          :id="`edit-task-title-${task.id}`"
          v-model="title"
          :aria-describedby="titleDescribedBy"
          :aria-invalid="errors.title ? 'true' : 'false'"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
          :maxlength="TASK_TITLE_MAX_LENGTH"
          type="text"
        />
        <p
          v-if="errors.title"
          :id="`edit-task-title-error-${task.id}`"
          class="text-sm font-medium text-[var(--color-danger)]"
          role="alert"
        >
          {{ localizeTodosError(errors.title, t) }}
        </p>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-semibold" :for="`edit-task-date-${task.id}`">
          {{ t('todos.tasks.dueDateLabel') }}
        </label>
        <input
          :id="`edit-task-date-${task.id}`"
          v-model="dueDate"
          :aria-describedby="errors.date ? `edit-task-date-error-${task.id}` : undefined"
          :aria-invalid="errors.date ? 'true' : 'false'"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
          type="date"
        />
      </div>
    </div>
    <div class="space-y-2">
      <label class="block text-sm font-semibold" :for="`edit-task-label-${task.id}`">
        {{ t('todos.tasks.labelLabel') }}
      </label>
      <input
        :id="`edit-task-label-${task.id}`"
        v-model="label"
        :aria-describedby="errors.label ? `edit-task-label-error-${task.id}` : undefined"
        :aria-invalid="errors.label ? 'true' : 'false'"
        class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-inset)] px-3"
        :maxlength="TASK_LABEL_MAX_LENGTH"
        type="text"
      />
      <p
        v-if="errors.date"
        :id="`edit-task-date-error-${task.id}`"
        class="text-sm font-medium text-[var(--color-danger)]"
        role="alert"
      >
        {{ localizeTodosError(errors.date, t) }}
      </p>
      <p
        v-if="errors.label"
        :id="`edit-task-label-error-${task.id}`"
        class="text-sm font-medium text-[var(--color-danger)]"
        role="alert"
      >
        {{ localizeTodosError(errors.label, t) }}
      </p>
    </div>
    <div class="flex flex-wrap justify-end gap-2">
      <BaseButton size="sm" variant="ghost" @click="emit('cancel')">
        {{ t('todos.tasks.cancelAction') }}
      </BaseButton>
      <BaseButton size="sm" type="submit" variant="primary">
        {{ t('todos.tasks.saveAction') }}
      </BaseButton>
    </div>
  </form>
</template>
