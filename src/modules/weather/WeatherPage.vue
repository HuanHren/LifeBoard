<script setup lang="ts">
import PageLayout from '@/components/base/PageLayout.vue'
import WeatherWorkspace from '@/modules/weather/components/WeatherWorkspace.vue'
</script>

<template>
  <PageLayout variant="wide" gap="md">
    <WeatherWorkspace />
  </PageLayout>
</template>
