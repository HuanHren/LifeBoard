<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageLayout from '@/components/base/PageLayout.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSurface from '@/components/base/BaseSurface.vue'
import StatCard from '@/components/base/StatCard.vue'
import type { BaseIconName } from '@/components/base/BaseIcon.vue'
import HomeNextUp from '@/modules/home/HomeNextUp.vue'
import HomeQuickAccess from '@/modules/home/HomeQuickAccess.vue'
import HomeTodayHeader from '@/modules/home/HomeTodayHeader.vue'
import HomeWeatherSummary from '@/modules/home/HomeWeatherSummary.vue'
import TodayFocusPanel from '@/modules/home/TodayFocusPanel.vue'
import { useI18n } from '@/i18n/useI18n'
import { useHomeDashboard } from '@/modules/home/composables/useHomeDashboard'

const { t, formatNumber } = useI18n()
const dashboard = useHomeDashboard()
const nextCountdown = computed(() => dashboard.countdownRows.value[0] ?? null)
const totalTodayTasks = computed(
  () => dashboard.todayFocusTasks.value.length + dashboard.todayTaskOverflowCount.value,
)
const activeCountdownCount = computed(() => dashboard.countdownRows.value.length)
const quickBookmarkCount = computed(() => dashboard.bookmarkRows.value.length)
const weatherReady = computed(() => dashboard.weatherStore.hasWeather)
const statusRailItems = computed<
  {
    key: string
    icon: BaseIconName
    value: string
    label: string
    featured: boolean
  }[]
>(() => [
  {
    key: 'today',
    icon: 'todos',
    value:
      totalTodayTasks.value > 0
        ? formatNumber(totalTodayTasks.value)
        : t('home.workspace.emptyTodayTasks'),
    label: t('home.workspace.todayTasks'),
    featured: true,
  },
  {
    key: 'dates',
    icon: 'check',
    value:
      activeCountdownCount.value > 0
        ? formatNumber(activeCountdownCount.value)
        : t('home.workspace.emptySavedDates'),
    label: t('home.workspace.savedDates'),
    featured: false,
  },
  {
    key: 'weather',
    icon: 'weather',
    value: weatherReady.value ? t('shared.status.connected') : t('home.workspace.weatherNotConnected'),
    label: t('home.workspace.weatherContext'),
    featured: false,
  },
  {
    key: 'references',
    icon: 'bookmarks',
    value:
      quickBookmarkCount.value > 0
        ? formatNumber(quickBookmarkCount.value)
        : t('home.workspace.emptyQuickReferences'),
    label: t('home.workspace.quickReferences'),
    featured: false,
  },
])

onMounted(() => {
  dashboard.initializeHomeDashboard()
})
</script>

<template>
  <PageLayout variant="wide" gap="md">
    <BaseSurface as="section" class="workspace-hero" aria-labelledby="home-title" padding="lg" variant="raised">
      <HomeTodayHeader
        :local-today="dashboard.localToday.value"
        :next-countdown="nextCountdown"
        :today-task-count="totalTodayTasks"
      />

      <dl class="workspace-hero__rail" :aria-label="t('home.workspace.railLabel')">
        <StatCard
          v-for="item in statusRailItems"
          :key="item.key"
          :label="item.label"
          :tone="item.featured ? 'accent' : 'default'"
          :value="item.value"
          :value-kind="item.key === 'today' && totalTodayTasks > 0 ? 'numeric' : 'semantic'"
          as="div"
          class="workspace-metric"
        >
          <template #media>
            <BaseIcon :name="item.icon" size="sm" />
          </template>
        </StatCard>
      </dl>
    </BaseSurface>

    <div class="home-workspace-grid">
      <div class="home-workspace-grid__main" :aria-label="t('home.accessibility.todayWorkspace')">
        <TodayFocusPanel
          :initialized="dashboard.todosInitialized.value"
          :local-today="dashboard.localToday.value"
          :overflow-count="dashboard.todayTaskOverflowCount.value"
          :persistence-error="dashboard.todosPersistenceError.value"
          :tasks="dashboard.todayFocusTasks.value"
          @toggle-task="dashboard.todosStore.toggleTask"
        />

        <HomeNextUp
          :countdowns="dashboard.countdownRows.value"
          :initialized="dashboard.todosInitialized.value"
          :persistence-error="dashboard.todosPersistenceError.value"
          :upcoming-tasks="dashboard.upcomingTaskRows.value"
        />
      </div>

      <aside
        class="home-workspace-grid__side"
        :aria-label="t('home.accessibility.sideWorkspace')"
      >
        <HomeWeatherSummary />
        <HomeQuickAccess
          :bookmarks="dashboard.bookmarkRows.value"
          :bookmarks-error="dashboard.bookmarksPersistenceError.value"
          :bookmarks-initialized="dashboard.bookmarksInitialized.value"
          :tools="dashboard.toolShortcuts.value"
        />
      </aside>
    </div>
  </PageLayout>
</template>

<style scoped>
.workspace-hero {
  display: grid;
  gap: 1rem;
  background:
    radial-gradient(circle at top left, color-mix(in oklch, var(--color-accent-wash) 72%, transparent), transparent 34rem),
    linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface-raised));
}

.workspace-hero__rail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
}

.workspace-metric {
  min-height: 4.25rem;
}

.home-workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.82fr) minmax(21rem, 1fr);
  gap: clamp(1rem, 2vw, 1.5rem);
  align-items: start;
}

.home-workspace-grid__main,
.home-workspace-grid__side {
  display: grid;
  gap: 1.25rem;
}

@media (max-width: 1180px) {
  .home-workspace-grid {
    grid-template-columns: 1fr;
  }

  .workspace-hero__rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-workspace-grid__side {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .home-workspace-grid,
  .home-workspace-grid__side {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  .workspace-hero__rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .workspace-hero {
    border-radius: var(--radius-md);
    margin-inline: calc(var(--page-inline) * -0.25);
    gap: 0.75rem;
  }

  .workspace-metric {
    min-height: 3.45rem;
  }
}
</style>
