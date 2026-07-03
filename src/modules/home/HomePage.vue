<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PageLayout from '@/components/base/PageLayout.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import HomeNextUp from '@/modules/home/HomeNextUp.vue'
import HomeQuickAccess from '@/modules/home/HomeQuickAccess.vue'
import HomeTodayHeader from '@/modules/home/HomeTodayHeader.vue'
import HomeWeatherSummary from '@/modules/home/HomeWeatherSummary.vue'
import TodayFocusPanel from '@/modules/home/TodayFocusPanel.vue'
import { useI18n } from '@/i18n/useI18n'
import { useHomeDashboard } from '@/modules/home/composables/useHomeDashboard'

const { t } = useI18n()
const dashboard = useHomeDashboard()
const nextCountdown = computed(() => dashboard.countdownRows.value[0] ?? null)
const totalTodayTasks = computed(
  () => dashboard.todayFocusTasks.value.length + dashboard.todayTaskOverflowCount.value,
)
const activeCountdownCount = computed(() => dashboard.countdownRows.value.length)
const quickBookmarkCount = computed(() => dashboard.bookmarkRows.value.length)
const weatherReady = computed(() => dashboard.weatherStore.hasWeather)

onMounted(() => {
  dashboard.initializeHomeDashboard()
})
</script>

<template>
  <PageLayout variant="wide" gap="lg">
    <section class="workspace-hero" aria-labelledby="home-title">
      <HomeTodayHeader
        :local-today="dashboard.localToday.value"
        :next-countdown="nextCountdown"
        :today-task-count="totalTodayTasks"
      />

      <div class="workspace-hero__rail" :aria-label="t('home.workspace.railLabel')">
        <RouterLink class="workspace-metric workspace-metric--primary" :to="{ name: 'todos' }">
          <BaseIcon name="todos" size="sm" />
          <span>
            <strong>{{ totalTodayTasks }}</strong>
            <span>{{ t('home.workspace.todayTasks') }}</span>
          </span>
        </RouterLink>
        <RouterLink class="workspace-metric" :to="{ name: 'todos' }">
          <BaseIcon name="check" size="sm" />
          <span>
            <strong>{{ activeCountdownCount }}</strong>
            <span>{{ t('home.workspace.savedDates') }}</span>
          </span>
        </RouterLink>
        <RouterLink class="workspace-metric" :to="{ name: 'weather' }">
          <BaseIcon name="weather" size="sm" />
          <span>
            <strong>{{ weatherReady ? t('shared.status.connected') : t('home.weather.connectTitle') }}</strong>
            <span>{{ t('home.workspace.weatherContext') }}</span>
          </span>
        </RouterLink>
        <RouterLink class="workspace-metric" :to="{ name: 'bookmarks' }">
          <BaseIcon name="bookmarks" size="sm" />
          <span>
            <strong>{{ quickBookmarkCount }}</strong>
            <span>{{ t('home.workspace.quickReferences') }}</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <div class="home-workspace-grid">
      <main class="home-workspace-grid__main" :aria-label="t('home.accessibility.todayWorkspace')">
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
      </main>

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
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at top left, color-mix(in oklch, var(--color-accent-wash) 72%, transparent), transparent 34rem),
    linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface-raised));
  padding: clamp(1rem, 2.4vw, 1.75rem);
}

.workspace-hero__rail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.workspace-metric {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
  min-height: 5rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: color-mix(in oklch, var(--color-surface-raised) 82%, transparent);
  padding: 0.9rem 1rem;
}

.workspace-metric:hover {
  border-color: var(--color-border);
  background: var(--color-surface-interactive);
}

.workspace-metric > svg {
  color: var(--color-accent-text);
}

.workspace-metric strong,
.workspace-metric span span {
  display: block;
  min-width: 0;
}

.workspace-metric strong {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-metric span span {
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  line-height: 1.35;
}

.workspace-metric--primary {
  border-color: color-mix(in oklch, var(--color-accent) 36%, var(--color-border-soft));
  background: var(--color-accent-wash);
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .home-workspace-grid,
  .workspace-hero__rail,
  .home-workspace-grid__side {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .workspace-hero {
    border-radius: var(--radius-md);
    margin-inline: calc(var(--page-inline) * -0.25);
  }
}
</style>
