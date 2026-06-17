<script setup lang="ts">
import MobileNav from '@/components/layout/MobileNav.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import Topbar from '@/components/layout/Topbar.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
    <a class="skip-link" href="#main-content">{{ t('shell.skipToMain') }}</a>
    <SidebarNav />
    <div class="min-h-dvh lg:pl-[17rem]">
      <Topbar />
      <main
        id="main-content"
        class="app-main mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 lg:pt-8"
        tabindex="-1"
      >
        <slot />
      </main>
    </div>
    <MobileNav />
  </div>
</template>
