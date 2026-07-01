import type { WeatherSolarPhase } from '@/modules/weather/types/weatherSolarPhase'
import type {
  LifeBoardCondition,
  WeatherContentTone,
  WeatherEffectGroup,
  WeatherIntensity,
  WeatherMotionPresetName,
  WeatherTimeline,
} from '@/modules/weather/visual/types'

declare const weatherSceneIdBrand: unique symbol
declare const weatherSceneAssetIdBrand: unique symbol
declare const weatherSceneLayerIdBrand: unique symbol

export type WeatherSceneId = string & { readonly [weatherSceneIdBrand]: true }
export type WeatherSceneAssetId = string & {
  readonly [weatherSceneAssetIdBrand]: true
}
export type WeatherSceneLayerId = string & {
  readonly [weatherSceneLayerIdBrand]: true
}

export type WeatherSceneViewport = 'desktop' | 'tablet' | 'mobile'
export type WeatherSceneRenderQuality = 'high' | 'balanced' | 'low' | 'static'
export type WeatherSceneAssetKind = 'poster' | 'image' | 'atlas' | 'sequence'

export interface WeatherSceneAssetSource {
  avif?: string
  webp?: string
  png?: string
  width?: number
  height?: number
}

export interface WeatherSceneContext {
  condition: LifeBoardCondition
  effectGroup: WeatherEffectGroup
  intensity: WeatherIntensity
  period: WeatherSolarPhase
  timeline: WeatherTimeline
  viewport: WeatherSceneViewport
  quality: WeatherSceneRenderQuality
  reducedMotion: boolean
  weatherCode: number
  precipitationIntensity?: number
  cloudCover?: number
  windSpeed?: number
  visibility?: number
}

export interface WeatherSceneMatchRule {
  conditions: readonly LifeBoardCondition[]
  periods: readonly WeatherSolarPhase[]
  intensities?: readonly WeatherIntensity[]
}

export interface AssetReference {
  id: WeatherSceneAssetId
  kind: WeatherSceneAssetKind
  desktop?: WeatherSceneAssetSource
  mobile?: WeatherSceneAssetSource
  fallback?: WeatherSceneAssetSource
  preload?: boolean
}

export interface PosterReference {
  assetId: WeatherSceneAssetId
  fit: 'cover' | 'contain'
  eager?: boolean
}

interface SceneLayerBase {
  id: WeatherSceneLayerId
  zIndex: number
  enabled?: boolean
}

export interface SpriteLayer extends SceneLayerBase {
  kind: 'sprite'
  assetId: WeatherSceneAssetId
  opacity: number
  fit: 'cover' | 'contain'
  scale?: number
}

export interface CloudLayer extends SceneLayerBase {
  kind: 'cloud'
  assetId: WeatherSceneAssetId
  role: 'far' | 'mid' | 'near' | 'haze'
  opacity: number
  drift: {
    x: number
    y: number
  }
  scale: number
}

export interface ParticleLayer extends SceneLayerBase {
  kind: 'particle'
  assetId: WeatherSceneAssetId
  particleKind: 'rain' | 'snow' | 'fog' | 'dust' | 'spark'
  maxParticles: number
  speed: number
  directionDeg: number
  spread: number
  opacity: number
  depthBand: 'far' | 'mid' | 'near'
}

export interface LightLayer extends SceneLayerBase {
  kind: 'light'
  lightKind: 'sun-glow' | 'moon-glow' | 'ambient' | 'lightning-flash'
  opacity: number
  position: {
    x: number
    y: number
  }
  pulse?: {
    durationMs: number
    intervalMs: number
  }
}

export interface OverlayLayer extends SceneLayerBase {
  kind: 'overlay'
  overlayKind: 'gradient' | 'wash' | 'vignette' | 'haze'
  opacity: number
  color?: string
}

export interface ShaderLayer extends SceneLayerBase {
  kind: 'shader'
  enabled: false
  reason: string
}

export type WeatherSceneLayer =
  | SpriteLayer
  | CloudLayer
  | ParticleLayer
  | LightLayer
  | OverlayLayer
  | ShaderLayer

export interface WeatherSceneLayoutVariant {
  objectPosition: string
  scale: number
  anchor: {
    x: number
    y: number
  }
  crop: 'cover' | 'contain'
  safeArea: 'none' | 'top' | 'bottom' | 'horizontal'
  maxParticleCoverage: number
}

export interface ResponsiveSceneLayout {
  desktop: WeatherSceneLayoutVariant
  tablet: WeatherSceneLayoutVariant
  mobile: WeatherSceneLayoutVariant
}

export interface SceneQualitySetting {
  maxFps: 0 | 15 | 24 | 30 | 60
  maxLayers: number
  maxParticleSystems: number
  maxParticles: number
  enableClouds: boolean
  enableParticles: boolean
  enableLightPulse: boolean
  enableBlur: boolean
  renderMode: 'animated' | 'static' | 'poster-only'
}

export interface SceneQualityOverrides {
  high: SceneQualitySetting
  balanced: SceneQualitySetting
  low: SceneQualitySetting
  static: SceneQualitySetting
}

export interface SceneAccessibilityConfig {
  decorative: boolean
  reducedMotion: {
    mode: 'static-poster' | 'disable-particles' | 'disable-pulses'
    maxTransitionMs: number
  }
  forcedColorsFallback: 'poster' | 'solid-surface'
}

export interface SceneTransitionConfig {
  type: 'crossfade' | 'fade-through' | 'immediate'
  durationMs: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  reducedMotionType: 'immediate' | 'short-crossfade'
  disposeOutgoingAfterMs: number
}

export interface SceneFallbackConfig {
  posterAssetId: WeatherSceneAssetId
  staticClass: string
  reason:
    | 'missing-assets'
    | 'reduced-motion'
    | 'save-data'
    | 'webgl-unavailable'
    | 'unknown-condition'
}

export interface WeatherScenePreset {
  schemaVersion: '1.0.0'
  cleanRoomNotice: typeof WEATHER_SCENE_CLEAN_ROOM_NOTICE
  id: WeatherSceneId
  title: string
  description?: string
  match: WeatherSceneMatchRule
  assets: readonly AssetReference[]
  poster: PosterReference
  layers: readonly WeatherSceneLayer[]
  responsive: ResponsiveSceneLayout
  quality: SceneQualityOverrides
  accessibility: SceneAccessibilityConfig
  transitions: SceneTransitionConfig
  fallback: SceneFallbackConfig
  legacyVisual: {
    atmosphereKey: string
    motionPreset: WeatherMotionPresetName
    contentTone: WeatherContentTone
    fallbackKey: string
    timeline: WeatherTimeline
  }
}

export interface ResolvedWeatherScene {
  preset: WeatherScenePreset
  context: WeatherSceneContext
  selectedQuality: WeatherSceneRenderQuality
  selectedViewport: WeatherSceneViewport
  activeLayers: readonly WeatherSceneLayer[]
}

export const WEATHER_SCENE_CLEAN_ROOM_NOTICE =
  'LifeBoard clean-room weather scene preset v1.'

export function weatherSceneId(value: string): WeatherSceneId {
  return value as WeatherSceneId
}

export function weatherSceneAssetId(value: string): WeatherSceneAssetId {
  return value as WeatherSceneAssetId
}

export function weatherSceneLayerId(value: string): WeatherSceneLayerId {
  return value as WeatherSceneLayerId
}
