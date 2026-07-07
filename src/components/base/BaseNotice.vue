<script setup lang="ts">
interface Props {
  tone?: 'info' | 'success' | 'danger' | 'warning'
  role?: 'status' | 'alert' | 'note'
  title?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  tone: 'info',
  role: 'status',
  title: undefined,
  message: undefined,
})

defineSlots<{
  default(): unknown
  actions(): unknown
}>()
</script>

<template>
  <div
    :class="[
      'base-notice',
      `base-notice--${tone}`,
    ]"
    :aria-live="role === 'alert' ? 'assertive' : role === 'status' ? 'polite' : undefined"
    :role="role"
  >
    <div class="base-notice__content">
      <p v-if="title" class="base-notice__title">
        {{ title }}
      </p>
      <p v-if="message" class="base-notice__message">
        {{ message }}
      </p>
      <div v-if="$slots.default" class="base-notice__body">
        <slot />
      </div>
    </div>
    <div v-if="$slots.actions" class="base-notice__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.base-notice {
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-primary);
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
}

.base-notice__content {
  min-width: 0;
}

.base-notice__title,
.base-notice__message {
  margin: 0;
}

.base-notice__title {
  font-weight: var(--font-weight-semibold);
}

.base-notice__message,
.base-notice__body {
  overflow-wrap: anywhere;
}

.base-notice__title + .base-notice__message,
.base-notice__title + .base-notice__body,
.base-notice__message + .base-notice__body,
.base-notice__actions {
  margin-top: var(--space-2);
}

.base-notice__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.base-notice--info {
  border-color: color-mix(in oklch, var(--color-info) 44%, var(--color-border-soft));
  background: var(--color-info-soft);
}

.base-notice--success {
  border-color: color-mix(in oklch, var(--color-success) 44%, var(--color-border-soft));
  background: var(--color-success-soft);
}

.base-notice--danger {
  border-color: color-mix(in oklch, var(--color-danger) 54%, var(--color-border-soft));
  background: var(--color-danger-soft);
}

.base-notice--warning {
  border-color: color-mix(in oklch, var(--color-warning) 54%, var(--color-border-soft));
  background: var(--color-warning-soft);
}
</style>
