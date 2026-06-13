<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import SettingsWorkspace from '@/modules/settings/components/SettingsWorkspace.vue'
</script>

<template>
  <div class="space-y-10">
    <PageHeader
      title="Settings"
      description="Manage this browser's appearance, local data, privacy, and portable LifeBoard backup."
    />

    <SettingsWorkspace />
  </div>
</template>
