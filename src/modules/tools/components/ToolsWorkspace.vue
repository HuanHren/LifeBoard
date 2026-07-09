<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import CaseConverterTool from '@/modules/tools/components/CaseConverterTool.vue'
import DeduplicateLinesTool from '@/modules/tools/components/DeduplicateLinesTool.vue'
import JsonTool from '@/modules/tools/components/JsonTool.vue'
import TextCounterTool from '@/modules/tools/components/TextCounterTool.vue'
import TimestampTool from '@/modules/tools/components/TimestampTool.vue'
import ToolNavigation from '@/modules/tools/components/ToolNavigation.vue'
import WhitespaceTool from '@/modules/tools/components/WhitespaceTool.vue'
import '@/modules/tools/components/tool-panel.css'
import { isToolId, TOOL_DEFINITIONS } from '@/modules/tools/constants/tools'
import type { ToolId } from '@/modules/tools/types/tools'
import { getToolDefinitionCopy } from '@/modules/tools/utils/toolsI18n'

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
const activeDefinition = computed(() => getToolDefinitionCopy(activeTool.value, t))
const toolCount = computed(() => TOOL_DEFINITIONS.length)

function selectTool(tool: ToolId) {
  activeTool.value = tool
  void router.replace({
    query: {
      ...route.query,
      tool,
    },
  })
}

