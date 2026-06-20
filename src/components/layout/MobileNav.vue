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
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-2 safe-bottom lg:hidden"
    :aria-label="t('shell.mobile.primaryLabel')"
  >
    <div class="grid grid-cols-3 gap-1">
      <RouterLink
        v-for="item in navigationItems"
          :key="item.labelKey"
          :to="item.to"
          class="interactive-surface group flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-center text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
          :class="
            isNavigationItemActive(item)
              ? 'is-active bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]'
              : ''
          "
          exact-active-class="bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]"
        >
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] bg-[var(--color-surface-inset)] text-[0.5625rem] font-semibold text-[var(--color-text-tertiary)] group-[.is-active]:bg-[var(--color-surface-raised)] group-[.is-active]:text-[var(--color-accent-text)] group-[.router-link-exact-active]:bg-[var(--color-surface-raised)] group-[.router-link-exact-active]:text-[var(--color-accent-text)]"
          aria-hidden="true"
        >
          {{ item.marker }}
        </span>
        <span class="truncate">{{ t(item.labelKey) }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
