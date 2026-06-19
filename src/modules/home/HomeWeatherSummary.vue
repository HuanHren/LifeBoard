<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseError from '@/components/base/BaseError.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import { useI18n } from '@/i18n/useI18n'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import {
  formatFullLocalTime,
  formatLocationName,
  formatTemperature,
} from '@/modules/weather/utils/weatherFormatting'
import {
  localizeAdviceItem,
  localizeWeatherCondition,
  localizeWeatherError,
} from '@/modules/weather/utils/weatherI18n'

const { locale, t } = useI18n()
const weatherStore = useWeatherStore()
const {
  selectedLocation,
  weather,
  forecastStatus,
  forecastError,
  autoLocationOnHome,
  isInitialized,
} = storeToRefs(weatherStore)
const { initializeWeather, loadForecast, selectCurrentCoordinates } = weatherStore

const currentLocationStatus = shallowRef<'idle' | 'loading'>('idle')
const currentLocationMessage = shallowRef<string | null>(null)
const hasAttemptedAutoLocation = shallowRef(false)

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
const localizedAdviceHighlight = computed(() =>
  adviceHighlight.value ? localizeAdviceItem(adviceHighlight.value, t) : null,
)
const localizedUmbrellaAdvice = computed(() =>
  umbrellaAdvice.value ? localizeAdviceItem(umbrellaAdvice.value, t) : null,
)

function refreshWeather() {
  void loadForecast()
}

function isLocationSecureContext() {
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
}

function geolocationPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 10000,
    })
  })
}

async function useCurrentLocationWeather() {
  currentLocationMessage.value = null

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    currentLocationMessage.value = t('home.weather.locationUnsupported')
    return
  }

  if (!isLocationSecureContext()) {
    currentLocationMessage.value = t('home.weather.locationSecureContext')
    return
  }

  if (typeof navigator.geolocation?.getCurrentPosition !== 'function') {
    currentLocationMessage.value = t('home.weather.locationUnsupported')
    return
  }

  currentLocationStatus.value = 'loading'

  try {
    const position = await geolocationPosition()
    await selectCurrentCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      locale: locale.value,
      fallbackName: t('home.weather.currentLocationLabel'),
    })
    currentLocationMessage.value = t('home.weather.locationLoaded')
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 1
    ) {
      currentLocationMessage.value = t('home.weather.locationDenied')
    } else {
      currentLocationMessage.value = t('home.weather.locationUnavailable')
    }
  } finally {
    currentLocationStatus.value = 'idle'
  }
}

onMounted(() => {
  void initializeWeather().then(() => {
    if (
      autoLocationOnHome.value &&
      !hasAttemptedAutoLocation.value &&
      !selectedLocation.value
    ) {
      hasAttemptedAutoLocation.value = true
      void useCurrentLocationWeather()
    }
  })
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
          {{ t('home.weather.title') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
          {{ t('home.weather.description') }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          :aria-busy="currentLocationStatus === 'loading'"
          :disabled="currentLocationStatus === 'loading'"
          size="sm"
          variant="secondary"
          @click="useCurrentLocationWeather"
        >
          {{
            currentLocationStatus === 'loading'
              ? t('home.weather.currentLocationLoading')
              : t('home.weather.useCurrentLocation')
          }}
        </BaseButton>
        <RouterLink
          v-if="selectedLocation"
          class="interactive-surface inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
          :to="{ name: 'weather' }"
        >
          {{ t('home.weather.open') }}
          <span class="ml-2" aria-hidden="true">&rarr;</span>
        </RouterLink>
      </div>
    </div>

    <p
      v-if="currentLocationMessage"
      class="mb-4 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
      aria-live="polite"
    >
      {{ currentLocationMessage }}
    </p>

    <BaseSkeleton v-if="isPreparing" :label="t('home.weather.loading')" />

    <BaseError
      v-else-if="forecastStatus === 'error' && selectedLocation"
      :action-label="t('home.weather.retry')"
      :message="localizeWeatherError(forecastError, t) ?? t('home.weather.errorFallback')"
      :title="t('home.weather.errorTitle')"
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
              {{ localizeWeatherCondition(weather.current.condition, t) }}
            </p>
            <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
              {{
                t('home.weather.feelsLike', {
                  temperature: formatTemperature(
                    weather.current.apparentTemperature,
                    weather.units.temperature,
                  ),
                })
              }}
            </p>
          </div>
        </div>
        <p class="mt-6 text-caption text-[var(--color-text-secondary)]">
          {{
            t('home.weather.updated', {
              time: formatFullLocalTime(weather.current.time, locale),
              timezone: weather.timezoneAbbreviation,
            })
          }}
        </p>
      </div>

      <div
        class="border-t border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6 sm:p-8 lg:border-t-0 lg:border-l"
      >
        <div v-if="localizedAdviceHighlight">
          <p class="text-caption font-medium text-[var(--color-text-secondary)]">
            {{ t('home.weather.guidance') }}
          </p>
          <p class="mt-2 text-base font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
            {{ localizedAdviceHighlight.summary }}
          </p>
          <p class="mt-2 text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
            {{ localizedAdviceHighlight.detail }}
          </p>
        </div>

        <div
          v-if="localizedUmbrellaAdvice"
          class="mt-5 border-t border-[var(--color-border-soft)] pt-4"
        >
          <p class="text-caption font-medium text-[var(--color-text-secondary)]">
            {{ t('home.weather.umbrella') }}
          </p>
          <p class="mt-1 text-sm font-semibold leading-6 text-pretty text-[var(--color-text-primary)]">
            {{ localizedUmbrellaAdvice.summary }}
          </p>
        </div>
      </div>
    </article>

    <article
      v-else-if="selectedLocation"
      class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] p-6"
    >
      <h3 class="text-section-title text-balance text-[var(--color-text-primary)]">
        {{ t('home.weather.loadTitle', { city: selectedLocation.name }) }}
      </h3>
      <p class="mt-2 max-w-xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('home.weather.loadDescription') }}
      </p>
      <BaseButton class="mt-4" size="sm" variant="primary" @click="refreshWeather">
        {{ t('home.weather.retry') }}
      </BaseButton>
    </article>

    <article
      v-else
      class="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <h3 class="text-section-title text-balance text-[var(--color-text-primary)]">
        {{ t('home.weather.connectTitle') }}
      </h3>
      <p class="mt-2 max-w-xl text-sm leading-6 text-pretty text-[var(--color-text-secondary)]">
        {{ t('home.weather.connectDescription') }}
      </p>
      <RouterLink
        class="interactive-surface mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
        :to="{ name: 'weather' }"
      >
        {{ t('home.weather.chooseCity') }}
      </RouterLink>
      <p class="mt-3 text-caption text-[var(--color-text-secondary)]">
        {{ t('home.weather.currentLocationHelper') }}
      </p>
    </article>
  </section>
</template>
