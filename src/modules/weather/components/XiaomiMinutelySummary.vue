<script setup lang="ts">
import BaseSurface from '@/components/base/BaseSurface.vue'
import { useI18n } from '@/i18n/useI18n'
import type { XiaomiMinutelySummaryViewModel } from '@/modules/weather/extended/xiaomiExtendedWeatherViewModel'
import { formatFullLocalTime } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  model: XiaomiMinutelySummaryViewModel
}

defineProps<Props>()
const { locale, t } = useI18n()
</script>

<template>
  <BaseSurface as="article" padding="md" variant="plain">
    <div class="max-w-2xl">
      <p class="text-caption font-medium text-[var(--color-accent-text)]">
        {{ t('weather.xiaomiExtended.immediateLabel') }}
      </p>
      <h3 class="mt-1 text-card-title font-semibold text-[var(--color-text-primary)]">
        {{ t('weather.xiaomiExtended.minutely.title') }}
      </h3>
      <p class="mt-3 text-base font-semibold leading-7 text-pretty text-[var(--color-text-primary)]">
        {{ model.summary }}
      </p>
      <p
        v-if="model.detail"
        class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
      >
        {{ model.detail }}
      </p>
      <p
        v-if="model.advice"
        class="mt-3 border-t border-[var(--color-border-soft)] pt-3 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]"
      >
        {{ model.advice }}
      </p>
      <p
        v-if="model.observedAt"
        class="mt-3 text-caption text-[var(--color-text-tertiary)]"
      >
        {{ t('weather.xiaomiExtended.updatedAt', {
          time: formatFullLocalTime(model.observedAt, locale),
        }) }}
      </p>
    </div>
  </BaseSurface>
</template>
