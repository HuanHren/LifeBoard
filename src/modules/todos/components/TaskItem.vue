<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
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
const todosStore = useTodosStore()
const isEditing = shallowRef(false)
const isConfirmingDelete = shallowRef(false)
const isCompleted = computed(() => props.task.completedAt !== null)
const isPastDue = computed(
  () =>
    !isCompleted.value &&
    props.task.dueDate !== null &&
    props.task.dueDate < props.today,
)

function deleteTask() {
  todosStore.deleteTask(props.task.id)
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
  <li class="px-4 py-4 sm:px-5">
    <TaskEditForm
      v-if="isEditing"
      :task="task"
      @cancel="isEditing = false"
      @saved="isEditing = false"
    />
    <div v-else class="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
      <input
        :id="`task-complete-${task.id}`"
        :checked="isCompleted"
        class="mt-1 size-5 shrink-0 accent-[var(--color-accent)]"
        type="checkbox"
        @change="toggleTask"
      />
      <div class="min-w-0">
        <label
          :for="`task-complete-${task.id}`"
          class="block cursor-pointer font-medium"
          :class="
            isCompleted
              ? 'line-through text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-text-primary)]'
          "
        >
          {{ task.title }}
        </label>
        <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
          <span v-if="isCompleted" class="font-medium text-[var(--color-text-secondary)]">
            Completed
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
            {{ isPastDue ? 'Past due · ' : '' }}{{ formatReadableDate(task.dueDate) }}
          </time>
          <span
            v-if="task.label"
            class="rounded-[var(--radius-pill)] bg-[var(--color-accent-wash)] px-2 py-0.5 font-medium text-[var(--color-accent-text)]"
          >
            {{ task.label }}
          </span>
        </div>

        <InlineDeleteConfirmation
          v-if="isConfirmingDelete"
          class="mt-3"
          :item-name="task.title"
          @cancel="isConfirmingDelete = false"
          @confirm="deleteTask"
        />
        <div v-else class="mt-2 flex flex-wrap justify-end gap-1">
          <BaseButton size="sm" variant="ghost" @click="isEditing = true">Edit</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="isConfirmingDelete = true">
            Delete
          </BaseButton>
        </div>
      </div>
    </div>
  </li>
</template>
