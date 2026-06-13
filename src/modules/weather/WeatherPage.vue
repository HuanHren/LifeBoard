<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import WeatherWorkspace from '@/modules/weather/components/WeatherWorkspace.vue'
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Weather"
      description="Check current conditions, plan what to bring, and choose a comfortable time to go out."
    />
    <WeatherWorkspace />
  </div>
</template>
