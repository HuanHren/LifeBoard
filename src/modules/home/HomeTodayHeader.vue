<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useI18n } from '@/i18n/useI18n'
import type { CountdownSummaryItem } from '@/modules/home/composables/useHomeDashboard'

interface Props {
  localToday: string
  todayTaskCount: number
  nextCountdown: CountdownSummaryItem | null
}

const props = defineProps<Props>()
const { t, formatDate, formatNumber } = useI18n()

const todayDate = computed(() => new Date(`${props.localToday}T12:00:00`))
const statusText = computed(() => {
  if (props.todayTaskCount > 0) {
    return t('home.today.statusWithTasks', {
      count: formatNumber(props.todayTaskCount),
    })
  }

  if (props.nextCountdown) {
    if (props.nextCountdown.state === 'today') return t('home.today.statusCountdownToday')
    return t('home.today.statusCountdownSoon', {
      count: formatNumber(Math.max(0, props.nextCountdown.days)),
    })
  }

  return t('home.today.statusClear')
})
</script>

<template>
  <section class="home-today-header" aria-labelledby="home-title">
    <div class="min-w-0">
      <p class="text-caption font-semibold text-[var(--color-accent-text)]">
        {{ t('home.today.eyebrow') }}
      </p>
      <h1 id="home-title" class="mt-2 text-page-title text-[var(--color-text-primary)]">
        {{ t('home.today.title') }}
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
        {{ statusText }}
      </p>
      <p class="mt-2 text-caption text-[var(--color-text-tertiary)]">
        <time :datetime="localToday">
          {{
            formatDate(todayDate, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })
          }}
        </time>
      </p>
    </div>

    <div class="home-today-header__actions" :aria-label="t('home.today.primaryActionsLabel')">
      <RouterLink
        class="interactive-surface inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-accent-hover)]"
        :to="{ name: 'todos' }"
      >
        <BaseIcon name="todos" size="sm" />
        {{ t('home.today.primaryAction') }}
      </RouterLink>
      <RouterLink
        class="interactive-surface inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-interactive)]"
        :to="{ name: 'weather' }"
      >
        <BaseIcon name="weather" size="sm" />
        {{ t('home.today.secondaryAction') }}
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.home-today-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: end;
  padding-block: 0.25rem 0.5rem;
}

.home-today-header__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 767px) {
  .home-today-header {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .home-today-header__actions {
    justify-content: flex-start;
  }
}
</style>
