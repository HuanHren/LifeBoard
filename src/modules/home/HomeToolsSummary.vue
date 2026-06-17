<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { TOOL_DEFINITIONS } from '@/modules/tools/constants/tools'
import { getToolDefinitionCopy } from '@/modules/tools/utils/toolsI18n'

const { t } = useI18n()

const toolCapabilities = computed(() =>
  TOOL_DEFINITIONS.map((tool) => ({
    id: tool.id,
    ...getToolDefinitionCopy(tool.id, t),
  })),
)
</script>

<template>
  <section aria-labelledby="home-tools-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          id="home-tools-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          {{ t('home.tools.title') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('home.tools.description') }}
        </p>
      </div>
      <RouterLink
        class="interactive-surface inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'tools' }"
      >
        {{ t('home.tools.open') }}
        <span class="ml-2" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <article
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] lg:grid-cols-[minmax(15rem,0.55fr)_minmax(0,1.45fr)]"
    >
      <div class="bg-[var(--color-accent-wash)] p-6 sm:p-8">
        <p class="text-caption font-medium text-[var(--color-accent-text)]">
          {{ t('home.tools.available') }}
        </p>
        <h3 class="mt-2 text-lg font-semibold text-balance text-[var(--color-text-primary)]">
          {{ t('home.tools.privateTitle') }}
        </h3>
        <p class="mt-3 max-w-md text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('home.tools.privateDescription') }}
        </p>
      </div>

      <ul
        class="grid gap-px bg-[var(--color-border-soft)] sm:grid-cols-2 lg:border-l lg:border-[var(--color-border-soft)]"
        :aria-label="t('home.tools.listLabel')"
      >
        <li
          v-for="tool in toolCapabilities"
          :key="tool.id"
          class="bg-[var(--color-surface-raised)] px-5 py-4"
        >
          <p class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ tool.shortTitle }}
          </p>
          <p class="mt-1 text-caption leading-5 text-pretty text-[var(--color-text-secondary)]">
            {{ tool.description }}
          </p>
        </li>
      </ul>
    </article>
  </section>
</template>
