<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'

interface Props {
  title: string
  description: string
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <header class="tool-panel-header">
    <h3>
      {{ title }}
    </h3>
    <p>
      {{ description }}
    </p>
    <p class="tool-panel-header__privacy">
      {{ t('tools.privacy') }}
    </p>
  </header>
</template>

<style scoped>
.tool-panel-header {
  max-width: 52rem;
}

.tool-panel-header h3 {
  color: var(--color-text-primary);
  font-size: var(--font-size-card-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-label);
}

.tool-panel-header p {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-label);
  line-height: 1.55;
}

.tool-panel-header__privacy {
  color: var(--color-text-tertiary) !important;
  font-size: var(--font-size-caption) !important;
}
</style>
