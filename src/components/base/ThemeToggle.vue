<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { mode } = storeToRefs(themeStore)
const { cycleMode } = themeStore
const { t } = useI18n()
const modeLabel = computed(() => t(`shell.theme.${mode.value}`))
</script>

<template>
  <BaseButton
    :aria-label="t('shell.theme.changeLabel', { mode: modeLabel })"
    size="sm"
    variant="ghost"
    class="gap-2 border-[var(--color-border-soft)]! bg-[var(--color-surface-raised)]! px-2.5! shadow-[var(--shadow-soft)] hover:border-[var(--color-control-border)]!"
    @click="cycleMode"
  >
    <span class="hidden text-caption text-[var(--color-text-tertiary)] sm:inline">
      {{ t('shell.theme.appearance') }}
    </span>
    <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ modeLabel }}</span>
  </BaseButton>
</template>
