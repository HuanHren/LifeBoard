<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import { useI18n } from '@/i18n/useI18n'
import SettingsWorkspace from '@/modules/settings/components/SettingsWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-10">
    <PageHeader
      :title="t('settings.page.title')"
      :description="t('settings.page.description')"
    />

    <SettingsWorkspace />
  </div>
</template>
