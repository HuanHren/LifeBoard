<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { navigationItems } from '@/shared/constants/navigation'
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-2 safe-bottom lg:hidden"
    aria-label="Mobile primary"
  >
    <div class="grid grid-cols-3 gap-1">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.label"
        :to="item.to"
        class="interactive-surface group flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-center text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
        exact-active-class="bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]"
      >
        <span
          class="flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] bg-[var(--color-surface-inset)] text-[0.5625rem] font-semibold text-[var(--color-text-tertiary)] group-[.router-link-exact-active]:bg-[var(--color-surface-raised)] group-[.router-link-exact-active]:text-[var(--color-accent-text)]"
          aria-hidden="true"
        >
          {{ item.marker }}
        </span>
        <span class="truncate">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
