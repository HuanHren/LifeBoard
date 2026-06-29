<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { type BaseIconName } from '@/components/base/BaseIcon.vue'
import IconButton from '@/components/base/IconButton.vue'
import { useI18n } from '@/i18n/useI18n'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { mode } = storeToRefs(themeStore)
const { cycleMode } = themeStore
const { t } = useI18n()
const modeLabel = computed(() => t(`shell.theme.${mode.value}`))
const modeIcon = computed<BaseIconName>(() =>
  mode.value === 'light' ? 'sun' : mode.value === 'dark' ? 'moon' : 'system',
)
</script>

<template>
  <IconButton
    :ariaLabel="t('shell.theme.changeLabel', { mode: modeLabel })"
    :icon="modeIcon"
    variant="secondary"
    @click="cycleMode"
  />
  <span class="sr-only">{{ modeLabel }}</span>
</template>
