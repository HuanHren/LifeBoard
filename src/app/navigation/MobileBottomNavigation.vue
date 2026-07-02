<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useI18n } from '@/i18n/useI18n'
import {
  appMobileMoreNavigationItems,
  appMobilePrimaryNavigationItems,
  getNavigationKey,
  isMobileMoreNavigationKey,
} from '@/shared/constants/navigation'

const { t } = useI18n()
const route = useRoute()
const moreOpen = ref(false)
const moreButton = ref<HTMLButtonElement | null>(null)
const morePanel = ref<HTMLElement | null>(null)

const activeNavigationKey = computed(() => getNavigationKey(route.meta.navigationKey))
const isMoreActive = computed(() => isMobileMoreNavigationKey(activeNavigationKey.value))

function closeMore() {
  moreOpen.value = false
}

function toggleMore() {
  moreOpen.value = !moreOpen.value
}

function focusableMoreElements() {
  if (!morePanel.value) return []

  return Array.from(
    morePanel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function handleMoreKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMore()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = focusableMoreElements()
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(moreOpen, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''

  if (isOpen) {
    await nextTick()
    focusableMoreElements()[0]?.focus()
  } else {
    moreButton.value?.focus()
  }
})

watch(
  () => route.fullPath,
  () => {
    closeMore()
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <nav class="mobile-bottom-nav safe-bottom" :aria-label="t('shell.mobile.primaryLabel')">
    <div class="mobile-bottom-nav__grid">
      <RouterLink
        v-for="item in appMobilePrimaryNavigationItems"
        :key="item.key"
        :to="item.to"
        class="interactive-surface mobile-bottom-nav__item"
        :class="{ 'is-active': activeNavigationKey === item.key }"
        :aria-current="activeNavigationKey === item.key ? 'page' : undefined"
      >
        <span class="mobile-bottom-nav__indicator" aria-hidden="true" />
        <BaseIcon :name="item.icon" size="sm" />
        <span>{{ t(item.labelKey) }}</span>
      </RouterLink>

      <button
        ref="moreButton"
        class="interactive-surface mobile-bottom-nav__item"
        :class="{ 'is-active': isMoreActive || moreOpen }"
        type="button"
        :aria-current="isMoreActive ? 'page' : undefined"
        :aria-expanded="moreOpen"
        aria-controls="app-mobile-more"
        @click="toggleMore"
      >
        <span class="mobile-bottom-nav__indicator" aria-hidden="true" />
        <span class="mobile-bottom-nav__more-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>{{ t('navigation.more.label') }}</span>
      </button>
    </div>
  </nav>

  <div
    v-if="moreOpen"
    class="mobile-menu-overlay mobile-menu-overlay--app"
    role="presentation"
    @click="closeMore"
  />
  <section
    v-if="moreOpen"
    id="app-mobile-more"
    ref="morePanel"
    class="mobile-menu-panel mobile-menu-panel--bottom safe-bottom"
    role="dialog"
    aria-modal="true"
    :aria-label="t('navigation.more.label')"
    @keydown="handleMoreKeydown"
  >
    <div class="mobile-menu-panel__header">
      <p class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('navigation.more.label') }}
      </p>
      <button
        class="interactive-surface mobile-menu-panel__close"
        type="button"
        :aria-label="t('shell.landing.closeMenu')"
        @click="closeMore"
      >
        <BaseIcon name="close" size="sm" />
      </button>
    </div>
    <nav class="mobile-menu-panel__links" :aria-label="t('navigation.more.label')">
      <RouterLink
        v-for="item in appMobileMoreNavigationItems"
        :key="item.key"
        :to="item.to"
        class="interactive-surface mobile-menu-panel__link"
        :class="{ 'is-active': activeNavigationKey === item.key }"
        :aria-current="activeNavigationKey === item.key ? 'page' : undefined"
        @click="closeMore"
      >
        <BaseIcon :name="item.icon" size="sm" />
        <span>{{ t(item.labelKey) }}</span>
      </RouterLink>
      <RouterLink
        :to="{ name: 'settings' }"
        class="interactive-surface mobile-menu-panel__link"
        @click="closeMore"
      >
        <span class="mobile-menu-panel__text-icon" aria-hidden="true">Aa</span>
        <span>{{ t('navigation.more.appearanceLanguage') }}</span>
      </RouterLink>
      <RouterLink
        :to="{ name: 'settings-data-sources' }"
        class="interactive-surface mobile-menu-panel__link"
        @click="closeMore"
      >
        <BaseIcon name="weather" size="sm" />
        <span>{{ t('navigation.more.dataManagement') }}</span>
      </RouterLink>
      <RouterLink
        :to="{ name: 'landing' }"
        class="interactive-surface mobile-menu-panel__link"
        @click="closeMore"
      >
        <span class="mobile-menu-panel__text-icon" aria-hidden="true">LB</span>
        <span>{{ t('navigation.more.about') }}</span>
      </RouterLink>
    </nav>
  </section>
</template>
