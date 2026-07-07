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
    class="task-composer surface-card surface-card--elevated"
    novalidate
    @submit.prevent="submitTask"
  >
    <div class="task-composer__header">
      <div>
        <h2 class="task-composer__title">
        {{ t('todos.tasks.addTitle') }}
        </h2>
        <p id="task-title-description" class="task-composer__description">
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

    <div class="task-composer__quick-row">
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
          class="task-composer__input"
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

      <BaseButton class="task-composer__submit" type="submit" variant="primary">
        {{ t('todos.tasks.addAction') }}
      </BaseButton>
    </div>

    <div v-if="isExpanded" class="task-composer__details">
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
            class="task-composer__input"
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
            class="task-composer__input"
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
      class="task-composer__helper"
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

<style scoped>
.task-composer {
  min-width: 0;
  width: 100%;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-surface-elevated) 82%, transparent), transparent),
    var(--color-surface-raised);
  padding: 1rem;
}

.task-composer__header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.task-composer__header > div {
  min-width: 0;
}

.task-composer__title {
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 700;
}

.task-composer__description,
.task-composer__helper {
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.5;
}

.task-composer__quick-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: start;
}

.task-composer__quick-row > div {
  min-width: 0;
}

.task-composer__input {
  min-height: 2.75rem;
  width: 100%;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-inset);
  padding-inline: 0.75rem;
  color: var(--color-text-primary);
}

.task-composer__input::placeholder {
  color: var(--color-text-tertiary);
}

.task-composer__input:hover {
  border-color: var(--color-accent);
}

.task-composer__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border-soft);
  padding-top: 1rem;
}

@media (max-width: 640px) {
  .task-composer {
    padding: 0.9rem;
  }

  .task-composer__quick-row,
  .task-composer__details {
    grid-template-columns: 1fr;
  }

  .task-composer__submit {
    width: 100%;
  }
}
</style>
