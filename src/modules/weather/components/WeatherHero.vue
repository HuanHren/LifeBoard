<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import WeatherSnapshotLayer from '@/modules/weather/components/WeatherSnapshotLayer.vue'
import { useWeatherSolarPhase } from '@/modules/weather/composables/useWeatherSolarPhase'
import { useWeatherSnapshotTransition } from '@/modules/weather/composables/useWeatherSnapshotTransition'
import type { AirQualitySnapshot } from '@/modules/weather/types/airQuality'
import type { WeatherSnapshot } from '@/modules/weather/types/weather'
import { deriveWeatherLighting } from '@/modules/weather/utils/weatherLighting'
import { createWeatherVisualSnapshot } from '@/modules/weather/utils/weatherVisualSnapshot'

interface Props {
  weather: WeatherSnapshot
  airQuality?: AirQualitySnapshot | null
}

const props = defineProps<Props>()
const { t } = useI18n()
const liveMessage = shallowRef('')
const visualSnapshot = computed(() =>
  createWeatherVisualSnapshot(props.weather, props.airQuality ?? null),
)
const {
  activeSnapshot,
  currentSnapshot,
  outgoingSnapshot,
  incomingSnapshot,
  phase,
  committedAnnouncementSnapshot,
  announcementSerial,
  shouldSwapImmediately,
  isTransitioning,
  markIncomingArtworkReady,
} = useWeatherSnapshotTransition(visualSnapshot)
const { phaseResult: solarPhaseResult } = useWeatherSolarPhase(activeSnapshot)

const heroAtmosphere = computed(() => activeSnapshot.value.atmosphere)
const activeLighting = computed(() =>
  deriveWeatherLighting({
    atmosphere: activeSnapshot.value.atmosphere,
    current: activeSnapshot.value.weather.current,
    solarPhase: solarPhaseResult.value.phase,
  }),
)
const showCurrentLayer = computed(
  () => currentSnapshot.value && !outgoingSnapshot.value && !incomingSnapshot.value,
)

watch(announcementSerial, () => {
  if (!committedAnnouncementSnapshot.value) {
    return
  }

  liveMessage.value = t('weather.hero.updatedForCity', {
    city: committedAnnouncementSnapshot.value.weather.location.name,
  })
})
</script>

<template>
  <section
    class="weather-hero relative isolate overflow-hidden rounded-[var(--radius-xl)] border border-[var(--weather-hero-border)] shadow-[var(--shadow-sm)]"
    aria-labelledby="weather-hero-title"
    :data-atmosphere="heroAtmosphere"
    :data-phase="phase"
    :data-reduced-motion="shouldSwapImmediately ? 'true' : 'false'"
    :data-solar-phase="solarPhaseResult.phase"
    :data-solar-phase-source="solarPhaseResult.source"
    :data-transitioning="isTransitioning ? 'true' : 'false'"
  >
    <RouterLink
      class="weather-hero__cities-control interactive-surface absolute right-5 top-5 z-30 inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--weather-hero-control-border)] bg-[var(--weather-hero-control-bg)] px-4 text-sm font-medium text-[var(--weather-hero-text)] hover:border-[var(--weather-hero-control-hover)] hover:bg-[var(--weather-hero-control-hover-bg)] focus-visible:outline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)] sm:right-6 sm:top-6"
      :to="{ name: 'weather-cities' }"
    >
      <span aria-hidden="true" class="text-lg leading-none">+</span>
      <span class="sr-only sm:not-sr-only sm:ml-2">
        {{ t('weather.hero.manageCities') }}
      </span>
    </RouterLink>

    <div class="weather-hero__viewport">
      <WeatherSnapshotLayer
        v-if="showCurrentLayer && currentSnapshot"
        :key="`stable-${currentSnapshot.identity}`"
        active
        :lighting-result="activeLighting"
        :snapshot="currentSnapshot"
        :solar-phase-result="solarPhaseResult"
        visual-state="stable"
      />

      <WeatherSnapshotLayer
        v-if="outgoingSnapshot"
        :key="`outgoing-${outgoingSnapshot.identity}`"
        active
        class="weather-hero__layer weather-hero__layer--outgoing"
        :snapshot="outgoingSnapshot"
        visual-state="outgoing"
      />

      <WeatherSnapshotLayer
        v-if="incomingSnapshot"
        :key="`incoming-${incomingSnapshot.identity}`"
        :active="false"
        class="weather-hero__layer weather-hero__layer--incoming"
        :snapshot="incomingSnapshot"
        visual-state="incoming"
        @base-artwork-ready="markIncomingArtworkReady"
      />
    </div>

    <p class="sr-only" aria-live="polite" aria-atomic="true">
      {{ liveMessage }}
    </p>
  </section>
