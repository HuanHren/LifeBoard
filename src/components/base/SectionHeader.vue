<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  titleId?: string
}

defineProps<Props>()
</script>

<template>
  <div v-if="title || description || $slots.actions" class="section-header">
    <div class="section-header__copy">
      <h2 v-if="title" :id="titleId" class="section-header__title">
        {{ title }}
      </h2>
      <p v-if="description" class="section-header__description">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="section-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>
