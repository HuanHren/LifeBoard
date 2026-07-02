<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import { useI18n } from '@/i18n/useI18n'
import { landingNavigationItems } from '@/shared/constants/navigation'

const { t } = useI18n()
const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const menuPanel = ref<HTMLElement | null>(null)

function closeMenu() {
  menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function focusableMenuElements() {
  if (!menuPanel.value) return []

  return Array.from(
    menuPanel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = focusableMenuElements()
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

watch(menuOpen, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''

  if (isOpen) {
    await nextTick()
    focusableMenuElements()[0]?.focus()
  } else {
    menuButton.value?.focus()
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="landing-nav safe-top">
    <div class="landing-nav__inner">
      <RouterLink
        :to="{ name: 'landing' }"
        class="interactive-surface landing-nav__brand"
        aria-label="LifeBoard"
      >
        <span class="landing-nav__brand-mark" aria-hidden="true">LB</span>
        <span>LifeBoard</span>
      </RouterLink>

      <nav class="landing-nav__links" :aria-label="t('shell.landing.primaryLabel')">
        <RouterLink
          v-for="item in landingNavigationItems"
          :key="item.key"
          :to="item.to"
          class="interactive-surface landing-nav__link"
        >
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <div class="landing-nav__actions">
        <ThemeToggle />
        <RouterLink
          :to="{ name: 'workspace' }"
          class="interactive-surface landing-nav__cta"
        >
          {{ t('landing.cta.enterWorkspace') }}
        </RouterLink>
        <button
          ref="menuButton"
          class="interactive-surface landing-nav__menu-button"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="landing-mobile-menu"
          :aria-label="t('shell.landing.openMenu')"
          @click="toggleMenu"
        >
          <BaseIcon v-if="menuOpen" name="close" size="sm" />
          <span v-else class="landing-nav__menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="menuOpen"
      class="mobile-menu-overlay"
      role="presentation"
      @click="closeMenu"
    />
    <section
      v-if="menuOpen"
      id="landing-mobile-menu"
      ref="menuPanel"
      class="mobile-menu-panel safe-bottom"
      role="dialog"
      aria-modal="true"
      :aria-label="t('shell.landing.menuLabel')"
      @keydown="handleMenuKeydown"
    >
      <div class="mobile-menu-panel__header">
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">LifeBoard</p>
        <button
          class="interactive-surface mobile-menu-panel__close"
          type="button"
          :aria-label="t('shell.landing.closeMenu')"
          @click="closeMenu"
        >
          <BaseIcon name="close" size="sm" />
        </button>
      </div>
      <nav class="mobile-menu-panel__links" :aria-label="t('shell.landing.menuLabel')">
        <RouterLink
          :to="{ name: 'workspace' }"
          class="interactive-surface mobile-menu-panel__primary"
          @click="closeMenu"
        >
          {{ t('landing.cta.enterWorkspace') }}
        </RouterLink>
        <RouterLink
          v-for="item in landingNavigationItems"
          :key="item.key"
          :to="item.to"
          class="interactive-surface mobile-menu-panel__link"
          @click="closeMenu"
        >
          <BaseIcon :name="item.icon" size="sm" />
          <span>{{ t(item.labelKey) }}</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'settings' }"
          class="interactive-surface mobile-menu-panel__link"
          @click="closeMenu"
        >
          <BaseIcon name="settings" size="sm" />
          <span>{{ t('navigation.settings.label') }}</span>
        </RouterLink>
      </nav>
    </section>
  </header>
</template>
