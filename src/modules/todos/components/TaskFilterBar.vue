<script setup lang="ts">
import { nextTick, onMounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import { TASK_FILTERS } from '@/modules/todos/constants/todos'
import type { TaskFilter } from '@/modules/todos/types/todos'
import { getTaskFilterLabel } from '@/modules/todos/utils/todosI18n'

interface Props {
  activeFilter: TaskFilter
  counts: Record<TaskFilter, number>
}

interface Emits {
  change: [filter: TaskFilter]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const filterButtons = ref<Partial<Record<TaskFilter, HTMLButtonElement>>>({})

function setFilterButtonRef(
  filter: TaskFilter,
  element: Element | ComponentPublicInstance | null,
) {
  if (element instanceof HTMLButtonElement) {
    filterButtons.value[filter] = element
  }
}

function scrollActiveFilterIntoView() {
  const activeButton = filterButtons.value[props.activeFilter]

  if (!activeButton) return

  activeButton.scrollIntoView({
    block: 'nearest',
    inline: 'center',
  })
}

watch(
  () => props.activeFilter,
  () => {
    void nextTick(scrollActiveFilterIntoView)
  },
)

onMounted(() => {
  void nextTick(scrollActiveFilterIntoView)
})
</script>

<template>
  <div class="task-filter-bar">
    <div
      class="task-filter-bar__scroller"
      :aria-label="t('todos.tasks.filterLabel')"
      role="group"
    >
      <button
        v-for="filter in TASK_FILTERS"
        :key="filter.value"
        :ref="(element) => setFilterButtonRef(filter.value, element)"
        :aria-pressed="activeFilter === filter.value"
        class="interactive-surface task-filter-bar__button"
        :class="activeFilter === filter.value ? 'task-filter-bar__button--active' : ''"
        type="button"
        @click="emit('change', filter.value)"
      >
        <span>{{ getTaskFilterLabel(filter.value, t) }}</span>
        <span class="task-filter-bar__count">
          {{ counts[filter.value] }}
        </span>
      </button>
    </div>
    <p class="task-filter-bar__hint">
      {{ t('todos.tasks.filterScrollHint') }}
    </p>
  </div>
</template>

<style scoped>
.task-filter-bar {
  min-width: 0;
  position: relative;
}

.task-filter-bar::after {
  content: '';
  pointer-events: none;
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  width: 2.25rem;
  height: 2.95rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: linear-gradient(90deg, transparent, var(--color-surface) 76%);
}

.task-filter-bar__scroller {
  display: flex;
  width: 100%;
  max-width: 100%;
  gap: 0.25rem;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-padding-inline: 0.5rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: 0.25rem;
  scrollbar-width: thin;
}

.task-filter-bar__button {
  min-height: 2.75rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  padding-inline: 0.65rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 650;
}

.task-filter-bar__button:hover {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
}

.task-filter-bar__button--active {
  background: var(--color-surface-raised);
  color: var(--color-accent-text);
  box-shadow: var(--shadow-soft);
}

.task-filter-bar__count {
  margin-left: 0.5rem;
  border-radius: var(--radius-pill);
  background: var(--color-surface-muted);
  padding: 0.125rem 0.4rem;
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.task-filter-bar__hint {
  margin-top: 0.35rem;
  color: var(--color-text-tertiary);
  font-size: var(--text-caption);
  line-height: 1.35;
}

@media (min-width: 700px) {
  .task-filter-bar::after,
  .task-filter-bar__hint {
    display: none;
  }
}
</style>
