<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initializeTheme()
})

watch(
  () => themeStore.resolvedTheme,
  (theme) => {
    document.documentElement.dataset.theme = theme
  },
  { immediate: true },
)
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
