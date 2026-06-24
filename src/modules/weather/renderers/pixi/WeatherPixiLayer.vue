<script setup lang="ts">
import {
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
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
  PixiWeatherRendererStatus,
  PixiWeatherSceneHandles,
  PixiWeatherVisualKey,
} from '@/modules/weather/renderers/pixi/types'
import type { LocalWeatherReferenceScene } from './local-reference'

interface Props {
  enabled: boolean
  imageElement: HTMLImageElement | null
  localScene?: LocalWeatherReferenceScene | null
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
let resizeObserver: ResizeObserver | null = null
let handles: PixiWeatherSceneHandles | null = null
let contextLostHandler: ((event: Event) => void) | null = null
let disposed = false

const canAttemptPixi = computed(() => {
  const image = props.imageElement
  const hasPosterScene =
    props.visualKey !== null &&
    image !== null &&
    image.complete &&
    image.naturalWidth > 0 &&
    image.naturalHeight > 0
  const hasLocalScene =
    props.localScene !== null &&
    props.localScene !== undefined &&
    props.localScene.layers.length > 0

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

function resizeScene() {
  if (!handles) {
    return
  }

  const { width, height } = getRootSize()
  const resolution = getCappedResolution(isMobileViewport.value)
  const preset = getPartlyCloudyPixiPreset(
    props.visualKey ?? 'partly-cloudy-day',
    isMobileViewport.value,
  )

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
    const preset = getPartlyCloudyPixiPreset(
      props.visualKey ?? 'partly-cloudy-day',
      isMobileViewport.value,
    )
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

    if (props.visualKey && props.imageElement) {
      baseTexture = createPixiTextureFromImage(pixi, props.imageElement)
      ambientTexture = createAmbientLightTexture(pixi, props.visualKey)
      baseSprite = new pixi.Sprite(baseTexture.texture)
      ambientSprite = new pixi.Sprite(ambientTexture.texture)

      scene.addChild(baseSprite)
      scene.addChild(ambientSprite)
    }

    if (props.localScene) {
      const textures = await Promise.all(
        props.localScene.layers.map(async (layer) => ({
          layer,
          texture: await pixi.Assets.load(layer.url),
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

      textures.forEach(({ layer, texture }, index) => {
        const sprite = new pixi.Sprite(texture)
        sprite.alpha = layer.opacity
        sprite.anchor.set(0.5)
        scene.addChild(sprite)
        localLayers.push({
          layer,
          sprite,
          phase: index * 0.72,
        })
      })
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
        layerHandle.sprite.x =
          width / 2 + layerWave * width * layerHandle.layer.speedX
        layerHandle.sprite.y =
          height / 2 + verticalWave * height * layerHandle.layer.speedY
        layerHandle.sprite.alpha =
          layerHandle.layer.opacity + layerWave * layerHandle.layer.opacity * 0.05
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
    props.localScene?.key ?? null,
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
  }

  mediaQuery.addEventListener('change', handleReducedMotionChange)
  mobileQuery.addEventListener('change', handleMobileChange)

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', handleReducedMotionChange)
    mobileQuery?.removeEventListener('change', handleMobileChange)
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
    :data-pixi-max-fps="metrics?.maxFps ?? ''"
    :data-pixi-ready-ms="metrics?.readyMs ?? ''"
    :data-pixi-renderer="metrics?.rendererType ?? ''"
    :data-pixi-status="status"
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
