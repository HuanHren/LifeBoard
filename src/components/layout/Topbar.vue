<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import ThemeToggle from '@/components/base/ThemeToggle.vue'
import { useI18n } from '@/i18n/useI18n'

const { formatDate } = useI18n()
const now = shallowRef(new Date())
let rolloverTimer: ReturnType<typeof window.setTimeout> | null = null

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
  <header
    class="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--color-background)]/95 backdrop-blur-sm safe-top"
  >
    <div class="mx-auto flex min-h-14 w-full max-w-[var(--content-wide-max-width)] items-center justify-between gap-4 px-[var(--page-inline)] py-2">
      <div class="min-w-0">
        <p class="truncate text-caption font-medium text-[var(--color-text-tertiary)]">
          LifeBoard
        </p>
        <time
          :datetime="currentDateTime"
          class="block truncate text-sm font-medium text-[var(--color-text-primary)]"
        >
          {{ currentDate }}
        </time>
      </div>
      <ThemeToggle />
    </div>
  </header>
</template>
