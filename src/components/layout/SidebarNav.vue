<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useI18n } from '@/i18n/useI18n'
import {
  getNavigationKey,
  navigationItems,
  type NavigationItem,
} from '@/shared/constants/navigation'

const { t } = useI18n()
const route = useRoute()

function isNavigationItemActive(item: NavigationItem) {
  return getNavigationKey(route.meta.navigationKey) === item.key
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-compact-width)] border-r border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-3 py-4 min-[56.25rem]:block xl:w-[var(--sidebar-width)] xl:px-4 xl:py-5"
    :aria-label="t('shell.sidebar.primaryLabel')"
  >
    <div class="flex h-full flex-col">
      <RouterLink
        :to="{ name: 'landing' }"
        class="interactive-surface flex min-h-14 items-center justify-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-surface-interactive)] xl:justify-start xl:px-3"
        aria-label="LifeBoard"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-sm font-semibold text-[var(--color-accent-text)]"
          aria-hidden="true"
        >
          LB
        </span>
        <span class="hidden min-w-0 xl:block">
          <span class="block text-lg font-semibold leading-tight text-[var(--color-text-primary)]">
            LifeBoard
          </span>
          <span class="mt-1 block text-caption text-[var(--color-text-secondary)]">
            {{ t('shell.sidebar.tagline') }}
          </span>
        </span>
      </RouterLink>

      <nav
        class="mt-8 flex flex-1 flex-col gap-1.5 xl:mt-10"
        :aria-label="t('shell.sidebar.mainSectionsLabel')"
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.labelKey"
          :to="item.to"
          class="interactive-surface group relative flex min-h-12 items-center justify-center gap-3 rounded-[var(--radius-md)] border border-transparent px-2 py-2 text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface-interactive)] hover:text-[var(--color-text-primary)] xl:min-h-14 xl:justify-start xl:px-2.5"
          :class="
            isNavigationItemActive(item)
              ? 'is-active border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] text-[var(--color-accent-text)]'
              : ''
          "
          :aria-current="isNavigationItemActive(item) ? 'page' : undefined"
          :aria-label="t(item.labelKey)"
        >
          <span
            class="absolute left-1 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] opacity-0 transition-opacity duration-[var(--motion-fast)] group-[.is-active]:opacity-100 xl:block"
            aria-hidden="true"
          />
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)] text-[var(--color-text-tertiary)] transition-[background-color,color] duration-[var(--motion-fast)] group-[.is-active]:bg-[var(--color-primary-soft)] group-[.is-active]:text-[var(--color-accent-text)]"
            aria-hidden="true"
          >
            <BaseIcon :name="item.icon" />
          </span>
          <span class="hidden min-w-0 xl:block">
            <span class="block text-sm font-medium">{{ t(item.labelKey) }}</span>
            <span class="mt-0.5 block text-caption text-[var(--color-text-tertiary)]">
              {{ t(item.descriptionKey) }}
            </span>
          </span>
        </RouterLink>
      </nav>

      <p class="hidden px-3 text-caption text-[var(--color-text-tertiary)] xl:block">
        {{ t('shell.sidebar.footer') }}
      </p>
    </div>
  </aside>
</template>
