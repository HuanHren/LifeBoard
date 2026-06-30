<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import InlineDeleteConfirmation from '@/modules/todos/components/InlineDeleteConfirmation.vue'
import TaskEditForm from '@/modules/todos/components/TaskEditForm.vue'
import { useTodosStore } from '@/modules/todos/stores/todos'
import type { Task } from '@/modules/todos/types/todos'
import { formatReadableDate } from '@/modules/todos/utils/todoDates'

interface Props {
  task: Task
  today: string
}

const props = defineProps<Props>()
const { locale, t } = useI18n()
const todosStore = useTodosStore()
const isEditing = shallowRef(false)
const isConfirmingDelete = shallowRef(false)
const isConfirmingPermanentDelete = shallowRef(false)
const isCompleted = computed(() => props.task.completedAt !== null)
const isDeleted = computed(() => props.task.deletedAt !== undefined && props.task.deletedAt !== null)
const isPastDue = computed(
  () =>
    !isCompleted.value &&
    !isDeleted.value &&
    props.task.dueDate !== null &&
    props.task.dueDate < props.today,
)

function deleteTask() {
  todosStore.deleteTask(props.task.id)
}

function restoreTask() {
  todosStore.restoreTask(props.task.id)
}

function permanentlyDeleteTask() {
  todosStore.permanentlyDeleteTask(props.task.id)
}

function toggleTask(event: Event) {
  if (todosStore.toggleTask(props.task.id)) {
    return
  }

  const input = event.currentTarget

  if (input instanceof HTMLInputElement) {
    input.checked = isCompleted.value
  }
}
</script>

<template>
  <li class="px-4 py-3.5 sm:px-5">
    <TaskEditForm
      v-if="isEditing && !isDeleted"
      :task="task"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />
    <div v-else class="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
      <label
        v-if="!isDeleted"
        class="mt-0.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]"
        :for="`task-complete-${task.id}`"
      >
        <input
          :id="`task-complete-${task.id}`"
          :checked="isCompleted"
          class="size-5 shrink-0 accent-[var(--color-accent)]"
          type="checkbox"
          @change="toggleTask"
        />
        <span class="sr-only">
          {{ isCompleted ? t('todos.tasks.restoreAction') : t('todos.tasks.completed') }}
        </span>
      </label>
      <div
        v-else
        class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      >
        &minus;
      </div>
      <div class="min-w-0">
        <component
          :is="isDeleted ? 'p' : 'label'"
          :for="isDeleted ? undefined : `task-complete-${task.id}`"
          class="block break-words font-medium"
          :class="
            isDeleted || isCompleted
              ? 'line-through text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-text-primary)]'
          "
        >
          {{ task.title }}
        </component>
        <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
          <span v-if="isDeleted" class="font-medium text-[var(--color-text-secondary)]">
            {{ t('todos.tasks.deleted') }}
          </span>
          <span v-if="isCompleted" class="font-medium text-[var(--color-text-secondary)]">
            {{ t('todos.tasks.completed') }}
          </span>
          <time
            v-if="task.dueDate"
            :datetime="task.dueDate"
            :class="
              isPastDue
                ? 'font-semibold text-[var(--color-danger)]'
                : 'text-[var(--color-text-secondary)]'
            "
          >
            {{ isPastDue ? `${t('todos.tasks.pastDue')} · ` : ''
            }}{{ formatReadableDate(task.dueDate, locale) }}
          </time>
          <span
            v-if="task.label"
            class="rounded-[var(--radius-pill)] bg-[var(--color-accent-wash)] px-2 py-0.5 font-medium text-[var(--color-accent-text)]"
          >
            {{ task.label }}
          </span>
          <span v-if="!task.dueDate" class="text-[var(--color-text-secondary)]">
            {{ t('todos.tasks.noDueDate') }}
          </span>
        </div>

        <InlineDeleteConfirmation
          v-if="isConfirmingDelete"
          class="mt-3"
          :item-name="task.title"
          @cancel="isConfirmingDelete = false"
          @confirm="deleteTask"
        />
        <InlineDeleteConfirmation
          v-else-if="isConfirmingPermanentDelete"
          class="mt-3"
          permanent
          :item-name="task.title"
          @cancel="isConfirmingPermanentDelete = false"
          @confirm="permanentlyDeleteTask"
        />
        <div v-else class="mt-2 flex flex-wrap justify-end gap-1">
          <BaseButton v-if="!isDeleted" size="sm" variant="ghost" @click="isEditing = true">
            {{ t('todos.tasks.editAction') }}
          </BaseButton>
          <BaseButton v-if="!isDeleted" size="sm" variant="ghost" @click="isConfirmingDelete = true">
            {{ t('todos.tasks.deleteAction') }}
          </BaseButton>
          <BaseButton v-if="isDeleted" size="sm" variant="secondary" @click="restoreTask">
            {{ t('todos.tasks.restoreAction') }}
          </BaseButton>
          <BaseButton
            v-if="isDeleted"
            size="sm"
            variant="ghost"
            @click="isConfirmingPermanentDelete = true"
          >
            {{ t('todos.tasks.permanentDeleteAction') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </li>
</template>
