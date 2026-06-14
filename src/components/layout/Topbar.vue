<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/base/ThemeToggle.vue'

const route = useRoute()
const now = shallowRef(new Date())
let rolloverTimer: ReturnType<typeof window.setTimeout> | null = null

const pageTitle = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : 'LifeBoard'))
const currentDate = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now.value),
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
    class="sticky top-0 z-20 border-b border-[var(--color-border-soft)] bg-[var(--color-canvas)] safe-top"
  >
    <div class="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-[var(--color-text-primary)]">{{ pageTitle }}</p>
        <time
          :datetime="currentDateTime"
          class="mt-0.5 block truncate text-caption text-[var(--color-text-secondary)]"
        >
          {{ currentDate }}
        </time>
      </div>
      <ThemeToggle />
    </div>
  </header>
</template>
