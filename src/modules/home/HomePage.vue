<script setup lang="ts">
import HomeBookmarksSummary from '@/modules/home/HomeBookmarksSummary.vue'
import HomeModuleLink from '@/modules/home/HomeModuleLink.vue'
import HomeToolsSummary from '@/modules/home/HomeToolsSummary.vue'
import HomeTodosSummary from '@/modules/home/HomeTodosSummary.vue'
import HomeWeatherSummary from '@/modules/home/HomeWeatherSummary.vue'
import { navigationItems } from '@/shared/constants/navigation'

const moduleCopy: Record<string, string> = {
  Settings: 'Choose appearance now, with more workspace preferences added later.',
}

const moduleItems = navigationItems
  .filter((item) => item.label === 'Settings')
  .map((item) => ({
    ...item,
    homeDescription: moduleCopy[item.label],
  }))
</script>

<template>
  <div class="space-y-12">
    <section
      class="grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-accent-wash)] shadow-[var(--shadow-soft)] lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)]"
      aria-labelledby="home-title"
    >
      <div class="px-6 py-9 sm:px-8 sm:py-12">
        <h1 id="home-title" class="text-page-title max-w-xl text-[var(--color-text-primary)]">
          Your day, in one place.
        </h1>
        <p class="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
          Start with local weather, saved plans, private tools, and useful references.
        </p>
      </div>
      <div
        class="border-t border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-6 py-7 sm:px-8 lg:border-t-0 lg:border-l"
      >
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">Useful, without pretense</p>
        <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Weather follows your selected city. Todos and countdowns reflect what you save locally,
          Tools keeps private input off Home, and Bookmarks shows only the references you save.
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
          Workspace settings
        </h2>
        <p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Appearance is available now. Broader workspace preferences remain clearly marked while
          they are still being built.
        </p>
      </div>

      <div class="mt-6 max-w-2xl">
        <HomeModuleLink
          v-for="item in moduleItems"
          :key="item.label"
          :description="item.homeDescription"
          :marker="item.marker"
          :title="item.label"
          :to="item.to"
        />
      </div>
    </section>
  </div>
</template>
