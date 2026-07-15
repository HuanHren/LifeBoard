import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import type { AppLocale } from '@/i18n/types'
import { reverseGeocodeCurrentCoordinates } from '@/modules/weather/services/bigDataCloudReverseGeocoder'
import {
  createConfirmedXiaomiCurrentLocation,
  resolveXiaomiCurrentLocation,
} from '@/modules/weather/services/xiaomiCurrentLocationResolver'
import { weatherProviderRuntime } from '@/modules/weather/providers/weatherProviderRuntime'
import { useWeatherStore } from '@/modules/weather/stores/weather'
import type {
  CurrentCoordinates,
  CurrentLocationResolutionErrorCode,
  RankedXiaomiLocationCandidate,
} from '@/modules/weather/types/currentLocationResolution'

export type CurrentLocationDialogMode = 'consent' | 'resolving' | 'candidates' | 'error'
export type CurrentLocationWorkflowStatus =
  | 'idle'
  | 'locating'
  | 'awaiting-consent'
  | 'resolving'
  | 'awaiting-confirmation'
  | 'confirming'

export interface UseCurrentLocationWeatherOptions {
  locale: { value: AppLocale }
  fallbackName: () => string
  onSelected?: () => void | Promise<void>
  onManualSearch?: () => void | Promise<void>
}

export interface CurrentLocationWorkflowDependencies {
  getCurrentPosition: () => Promise<GeolocationPosition>
  resolve: typeof resolveXiaomiCurrentLocation
}

function defaultGetCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 10000,
    })
  })
}

function isLocationSecureContext() {
  return window.isSecureContext
    || window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
}

function geolocationErrorCode(error: unknown): CurrentLocationResolutionErrorCode {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if (error.code === 1) return 'permission-denied'
    if (error.code === 3) return 'geolocation-timeout'
  }
  return 'position-unavailable'
}

function resolutionErrorCode(error: unknown): CurrentLocationResolutionErrorCode {
  const knownCodes = new Set<CurrentLocationResolutionErrorCode>([
    'permission-denied',
    'position-unavailable',
    'geolocation-timeout',
    'reverse-network',
    'reverse-http',
    'reverse-contract',
    'outside-xiaomi-region',
    'xiaomi-no-candidate',
    'xiaomi-ambiguous',
    'aborted',
  ])
  if (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof error.code === 'string'
  ) {
    const code = error.code as CurrentLocationResolutionErrorCode
    if (knownCodes.has(code)) return code
  }
  if (error instanceof DOMException && error.name === 'AbortError') return 'aborted'
  return 'reverse-network'
}

