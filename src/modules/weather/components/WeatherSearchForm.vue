<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import { MIN_SEARCH_LENGTH } from '@/modules/weather/constants/weather'
import type { WeatherRequestStatus } from '@/modules/weather/types/weather'
import { localizeWeatherError } from '@/modules/weather/utils/weatherI18n'

interface Props {
  status: WeatherRequestStatus
  serviceError?: string | null
  compact?: boolean
}

interface Emits {
  search: [query: string]
}

const props = withDefaults(defineProps<Props>(), {
  serviceError: null,
  compact: false,
})
const emit = defineEmits<Emits>()
const { t } = useI18n()
const query = shallowRef('')
const validationError = shallowRef<string | null>(null)

const isLoading = computed(() => props.status === 'loading')
const describedBy = computed(() => {
  const ids = ['weather-search-helper']

  if (validationError.value) {
    ids.push('weather-search-validation')
  }

  if (props.serviceError) {
    ids.push('weather-search-service-error')
  }

  return ids.join(' ')
})

function submitSearch() {
  if (isLoading.value) {
    return
  }

  const normalizedQuery = query.value.trim()

  if (normalizedQuery.length < MIN_SEARCH_LENGTH) {
    validationError.value = t('weather.search.validation', {
      count: MIN_SEARCH_LENGTH,
    })
    return
  }

  validationError.value = null
  emit('search', normalizedQuery)
}

function handleInput() {
  if (validationError.value && query.value.trim().length >= MIN_SEARCH_LENGTH) {
    validationError.value = null
  }
}
</script>

<template>
  <form
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]"
    :class="compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'"
    novalidate
    role="search"
    @submit.prevent="submitSearch"
  >
    <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div class="space-y-2">
        <label
          class="block text-sm font-semibold text-[var(--color-text-primary)]"
          for="weather-city-search"
        >
          {{
            compact
              ? t('weather.search.anotherLabel')
              : t('weather.search.label')
          }}
        </label>
        <input
          id="weather-city-search"
          v-model="query"
          :aria-describedby="describedBy"
          :aria-invalid="validationError ? 'true' : 'false'"
          autocomplete="off"
          class="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-text-tertiary)] bg-[var(--color-surface-inset)] px-3 text-base text-[var(--color-text-primary)] transition-[background-color,border-color] duration-[var(--motion-fast)] placeholder:text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
          name="city"
          :placeholder="t('weather.search.placeholder')"
          type="search"
          @input="handleInput"
        />
      </div>
      <BaseButton
        class="w-full sm:w-auto"
        :aria-busy="isLoading"
        :aria-disabled="isLoading"
        type="submit"
        variant="primary"
      >
        {{
          isLoading
            ? t('weather.search.searching')
            : t('weather.search.action')
        }}
      </BaseButton>
    </div>

    <p
      id="weather-search-helper"
      class="text-caption text-[var(--color-text-secondary)]"
      :class="compact ? 'sr-only' : 'mt-2'"
    >
      {{ t('weather.search.helper') }}
    </p>
    <p
      v-if="validationError"
      id="weather-search-validation"
      class="mt-2 text-sm font-medium text-[var(--color-danger)]"
      role="alert"
    >
      {{ validationError }}
    </p>
    <p
      v-if="serviceError"
      id="weather-search-service-error"
      class="mt-2 text-sm font-medium text-[var(--color-danger)]"
      role="alert"
    >
      {{ localizeWeatherError(serviceError, t) }}
    </p>
    <p class="sr-only" aria-live="polite">
      {{ isLoading ? t('weather.search.loadingAnnouncement') : '' }}
    </p>
  </form>
</template>
