<script setup lang="ts">
interface Props {
  variant?: 'default' | 'wide' | 'narrow'
  gap?: 'md' | 'lg'
  title?: string
  description?: string
  eyebrow?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  gap: 'lg',
  title: undefined,
  description: undefined,
  eyebrow: undefined,
})
</script>

<template>
  <div
    :class="[
      'page-shell',
      variant === 'default' ? 'page-shell--default' : '',
      variant === 'wide' ? 'page-shell--wide' : '',
      variant === 'narrow' ? 'page-shell--narrow' : '',
      gap === 'md' ? 'page-shell--compact' : '',
    ]"
  >
    <header
      v-if="title || description || eyebrow || $slots.header || $slots.actions"
      class="page-shell__header"
    >
      <slot name="header">
        <p v-if="eyebrow" class="page-shell__eyebrow">
          {{ eyebrow }}
        </p>
        <div class="page-shell__header-row">
          <div>
            <h1 v-if="title" class="page-shell__title">
              {{ title }}
            </h1>
            <p v-if="description" class="page-shell__description">
              {{ description }}
            </p>
          </div>
          <div v-if="$slots.actions" class="section-header__actions">
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </header>
    <slot />
  </div>
</template>
