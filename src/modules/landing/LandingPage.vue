<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useI18n } from '@/i18n/useI18n'
import { landingNavigationItems } from '@/shared/constants/navigation'

const { t } = useI18n()
</script>

<template>
  <section class="landing-hero" aria-labelledby="landing-title">
    <div class="landing-hero__copy">
      <p class="landing-hero__kicker">{{ t('landing.hero.kicker') }}</p>
      <h1 id="landing-title" class="landing-hero__title">
        {{ t('landing.hero.title') }}
      </h1>
      <p class="landing-hero__description">
        {{ t('landing.hero.description') }}
      </p>
      <div class="landing-hero__actions">
        <RouterLink
          :to="{ name: 'workspace' }"
          class="interactive-surface landing-hero__primary"
        >
          {{ t('landing.cta.enterWorkspace') }}
        </RouterLink>
        <a class="interactive-surface landing-hero__secondary" href="#landing-entry-points">
          {{ t('landing.cta.explore') }}
        </a>
      </div>
    </div>

    <div class="landing-hero__panel" aria-hidden="true">
      <div class="landing-hero__panel-header">
        <span />
        <span />
        <span />
      </div>
      <div class="landing-hero__weather">
        <span>Weather</span>
        <strong>24°C</strong>
      </div>
      <div class="landing-hero__rows">
        <span />
        <span />
        <span />
      </div>
    </div>
  </section>

  <section
    id="landing-entry-points"
    class="landing-entry"
    aria-labelledby="landing-entry-title"
  >
    <div class="landing-entry__header">
      <h2 id="landing-entry-title" class="text-section-title text-[var(--color-text-primary)]">
        {{ t('landing.entry.title') }}
      </h2>
      <p>{{ t('landing.entry.description') }}</p>
    </div>

    <div class="landing-entry__grid">
      <RouterLink
        v-for="item in landingNavigationItems"
        :key="item.key"
        :to="item.to"
        class="interactive-surface landing-entry__item"
      >
        <span class="landing-entry__icon" aria-hidden="true">
          <BaseIcon :name="item.icon" />
        </span>
        <span>
          <span class="landing-entry__title">{{ t(item.labelKey) }}</span>
          <span class="landing-entry__description">{{ t(item.descriptionKey) }}</span>
        </span>
      </RouterLink>
    </div>
  </section>
</template>
