<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageLayout from '@/components/base/PageLayout.vue'
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

onMounted(() => {
  dashboard.initializeHomeDashboard()
})
</script>

<template>
  <PageLayout variant="wide" gap="md">
    <HomeTodayHeader
      :local-today="dashboard.localToday.value"
      :next-countdown="nextCountdown"
      :today-task-count="dashboard.todayFocusTasks.value.length + dashboard.todayTaskOverflowCount.value"
    />

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
.home-workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(20rem, 0.85fr);
  gap: 1.25rem;
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

  .home-workspace-grid__side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .home-workspace-grid,
  .home-workspace-grid__side {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
