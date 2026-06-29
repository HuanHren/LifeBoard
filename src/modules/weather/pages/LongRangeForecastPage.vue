<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
} from 'vue'
import { storeToRefs } from 'pinia'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseError from '@/components/base/BaseError.vue'
import PageLayout from '@/components/base/PageLayout.vue'
import { useI18n } from '@/i18n/useI18n'
import LongRangeForecastStrip from '@/modules/weather/components/LongRangeForecastStrip.vue'
import WeatherAttribution from '@/modules/weather/components/WeatherAttribution.vue'
import { DAILY_FORECAST_LENGTH } from '@/modules/weather/constants/weather'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'
import { localizeWeatherError } from '@/modules/weather/utils/weatherI18n'

const weatherStore = useWeatherStore()
const { t } = useI18n()
const {
  selectedLocation,
  weather,
  longRangeForecast,
  longRangeStatus,
  longRangeError,
} = storeToRefs(weatherStore)
const {
  initializeWeather,
  loadLongRangeForecast,
  clearLongRangeForecast,
} = weatherStore
const headingRef = shallowRef<HTMLHeadingElement | null>(null)
const canAutoReloadLongRange = shallowRef(false)

const dailyItems = computed(() =>
  longRangeForecast.value?.daily.slice(0, DAILY_FORECAST_LENGTH) ?? [],
)
const hasDailyForecast = computed(() => dailyItems.value.length > 0)
const forecastSnapshot = computed(() =>
  longRangeForecast.value && hasDailyForecast.value ? longRangeForecast.value : null,
)
const sourceLocation = computed(
  () => weather.value?.location ?? selectedLocation.value,
)
const activeLocationName = computed(() =>
  longRangeForecast.value
    ? formatLocationName(longRangeForecast.value.location)
    : sourceLocation.value
      ? formatLocationName(sourceLocation.value)
      : '',
)
const availableDaysMessage = computed(() => {
  const count = dailyItems.value.length

  if (count >= DAILY_FORECAST_LENGTH) {
    return t('weather.longRange.availableDays', { count })
  }

  return t('weather.longRange.fewerDays', {
    count,
    target: DAILY_FORECAST_LENGTH,
  })
})
const unavailableDescription = computed(() => {
  if (!sourceLocation.value) {
    return t('weather.longRange.noLocationDescription')
  }

  return t('weather.longRange.unavailableDescription')
})

function retryLongRangeForecast() {
  void loadLongRangeForecast(null, { forceRefresh: true })
}

watch(sourceLocation, () => {
  if (canAutoReloadLongRange.value) {
    void loadLongRangeForecast()
  }
})

onMounted(async () => {
  await initializeWeather()
  await loadLongRangeForecast()
  canAutoReloadLongRange.value = true
  await nextTick()
  headingRef.value?.focus()
})

onBeforeUnmount(() => {
  clearLongRangeForecast({ keepForecast: true })
})
</script>

<template>
  <PageLayout variant="wide" gap="md">
    <RouterLink
      class="inline-flex w-fit items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-sm font-medium text-[var(--color-accent-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-wash)] focus-visible:outline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)]"
      :to="{ name: 'weather' }"
    >
      {{ t('weather.longRange.backToWeather') }}
    </RouterLink>

    <header class="max-w-4xl space-y-3">
      <p
        v-if="activeLocationName"
        class="text-sm font-medium text-[var(--color-text-secondary)]"
      >
        {{ activeLocationName }}
      </p>
      <h1
        ref="headingRef"
        class="text-page-title text-balance text-[var(--color-text-primary)] outline-none"
        tabindex="-1"
      >
        {{ t('weather.longRange.title') }}
      </h1>
      <p class="max-w-2xl text-base leading-7 text-pretty text-[var(--color-text-secondary)]">
        {{ t('weather.longRange.description') }}
      </p>
    </header>

    <section
      v-if="longRangeStatus === 'loading' && !forecastSnapshot"
      aria-labelledby="long-range-loading-title"
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6"
    >
      <h2
        id="long-range-loading-title"
        class="text-section-title text-[var(--color-text-primary)]"
      >
        {{ t('weather.longRange.loadingTitle') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]" role="status">
        {{ t('weather.longRange.loadingDescription') }}
      </p>
    </section>

    <BaseError
      v-else-if="longRangeStatus === 'error'"
      :action-label="t('weather.longRange.retry')"
      :message="
        localizeWeatherError(longRangeError, t) ??
        t('weather.longRange.unavailableDescription')
      "
      :title="t('weather.longRange.unavailableTitle')"
      @action="retryLongRangeForecast"
    />

    <BaseEmpty
      v-else-if="longRangeStatus === 'unsupported'"
      :description="t('weather.longRange.unsupportedDescription')"
      :title="t('weather.longRange.unsupportedTitle')"
    />

    <BaseEmpty
      v-else-if="longRangeStatus === 'empty'"
      :description="t('weather.longRange.emptyDescription')"
      :title="t('weather.longRange.emptyTitle')"
    />

    <div v-else-if="forecastSnapshot" class="space-y-6">
      <p
        class="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
      >
        {{ availableDaysMessage }}
      </p>

      <LongRangeForecastStrip
        :items="dailyItems"
        :units="forecastSnapshot.units"
      />

      <div class="space-y-3">
        <WeatherAttribution :provider="forecastSnapshot.provider" />
        <p class="text-caption leading-5 text-[var(--color-text-secondary)]">
          {{ t('weather.longRange.sourceLength', { count: dailyItems.length }) }}
        </p>
      </div>
    </div>

    <BaseEmpty
      v-else
      :description="unavailableDescription"
      :title="t('weather.longRange.unavailableTitle')"
    />
  </PageLayout>
</template>
