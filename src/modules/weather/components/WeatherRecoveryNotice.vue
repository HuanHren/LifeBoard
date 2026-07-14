<script setup lang="ts">
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/i18n/useI18n'
import type {
  WeatherDataFreshness,
  WeatherRecoveryState,
} from '@/modules/weather/services/weatherResilience'
import { formatFullLocalTime } from '@/modules/weather/utils/weatherFormatting'

interface Props {
  dataFreshness: WeatherDataFreshness
  recoveryState: WeatherRecoveryState
  cachedAt?: string | null
  retryAvailableAt?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ retry: [] }>()
const { locale, t } = useI18n()
const now = shallowRef(Date.now())
let retryTimer: ReturnType<typeof globalThis.setTimeout> | null = null

const cachedTime = computed(() => props.cachedAt
  ? formatFullLocalTime(props.cachedAt, locale.value)
  : t('weather.recovery.unknownTime'))
const retryTime = computed(() => props.retryAvailableAt
  ? formatFullLocalTime(props.retryAvailableAt, locale.value)
  : '')
const retryAtMs = computed(() => props.retryAvailableAt ? Date.parse(props.retryAvailableAt) : Number.NaN)
const retryDisabled = computed(() => Number.isFinite(retryAtMs.value) && now.value < retryAtMs.value)
const showRetry = computed(() => (
  props.recoveryState !== 'idle' && props.recoveryState !== 'retrying'
))
const message = computed(() => {
  if (props.recoveryState === 'fallback') return t('weather.recovery.fallback')
  if (props.recoveryState === 'offline') return t('weather.recovery.offline', { time: cachedTime.value })
  if (props.recoveryState === 'rate-limited') {
    return t('weather.recovery.rateLimited', { time: retryTime.value || cachedTime.value })
  }
  if (props.recoveryState === 'retrying') return t('weather.recovery.retrying')
  if (props.recoveryState === 'failed') return t('weather.recovery.refreshFailed', { time: cachedTime.value })
  if (props.dataFreshness === 'fresh-cache') return t('weather.recovery.freshCache', { time: cachedTime.value })
  if (props.dataFreshness === 'stale-cache') return t('weather.recovery.staleCache', { time: cachedTime.value })
  return null
})

function scheduleRetryAvailability(value: string | null | undefined) {
  if (retryTimer !== null) globalThis.clearTimeout(retryTimer)
  retryTimer = null
  const retryAt = value ? Date.parse(value) : Number.NaN
  if (!Number.isFinite(retryAt) || retryAt <= Date.now()) {
    now.value = Date.now()
    return
  }
  retryTimer = globalThis.setTimeout(() => {
    now.value = Date.now()
    retryTimer = null
  }, retryAt - Date.now())
}

watch(() => props.retryAvailableAt, scheduleRetryAvailability, { immediate: true })
onUnmounted(() => {
  if (retryTimer !== null) globalThis.clearTimeout(retryTimer)
})
</script>

<template>
  <aside
    v-if="message"
    class="flex min-w-0 flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between"
    aria-live="polite"
    role="status"
  >
    <p class="min-w-0 text-pretty">
      {{ message }}
    </p>
    <BaseButton
      v-if="showRetry"
      :disabled="retryDisabled"
      size="sm"
      variant="secondary"
      @click="emit('retry')"
    >
      {{ retryDisabled ? t('weather.recovery.retryWaiting') : t('weather.recovery.retry') }}
    </BaseButton>
  </aside>
</template>
