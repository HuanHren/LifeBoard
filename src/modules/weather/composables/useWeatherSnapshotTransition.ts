import {
  computed,
  onBeforeUnmount,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import type { WeatherVisualSnapshot } from '@/modules/weather/types/weatherVisualSnapshot'

export type WeatherSnapshotTransitionPhase =
  | 'stable'
  | 'preparing'
  | 'ready'
  | 'crossfading'
  | 'settled'
  | 'failed-with-previous'
  | 'failed-without-previous'
  | 'superseded'

export type WeatherArtworkReadiness = 'loaded' | 'failed' | 'absent' | 'timeout'

const ARTWORK_WAIT_MS = 300
const CROSSFADE_MS = 280
const REDUCED_MOTION_MS = 80

function createMediaRef(query: string) {
  const matches = shallowRef(false)
  let mediaQuery: MediaQueryList | null = null

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    const handleChange = (event: MediaQueryListEvent) => {
      matches.value = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    onBeforeUnmount(() => {
      mediaQuery?.removeEventListener('change', handleChange)
    })
  }

  return matches
}

export function useWeatherSnapshotTransition(
  sourceSnapshot: ComputedRef<WeatherVisualSnapshot>,
) {
  const phase = shallowRef<WeatherSnapshotTransitionPhase>('stable')
  const currentSnapshot = shallowRef<WeatherVisualSnapshot | null>(sourceSnapshot.value)
  const outgoingSnapshot = shallowRef<WeatherVisualSnapshot | null>(null)
  const incomingSnapshot = shallowRef<WeatherVisualSnapshot | null>(null)
  const transitionGeneration = shallowRef(0)
  const committedAnnouncementSnapshot = shallowRef<WeatherVisualSnapshot | null>(null)
  const announcementSerial = shallowRef(0)
  const prefersReducedMotion = createMediaRef('(prefers-reduced-motion: reduce)')
  const forcedColorsActive = createMediaRef('(forced-colors: active)')

  let artworkTimer: number | null = null
  let crossfadeTimer: number | null = null
  let settleTimer: number | null = null
  let disposed = false

  const shouldSwapImmediately = computed(
    () => prefersReducedMotion.value || forcedColorsActive.value,
  )
  const activeSnapshot = computed(
    () => currentSnapshot.value ?? incomingSnapshot.value ?? sourceSnapshot.value,
  )
  const isTransitioning = computed(
    () => phase.value === 'preparing' || phase.value === 'ready' || phase.value === 'crossfading',
  )
  const transitionDuration = computed(() =>
    shouldSwapImmediately.value ? REDUCED_MOTION_MS : CROSSFADE_MS,
  )

  function clearArtworkTimer() {
    if (artworkTimer !== null) {
      window.clearTimeout(artworkTimer)
      artworkTimer = null
    }
  }

  function clearCrossfadeTimer() {
    if (crossfadeTimer !== null) {
      window.clearTimeout(crossfadeTimer)
      crossfadeTimer = null
    }
  }

  function clearSettleTimer() {
    if (settleTimer !== null) {
      window.clearTimeout(settleTimer)
      settleTimer = null
    }
  }

  function clearTimers() {
    clearArtworkTimer()
    clearCrossfadeTimer()
    clearSettleTimer()
  }

  function scheduleStablePhase(generation: number, expectedPhase: WeatherSnapshotTransitionPhase) {
    clearSettleTimer()

    settleTimer = window.setTimeout(() => {
      settleTimer = null

      if (
        disposed ||
        generation !== transitionGeneration.value ||
        phase.value !== expectedPhase
      ) {
        return
      }

      phase.value = 'stable'
    }, 0)
  }

  function announceCommittedSnapshot(snapshot: WeatherVisualSnapshot) {
    committedAnnouncementSnapshot.value = snapshot
    announcementSerial.value += 1
  }

  function settleIncoming(generation: number, shouldAnnounce: boolean) {
    if (generation !== transitionGeneration.value || !incomingSnapshot.value) {
      return
    }

    const nextSnapshot = incomingSnapshot.value
    currentSnapshot.value = nextSnapshot
    outgoingSnapshot.value = null
    incomingSnapshot.value = null
    phase.value = 'settled'
    clearTimers()

    if (shouldAnnounce) {
      announceCommittedSnapshot(nextSnapshot)
    }

    scheduleStablePhase(generation, 'settled')
  }

  function beginCrossfade(generation: number, readiness: WeatherArtworkReadiness) {
    if (
      generation !== transitionGeneration.value ||
      !incomingSnapshot.value ||
      phase.value !== 'preparing'
    ) {
      return
    }

    clearArtworkTimer()
    phase.value = 'ready'

    if (shouldSwapImmediately.value) {
      crossfadeTimer = window.setTimeout(() => {
        settleIncoming(generation, true)
      }, REDUCED_MOTION_MS)
      return
    }

    phase.value = 'crossfading'
    crossfadeTimer = window.setTimeout(() => {
      settleIncoming(generation, true)
    }, CROSSFADE_MS)

    void readiness
  }

  function startTransition(nextSnapshot: WeatherVisualSnapshot) {
    if (
      incomingSnapshot.value?.identity === nextSnapshot.identity &&
      (
        phase.value === 'preparing' ||
        phase.value === 'ready' ||
        phase.value === 'crossfading'
      )
    ) {
      incomingSnapshot.value = nextSnapshot
      return
    }

    const previousSnapshot = currentSnapshot.value
    transitionGeneration.value += 1
    const generation = transitionGeneration.value
    clearTimers()

    if (!previousSnapshot) {
      currentSnapshot.value = nextSnapshot
      outgoingSnapshot.value = null
      incomingSnapshot.value = null
      phase.value = 'stable'
      return
    }

    if (previousSnapshot.identity === nextSnapshot.identity) {
      currentSnapshot.value = nextSnapshot
      phase.value = 'stable'
      outgoingSnapshot.value = null
      incomingSnapshot.value = null
      return
    }

    outgoingSnapshot.value = previousSnapshot
    incomingSnapshot.value = nextSnapshot
    phase.value = 'preparing'

    if (shouldSwapImmediately.value) {
      settleIncoming(generation, true)
      return
    }

    artworkTimer = window.setTimeout(() => {
      beginCrossfade(generation, 'timeout')
    }, ARTWORK_WAIT_MS)
  }

  function markIncomingArtworkReady(readiness: WeatherArtworkReadiness) {
    if (phase.value !== 'preparing') {
      return
    }

    beginCrossfade(transitionGeneration.value, readiness)
  }

  function cancelTransition() {
    transitionGeneration.value += 1
    clearTimers()
    incomingSnapshot.value = null
    outgoingSnapshot.value = null
    phase.value = currentSnapshot.value ? 'superseded' : 'failed-without-previous'

    scheduleStablePhase(transitionGeneration.value, 'superseded')
  }

  watch(
    sourceSnapshot,
    (nextSnapshot) => {
      startTransition(nextSnapshot)
    },
    { flush: 'post' },
  )

  watch(
    shouldSwapImmediately,
    (shouldSettle) => {
      if (shouldSettle && incomingSnapshot.value) {
        settleIncoming(transitionGeneration.value, true)
      }
    },
  )

  onBeforeUnmount(() => {
    disposed = true
    clearTimers()
  })

  return {
    activeSnapshot,
    currentSnapshot: currentSnapshot as Ref<WeatherVisualSnapshot | null>,
    outgoingSnapshot: outgoingSnapshot as Ref<WeatherVisualSnapshot | null>,
    incomingSnapshot: incomingSnapshot as Ref<WeatherVisualSnapshot | null>,
    phase,
    transitionGeneration,
    committedAnnouncementSnapshot,
    announcementSerial,
    prefersReducedMotion,
    forcedColorsActive,
    shouldSwapImmediately,
    isTransitioning,
    transitionDuration,
    markIncomingArtworkReady,
    cancelTransition,
  }
}
