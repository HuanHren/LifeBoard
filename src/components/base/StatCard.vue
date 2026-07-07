<script setup lang="ts">
interface Props {
  as?: 'div' | 'li'
  label: string
  value: string
  description?: string
  tone?: 'default' | 'accent' | 'danger' | 'info'
  valueKind?: 'numeric' | 'semantic'
}

withDefaults(defineProps<Props>(), {
  as: 'div',
  description: '',
  tone: 'default',
  valueKind: 'numeric',
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'stat-card',
      `stat-card--${tone}`,
      `stat-card--value-${valueKind}`,
      $slots.media ? 'stat-card--with-media' : '',
    ]"
  >
    <div v-if="$slots.media" class="stat-card__media" aria-hidden="true">
      <slot name="media" />
    </div>
    <div class="stat-card__copy">
      <dt class="stat-card__label">{{ label }}</dt>
      <dd class="stat-card__value">{{ value }}</dd>
      <p v-if="description" class="stat-card__description">{{ description }}</p>
    </div>
  </component>
</template>

<style scoped>
.stat-card {
  min-width: 0;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: color-mix(in oklch, var(--color-surface-raised) 88%, transparent);
  padding: var(--space-3);
}

.stat-card--with-media {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
}

.stat-card__media {
  color: var(--color-accent-text);
}

.stat-card__copy {
  min-width: 0;
}

.stat-card--accent {
  border-color: color-mix(in oklch, var(--color-accent) 42%, var(--color-border-soft));
  background: var(--color-accent-wash);
}

.stat-card--danger {
  border-color: color-mix(in oklch, var(--color-danger) 46%, var(--color-border-soft));
  background: var(--color-danger-soft);
}

.stat-card--info {
  border-color: color-mix(in oklch, var(--color-info) 42%, var(--color-border-soft));
  background: var(--color-info-soft);
}

.stat-card__label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label);
}

.stat-card__value {
  margin-top: var(--space-1);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 720;
  line-height: 1.05;
}

.stat-card--value-numeric .stat-card__value {
  font-size: var(--font-size-numeric-medium);
}

.stat-card--value-semantic .stat-card__value {
  font-size: var(--font-size-card-title);
  line-height: var(--line-height-tight);
  text-wrap: balance;
}

.stat-card__description {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: 1.45;
}

@media (max-width: 40rem) {
  .stat-card {
    padding: var(--space-2);
  }

  .stat-card--value-numeric .stat-card__value,
  .stat-card--value-semantic .stat-card__value {
    font-size: 1rem;
    line-height: 1.15;
  }

  .stat-card__description {
    display: none;
  }
}
</style>
