<script setup lang="ts">
import type { WeatherAtmosphere } from '@/modules/weather/utils/weatherAtmosphere'

interface Props {
  atmosphere: WeatherAtmosphere
}

defineProps<Props>()
</script>

<template>
  <div
    aria-hidden="true"
    class="weather-atmosphere"
    :data-atmosphere="atmosphere"
  >
    <span class="weather-atmosphere__wash" />
    <span class="weather-atmosphere__horizon" />
    <span class="weather-atmosphere__detail" />
  </div>
</template>

<style scoped>
.weather-atmosphere {
  --weather-sky-start: var(--color-surface-raised);
  --weather-sky-end: var(--color-surface);
  --weather-horizon: color-mix(in oklch, var(--color-accent) 12%, transparent);
  --weather-detail: color-mix(in oklch, var(--color-accent) 18%, transparent);
  --weather-detail-size: 14rem;
  --weather-detail-opacity: 0.55;

  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(140deg, var(--weather-sky-start), var(--weather-sky-end));
}

.weather-atmosphere__wash,
.weather-atmosphere__horizon,
.weather-atmosphere__detail {
  position: absolute;
  display: block;
  pointer-events: none;
}

.weather-atmosphere__wash {
  inset: 0;
  background:
    radial-gradient(
      circle at 14% 18%,
      color-mix(in oklch, var(--weather-detail) 64%, transparent),
      transparent 36%
    );
  opacity: var(--weather-detail-opacity);
}

.weather-atmosphere__horizon {
  right: -12%;
  bottom: -34%;
  width: min(36rem, 82vw);
  aspect-ratio: 1;
  border-radius: 999rem;
  background: radial-gradient(circle, var(--weather-horizon), transparent 68%);
}

.weather-atmosphere__detail {
  top: 18%;
  right: 10%;
  width: var(--weather-detail-size);
  aspect-ratio: 1.55;
  border-radius: 999rem;
  background:
    radial-gradient(
      ellipse at center,
      color-mix(in oklch, var(--weather-detail) 86%, transparent),
      transparent 68%
    );
  opacity: 0.72;
}

.weather-atmosphere[data-atmosphere='clear-day'] {
  --weather-sky-start: oklch(93% 0.032 92);
  --weather-sky-end: oklch(87% 0.044 138);
  --weather-horizon: oklch(78% 0.052 132 / 42%);
  --weather-detail: oklch(88% 0.054 98 / 48%);
  --weather-detail-size: 12rem;
}

.weather-atmosphere[data-atmosphere='clear-night'] {
  --weather-sky-start: oklch(33% 0.035 258);
  --weather-sky-end: oklch(23% 0.03 248);
  --weather-horizon: oklch(62% 0.052 145 / 26%);
  --weather-detail: oklch(82% 0.028 86 / 18%);
  --weather-detail-size: 8rem;
}

.weather-atmosphere[data-atmosphere='partly-cloudy-day'] {
  --weather-sky-start: oklch(91% 0.027 116);
  --weather-sky-end: oklch(82% 0.034 155);
  --weather-horizon: oklch(72% 0.042 138 / 38%);
  --weather-detail: oklch(95% 0.012 105 / 62%);
  --weather-detail-size: 16rem;
}

.weather-atmosphere[data-atmosphere='partly-cloudy-night'] {
  --weather-sky-start: oklch(36% 0.033 250);
  --weather-sky-end: oklch(25% 0.027 242);
  --weather-horizon: oklch(58% 0.048 144 / 24%);
  --weather-detail: oklch(78% 0.018 104 / 18%);
  --weather-detail-size: 15rem;
}

.weather-atmosphere[data-atmosphere='overcast'] {
  --weather-sky-start: oklch(84% 0.011 121);
  --weather-sky-end: oklch(74% 0.013 129);
  --weather-horizon: oklch(66% 0.025 138 / 34%);
  --weather-detail: oklch(92% 0.01 110 / 48%);
  --weather-detail-size: 18rem;
}

.weather-atmosphere[data-atmosphere='fog-haze'] {
  --weather-sky-start: oklch(88% 0.018 98);
  --weather-sky-end: oklch(77% 0.018 116);
  --weather-horizon: oklch(70% 0.026 122 / 34%);
  --weather-detail: oklch(94% 0.01 102 / 58%);
  --weather-detail-size: 20rem;
}

.weather-atmosphere[data-atmosphere='rain'] {
  --weather-sky-start: oklch(68% 0.018 177);
  --weather-sky-end: oklch(50% 0.022 199);
  --weather-horizon: oklch(55% 0.038 146 / 30%);
  --weather-detail: oklch(88% 0.014 180 / 22%);
  --weather-detail-size: 17rem;
}

.weather-atmosphere[data-atmosphere='snow'] {
  --weather-sky-start: oklch(93% 0.01 115);
  --weather-sky-end: oklch(82% 0.012 148);
  --weather-horizon: oklch(72% 0.028 143 / 32%);
  --weather-detail: oklch(99% 0.004 106 / 74%);
  --weather-detail-size: 19rem;
}

.weather-atmosphere[data-atmosphere='thunderstorm'] {
  --weather-sky-start: oklch(37% 0.028 236);
  --weather-sky-end: oklch(24% 0.025 244);
  --weather-horizon: oklch(54% 0.046 145 / 28%);
  --weather-detail: oklch(86% 0.018 102 / 16%);
  --weather-detail-size: 16rem;
}

.weather-atmosphere[data-atmosphere='neutral'] {
  --weather-sky-start: var(--color-surface-raised);
  --weather-sky-end: var(--color-surface);
  --weather-horizon: color-mix(in oklch, var(--color-accent) 13%, transparent);
  --weather-detail: color-mix(in oklch, var(--color-accent) 14%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .weather-atmosphere,
  .weather-atmosphere__wash,
  .weather-atmosphere__horizon,
  .weather-atmosphere__detail {
    transition: none;
  }
}
</style>
