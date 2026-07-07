<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import BaseSurface from '@/components/base/BaseSurface.vue'

interface DetailItem {
  label: string
  value: string
  to?: RouteLocationRaw
}

interface ActionLink {
  label: string
  to?: RouteLocationRaw
  href?: string
  ariaLabel?: string
}

interface Props {
  title: string
  description: string
  status: string
  details: DetailItem[]
  officialLink?: ActionLink | null
  licenceLink?: ActionLink | null
  configureLink?: ActionLink | null
  secondaryLink?: ActionLink | null
}

defineProps<Props>()
</script>

<template>
  <BaseSurface as="article" padding="sm" variant="muted">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 max-w-2xl">
        <h3 class="text-base font-semibold text-balance text-[var(--color-text-primary)]">
          {{ title }}
        </h3>
        <p class="mt-1 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ description }}
        </p>
      </div>
      <p
        class="inline-flex w-fit shrink-0 rounded-[var(--radius-pill)] border border-[var(--color-border-soft)] bg-[var(--color-accent-wash)] px-3 py-1 text-caption font-medium text-[var(--color-accent-text)]"
        :aria-label="`${title}: ${status}`"
      >
        {{ status }}
      </p>
    </div>

    <dl class="mt-4 grid gap-3 sm:grid-cols-2">
      <div
        v-for="item in details"
        :key="item.label"
        class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-3"
      >
        <dt class="text-caption text-[var(--color-text-tertiary)]">
          {{ item.label }}
        </dt>
        <dd class="mt-1 text-sm font-medium leading-6 text-[var(--color-text-primary)] break-words">
          <RouterLink
            v-if="item.to"
            class="interactive-surface rounded-[var(--radius-sm)] text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
            :to="item.to"
          >
            {{ item.value }}
          </RouterLink>
          <span v-else>{{ item.value }}</span>
        </dd>
      </div>
    </dl>

    <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <a
        v-if="officialLink?.href"
        class="interactive-surface rounded-[var(--radius-sm)] font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        :href="officialLink.href"
        :aria-label="officialLink.ariaLabel"
        rel="noreferrer"
        target="_blank"
      >
        {{ officialLink.label }}
      </a>
      <a
        v-if="licenceLink?.href"
        class="interactive-surface rounded-[var(--radius-sm)] font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        :href="licenceLink.href"
        :aria-label="licenceLink.ariaLabel"
        rel="noreferrer"
        target="_blank"
      >
        {{ licenceLink.label }}
      </a>
      <RouterLink
        v-if="configureLink?.to"
        class="interactive-surface rounded-[var(--radius-sm)] font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        :to="configureLink.to"
      >
        {{ configureLink.label }}
      </RouterLink>
      <RouterLink
        v-if="secondaryLink?.to"
        class="interactive-surface rounded-[var(--radius-sm)] font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        :to="secondaryLink.to"
      >
        {{ secondaryLink.label }}
      </RouterLink>
      <a
        v-else-if="secondaryLink?.href"
        class="interactive-surface rounded-[var(--radius-sm)] font-medium text-[var(--color-accent-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        :href="secondaryLink.href"
        :aria-label="secondaryLink.ariaLabel"
        rel="noreferrer"
        target="_blank"
      >
        {{ secondaryLink.label }}
      </a>
    </div>
  </BaseSurface>
</template>
