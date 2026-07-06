<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
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
    <section class="tools-hero" aria-labelledby="tools-title">
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
        <div class="tools-hero__fact">
          <dt>{{ t('tools.hero.factLocal') }}</dt>
          <dd>{{ t('tools.hero.factLocalDetail') }}</dd>
        </div>
        <div class="tools-hero__fact">
          <dt>{{ t('tools.hero.factStored') }}</dt>
          <dd>{{ t('tools.hero.factStoredDetail') }}</dd>
        </div>
        <div class="tools-hero__fact">
          <dt>{{ t('tools.hero.factUtilities') }}</dt>
          <dd>{{ t('tools.hero.factUtilitiesDetail', { count: toolCount }) }}</dd>
        </div>
      </dl>
    </section>

    <section class="tools-console" aria-labelledby="tools-switcher-title">
      <div class="tools-console__switcher">
        <div class="tools-console__switcher-header">
          <h2 id="tools-switcher-title">{{ t('tools.navigation.label') }}</h2>
          <p>{{ t('tools.navigation.hint') }}</p>
        </div>
        <ToolNavigation :active-tool="activeTool" @select="selectTool" />
      </div>

      <div id="tools-active-workspace" class="tools-console__main" tabindex="-1">
        <div class="tools-console__active-header">
          <div>
            <p>{{ t('tools.workspace.activeLabel') }}</p>
            <h2>{{ activeDefinition.title }}</h2>
          </div>
          <span>{{ t('tools.workspace.localBadge') }}</span>
        </div>

        <section
          :aria-label="activeDefinition.title"
          class="tools-console__tool"
        >
          <KeepAlive>
            <component :is="activeComponent" :key="activeTool" />
          </KeepAlive>
        </section>
      </div>

      <aside class="tools-console__guide" aria-labelledby="tools-guide-title">
        <h2 id="tools-guide-title">{{ t('tools.guide.title') }}</h2>
        <p>{{ activeDefinition.description }}</p>
        <ul>
          <li>{{ t('tools.guide.local') }}</li>
          <li>{{ t('tools.guide.copy') }}</li>
          <li>{{ t('tools.guide.switch') }}</li>
        </ul>
      </aside>
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
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
  padding: clamp(1rem, 3vw, 2rem);
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
}

.tools-hero__fact {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: color-mix(in oklch, var(--color-surface-elevated) 88%, transparent);
  padding: var(--space-3);
}

.tools-hero__fact dt {
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-semibold);
}

.tools-hero__fact dd {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-label);
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
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);
}

.tools-console__switcher {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
}

.tools-console__switcher-header {
  padding: 0 var(--space-1);
}

.tools-console__switcher-header h2,
.tools-console__guide h2 {
  color: var(--color-text-primary);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label);
}

.tools-console__switcher-header p,
.tools-console__guide p,
.tools-console__guide li {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.55;
}

.tools-console__main {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.tools-console__active-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  border-bottom: 1px solid var(--color-border-soft);
  padding-bottom: var(--space-4);
}

.tools-console__active-header p {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.tools-console__active-header h2 {
  margin-top: var(--space-1);
  color: var(--color-text-primary);
  font-size: var(--font-size-section-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.tools-console__active-header span {
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
  padding: var(--space-4);
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
    padding: var(--space-4);
  }

  .tools-hero__description {
    margin-top: var(--space-2);
    line-height: 1.5;
  }

  .tools-hero__actions {
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .tools-hero__fact {
    padding: var(--space-2);
  }

  .tools-hero__facts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-1);
  }

  .tools-hero__fact dt {
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .tools-hero__fact dd {
    margin-top: 0.1875rem;
    font-size: 0.6875rem;
    line-height: 1.25;
  }

  .tools-console,
  .tools-console__main {
    gap: var(--space-3);
  }

  .tools-console__main,
  .tools-console__guide {
    padding: var(--space-3);
  }

  .tools-console__active-header {
    padding-bottom: var(--space-3);
  }
}
</style>
