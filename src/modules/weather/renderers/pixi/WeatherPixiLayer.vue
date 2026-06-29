<script setup lang="ts">
import {
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
import type { Texture } from 'pixi.js'
import { createAmbientLightTexture } from '@/modules/weather/renderers/pixi/createAmbientLightTexture'
import { createPixiTextureFromImage } from '@/modules/weather/renderers/pixi/createPixiTextureFromImage'
import { fitWeatherSprite } from '@/modules/weather/renderers/pixi/fitWeatherSprite'
import { getPartlyCloudyPixiPreset } from '@/modules/weather/renderers/pixi/partlyCloudyPixiPreset'
import {
  canCreateWebGlContext,
  getCappedResolution,
  isSaveDataEnabled,
} from '@/modules/weather/renderers/pixi/pixiWeatherCapabilities'
import type {
  PixiWeatherMetrics,
  PixiWeatherPerformanceTier,
  PixiWeatherReferenceScene,
  PixiWeatherRendererStatus,
  PixiWeatherSceneHandles,
  PixiWeatherSceneOptions,
  PixiWeatherVisualKey,
  PixiWeatherViewportProfile,
} from '@/modules/weather/renderers/pixi/types'

interface Props {
  enabled: boolean
  imageElement: HTMLImageElement | null
  referenceScene?: PixiWeatherReferenceScene | null
  visualKey: PixiWeatherVisualKey | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  statusChange: [status: PixiWeatherRendererStatus]
  metrics: [metrics: PixiWeatherMetrics]
}>()

const rootRef = useTemplateRef<HTMLDivElement>('root')
const status = shallowRef<PixiWeatherRendererStatus>('idle')
const metrics = shallowRef<PixiWeatherMetrics | null>(null)
const prefersReducedMotion = shallowRef(false)
const isMobileViewport = shallowRef(false)
const initGeneration = shallowRef(0)

let mediaQuery: MediaQueryList | null = null
let mobileQuery: MediaQueryList | null = null
let tabletQuery: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null
let handles: PixiWeatherSceneHandles | null = null
let contextLostHandler: ((event: Event) => void) | null = null
let disposed = false

const MAX_REFERENCE_LAYERS = 8

const canAttemptPixi = computed(() => {
  const image = props.imageElement
  const hasPosterScene =
    props.visualKey !== null &&
    image !== null &&
    image.complete &&
    image.naturalWidth > 0 &&
    image.naturalHeight > 0
  const hasLocalScene =
    props.referenceScene !== null &&
    props.referenceScene !== undefined &&
    props.referenceScene.layers.length > 0

  return (
    props.enabled &&
    (hasPosterScene || hasLocalScene) &&
    !prefersReducedMotion.value
  )
})

function setStatus(nextStatus: PixiWeatherRendererStatus) {
  status.value = nextStatus
  emit('statusChange', nextStatus)
}

function destroyPixi(nextStatus: PixiWeatherRendererStatus = 'destroyed') {
  initGeneration.value += 1

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (handles) {
    handles.app.ticker.stop()
    handles.app.ticker.remove(handles.onTick)

    if (contextLostHandler) {
      handles.app.canvas.removeEventListener('webglcontextlost', contextLostHandler)
      contextLostHandler = null
    }

    handles.app.destroy({ removeView: true }, {
      children: true,
      texture: true,
      textureSource: true,
    })
    handles = null
  }

  metrics.value = null

  if (!disposed) {
    setStatus(nextStatus)
  }
}

function getRootSize() {
  const root = rootRef.value
  const rect = root?.getBoundingClientRect()

  return {
    width: Math.max(1, Math.round(rect?.width ?? 0)),
    height: Math.max(1, Math.round(rect?.height ?? 0)),
  }
}

function getViewportProfile(): PixiWeatherViewportProfile {
  if (isMobileViewport.value) {
    return 'mobile'
  }

  if (tabletQuery?.matches) {
    return window.innerWidth > window.innerHeight
      ? 'tablet-landscape'
      : 'tablet-portrait'
  }

  return 'desktop'
}

function getPerformanceTier(): PixiWeatherPerformanceTier {
  if (prefersReducedMotion.value) {
    return 'static'
  }

  if (isSaveDataEnabled()) {
    return 'low'
  }

  const viewportProfile = getViewportProfile()

  if (viewportProfile === 'mobile') {
    return 'low'
  }

  if (
    viewportProfile === 'tablet-landscape' ||
    viewportProfile === 'tablet-portrait'
  ) {
    return 'balanced'
  }

  return 'high'
}

function getSceneOptions(): PixiWeatherSceneOptions {
  const performanceTier = getPerformanceTier()
  const viewportProfile = getViewportProfile()
  const posterPreset = getPartlyCloudyPixiPreset(
    props.visualKey ?? 'partly-cloudy-day',
    viewportProfile === 'mobile',
  )
  const intensityPreset = props.referenceScene?.intensityPreset

  if (!props.referenceScene || !intensityPreset) {
    return {
      ...posterPreset,
      performanceTier,
      viewportProfile,
    }
  }

  const tierMultiplier =
    performanceTier === 'high'
      ? 1
      : performanceTier === 'balanced'
        ? 0.82
        : performanceTier === 'low'
          ? 0.64
          : 0

  return {
    driftX: (4 + intensityPreset.cloudDarkness * 3) * tierMultiplier,
    driftY: (-1.2 - intensityPreset.atmosphereOpacity) * tierMultiplier,
    scale: 1.01 + intensityPreset.density * 0.035,
    ambientOpacity: Math.min(0.32, 0.14 + intensityPreset.atmosphereOpacity * 0.16),
    maxFps: viewportProfile === 'mobile' ? 24 : 30,
    performanceTier,
    viewportProfile,
  }
}

function resizeScene() {
  if (!handles) {
    return
  }

  const { width, height } = getRootSize()
  const resolution = getCappedResolution(isMobileViewport.value)
  const preset = getSceneOptions()

  handles.app.ticker.maxFPS = preset.maxFps
  handles.app.renderer.resize(width, height, resolution)

  if (handles.baseSprite && props.imageElement) {
    fitWeatherSprite({
      sprite: handles.baseSprite,
      containerWidth: width,
      containerHeight: height,
      sourceWidth: props.imageElement.naturalWidth,
      sourceHeight: props.imageElement.naturalHeight,
      extraScale: preset.scale,
    })
  }

  if (handles.ambientSprite) {
    handles.ambientSprite.width = width
    handles.ambientSprite.height = height
  }

  if (handles.thunderOverlay) {
    handles.thunderOverlay.width = width
    handles.thunderOverlay.height = height
  }

  for (const layerHandle of handles.localLayers) {
    fitWeatherSprite({
      sprite: layerHandle.sprite,
      containerWidth: width,
      containerHeight: height,
      sourceWidth: layerHandle.sprite.texture.width,
      sourceHeight: layerHandle.sprite.texture.height,
      extraScale: layerHandle.layer.scale,
    })
  }

  const nextMetrics = metrics.value

  if (nextMetrics) {
    metrics.value = {
      ...nextMetrics,
      canvasWidth: handles.app.canvas.width,
      canvasHeight: handles.app.canvas.height,
      dpr: resolution,
      maxFps: preset.maxFps,
      performanceTier: preset.performanceTier,
      viewportProfile: preset.viewportProfile,
      layerCount: props.referenceScene?.layers.length ?? 0,
      loadedLayerCount: handles.localLayers.length,
      maxParticleCount: props.referenceScene?.maxParticleCount ?? 0,
    }
    emit('metrics', metrics.value)
  }
}

function pauseForVisibility() {
  if (!handles) {
    return
  }

  if (document.visibilityState === 'hidden') {
    handles.app.ticker.stop()
    return
  }

  if (status.value === 'ready' && !prefersReducedMotion.value) {
    handles.app.ticker.start()
  }
}

async function initializePixi() {
  destroyPixi('loading')

  if (!canAttemptPixi.value) {
    setStatus('static-fallback')
    return
  }

  if (isSaveDataEnabled() || !canCreateWebGlContext()) {
    setStatus('static-fallback')
    return
  }

  const root = rootRef.value

  if (!root) {
    setStatus('static-fallback')
    return
  }

  const generation = initGeneration.value
  const startMs = performance.now()

  try {
    const pixi = await import('pixi.js')

    if (disposed || generation !== initGeneration.value) {
      return
    }

    const { width, height } = getRootSize()
    const resolution = getCappedResolution(isMobileViewport.value)
    const preset = getSceneOptions()
    const app = new pixi.Application()

    await app.init({
      width,
      height,
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      autoStart: false,
      eventMode: 'none',
      hello: false,
      preference: 'webgl',
      resolution,
    })

    if (disposed || generation !== initGeneration.value) {
      app.destroy({ removeView: true }, {
        children: true,
        texture: true,
        textureSource: true,
      })
      return
    }

    const scene = new pixi.Container()
    const localLayers: PixiWeatherSceneHandles['localLayers'] = []
    let baseTexture:
      | ReturnType<typeof createPixiTextureFromImage>
      | undefined
    let ambientTexture:
      | ReturnType<typeof createAmbientLightTexture>
      | undefined
    let baseSprite: import('pixi.js').Sprite | undefined
    let ambientSprite: import('pixi.js').Sprite | undefined
    let thunderOverlay: import('pixi.js').Graphics | undefined

    if (props.visualKey && props.imageElement) {
      baseTexture = createPixiTextureFromImage(pixi, props.imageElement)
      ambientTexture = createAmbientLightTexture(pixi, props.visualKey)
      baseSprite = new pixi.Sprite(baseTexture.texture)
      ambientSprite = new pixi.Sprite(ambientTexture.texture)

      scene.addChild(baseSprite)
      scene.addChild(ambientSprite)
    }

    if (props.referenceScene) {
      const tierLayerLimit =
        preset.performanceTier === 'high'
          ? MAX_REFERENCE_LAYERS
          : preset.performanceTier === 'balanced'
            ? 6
            : 4
      const sceneLayers = props.referenceScene.layers.slice(0, tierLayerLimit)
      const textureByUrl = new Map<string, unknown>()
      const uniqueUrls = [...new Set(sceneLayers.map((layer) => layer.url))]
      const textureResults = await Promise.allSettled(
        uniqueUrls.map(async (url) => ({
          url,
          texture: await pixi.Assets.load(url),
        })),
      )

      if (disposed || generation !== initGeneration.value) {
        app.destroy({ removeView: true }, {
          children: true,
          texture: true,
          textureSource: true,
        })
        return
      }

      for (const result of textureResults) {
        if (result.status === 'fulfilled') {
          textureByUrl.set(result.value.url, result.value.texture)
        }
      }

      sceneLayers.forEach((layer, index) => {
        const texture = textureByUrl.get(layer.url)

        if (!texture) {
          return
        }

        const sprite = new pixi.Sprite(texture as Texture)
        sprite.alpha = layer.opacity
        sprite.anchor.set(0.5)
        scene.addChild(sprite)
        localLayers.push({
          layer,
          sprite,
          phase: index * 0.72,
        })
      })

      if (sceneLayers.length > 0 && localLayers.length === 0 && !baseSprite) {
        app.destroy({ removeView: true }, {
          children: true,
          texture: true,
          textureSource: true,
        })
        setStatus('static-fallback')
        return
      }

      if (props.referenceScene.isThunderstorm) {
        thunderOverlay = new pixi.Graphics()
        thunderOverlay
          .rect(0, 0, width, height)
          .fill({ color: 0xdce7ef, alpha: 1 })
        thunderOverlay.alpha = 0
        scene.addChild(thunderOverlay)
      }
    }

    app.stage.addChild(scene)

    app.canvas.className = 'weather-pixi-layer__canvas'
    app.canvas.setAttribute('aria-hidden', 'true')
    app.canvas.setAttribute('role', 'presentation')
    app.canvas.setAttribute('tabindex', '-1')

    root.appendChild(app.canvas)
    app.ticker.maxFPS = preset.maxFps
    app.ticker.minFPS = 10

    let elapsedMs = 0
    let thunderSeed = 0.37
    let nextThunderMs =
      props.referenceScene?.intensity === 'severe' ? 4200 : 6200
    let thunderRemainingMs = 0
    const onTick = (ticker: import('pixi.js').Ticker) => {
      elapsedMs += ticker.deltaMS
      const cycle = elapsedMs / 52000
      const wave = Math.sin(cycle * Math.PI * 2)

      if (ambientSprite) {
        scene.x = wave * preset.driftX
        scene.y = wave * preset.driftY
        ambientSprite.alpha = preset.ambientOpacity + wave * 0.025
      }

      for (const layerHandle of localLayers) {
        const layerWave = Math.sin(cycle * Math.PI * 2 + layerHandle.phase)
        const verticalWave = Math.cos(cycle * Math.PI * 2 + layerHandle.phase)
        const screenWidth = app.screen.width
        const screenHeight = app.screen.height
        layerHandle.sprite.x =
          screenWidth / 2 + layerWave * screenWidth * layerHandle.layer.speedX
        layerHandle.sprite.y =
          screenHeight / 2 + verticalWave * screenHeight * layerHandle.layer.speedY
        layerHandle.sprite.alpha =
          layerHandle.layer.opacity + layerWave * layerHandle.layer.opacity * 0.05
      }

      if (thunderOverlay && props.referenceScene?.isThunderstorm) {
        if (thunderRemainingMs <= 0 && elapsedMs >= nextThunderMs) {
          thunderSeed = (thunderSeed * 9301 + 49297) % 233280
          const randomUnit = thunderSeed / 233280
          thunderRemainingMs = props.referenceScene.intensity === 'severe' ? 130 : 90
          nextThunderMs =
            elapsedMs +
            5200 +
            randomUnit * (props.referenceScene.intensity === 'severe' ? 4200 : 7200)
        }

        if (thunderRemainingMs > 0) {
          thunderRemainingMs = Math.max(0, thunderRemainingMs - ticker.deltaMS)
          thunderOverlay.alpha =
            (thunderRemainingMs / 130) *
            (props.referenceScene.intensity === 'severe' ? 0.13 : 0.09)
        } else {
          thunderOverlay.alpha = 0
        }
      }
    }

    handles = {
      app,
      scene,
      baseSprite,
      ambientSprite,
      baseTexture: baseTexture?.texture,
      baseTextureSource: baseTexture?.source,
      ambientTexture: ambientTexture?.texture,
      ambientTextureSource: ambientTexture?.source,
      thunderOverlay,
      localLayers,
      onTick,
    }

    contextLostHandler = (event: Event) => {
      event.preventDefault()
      destroyPixi('static-fallback')
    }
    app.canvas.addEventListener('webglcontextlost', contextLostHandler)

    resizeScene()
    app.render()
    app.ticker.add(onTick)
    app.ticker.start()

    resizeObserver = new ResizeObserver(() => {
      resizeScene()
    })
    resizeObserver.observe(root)

    const readyMs = performance.now()
    const nextMetrics = {
      canvasWidth: app.canvas.width,
      canvasHeight: app.canvas.height,
      dpr: resolution,
      maxFps: preset.maxFps,
      performanceTier: preset.performanceTier,
      viewportProfile: preset.viewportProfile,
      layerCount: props.referenceScene?.layers.length ?? 0,
      loadedLayerCount: localLayers.length,
      maxParticleCount: props.referenceScene?.maxParticleCount ?? 0,
      initMs: Math.round(readyMs - startMs),
      readyMs: Math.round(readyMs - startMs),
      rendererType: String((app.renderer as { type?: unknown }).type ?? 'webgl'),
    }

    metrics.value = nextMetrics
    emit('metrics', nextMetrics)
    setStatus('ready')
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Weather Pixi renderer fell back to static poster.', error)
    }

    destroyPixi('error')
  }
}

