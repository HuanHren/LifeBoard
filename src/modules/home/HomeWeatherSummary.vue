<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseError from '@/components/base/BaseError.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import SectionHeader from '@/components/base/SectionHeader.vue'
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
  forecastCacheState,
  dataFreshness,
  recoveryState,
  servingProvider,
  fallbackFromProvider,
  autoLocationOnHome,
  isInitialized,
} = storeToRefs(weatherStore)
const { initializeWeather, loadForecast, selectCurrentCoordinates, setLocale } = weatherStore

watch(locale, setLocale, { immediate: true })

const currentLocationStatus = shallowRef<'idle' | 'loading'>('idle')
const currentLocationMessage = shallowRef<string | null>(null)
const hasAttemptedAutoLocation = shallowRef(false)

const isPreparing = computed(() => !isInitialized.value || (
  forecastStatus.value === 'loading' && !weather.value
))
const todayForecast = computed(() => weather.value?.daily[0] ?? null)
const weatherStatusLabel = computed(() => {
  if (recoveryState.value === 'fallback' && fallbackFromProvider.value === 'xiaomi' && servingProvider.value === 'openMeteo') {
    return t('home.weather.fallback')
  }
  if (recoveryState.value === 'offline') return t('home.weather.offline')
  if (recoveryState.value === 'rate-limited') return t('home.weather.rateLimited')
  if (recoveryState.value === 'failed' && weather.value) return t('home.weather.updateFailed')
  if (dataFreshness.value === 'fresh-cache') return t('home.weather.freshCache')
  if (forecastCacheState.value === 'stale' || forecastCacheState.value === 'offline-stale') {
    return t('home.weather.stale')
  }

  if (forecastCacheState.value === 'refreshing') return t('home.weather.refreshing')
  return t('shared.status.connected')
})
const adviceHighlight = computed(() => {
  if (!weather.value) return null
  return (
    weather.value.advice.items.find((item) => item.kind === 'outdoor') ??
    weather.value.advice.items[0] ??
    null
  )
})
const localizedAdviceHighlight = computed(() =>
  adviceHighlight.value ? localizeAdviceItem(adviceHighlight.value, t) : null,
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
    if (autoLocationOnHome.value && !hasAttemptedAutoLocation.value && !selectedLocation.value) {
      hasAttemptedAutoLocation.value = true
      void useCurrentLocationWeather()
    }
  })
})
</script>

<template>
  <section aria-labelledby="home-weather-title">
    <SectionHeader
      class="home-section-header"
      :description="t('home.weather.eyebrow')"
      :title="t('home.weather.title')"
      title-id="home-weather-title"
    >
      <template #actions>
      <RouterLink
        class="interactive-surface inline-flex min-h-10 items-center rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-wash)]"
        :to="{ name: 'weather' }"
      >
        {{ t('home.weather.open') }}
      </RouterLink>
      </template>
    </SectionHeader>

    <p
      v-if="currentLocationMessage"
      class="mb-3 rounded-[var(--radius-sm)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
      aria-live="polite"
    >
      {{ currentLocationMessage }}
    </p>

    <BaseSkeleton v-if="isPreparing" :label="t('home.weather.loading')" />

    <BaseError
      v-else-if="forecastStatus === 'error' && selectedLocation && !weather"
      :action-label="t('home.weather.retry')"
      :message="localizeWeatherError(forecastError, t) ?? t('home.weather.errorFallback')"
      :title="t('home.weather.errorTitle')"
      @action="refreshWeather"
    />

    <BaseSurface v-else-if="weather" as="article" class="home-weather-card" padding="lg" variant="plain">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {{ formatLocationName(weather.location) }}
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ weatherStatusLabel }}
          </p>
        </div>
        <BaseIcon name="weather" class="text-[var(--color-accent-text)]" size="lg" />
      </div>

      <div class="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
        <p class="text-5xl font-semibold leading-none tabular-nums text-[var(--color-text-primary)]">
          {{ formatTemperature(weather.current.temperature, weather.units.temperature) }}
        </p>
        <div class="pb-1">
          <p class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ localizeWeatherCondition(weather.current.condition, t) }}
          </p>
          <p class="mt-1 text-caption text-[var(--color-text-secondary)]">
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

      <dl
        v-if="todayForecast"
        class="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--color-border-soft)] pt-4 text-sm"
      >
        <div>
          <dt class="text-caption text-[var(--color-text-secondary)]">
            {{ t('home.weather.high') }}
          </dt>
          <dd class="mt-1 font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ formatTemperature(todayForecast.temperatureMax, weather.units.temperature) }}
          </dd>
        </div>
        <div>
          <dt class="text-caption text-[var(--color-text-secondary)]">
            {{ t('home.weather.low') }}
          </dt>
          <dd class="mt-1 font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ formatTemperature(todayForecast.temperatureMin, weather.units.temperature) }}
          </dd>
        </div>
      </dl>

      <div
        v-if="localizedAdviceHighlight"
        class="mt-5 border-t border-[var(--color-border-soft)] pt-4"
      >
        <p class="text-caption font-medium text-[var(--color-text-secondary)]">
          {{ t('home.weather.guidance') }}
        </p>
        <p class="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-primary)]">
          {{ localizedAdviceHighlight.summary }}
        </p>
      </div>

      <p class="mt-5 text-caption text-[var(--color-text-secondary)]">
        {{
          t('home.weather.updated', {
            time: formatFullLocalTime(weather.current.time, locale),
            timezone: weather.timezoneAbbreviation,
          })
        }}
      </p>
    </BaseSurface>

    <BaseSurface v-else-if="selectedLocation" as="article" padding="lg" variant="muted">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('home.weather.loadTitle', { city: selectedLocation.name }) }}
      </h3>
      <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('home.weather.loadDescription') }}
      </p>
      <BaseButton class="mt-4" size="sm" variant="primary" @click="refreshWeather">
        {{ t('home.weather.retry') }}
      </BaseButton>
    </BaseSurface>

    <BaseSurface v-else as="article" class="home-weather-card" padding="lg" variant="muted">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('home.weather.connectTitle') }}
      </h3>
      <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {{ t('home.weather.connectDescription') }}
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <RouterLink
          class="interactive-surface inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-accent-hover)]"
          :to="{ name: 'weather' }"
        >
          {{ t('home.weather.chooseCity') }}
        </RouterLink>
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
      </div>
    </BaseSurface>
  </section>
</template>

<style scoped>
.home-section-header {
  margin-bottom: 1rem;
}

.home-section-header :deep(.section-header__description) {
  color: var(--color-accent-text);
  font-weight: var(--font-weight-semibold);
}
</style>
