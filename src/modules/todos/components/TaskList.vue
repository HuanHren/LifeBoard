<script setup lang="ts">
import { computed } from 'vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import { useI18n } from '@/i18n/useI18n'
import TaskItem from '@/modules/todos/components/TaskItem.vue'
import type { Task, TaskFilter } from '@/modules/todos/types/todos'

interface Props {
  tasks: Task[]
  filter: TaskFilter
  today: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const emptyCopy = computed<Record<TaskFilter, { title: string; description: string }>>(
  () => ({
    today: {
      title: t('todos.tasks.empty.todayTitle'),
      description: t('todos.tasks.empty.todayDescription'),
    },
    upcoming: {
      title: t('todos.tasks.empty.upcomingTitle'),
      description: t('todos.tasks.empty.upcomingDescription'),
    },
    completed: {
      title: t('todos.tasks.empty.completedTitle'),
      description: t('todos.tasks.empty.completedDescription'),
    },
    all: {
      title: t('todos.tasks.empty.allTitle'),
      description: t('todos.tasks.empty.allDescription'),
    },
    deleted: {
      title: t('todos.tasks.empty.deletedTitle'),
      description: t('todos.tasks.empty.deletedDescription'),
    },
  }),
)
</script>

<template>
  <BaseEmpty
    v-if="tasks.length === 0"
    class="todos-task-list__empty"
    :description="emptyCopy[props.filter].description"
    :title="emptyCopy[props.filter].title"
  />
  <ul
    v-else
    class="todos-task-list divide-y divide-[var(--color-border-soft)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]"
  >
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :today="today"
    />
  </ul>
</template>

<style scoped>
.todos-task-list {
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-border-soft) 70%, transparent);
}

.todos-task-list__empty {
  border-style: dashed;
}
</style>
