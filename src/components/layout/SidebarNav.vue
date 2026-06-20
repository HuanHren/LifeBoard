<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import { navigationItems, type NavigationItem } from '@/shared/constants/navigation'

const { t } = useI18n()
const route = useRoute()

function isNavigationItemActive(item: NavigationItem) {
  if (typeof item.to === 'object' && 'name' in item.to && item.to.name === 'weather') {
    return route.path === '/weather' || route.path.startsWith('/weather/')
  }

  if (typeof item.to === 'object' && 'name' in item.to && item.to.name === 'settings') {
    return route.path === '/settings' || route.path.startsWith('/settings/')
  }

  return typeof item.to === 'object' && 'name' in item.to
    ? route.name === item.to.name
    : false
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 hidden w-[17rem] border-r border-[var(--color-border-soft)] bg-[var(--color-canvas)] px-4 py-5 lg:block"
    :aria-label="t('shell.sidebar.primaryLabel')"
  >
    <div class="flex h-full flex-col">
      <RouterLink
        :to="{ name: 'home' }"
        class="interactive-surface flex min-h-16 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-surface)]"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent-text)]"
          aria-hidden="true"
        >
          LB
        </span>
        <span class="min-w-0">
          <span class="block text-lg font-semibold leading-tight text-[var(--color-text-primary)]">
            LifeBoard
          </span>
          <span class="mt-1 block text-caption text-[var(--color-text-secondary)]">
            {{ t('shell.sidebar.tagline') }}
          </span>
        </span>
      </RouterLink>

      <nav
        class="mt-10 flex flex-1 flex-col gap-1.5"
        :aria-label="t('shell.sidebar.mainSectionsLabel')"
      >
        <RouterLink
          v-for="item in navigationItems"
          :key="item.labelKey"
          :to="item.to"
          class="interactive-surface group flex min-h-14 items-center gap-3 rounded-[var(--radius-md)] border border-transparent px-2.5 py-2 text-[var(--color-text-secondary)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
          :class="
            isNavigationItemActive(item)
              ? 'is-active border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] text-[var(--color-accent-text)] shadow-[var(--shadow-soft)]'
              : ''
          "
          exact-active-class="border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] text-[var(--color-accent-text)] shadow-[var(--shadow-soft)]"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)] text-[0.6875rem] font-semibold text-[var(--color-text-tertiary)] transition-[background-color,color] duration-[var(--motion-fast)] group-[.is-active]:bg-[var(--color-accent-soft)] group-[.is-active]:text-[var(--color-accent-text)] group-[.router-link-exact-active]:bg-[var(--color-accent-soft)] group-[.router-link-exact-active]:text-[var(--color-accent-text)]"
            aria-hidden="true"
          >
            {{ item.marker }}
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-medium">{{ t(item.labelKey) }}</span>
            <span class="mt-0.5 block text-caption text-[var(--color-text-tertiary)]">
              {{ t(item.descriptionKey) }}
            </span>
          </span>
        </RouterLink>
      </nav>

      <p class="px-3 text-caption text-[var(--color-text-tertiary)]">
        {{ t('shell.sidebar.footer') }}
      </p>
    </div>
  </aside>
</template>