watch(
  canAttemptPixi,
  () => {
    void initializePixi()
  },
  { flush: 'post', immediate: true },
)

watch(
  () => [
    props.imageElement,
    props.visualKey,
    props.referenceScene?.key ?? null,
    props.enabled,
  ] as const,
  () => {
    void initializePixi()
  },
  { flush: 'post' },
)

watch(isMobileViewport, () => {
  resizeScene()
})

function installMediaListeners() {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mobileQuery = window.matchMedia('(max-width: 39.9375rem)')
  tabletQuery = window.matchMedia('(min-width: 40rem) and (max-width: 74.9375rem)')
  prefersReducedMotion.value = mediaQuery.matches
  isMobileViewport.value = mobileQuery.matches

  const handleReducedMotionChange = (event: MediaQueryListEvent) => {
    prefersReducedMotion.value = event.matches

    if (event.matches) {
      destroyPixi('static-fallback')
      return
    }

    void initializePixi()
  }
  const handleMobileChange = (event: MediaQueryListEvent) => {
    isMobileViewport.value = event.matches
    resizeScene()
  }
  const handleTabletChange = () => {
    resizeScene()
  }

  mediaQuery.addEventListener('change', handleReducedMotionChange)
  mobileQuery.addEventListener('change', handleMobileChange)
  tabletQuery.addEventListener('change', handleTabletChange)

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', handleReducedMotionChange)
    mobileQuery?.removeEventListener('change', handleMobileChange)
    tabletQuery?.removeEventListener('change', handleTabletChange)
  })
}

