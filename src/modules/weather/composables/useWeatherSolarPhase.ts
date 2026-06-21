import { computed, onBeforeUnmount, shallowRef, watch, type ComputedRef } from 'vue'
import type { WeatherVisualSnapshot } from '@/modules/weather/types/weatherVisualSnapshot'
import type { WeatherSolarPhaseResult } from '@/modules/weather/types/weatherSolarPhase'
import { deriveWeatherSolarPhase } from '@/modules/weather/utils/weatherSolarPhase'

const BOUNDARY_OFFSET_MS = 500
const MIN_RESCHEDULE_MS = 1000
const MAX_RESCHEDULE_MS = 60 * 60 * 1000

export function useWeatherSolarPhase(
  snapshot: ComputedRef<WeatherVisualSnapshot>,
) {
  const phaseResult = shallowRef<WeatherSolarPhaseResult>(snapshot.value.solarPhase)
  let phaseTimer: number | null = null

  const scheduleIdentity = computed(() => [
    snapshot.value.identity,
    snapshot.value.weather.timezone,
    snapshot.value.weather.daily[0]?.date ?? '',
    snapshot.value.weather.daily[0]?.sunrise ?? '',
    snapshot.value.weather.daily[0]?.sunset ?? '',
  ].join('|'))

  function clearPhaseTimer() {
    if (phaseTimer !== null) {
      window.clearTimeout(phaseTimer)
      phaseTimer = null
    }
  }

  function scheduleNextBoundary() {
    clearPhaseTimer()

    if (typeof window === 'undefined') {
      return
    }

    const nextBoundaryAt = phaseResult.value.nextBoundaryAt

    if (nextBoundaryAt === null) {
      return
    }

    const rawDelay = nextBoundaryAt - Date.now() + BOUNDARY_OFFSET_MS
    const delay = Math.min(
      Math.max(rawDelay, MIN_RESCHEDULE_MS),
      MAX_RESCHEDULE_MS,
    )

    phaseTimer = window.setTimeout(() => {
      recomputePhase()
    }, delay)
  }

  function recomputePhase() {
    phaseResult.value = deriveWeatherSolarPhase(snapshot.value.weather)
    scheduleNextBoundary()
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      recomputePhase()
    }
  }

  function handleFocus() {
    recomputePhase()
  }

  watch(
    scheduleIdentity,
    () => {
      recomputePhase()
    },
    { immediate: true },
  )

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus)
  }

  onBeforeUnmount(() => {
    clearPhaseTimer()

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleFocus)
    }
  })

  return {
    phaseResult,
  }
}
