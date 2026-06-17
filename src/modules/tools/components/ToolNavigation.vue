<script setup lang="ts">
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
</script>

<template>
  <nav :aria-label="t('tools.navigation.label')">
    <div
      class="flex max-w-full gap-1 overflow-x-auto p-1 lg:block lg:space-y-1 lg:overflow-visible lg:p-0"
    >
      <button
        v-for="tool in TOOL_DEFINITIONS"
        :key="tool.id"
        :aria-pressed="activeTool === tool.id"
        class="interactive-surface min-h-11 shrink-0 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-medium lg:block lg:w-full"
        :class="
          activeTool === tool.id
            ? 'bg-[var(--color-accent-wash)] text-[var(--color-accent-text)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'
        "
        type="button"
        @click="emit('select', tool.id)"
      >
        {{ getToolDefinitionCopy(tool.id, t).shortTitle }}
      </button>
    </div>
  </nav>
</template>
