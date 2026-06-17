<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import { TASK_FILTERS } from '@/modules/todos/constants/todos'
import type { TaskFilter } from '@/modules/todos/types/todos'
import { getTaskFilterLabel } from '@/modules/todos/utils/todosI18n'

interface Props {
  activeFilter: TaskFilter
}

interface Emits {
  change: [filter: TaskFilter]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
</script>

<template>
  <div
    class="flex max-w-full gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-1"
    :aria-label="t('todos.tasks.filterLabel')"
    role="group"
  >
    <button
      v-for="filter in TASK_FILTERS"
      :key="filter.value"
      :aria-pressed="activeFilter === filter.value"
      class="interactive-surface min-h-11 shrink-0 rounded-[var(--radius-sm)] px-3 text-sm font-medium"
      :class="
        activeFilter === filter.value
          ? 'bg-[var(--color-surface-raised)] text-[var(--color-accent-text)] shadow-[var(--shadow-soft)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-primary)]'
      "
      type="button"
      @click="emit('change', filter.value)"
    >
      {{ getTaskFilterLabel(filter.value, t) }}
    </button>
  </div>
</template>
