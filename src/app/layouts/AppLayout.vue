<script setup lang="ts">
import AppTopNavigation from '@/app/navigation/AppTopNavigation.vue'
import MobileBottomNavigation from '@/app/navigation/MobileBottomNavigation.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="app-shell min-h-dvh bg-[var(--color-app-background)] text-[var(--color-foreground)]">
    <a class="skip-link" href="#main-content">{{ t('shell.skipToMain') }}</a>
    <AppTopNavigation />
    <main
      id="main-content"
      class="app-main mx-auto w-full px-[var(--page-shell-inline)] pt-[var(--page-shell-block)]"
      tabindex="-1"
    >
      <slot />
    </main>
    <MobileBottomNavigation />
    <div id="app-overlay-root" />
  </div>
</template>
