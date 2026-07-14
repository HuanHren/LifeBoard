<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import type { XiaomiAttributionViewModel } from '@/modules/weather/extended/xiaomiExtendedWeatherViewModel'
import { formatFullLocalTime } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  model: XiaomiAttributionViewModel
}

defineProps<Props>()
const { locale, t } = useI18n()
</script>

<template>
  <p class="border-t border-[var(--color-border-soft)] pt-4 text-caption leading-5 text-pretty text-[var(--color-text-secondary)]">
    {{ t('weather.xiaomiExtended.attribution.sources', {
      sources: model.sourceNames.join('、'),
    }) }}
    {{ t('weather.xiaomiExtended.attribution.updatedAt', {
      time: formatFullLocalTime(model.updatedAt, locale),
    }) }}
  </p>
</template>
