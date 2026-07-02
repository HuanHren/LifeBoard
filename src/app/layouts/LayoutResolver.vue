<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppLayout from '@/app/layouts/AppLayout.vue'
import LandingLayout from '@/app/layouts/LandingLayout.vue'
import MinimalLayout from '@/app/layouts/MinimalLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
  if (route.meta.layout === 'landing') return LandingLayout
  if (route.meta.layout === 'minimal') return MinimalLayout
  return AppLayout
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    const main = document.getElementById('main-content')
    main?.focus({ preventScroll: true })
  },
)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="layoutComponent">
      <component :is="Component" />
    </component>
  </RouterView>
</template>