</template>

<style scoped>
.weather-hero {
  --weather-hero-text: var(--color-text-primary);
  --weather-hero-border: var(--color-border-soft);
  --weather-hero-control-bg: color-mix(
    in oklch,
    var(--color-surface-raised) 88%,
    transparent
  );
  --weather-hero-control-border: color-mix(
    in oklch,
    var(--color-control-border) 78%,
    transparent
  );
  --weather-hero-control-hover: var(--color-accent);
  --weather-hero-control-hover-bg: color-mix(
    in oklch,
    var(--color-surface-raised) 82%,
    var(--color-accent)
  );

  min-height: clamp(16rem, 26vw, 18.75rem);
  background: var(--color-surface-raised);
  transition:
    border-color var(--motion-base) var(--motion-ease),
    color var(--motion-base) var(--motion-ease);
}

.weather-hero[data-atmosphere='clear-night'],
.weather-hero[data-atmosphere='partly-cloudy-night'],
.weather-hero[data-atmosphere='rain-day'],
.weather-hero[data-atmosphere='rain-night'],
.weather-hero[data-atmosphere='thunderstorm'] {
  --weather-hero-text: oklch(97% 0.006 95);
  --weather-hero-border: oklch(72% 0.04 140 / 26%);
  --weather-hero-control-bg: oklch(100% 0 0 / 12%);
  --weather-hero-control-border: oklch(100% 0 0 / 22%);
  --weather-hero-control-hover: oklch(91% 0.055 136);
  --weather-hero-control-hover-bg: oklch(100% 0 0 / 18%);
}

.weather-hero[data-atmosphere='overcast'],
.weather-hero[data-atmosphere='fog-haze'] {
  --weather-hero-text: oklch(23% 0.025 118);
  --weather-hero-control-bg: oklch(100% 0 0 / 42%);
  --weather-hero-control-border: oklch(47% 0.035 126 / 28%);
}

.weather-hero[data-atmosphere='snow'] {
  --weather-hero-text: oklch(24% 0.024 136);
  --weather-hero-control-bg: oklch(100% 0 0 / 48%);
  --weather-hero-control-border: oklch(47% 0.036 138 / 26%);
}

.weather-hero__viewport {
  position: relative;
  min-height: inherit;
  overflow: hidden;
}

.weather-hero__layer--incoming {
  position: relative;
  z-index: 2;
  opacity: 0;
}

.weather-hero__viewport > .weather-hero__layer--outgoing {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.weather-hero[data-phase='crossfading'] .weather-hero__layer--outgoing {
  animation: weather-hero-outgoing 220ms ease-in both;
  will-change: opacity;
}

.weather-hero[data-phase='crossfading'] .weather-hero__layer--incoming {
  animation: weather-hero-incoming 280ms ease-out both;
  will-change: opacity;
}

.weather-hero[data-reduced-motion='true'] .weather-hero__layer--outgoing {
  animation: weather-hero-outgoing 80ms ease-in both;
}

.weather-hero[data-reduced-motion='true'] .weather-hero__layer--incoming {
  animation: weather-hero-incoming 80ms ease-out both;
}

@keyframes weather-hero-outgoing {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes weather-hero-incoming {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-hero,
  .weather-hero__layer--outgoing,
  .weather-hero__layer--incoming {
    transition: none !important;
  }
}

@media (forced-colors: active) {
  .weather-hero {
    --weather-hero-text: ButtonText;
    --weather-hero-border: ButtonText;
    --weather-hero-control-bg: ButtonFace;
    --weather-hero-control-border: ButtonText;
    --weather-hero-control-hover: Highlight;
    --weather-hero-control-hover-bg: ButtonFace;
  }

  .weather-hero__layer--outgoing {
    display: none;
  }
}
</style>
