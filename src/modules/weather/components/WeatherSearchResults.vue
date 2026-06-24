<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import type { WeatherLocation } from '@/modules/weather/types/weather'
import { formatLocationName } from '@/modules/weather/utils/weatherFormatting'
import { localizeLocationKind } from '@/modules/weather/utils/weatherI18n'

interface Props {
  query: string
  results: WeatherLocation[]
}

interface Emits {
  select: [location: WeatherLocation]
  close: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const resultList = useTemplateRef<HTMLElement>('resultList')

function resultButtons() {
  return Array.from(
    resultList.value?.querySelectorAll<HTMLButtonElement>(
      '[data-weather-search-option]',
    ) ?? [],
  )
}

function focusResult(index: number) {
  resultButtons()[index]?.focus()
}

function focusFirstResult() {
  focusResult(0)
}

defineExpose({
  focusFirstResult,
})

function handleResultsKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (props.results.length === 0) {
    return
  }

  const buttons = resultButtons()
  const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement)

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusResult(currentIndex >= 0 ? (currentIndex + 1) % buttons.length : 0)
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusResult(
      currentIndex >= 0
        ? (currentIndex - 1 + buttons.length) % buttons.length
        : buttons.length - 1,
    )
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusResult(0)
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusResult(buttons.length - 1)
  }
}
</script>

<template>
  <section
    class="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4 sm:p-5"
    aria-labelledby="weather-search-results-title"
  >
    <h2
      id="weather-search-results-title"
      class="text-base font-semibold text-[var(--color-text-primary)]"
    >
      {{
        results.length > 0
          ? t('weather.results.chooseTitle')
          : t('weather.results.emptyTitle')
      }}
    </h2>
    <p
      class="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]"
      aria-live="polite"
    >
      {{
        results.length > 0
          ? t('weather.results.matches', { count: results.length, query })
          : t('weather.results.noMatches', { query })
      }}
    </p>

    <ul
      v-if="results.length > 0"
      ref="resultList"
      class="mt-4 grid gap-2 sm:grid-cols-2"
      role="listbox"
      :aria-label="t('weather.results.chooseTitle')"
      @keydown="handleResultsKeydown"
    >
      <li v-for="location in results" :key="location.id" role="none">
        <button
          data-weather-search-option
          class="interactive-surface min-h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-text-tertiary)] bg-[var(--color-surface-raised)] px-3 py-2 text-left hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-wash)]"
          role="option"
          type="button"
          aria-selected="false"
          @click="emit('select', location)"
        >
          <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
            {{ location.name }}
          </span>
          <span class="mt-1 block text-caption text-[var(--color-text-secondary)]">
            {{ localizeLocationKind(location.kind, t) }} / {{ formatLocationName(location) }}
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>
