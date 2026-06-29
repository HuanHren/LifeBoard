<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import WeatherWorkspace from '@/modules/weather/components/WeatherWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <PageLayout variant="wide" gap="md">
    <PageHeader
      :title="t('weather.page.title')"
      :description="t('weather.page.description')"
    />
    <WeatherWorkspace />
  </PageLayout>
</template>
