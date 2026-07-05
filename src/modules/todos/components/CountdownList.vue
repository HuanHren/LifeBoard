<script setup lang="ts">
import CountdownItem from '@/modules/todos/components/CountdownItem.vue'
import type { Countdown } from '@/modules/todos/types/todos'

interface Props {
  countdowns: Countdown[]
  today: string
}

defineProps<Props>()
</script>

<template>
  <ul class="countdown-list divide-y divide-[var(--color-border-soft)]">
    <CountdownItem
      v-for="countdown in countdowns"
      :key="countdown.id"
      :countdown="countdown"
      :today="today"
    />
  </ul>
</template>

<style scoped>
.countdown-list {
  border-radius: var(--radius-md);
}
</style>
