import type {
  Application,
  Container,
  Graphics,
  Sprite,
  Texture,
  TextureSource,
  Ticker,
} from 'pixi.js'
import type {
  LifeBoardCondition,
  WeatherEffectGroup,
  WeatherIntensity,
  WeatherIntensityPreset,
  WeatherTimeline,
} from '@/modules/weather/visual/types'

export type PixiWeatherRendererStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'static-fallback'
  | 'destroyed'
  | 'error'

export type PixiWeatherVisualKey = 'partly-cloudy-day' | 'partly-cloudy-night'

export type PixiWeatherLayerType =
  | 'sprite'
  | 'tiling-sprite'
  | 'particle'
  | 'atmosphere'
  | 'overlay'
  | 'sequence'
  | 'image'

export type PixiWeatherPerformanceTier = 'high' | 'balanced' | 'low' | 'static'

export type PixiWeatherViewportProfile =
  | 'desktop'
  | 'tablet-portrait'
  | 'tablet-landscape'
  | 'mobile'

export type PixiWeatherReferenceSceneSource =
  | 'authorized-vendor'
  | 'local-reference'

export interface PixiWeatherReferenceLayer {
  type: PixiWeatherLayerType
  url: string
  role: string
  opacity: number
  speedX: number
  speedY: number
  scale: number
  fit: 'cover'
  assetType: string
  blendMode?: 'normal'
  tint?: number
  positionX?: number
  positionY?: number
  particleCount?: number
  particleScale?: number
  particleSpread?: number
}

export interface PixiWeatherReferenceScene {
  key: string
  source: PixiWeatherReferenceSceneSource
  condition?: LifeBoardCondition
  effectGroup: WeatherEffectGroup
  intensity: WeatherIntensity
  intensityPreset: WeatherIntensityPreset
  timeline: Extract<WeatherTimeline, 'day' | 'night'>
  isThunderstorm: boolean
  family: string
  v12Family?: number
  maxParticleCount: number
  layers: PixiWeatherReferenceLayer[]
}

export interface PixiWeatherSceneOptions {
  driftX: number
  driftY: number
  scale: number
  ambientOpacity: number
  maxFps: number
  performanceTier: PixiWeatherPerformanceTier
  viewportProfile: PixiWeatherViewportProfile
}

export interface PixiWeatherSceneInput {
  visualKey: PixiWeatherVisualKey
  timeline: Extract<WeatherTimeline, 'day' | 'night'>
  imageElement: HTMLImageElement
  reducedMotion: boolean
}

export interface PixiWeatherSceneHandles {
  app: Application
  scene: Container
  baseSprite?: Sprite
  ambientSprite?: Sprite
  baseTexture?: Texture
  baseTextureSource?: TextureSource
  ambientTexture?: Texture
  ambientTextureSource?: TextureSource
  thunderOverlay?: Graphics
  localLayers: Array<{
    layer: PixiWeatherReferenceLayer
    sprite: Sprite
    phase: number
  }>
  particleLayers: Array<{
    layer: PixiWeatherReferenceLayer
    sprites: Sprite[]
    seed: number
    width: number
    height: number
  }>
  onTick: (ticker: Ticker) => void
}

export interface PixiWeatherMetrics {
  canvasWidth: number
  canvasHeight: number
  dpr: number
  maxFps: number
  performanceTier: PixiWeatherPerformanceTier
  viewportProfile: PixiWeatherViewportProfile
  layerCount: number
  loadedLayerCount: number
  maxParticleCount: number
  initMs: number
  readyMs: number
  rendererType: string
}
