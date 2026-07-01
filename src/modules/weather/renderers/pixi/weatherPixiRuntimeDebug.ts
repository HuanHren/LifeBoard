export interface WeatherSceneRuntimeDebugSnapshot {
  applicationCount: number
  canvasCount: number
  activeSceneCount: number
  tickerCallbackCount: number
  resizeListenerCount: number
  visibilityListenerCount: number
  mediaQueryListenerCount: number
  activeTextureCount: number
  textureCreationCount: number
  sceneBuildCount: number
  sceneDestroyCount: number
  applicationCreateCount: number
  applicationDestroyCount: number
  tickerAddCount: number
  tickerRemoveCount: number
  resizeListenerAddCount: number
  resizeListenerRemoveCount: number
  visibilityListenerAddCount: number
  visibilityListenerRemoveCount: number
  mediaQueryListenerAddCount: number
  mediaQueryListenerRemoveCount: number
  pauseCount: number
  resumeCount: number
  currentSceneId: string | null
  currentGeneration: number
}

type WeatherSceneRuntimeDebugApi = {
  snapshot: () => WeatherSceneRuntimeDebugSnapshot
  reset: () => void
}

declare global {
  interface Window {
    __lifeboardWeatherSceneRuntimeDebug?: WeatherSceneRuntimeDebugApi
  }
}

const debugStorageKey = '__lifeboard_weather_runtime_debug'

const runtimeDebugState: WeatherSceneRuntimeDebugSnapshot = {
  applicationCount: 0,
  canvasCount: 0,
  activeSceneCount: 0,
  tickerCallbackCount: 0,
  resizeListenerCount: 0,
  visibilityListenerCount: 0,
  mediaQueryListenerCount: 0,
  activeTextureCount: 0,
  textureCreationCount: 0,
  sceneBuildCount: 0,
  sceneDestroyCount: 0,
  applicationCreateCount: 0,
  applicationDestroyCount: 0,
  tickerAddCount: 0,
  tickerRemoveCount: 0,
  resizeListenerAddCount: 0,
  resizeListenerRemoveCount: 0,
  visibilityListenerAddCount: 0,
  visibilityListenerRemoveCount: 0,
  mediaQueryListenerAddCount: 0,
  mediaQueryListenerRemoveCount: 0,
  pauseCount: 0,
  resumeCount: 0,
  currentSceneId: null,
  currentGeneration: 0,
}

function isDebugEnabled() {
  if (import.meta.env.DEV) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(debugStorageKey) === '1'
  } catch {
    return false
  }
}

function snapshot(): WeatherSceneRuntimeDebugSnapshot {
  return { ...runtimeDebugState }
}

function reset() {
  for (const key of Object.keys(runtimeDebugState) as Array<keyof WeatherSceneRuntimeDebugSnapshot>) {
    if (typeof runtimeDebugState[key] === 'number') {
      ;(runtimeDebugState[key] as number) = 0
    }
  }
  runtimeDebugState.currentSceneId = null
}

function syncDebugApi() {
  if (typeof window === 'undefined') {
    return
  }

  if (!isDebugEnabled()) {
    if (window.__lifeboardWeatherSceneRuntimeDebug) {
      delete window.__lifeboardWeatherSceneRuntimeDebug
    }
    return
  }

  window.__lifeboardWeatherSceneRuntimeDebug = {
    snapshot,
    reset,
  }
}

function increment(key: keyof WeatherSceneRuntimeDebugSnapshot, amount = 1) {
  const current = runtimeDebugState[key]

  if (typeof current === 'number') {
    ;(runtimeDebugState[key] as number) = Math.max(0, current + amount)
  }

  syncDebugApi()
}

export function recordWeatherPixiApplicationCreated() {
  increment('applicationCount')
  increment('applicationCreateCount')
}

export function recordWeatherPixiApplicationDestroyed() {
  increment('applicationCount', -1)
  increment('applicationDestroyCount')
}

export function recordWeatherPixiCanvasMounted() {
  increment('canvasCount')
}

export function recordWeatherPixiCanvasRemoved() {
  increment('canvasCount', -1)
}

export function recordWeatherPixiSceneBuilt(sceneId: string | null) {
  runtimeDebugState.currentSceneId = sceneId
  increment('activeSceneCount')
  increment('sceneBuildCount')
}

export function recordWeatherPixiSceneDestroyed() {
  increment('activeSceneCount', -1)
  increment('sceneDestroyCount')

  if (runtimeDebugState.activeSceneCount === 0) {
    runtimeDebugState.currentSceneId = null
  }

  syncDebugApi()
}

export function recordWeatherPixiTickerAdded() {
  increment('tickerCallbackCount')
  increment('tickerAddCount')
}

export function recordWeatherPixiTickerRemoved() {
  increment('tickerCallbackCount', -1)
  increment('tickerRemoveCount')
}

export function recordWeatherPixiResizeListenerAdded() {
  increment('resizeListenerCount')
  increment('resizeListenerAddCount')
}

export function recordWeatherPixiResizeListenerRemoved() {
  increment('resizeListenerCount', -1)
  increment('resizeListenerRemoveCount')
}

export function recordWeatherPixiVisibilityListenerAdded() {
  increment('visibilityListenerCount')
  increment('visibilityListenerAddCount')
}

export function recordWeatherPixiVisibilityListenerRemoved() {
  increment('visibilityListenerCount', -1)
  increment('visibilityListenerRemoveCount')
}

export function recordWeatherPixiMediaQueryListenersAdded(count: number) {
  increment('mediaQueryListenerCount', count)
  increment('mediaQueryListenerAddCount', count)
}

export function recordWeatherPixiMediaQueryListenersRemoved(count: number) {
  increment('mediaQueryListenerCount', -count)
  increment('mediaQueryListenerRemoveCount', count)
}

export function recordWeatherPixiTexturesCreated(count: number) {
  increment('activeTextureCount', count)
  increment('textureCreationCount', count)
}

export function recordWeatherPixiTexturesDestroyed(count: number) {
  increment('activeTextureCount', -count)
}

export function recordWeatherPixiPaused() {
  increment('pauseCount')
}

export function recordWeatherPixiResumed() {
  increment('resumeCount')
}

export function recordWeatherPixiGeneration(generation: number) {
  runtimeDebugState.currentGeneration = generation
  syncDebugApi()
}

export function ensureWeatherPixiRuntimeDebugApi() {
  syncDebugApi()
}