export function useCurrentLocationWeather(
  options: UseCurrentLocationWeatherOptions,
  dependencies: CurrentLocationWorkflowDependencies = {
    getCurrentPosition: defaultGetCurrentPosition,
    resolve: resolveXiaomiCurrentLocation,
  },
) {
  const weatherStore = useWeatherStore()
  const status = shallowRef<CurrentLocationWorkflowStatus>('idle')
  const dialogMode = shallowRef<CurrentLocationDialogMode | null>(null)
  const candidates = shallowRef<RankedXiaomiLocationCandidate[]>([])
  const selectedCandidateIndex = shallowRef<number | null>(null)
  const errorCode = shallowRef<CurrentLocationResolutionErrorCode | null>(null)
  const pendingCoordinates = shallowRef<CurrentCoordinates | null>(null)
  let activeToken = 0
  let resolutionController: AbortController | null = null

  const dialogOpen = computed(() => dialogMode.value !== null)
  const isBusy = computed(() => status.value === 'locating'
    || status.value === 'resolving'
    || status.value === 'confirming')

  function invalidateActiveRequest() {
    activeToken += 1
    resolutionController?.abort()
    resolutionController = null
  }

  function resetDialogState() {
    dialogMode.value = null
    candidates.value = []
    selectedCandidateIndex.value = null
    pendingCoordinates.value = null
    status.value = 'idle'
  }

  function cancel() {
    invalidateActiveRequest()
    errorCode.value = null
    resetDialogState()
  }

  async function commitUnresolvedCoordinates(coordinates: CurrentCoordinates) {
    await weatherStore.selectUnresolvedCurrentCoordinates({
      ...coordinates,
      fallbackName: options.fallbackName(),
    })
  }

  async function requestCurrentLocation() {
    invalidateActiveRequest()
    const token = activeToken
    errorCode.value = null
    candidates.value = []
    selectedCandidateIndex.value = null
    dialogMode.value = null

    if (
      typeof window === 'undefined'
      || typeof navigator === 'undefined'
      || typeof navigator.geolocation?.getCurrentPosition !== 'function'
    ) {
      errorCode.value = 'position-unavailable'
      return false
    }
    if (!isLocationSecureContext()) {
      errorCode.value = 'position-unavailable'
      return false
    }

    status.value = 'locating'
    try {
      const position = await dependencies.getCurrentPosition()
      if (token !== activeToken) return false
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
      pendingCoordinates.value = coordinates

      const shouldResolveXiaomi = weatherStore.xiaomiWeatherEnabled
        && weatherStore.provider === 'xiaomi'
        && options.locale.value === 'zh-CN'
      if (shouldResolveXiaomi) {
        status.value = 'awaiting-consent'
        dialogMode.value = 'consent'
        return true
      }

      const selected = await weatherStore.selectCurrentCoordinates({
        ...coordinates,
        locale: options.locale.value,
        fallbackName: options.fallbackName(),
      })
      if (token !== activeToken) return false
      status.value = 'idle'
      pendingCoordinates.value = null
      if (selected) await options.onSelected?.()
      return selected
    } catch (error) {
      if (token !== activeToken) return false
      errorCode.value = geolocationErrorCode(error)
      status.value = 'idle'
      return false
    }
  }

  async function continueResolution() {
    const coordinates = pendingCoordinates.value
    if (!coordinates || dialogMode.value !== 'consent') return false

    invalidateActiveRequest()
    const token = activeToken
    resolutionController = new AbortController()
    status.value = 'resolving'
    dialogMode.value = 'resolving'
    errorCode.value = null

    try {
      const result = await dependencies.resolve(
        coordinates,
        {
          reverseGeocode: reverseGeocodeCurrentCoordinates,
          searchXiaomi: weatherProviderRuntime.searchXiaomi,
        },
        resolutionController.signal,
      )
      if (
        token !== activeToken
        || weatherStore.provider !== 'xiaomi'
        || options.locale.value !== 'zh-CN'
      ) return false

      candidates.value = result.candidates
      selectedCandidateIndex.value = null
      status.value = 'awaiting-confirmation'
      dialogMode.value = 'candidates'
      return true
    } catch (error) {
      if (token !== activeToken) return false
      const code = resolutionErrorCode(error)
      if (code === 'aborted') return false
      await commitUnresolvedCoordinates(coordinates)
      if (token !== activeToken) return false
      errorCode.value = code
      status.value = 'idle'
      dialogMode.value = 'error'
      return false
    } finally {
      if (token === activeToken) resolutionController = null
    }
  }

  async function confirmCandidate() {
    const coordinates = pendingCoordinates.value
    const index = selectedCandidateIndex.value
    if (
      !coordinates
      || index === null
      || !candidates.value[index]
      || weatherStore.provider !== 'xiaomi'
      || options.locale.value !== 'zh-CN'
    ) return false

    const token = activeToken
    status.value = 'confirming'
    const location = createConfirmedXiaomiCurrentLocation(
      candidates.value[index].location,
      coordinates,
    )
    const selected = await weatherStore.selectLocation(location)
    if (token !== activeToken) return false
    if (!selected) {
      errorCode.value = 'position-unavailable'
      status.value = 'awaiting-confirmation'
      return false
    }

    resetDialogState()
    await options.onSelected?.()
    return true
  }

  function selectCandidate(index: number) {
    if (Number.isInteger(index) && index >= 0 && index < candidates.value.length) {
      selectedCandidateIndex.value = index
    }
  }

  async function chooseOtherLocation() {
    cancel()
    await options.onManualSearch?.()
  }

  watch(
    [() => weatherStore.provider, () => options.locale.value],
    () => {
      if (dialogOpen.value || isBusy.value) cancel()
    },
  )

  onBeforeUnmount(cancel)

  return {
    status,
    dialogMode,
    dialogOpen,
    isBusy,
    candidates,
    selectedCandidateIndex,
    errorCode,
    requestCurrentLocation,
    continueResolution,
    confirmCandidate,
    selectCandidate,
    chooseOtherLocation,
    cancel,
  }
}
