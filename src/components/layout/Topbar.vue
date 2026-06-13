<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/base/ThemeToggle.vue'

const route = useRoute()

const pageTitle = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : 'LifeBoard'))
const now = new Date()
const currentDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(now)
const currentDateTime = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')
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
