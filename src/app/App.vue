<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

themeStore.initializeTheme()

watch(
  () => themeStore.resolvedTheme,
  (theme) => {
    document.documentElement.dataset.theme = theme
  },
  { immediate: true },
)

onUnmounted(() => {
  themeStore.disposeThemeListener()
})
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
