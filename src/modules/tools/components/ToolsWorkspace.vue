<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import CaseConverterTool from '@/modules/tools/components/CaseConverterTool.vue'
import DeduplicateLinesTool from '@/modules/tools/components/DeduplicateLinesTool.vue'
import JsonTool from '@/modules/tools/components/JsonTool.vue'
import TextCounterTool from '@/modules/tools/components/TextCounterTool.vue'
import TimestampTool from '@/modules/tools/components/TimestampTool.vue'
import ToolNavigation from '@/modules/tools/components/ToolNavigation.vue'
import WhitespaceTool from '@/modules/tools/components/WhitespaceTool.vue'
import { isToolId } from '@/modules/tools/constants/tools'
import type { ToolId } from '@/modules/tools/types/tools'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const initialTool = isToolId(route.query.tool) ? route.query.tool : 'json'
const activeTool = shallowRef<ToolId>(initialTool)

const toolComponents: Record<ToolId, Component> = {
  json: JsonTool,
  timestamp: TimestampTool,
  whitespace: WhitespaceTool,
  deduplicate: DeduplicateLinesTool,
  case: CaseConverterTool,
  counter: TextCounterTool,
}

const activeComponent = computed(() => toolComponents[activeTool.value])

function selectTool(tool: ToolId) {
  activeTool.value = tool
  void router.replace({
    query: {
      ...route.query,
      tool,
    },
  })
}

watch(
  () => route.query.tool,
  (tool) => {
    if (isToolId(tool)) {
      activeTool.value = tool
    }
  },
)
</script>

<template>
  <div
    class="grid min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:grid-cols-[15rem_minmax(0,1fr)]"
  >
    <aside
      class="min-w-0 border-b border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3 lg:border-r lg:border-b-0 lg:p-4"
    >
      <p class="mb-2 px-2 text-caption font-medium text-[var(--color-text-secondary)]">
        {{ t('tools.navigation.label') }}
      </p>
      <ToolNavigation :active-tool="activeTool" @select="selectTool" />
    </aside>

    <section
      :aria-label="t('tools.navigation.label')"
      class="min-w-0 p-5 sm:p-6 lg:p-8"
    >
      <KeepAlive>
        <component :is="activeComponent" :key="activeTool" />
      </KeepAlive>
    </section>
  </div>
</template>
