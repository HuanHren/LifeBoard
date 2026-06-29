<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import SettingsWorkspace from '@/modules/settings/components/SettingsWorkspace.vue'

const { t } = useI18n()
</script>

<template>
  <PageLayout>
    <PageHeader
      :title="t('settings.page.title')"
      :description="t('settings.page.description')"
    />

    <SettingsWorkspace />
  </PageLayout>
</template>
