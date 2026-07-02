<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import { useI18n } from '@/i18n/useI18n'
import {
  appDesktopNavigationItems,
  getNavigationKey,
} from '@/shared/constants/navigation'

const { formatDate, t } = useI18n()
const route = useRoute()
const now = shallowRef(new Date())
let rolloverTimer: ReturnType<typeof window.setTimeout> | null = null

const activeNavigationKey = computed(() => getNavigationKey(route.meta.navigationKey))
const currentDate = computed(() =>
  formatDate(now.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }),
)
const currentDateTime = computed(() => [
  now.value.getFullYear(),
  String(now.value.getMonth() + 1).padStart(2, '0'),
  String(now.value.getDate()).padStart(2, '0'),
].join('-'))

function scheduleDateRollover() {
  const current = new Date()
  const nextDay = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate() + 1,
  )
  const delay = Math.max(1_000, nextDay.getTime() - current.getTime() + 1_000)

  rolloverTimer = window.setTimeout(() => {
    now.value = new Date()
    scheduleDateRollover()
  }, delay)
}

onMounted(scheduleDateRollover)

onUnmounted(() => {
  if (rolloverTimer !== null) {
    window.clearTimeout(rolloverTimer)
  }
})
</script>

<template>
  <header class="app-top-nav safe-top">
    <div class="app-top-nav__inner">
      <RouterLink
        :to="{ name: 'landing' }"
        class="interactive-surface app-top-nav__brand"
        aria-label="LifeBoard"
      >
        <span class="app-top-nav__brand-mark" aria-hidden="true">LB</span>
        <span class="app-top-nav__brand-copy">
          <span class="app-top-nav__brand-title">LifeBoard</span>
          <span class="app-top-nav__brand-subtitle">{{ t('shell.sidebar.tagline') }}</span>
        </span>
      </RouterLink>

      <nav class="app-top-nav__links" :aria-label="t('shell.app.primaryLabel')">
        <RouterLink
          v-for="item in appDesktopNavigationItems"
          :key="item.key"
          :to="item.to"
          class="interactive-surface app-top-nav__link"
          :class="{ 'is-active': activeNavigationKey === item.key }"
          :aria-current="activeNavigationKey === item.key ? 'page' : undefined"
        >
          <BaseIcon :name="item.icon" size="sm" />
          <span>{{ t(item.labelKey) }}</span>
        </RouterLink>
      </nav>

      <div class="app-top-nav__utility">
        <time class="app-top-nav__date" :datetime="currentDateTime">
          {{ currentDate }}
        </time>
        <ThemeToggle />
        <RouterLink
          :to="{ name: 'settings' }"
          class="interactive-surface app-top-nav__settings"
          :aria-label="t('navigation.settings.label')"
          :aria-current="activeNavigationKey === 'settings' ? 'page' : undefined"
        >
          <BaseIcon name="settings" size="sm" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
