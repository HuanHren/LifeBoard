<script setup lang="ts">
import LandingNavigation from '@/app/navigation/LandingNavigation.vue'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh bg-[var(--color-background)] text-[var(--color-foreground)]">
    <a class="skip-link" href="#main-content">{{ t('shell.skipToMain') }}</a>
    <LandingNavigation />
    <main id="main-content" class="landing-main" tabindex="-1">
      <slot />
    </main>
    <footer class="border-t border-[var(--color-border-soft)] px-[var(--page-inline)] py-8">
      <div class="mx-auto flex w-full max-w-[var(--content-wide-max-width)] flex-col gap-2 text-caption text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <p>LifeBoard</p>
        <p>{{ t('landing.footer.localFirst') }}</p>
      </div>
    </footer>
  </div>
</template>
