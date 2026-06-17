<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import WeatherWorkspace from '@/modules/weather/components/WeatherWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      :title="t('weather.page.title')"
      :description="t('weather.page.description')"
    />
    <WeatherWorkspace />
  </div>
</template>