function focusWorkspace() {
  document.getElementById('tools-active-workspace')?.scrollIntoView({
    block: 'start',
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
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
  <div class="tools-workspace">
    <BaseSurface as="section" class="tools-hero" aria-labelledby="tools-title" padding="lg" variant="raised">
      <div class="tools-hero__copy">
        <h1 id="tools-title" class="tools-hero__title">
          {{ t('tools.page.title') }}
        </h1>
        <p class="tools-hero__description">
          {{ t('tools.page.description') }}
        </p>
        <div class="tools-hero__actions" :aria-label="t('tools.hero.actionsLabel')">
          <BaseButton variant="primary" @click="focusWorkspace">
            {{ t('tools.hero.primaryAction') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="selectTool('json')">
            {{ t('tools.hero.secondaryAction') }}
          </BaseButton>
        </div>
      </div>

      <dl class="tools-hero__facts" :aria-label="t('tools.hero.statusLabel')">
        <div>
          <dt>{{ t('tools.hero.factLocal') }}</dt>
          <dd>{{ t('tools.hero.factLocalDetail') }}</dd>
        </div>
        <div>
          <dt>{{ t('tools.hero.factStored') }}</dt>
          <dd>{{ t('tools.hero.factStoredDetail') }}</dd>
        </div>
        <div>
          <dt>{{ t('tools.hero.factUtilities') }}</dt>
          <dd>{{ t('tools.hero.factUtilitiesDetail', { count: toolCount }) }}</dd>
        </div>
      </dl>
    </BaseSurface>

    <section class="tools-console" aria-labelledby="tools-switcher-title">
      <BaseSurface as="div" class="tools-console__switcher" padding="sm" variant="plain">
        <SectionHeader
          :description="t('tools.navigation.hint')"
          :title="t('tools.navigation.label')"
          title-id="tools-switcher-title"
        />
        <ToolNavigation :active-tool="activeTool" @select="selectTool" />
      </BaseSurface>

      <BaseSurface
        id="tools-active-workspace"
        as="div"
        :aria-labelledby="`tool-tab-${activeTool}`"
        class="tools-console__main"
        padding="md"
        role="tabpanel"
        tabindex="-1"
        variant="plain"
      >
        <SectionHeader
          :description="t('tools.workspace.activeLabel')"
          :title="activeDefinition.title"
        >
          <template #actions>
          <span>{{ t('tools.workspace.localBadge') }}</span>
          </template>
        </SectionHeader>

        <section
          :aria-label="activeDefinition.title"
          class="tools-console__tool"
        >
          <KeepAlive>
            <component :is="activeComponent" :key="activeTool" />
          </KeepAlive>
        </section>
      </BaseSurface>

      <BaseSurface as="aside" class="tools-console__guide" aria-labelledby="tools-guide-title" padding="md" variant="muted">
        <SectionHeader
          :description="activeDefinition.description"
          :title="t('tools.guide.title')"
          title-id="tools-guide-title"
        />
        <ul>
          <li>{{ t('tools.guide.local') }}</li>
          <li>{{ t('tools.guide.copy') }}</li>
          <li>{{ t('tools.guide.switch') }}</li>
        </ul>
      </BaseSurface>
    </section>
  </div>
</template>

<style scoped>
.tools-workspace {
  display: grid;
  gap: var(--section-gap);
}

.tools-hero {
  display: grid;
  gap: var(--space-5);
  background: var(--color-surface-raised);
}

.tools-hero__copy {
  min-width: 0;
  max-width: 48rem;
}

.tools-hero__title {
  color: var(--color-text-primary);
  font-size: var(--font-size-page-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.tools-hero__description {
  max-width: 42rem;
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-small);
  line-height: 1.65;
}

.tools-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.tools-hero__facts {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}

.tools-hero__facts div {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-3);
}

.tools-hero__facts dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
}

.tools-hero__facts dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label);
  overflow-wrap: anywhere;
}

.tools-console {
  display: grid;
  gap: var(--space-4);
  align-items: start;
}

.tools-console__switcher,
.tools-console__main,
.tools-console__guide {
  min-width: 0;
}

.tools-console__switcher {
  display: grid;
  gap: var(--space-3);
}

.tools-console__guide :deep(.section-header__description),
.tools-console__guide li {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.55;
}

.tools-console__main {
  display: grid;
  gap: var(--space-4);
}

.tools-console__main :deep(.section-header) {
  border-bottom: 1px solid var(--color-border-soft);
  padding-bottom: var(--space-4);
}

.tools-console__main :deep(.section-header__description) {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.tools-console__main :deep(.section-header__actions span) {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-pill);
  background: var(--color-accent-wash);
  color: var(--color-accent-text);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
}

.tools-console__tool {
  min-width: 0;
}

.tools-console__guide {
  display: grid;
  gap: var(--space-3);
}

.tools-console__guide ul {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tools-console__guide li {
  border-top: 1px solid var(--color-border-soft);
  padding-top: var(--space-2);
}

@media (min-width: 48rem) {
  .tools-hero__facts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 72rem) {
  .tools-hero {
    grid-template-columns: minmax(0, 1.2fr) minmax(22rem, 0.8fr);
    align-items: end;
  }

  .tools-console {
    grid-template-columns: minmax(14rem, 0.24fr) minmax(0, 0.76fr);
  }

  .tools-console__switcher,
  .tools-console__guide {
    position: sticky;
    top: calc(var(--top-nav-height) + var(--space-4));
  }

  .tools-console__main {
    grid-row: span 2;
  }
}

@media (max-width: 40rem) {
  .tools-workspace {
    gap: var(--space-4);
  }

  .tools-hero {
    gap: var(--space-4);
  }

  .tools-hero__description {
    margin-top: var(--space-2);
    line-height: 1.5;
  }

  .tools-hero__actions {
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .tools-hero__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--color-border-soft);
    gap: var(--space-2);
    padding-top: var(--space-3);
  }

  .tools-hero__facts div {
    border: 0;
    border-radius: var(--radius-sm);
    background: color-mix(in oklch, var(--color-surface) 78%, transparent);
    padding: var(--space-2) var(--space-3);
  }

  .tools-hero__facts div:last-child {
    grid-column: 1 / -1;
  }

  .tools-console,
  .tools-console__main {
    gap: var(--space-3);
  }

  .tools-console__main :deep(.section-header) {
    padding-bottom: var(--space-3);
  }
}
</style>
