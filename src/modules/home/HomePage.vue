<script setup lang="ts">
import PageLayout from '@/components/base/PageLayout.vue'
import HomeBookmarksSummary from '@/modules/home/HomeBookmarksSummary.vue'
import HomeModuleLink from '@/modules/home/HomeModuleLink.vue'
import HomeToolsSummary from '@/modules/home/HomeToolsSummary.vue'
import HomeTodosSummary from '@/modules/home/HomeTodosSummary.vue'
import HomeWeatherSummary from '@/modules/home/HomeWeatherSummary.vue'
import { useI18n } from '@/i18n/useI18n'
import { navigationItems } from '@/shared/constants/navigation'

const { t } = useI18n()

const moduleItems = navigationItems
  .filter((item) => item.labelKey === 'navigation.settings.label')
  .map((item) => ({
    ...item,
    homeDescriptionKey: 'home.settings.cardDescription' as const,
  }))
</script>

<template>
  <PageLayout>
    <section
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-accent-wash)] shadow-[var(--shadow-soft)] lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)]"
      aria-labelledby="home-title"
    >
      <div class="px-6 py-9 sm:px-8 sm:py-12">
        <h1 id="home-title" class="text-page-title max-w-xl text-[var(--color-text-primary)]">
          {{ t('home.hero.title') }}
        </h1>
        <p class="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
          {{ t('home.hero.description') }}
        </p>
      </div>
      <div
        class="border-t border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-6 py-7 sm:px-8 lg:border-t-0 lg:border-l"
      >
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('home.hero.contextTitle') }}
        </p>
        <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ t('home.hero.contextDescription') }}
        </p>
      </div>
    </section>

    <HomeWeatherSummary />

    <HomeTodosSummary />

    <HomeToolsSummary />

    <HomeBookmarksSummary />

    <section aria-labelledby="modules-title">
      <div class="max-w-2xl">
        <h2 id="modules-title" class="text-section-title text-[var(--color-text-primary)]">
          {{ t('home.settings.title') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {{ t('home.settings.description') }}
        </p>
      </div>

      <div class="mt-6 max-w-2xl">
        <HomeModuleLink
          v-for="item in moduleItems"
          :key="item.labelKey"
          :description="t(item.homeDescriptionKey)"
          :icon="item.icon"
          :title="t(item.labelKey)"
          :to="item.to"
          :action-label="t('home.settings.action')"
          :status-label="t('home.settings.status')"
        />
      </div>
    </section>
  </PageLayout>
</template>
