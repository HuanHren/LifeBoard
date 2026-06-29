<script setup lang="ts">
import MobileNav from '@/components/layout/MobileNav.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import Topbar from '@/components/layout/Topbar.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh bg-[var(--color-background)] text-[var(--color-foreground)]">
    <a class="skip-link" href="#main-content">{{ t('shell.skipToMain') }}</a>
    <SidebarNav />
    <div class="min-h-dvh min-[56.25rem]:pl-[var(--sidebar-compact-width)] xl:pl-[var(--sidebar-width)]">
      <Topbar />
      <main
        id="main-content"
        class="app-main mx-auto w-full px-[var(--page-inline)] pt-[var(--page-block)]"
        tabindex="-1"
      >
        <slot />
      </main>
    </div>
    <MobileNav />
  </div>
</template>