if (typeof window !== 'undefined') {
  installMediaListeners()
  document.addEventListener('visibilitychange', pauseForVisibility)
}

onMounted(() => {
  void initializePixi()
})

onBeforeUnmount(() => {
  disposed = true
  document.removeEventListener('visibilitychange', pauseForVisibility)
  destroyPixi('destroyed')
})
</script>

<template>
  <div
    ref="root"
    aria-hidden="true"
    class="weather-pixi-layer"
    :data-pixi-dpr="metrics?.dpr ?? ''"
    :data-pixi-layer-count="metrics?.layerCount ?? ''"
    :data-pixi-loaded-layer-count="metrics?.loadedLayerCount ?? ''"
    :data-pixi-max-fps="metrics?.maxFps ?? ''"
    :data-pixi-max-particle-count="metrics?.maxParticleCount ?? ''"
    :data-pixi-performance-tier="metrics?.performanceTier ?? 'static'"
    :data-pixi-ready-ms="metrics?.readyMs ?? ''"
    :data-pixi-renderer="metrics?.rendererType ?? ''"
    :data-pixi-status="status"
    :data-pixi-viewport-profile="metrics?.viewportProfile ?? ''"
  />
</template>

<style scoped>
.weather-pixi-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 280ms var(--motion-ease);
}

.weather-pixi-layer[data-pixi-status='ready'] {
  opacity: 1;
}

:deep(.weather-pixi-layer__canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .weather-pixi-layer {
    display: none;
    transition: none !important;
  }
}

@media (forced-colors: active) {
  .weather-pixi-layer {
    display: none;
  }
}
</style>
