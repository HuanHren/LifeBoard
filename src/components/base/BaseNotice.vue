<script setup lang="ts">
interface Props {
  tone?: 'info' | 'success' | 'danger' | 'warning'
  role?: 'status' | 'alert' | 'note'
}

withDefaults(defineProps<Props>(), {
  tone: 'info',
  role: 'status',
})
</script>

<template>
  <div
    :class="[
      'base-notice',
      `base-notice--${tone}`,
    ]"
    :role="role"
  >
    <slot />
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
