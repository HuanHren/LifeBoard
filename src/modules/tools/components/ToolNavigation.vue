<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import { TOOL_DEFINITIONS } from '@/modules/tools/constants/tools'
import type { ToolId } from '@/modules/tools/types/tools'
import { getToolDefinitionCopy } from '@/modules/tools/utils/toolsI18n'

interface Props {
  activeTool: ToolId
}

interface Emits {
  select: [tool: ToolId]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const tools = computed(() =>
  TOOL_DEFINITIONS.map((tool) => ({
    ...tool,
    copy: getToolDefinitionCopy(tool.id, t),
  })),
)
</script>

<template>
  <div
    class="tool-navigation"
    role="tablist"
    :aria-label="t('tools.navigation.label')"
  >
    <button
      v-for="(tool, index) in tools"
      :id="`tool-tab-${tool.id}`"
      :key="tool.id"
      aria-controls="tools-active-workspace"
      :aria-selected="activeTool === tool.id"
      class="tool-navigation__item interactive-surface"
      :class="{ 'is-active': activeTool === tool.id }"
      role="tab"
      type="button"
      @click="emit('select', tool.id)"
    >
      <span class="tool-navigation__index">{{ index + 1 }}</span>
      <span class="tool-navigation__copy">
        <span class="tool-navigation__title">
          {{ tool.copy.shortTitle }}
        </span>
        <span class="tool-navigation__description">
          {{ tool.copy.description }}
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.tool-navigation {
  display: flex;
  max-width: 100%;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-1);
  scrollbar-width: thin;
}

.tool-navigation__item {
  display: grid;
  min-width: min(14rem, 78vw);
  min-height: 3.5rem;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  padding: var(--space-2);
  text-align: left;
}

.tool-navigation__item:hover,
.tool-navigation__item.is-active {
  border-color: var(--color-accent);
  background: var(--color-accent-wash);
  color: var(--color-accent-text);
}

.tool-navigation__item.is-active {
  box-shadow: 0 0 0 0.125rem color-mix(in oklch, var(--color-accent) 22%, transparent);
}

.tool-navigation__index {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}

.tool-navigation__item.is-active .tool-navigation__index {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.tool-navigation__copy {
  min-width: 0;
}

.tool-navigation__title,
.tool-navigation__description {
  display: block;
}

.tool-navigation__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label);
}

.tool-navigation__description {
  display: none;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.4;
}

@media (min-width: 72rem) {
  .tool-navigation {
    display: grid;
    overflow: visible;
    padding-bottom: 0;
  }

  .tool-navigation__item {
    width: 100%;
    min-width: 0;
  }

  .tool-navigation__description {
    display: block;
  }
}
</style>
