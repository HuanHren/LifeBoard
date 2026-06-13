<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseError from '@/components/base/BaseError.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import {
  formatFullLocalTime,
  formatLocationName,
  formatTemperature,
} from '@/modules/weather/utils/weatherFormatting'

const weatherStore = useWeatherStore()
const {
  selectedLocation,
  weather,
  forecastStatus,
  forecastError,
  isInitialized,
} = storeToRefs(weatherStore)
const { initializeWeather, loadForecast } = weatherStore

const isPreparing = computed(
  () => !isInitialized.value || forecastStatus.value === 'loading',
)

const adviceHighlight = computed(() => {
  if (!weather.value) {
    return null
  }

  return (
    weather.value.advice.items.find((item) => item.kind === 'outdoor') ??
    weather.value.advice.items[0] ??
    null
  )
})

const umbrellaAdvice = computed(
  () => weather.value?.advice.items.find((item) => item.kind === 'umbrella') ?? null,
)

function refreshWeather() {
  void loadForecast()
}

onMounted(() => {
  void initializeWeather()
})
</script>

<template>
  <section aria-labelledby="home-weather-title">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          id="home-weather-title"
          class="text-section-title text-balance text-[var(--color-text-primary)]"
        >
          Weather at a glance
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          Real conditions and practical guidance from your selected city.
        </p>
      </div>
      <RouterLink
        v-if="selectedLocation"
        class="interactive-surface inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'weather' }"
      >
        Open full weather
        <span class="ml-2" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>

    <BaseSkeleton v-if="isPreparing" label="Loading your weather summary" />

    <BaseError
      v-else-if="forecastStatus === 'error' && selectedLocation"
      action-label="Load latest weather"
      :message="forecastError ?? 'The latest forecast could not be loaded.'"
      title="Weather summary unavailable"
      @action="refreshWeather"
    />

    <article
      v-else-if="weather"
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-accent-wash)] lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)]"
    >
      <div class="p-6 sm:p-8">
        <p class="text-sm font-medium text-[var(--color-accent-text)]">
          {{ formatLocationName(weather.location) }}
        </p>
        <div class="mt-5 flex flex-wrap items-end gap-x-5 gap-y-2">
          <p class="text-5xl font-semibold leading-none tabular-nums text-[var(--color-text-primary)]">
            {{ formatTemperature(weather.current.temperature, weather.units.temperature) }}
          </p>
          <div class="pb-0.5">
            <p class="text-lg font-semibold text-balance text-[var(--color-text-primary)]">
              {{ weather.current.condition.label }}
            </p>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
              Feels like
              {{
                formatTemperature(
                  weather.current.apparentTemperature,
                  weather.units.temperature,
                )
              }}
            </p>
          </div>
        </div>
        <p class="mt-6 text-caption text-[var(--color-text-secondary)]">
          Updated
          <time :datetime="weather.current.time">
            {{ formatFullLocalTime(weather.current.time) }}
          </time>
          {{ weather.timezoneAbbreviation }}
        </p>
      </div>

      <div
        class="border-t border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6 sm:p-8 lg:border-t-0 lg:border-l"
      >
        <div v-if="adviceHighlight">
          <p class="text-caption font-medium text-[var(--color-text-secondary)]">
            Daily guidance
          </p>
          <p class="mt-2 text-base font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
            {{ adviceHighlight.summary }}
          </p>
          <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
            {{ adviceHighlight.detail }}
          </p>
        </div>

        <div
          v-if="umbrellaAdvice"
          class="mt-5 border-t border-[var(--color-border-soft)] pt-4"
        >
          <p class="text-caption font-medium text-[var(--color-text-secondary)]">
            Umbrella
          </p>
          <p class="mt-1 text-sm font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
            {{ umbrellaAdvice.summary }}
          </p>
        </div>
      </div>
    </article>

    <article
      v-else-if="selectedLocation"
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6"
    >
      <h3 class="text-section-title text-balance text-[var(--color-text-primary)]">
        Load weather for {{ selectedLocation.name }}
      </h3>
      <p class="mt-2 max-w-xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        Your city is saved, but current conditions have not been loaded in this session.
      </p>
      <BaseButton class="mt-4" size="sm" variant="primary" @click="refreshWeather">
        Load latest weather
      </BaseButton>
    </article>

    <article
      v-else
      class="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <h3 class="text-section-title text-balance text-[var(--color-text-primary)]">
        Connect your local weather
      </h3>
      <p class="mt-2 max-w-xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        Choose a city in Weather to connect this summary.
      </p>
      <RouterLink
        class="interactive-surface mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
        :to="{ name: 'weather' }"
      >
        Choose a city
      </RouterLink>
    </article>
  </section>
</template>
