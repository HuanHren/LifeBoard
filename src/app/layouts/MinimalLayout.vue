<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh bg-[var(--color-background)] text-[var(--color-foreground)]">
    <a class="skip-link" href="#main-content">{{ t('shell.skipToMain') }}</a>
    <header class="safe-top border-b border-[var(--color-border-soft)] px-[var(--page-inline)]">
      <div class="mx-auto flex min-h-[var(--top-nav-height)] w-full max-w-[var(--content-wide-max-width)] items-center justify-between gap-4">
        <RouterLink
          :to="{ name: 'landing' }"
          class="interactive-surface inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-interactive)]"
          aria-label="LifeBoard"
        >
          <span class="flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-accent-text)]" aria-hidden="true">
            LB
          </span>
          <span>LifeBoard</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'workspace' }"
          class="interactive-surface hidden min-h-10 items-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-accent-hover)] sm:inline-flex"
        >
          {{ t('landing.cta.enterWorkspace') }}
        </RouterLink>
      </div>
    </header>
    <main
      id="main-content"
      class="mx-auto w-full max-w-[var(--content-max-width)] px-[var(--page-inline)] py-[var(--space-12)]"
      tabindex="-1"
    >
      <slot />
    </main>
  </div>
</template>
