<script setup lang="ts">
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import TaskItem from '@/modules/todos/components/TaskItem.vue'
import type { Task, TaskFilter } from '@/modules/todos/types/todos'

interface Props {
  tasks: Task[]
  filter: TaskFilter
  today: string
}

const props = defineProps<Props>()

const emptyCopy: Record<TaskFilter, { title: string; description: string }> = {
  today: {
    title: 'Today is clear',
    description: 'Tasks due today and overdue unfinished tasks will appear here.',
  },
  upcoming: {
    title: 'Nothing upcoming',
    description: 'Future-dated tasks will appear here when you add them.',
  },
  completed: {
    title: 'No completed tasks',
    description: 'Completed tasks remain available here until you delete them.',
  },
  all: {
    title: 'No tasks yet',
    description: 'Use the task form above to add your first item.',
  },
}
</script>

<template>
  <BaseEmpty
    v-if="tasks.length === 0"
    :description="emptyCopy[props.filter].description"
    :title="emptyCopy[props.filter].title"
  />
  <ul
    v-else
    class="divide-y divide-[var(--color-border-soft)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]"
  >
    <TaskItem v-for="task in tasks" :key="task.id" :task="task" :today="today" />
  </ul>
</template>
