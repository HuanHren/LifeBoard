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
  <li
    class="task-item"
    :class="[
      isCompleted ? 'task-item--completed' : '',
      isDeleted ? 'task-item--deleted' : '',
      isPastDue ? 'task-item--past-due' : '',
    ]"
  >
    <TaskEditForm
      v-if="isEditing && !isDeleted"
      :task="task"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />
    <div v-else class="task-item__body">
      <label
        v-if="!isDeleted"
        class="task-item__check"
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
      <div v-else class="task-item__deleted-mark" aria-hidden="true">
        &minus;
      </div>
      <div class="min-w-0">
        <component
          :is="isDeleted ? 'p' : 'label'"
          :for="isDeleted ? undefined : `task-complete-${task.id}`"
          class="task-item__title"
          :class="
            isDeleted || isCompleted
              ? 'line-through text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-text-primary)]'
          "
        >
          {{ task.title }}
        </component>
        <div class="task-item__meta">
          <span v-if="isDeleted" class="task-item__badge">
            {{ t('todos.tasks.deleted') }}
          </span>
          <span v-if="isCompleted" class="task-item__badge">
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
            {{ isPastDue ? `${t('todos.tasks.pastDue')} - ` : ''
            }}{{ formatReadableDate(task.dueDate, locale) }}
          </time>
          <span v-if="task.label" class="task-item__label">
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
        <div v-else class="task-item__actions">
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

<style scoped>
.task-item {
  padding: 0.9rem 1rem;
  background: var(--color-surface-raised);
}

.task-item--past-due {
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--color-danger-soft) 55%, transparent), transparent 42%),
    var(--color-surface-raised);
}

.task-item--completed,
.task-item--deleted {
  background: var(--color-surface);
}

.task-item__body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.8rem;
}

.task-item__check,
.task-item__deleted-mark {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  margin-top: 0.05rem;
  flex-shrink: 0;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.task-item__check {
  cursor: pointer;
}

.task-item__check:hover {
  border-color: var(--color-accent);
}

.task-item__deleted-mark {
  border-color: var(--color-border-soft);
  background: var(--color-surface-muted);
  color: var(--color-text-tertiary);
}

.task-item__title {
  display: block;
  word-break: break-word;
  font-weight: 680;
  line-height: 1.45;
}

.task-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.6rem;
  margin-top: 0.4rem;
  font-size: var(--text-caption);
}

.task-item__badge,
.task-item__label {
  border-radius: var(--radius-pill);
  padding: 0.15rem 0.5rem;
  font-weight: 650;
}

.task-item__badge {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.task-item__label {
  background: var(--color-accent-wash);
  color: var(--color-accent-text);
}

.task-item__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.45rem;
}

@media (max-width: 520px) {
  .task-item {
    padding: 0.8rem;
  }

  .task-item__body {
    gap: 0.65rem;
  }

  .task-item__actions {
    justify-content: flex-start;
  }
}
</style>
