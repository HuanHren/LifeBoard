<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import type { TranslationKey } from '@/i18n/keys'
import { useI18n } from '@/i18n/useI18n'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import type {
  WeatherFavoriteCity,
  WeatherFavoriteMessage,
} from '@/modules/weather/types/weatherFavorites'
import { getWeatherFavoriteIdentity } from '@/modules/weather/utils/weatherFavoriteIdentity'

interface Props {
  favoriteCities: WeatherFavoriteCity[]
  selectedLocation: WeatherLocation | null
  hasSelectedFavorite: boolean
  message: WeatherFavoriteMessage | null
}

interface Emits {
  addSelected: []
  select: [favorite: WeatherFavoriteCity]
  remove: [favoriteId: string]
  clearMessage: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const messageKeyByType: Record<WeatherFavoriteMessage, TranslationKey> = {
  saved: 'weather.favorites.message.saved',
  removed: 'weather.favorites.message.removed',
  duplicate: 'weather.favorites.message.duplicate',
  storageError: 'weather.favorites.message.storageError',
  invalidStorage: 'weather.favorites.message.invalidStorage',
}

const selectedIdentity = computed(() =>
  props.selectedLocation
    ? getWeatherFavoriteIdentity(props.selectedLocation)
    : null,
)

function isCurrentFavorite(favorite: WeatherFavoriteCity) {
  return (
    selectedIdentity.value !== null &&
    getWeatherFavoriteIdentity(favorite) === selectedIdentity.value
  )
}
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4 sm:p-5"
    aria-labelledby="weather-favorites-title"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2
          id="weather-favorites-title"
          class="text-base font-semibold text-[var(--color-text-primary)]"
        >
          {{ t('weather.favorites.title') }}
        </h2>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ t('weather.favorites.description') }}
        </p>
      </div>

      <BaseButton
        v-if="selectedLocation"
        :disabled="hasSelectedFavorite"
        size="sm"
        variant="secondary"
        @click="emit('addSelected')"
      >
        {{
          hasSelectedFavorite
            ? t('weather.favorites.savedAction')
            : t('weather.favorites.saveAction')
        }}
      </BaseButton>
    </div>

    <p
      v-if="message"
      class="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm leading-6 text-[var(--color-text-secondary)]"
      role="status"
    >
      {{ t(messageKeyByType[message]) }}
      <button
        class="ml-2 rounded-[var(--radius-xs)] text-[var(--color-text-primary)] underline decoration-[var(--color-border-strong)] underline-offset-4 hover:text-[var(--color-accent)]"
        type="button"
        @click="emit('clearMessage')"
      >
        {{ t('weather.favorites.dismissMessage') }}
      </button>
    </p>

    <p
      v-if="favoriteCities.length === 0"
      class="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]"
    >
      {{ t('weather.favorites.empty') }}
    </p>

    <ul
      v-else
      class="mt-4 flex gap-2 overflow-x-auto pb-1"
      :aria-label="t('weather.favorites.listLabel')"
    >
      <li
        v-for="favorite in favoriteCities"
        :key="favorite.id"
        class="flex min-w-52 shrink-0 items-stretch rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)]"
      >
        <button
          class="interactive-surface flex min-h-16 flex-1 flex-col justify-center rounded-l-[var(--radius-md)] px-3 py-2 text-left hover:bg-[var(--color-accent-wash)]"
          type="button"
          :aria-current="isCurrentFavorite(favorite) ? 'location' : undefined"
          @click="emit('select', favorite)"
        >
          <span class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ favorite.name }}
          </span>
          <span class="mt-1 text-caption text-[var(--color-text-secondary)]">
            {{ favorite.region ? `${favorite.region}, ${favorite.country}` : favorite.country }}
          </span>
          <span
            v-if="isCurrentFavorite(favorite)"
            class="mt-1 text-caption font-medium text-[var(--color-accent)]"
          >
            {{ t('weather.favorites.current') }}
          </span>
        </button>
        <button
          class="interactive-surface min-h-16 rounded-r-[var(--radius-md)] border-l border-[var(--color-border-soft)] px-3 text-caption font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
          type="button"
          :aria-label="t('weather.favorites.removeAria', { city: favorite.displayLabel })"
          @click="emit('remove', favorite.id)"
        >
          {{ t('weather.favorites.remove') }}
        </button>
      </li>
    </ul>
  </section>
</template>
