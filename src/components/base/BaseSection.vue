<script setup lang="ts">
import SectionHeader from '@/components/base/SectionHeader.vue'

interface Props {
  title?: string
  description?: string
  titleId?: string
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-4">
    <SectionHeader
      :description="description"
      :title="title"
      :title-id="titleId"
    >
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </SectionHeader>
    <slot />
  </section>
</template>
