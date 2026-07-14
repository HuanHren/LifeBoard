<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
import XiaomiExtendedAttribution from '@/modules/weather/components/XiaomiExtendedAttribution.vue'
import XiaomiMinutelySummary from '@/modules/weather/components/XiaomiMinutelySummary.vue'
import XiaomiRecentChanges from '@/modules/weather/components/XiaomiRecentChanges.vue'
import type { XiaomiExtendedWeatherViewModel } from '@/modules/weather/extended/xiaomiExtendedWeatherViewModel'

interface Props {
  model: XiaomiExtendedWeatherViewModel
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <section
    aria-labelledby="xiaomi-extended-weather-title"
    class="min-w-0 max-w-full space-y-4"
  >
    <div class="max-w-2xl">
      <h2
        id="xiaomi-extended-weather-title"
        class="text-section-title text-balance text-[var(--color-text-primary)]"
      >
        {{ t('weather.xiaomiExtended.title') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.xiaomiExtended.description') }}
      </p>
    </div>

    <div class="grid min-w-0 max-w-full items-start gap-4 lg:grid-cols-2">
      <XiaomiMinutelySummary
        v-if="model.minutely"
        :model="model.minutely"
      />
      <XiaomiRecentChanges
        v-if="model.recentChanges"
        :model="model.recentChanges"
      />
    </div>

    <XiaomiExtendedAttribution
      v-if="model.attribution"
      :model="model.attribution"
    />
  </section>
</template>
