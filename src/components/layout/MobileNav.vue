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
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border-soft)] bg-[var(--color-surface-elevated)] px-1.5 safe-bottom min-[56.25rem]:hidden"
    :aria-label="t('shell.mobile.primaryLabel')"
  >
    <div class="grid grid-cols-5 gap-0.5">
      <RouterLink
        v-for="item in navigationItems"
          :key="item.labelKey"
          :to="item.to"
          class="interactive-surface group relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] px-1 py-1 text-center text-[0.6875rem] font-medium leading-tight text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-interactive)]"
          :class="
            isNavigationItemActive(item)
              ? 'is-active bg-[var(--color-primary-soft)] text-[var(--color-accent-text)]'
              : ''
          "
          :aria-current="isNavigationItemActive(item) ? 'page' : undefined"
        >
        <span
          class="absolute top-1 h-0.5 w-5 rounded-[var(--radius-pill)] bg-[var(--color-accent)] opacity-0 transition-opacity duration-[var(--motion-fast)] group-[.is-active]:opacity-100"
          aria-hidden="true"
        />
        <span
          class="flex size-5 shrink-0 items-center justify-center text-[var(--color-text-tertiary)] group-[.is-active]:text-[var(--color-accent-text)]"
          aria-hidden="true"
        >
          <BaseIcon :name="item.icon" size="sm" />
        </span>
        <span class="block w-full truncate">{{ t(item.labelKey) }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
