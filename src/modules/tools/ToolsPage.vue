<script setup lang="ts">
import PageHeader from '@/components/base/PageHeader.vue'
import ToolsWorkspace from '@/modules/tools/components/ToolsWorkspace.vue'
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Tools"
      description="A private browser-local workbench for small text, JSON, and time conversion tasks."
    />
    <ToolsWorkspace />
  </div>
</template>
