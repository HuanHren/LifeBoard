import type {
  ResponsiveSceneLayout,
  SceneAccessibilityConfig,
  SceneQualityOverrides,
  SceneTransitionConfig,
} from '@/modules/weather/scenes/weatherSceneTypes'

export const defaultResponsiveSceneLayout = {
  desktop: {
    objectPosition: 'center center',
    scale: 1,
    anchor: { x: 0.5, y: 0.5 },
    crop: 'cover',
    safeArea: 'none',
    maxParticleCoverage: 0,
  },
  tablet: {
    objectPosition: 'center center',
    scale: 1,
    anchor: { x: 0.5, y: 0.5 },
    crop: 'cover',
    safeArea: 'horizontal',
    maxParticleCoverage: 0,
  },
  mobile: {
    objectPosition: '54% center',
    scale: 1,
    anchor: { x: 0.5, y: 0.5 },
    crop: 'cover',
    safeArea: 'top',
    maxParticleCoverage: 0,
  },
} satisfies ResponsiveSceneLayout

export const staticSceneQuality = {
  high: {
    maxFps: 30,
    maxLayers: 1,
    maxParticleSystems: 0,
    maxParticles: 0,
    enableClouds: false,
    enableParticles: false,
    enableLightPulse: false,
    enableBlur: false,
    renderMode: 'animated',
  },
  balanced: {
    maxFps: 30,
    maxLayers: 1,
    maxParticleSystems: 0,
    maxParticles: 0,
    enableClouds: false,
    enableParticles: false,
    enableLightPulse: false,
    enableBlur: false,
    renderMode: 'animated',
  },
  low: {
    maxFps: 24,
    maxLayers: 1,
    maxParticleSystems: 0,
    maxParticles: 0,
    enableClouds: false,
    enableParticles: false,
    enableLightPulse: false,
    enableBlur: false,
    renderMode: 'static',
  },
  static: {
    maxFps: 0,
    maxLayers: 1,
    maxParticleSystems: 0,
    maxParticles: 0,
    enableClouds: false,
    enableParticles: false,
    enableLightPulse: false,
    enableBlur: false,
    renderMode: 'poster-only',
  },
} satisfies SceneQualityOverrides

export const defaultSceneAccessibility = {
  decorative: true,
  reducedMotion: {
    mode: 'static-poster',
    maxTransitionMs: 80,
  },
  forcedColorsFallback: 'solid-surface',
} satisfies SceneAccessibilityConfig

export const defaultSceneTransition = {
  type: 'crossfade',
  durationMs: 280,
  easing: 'ease-out',
  reducedMotionType: 'short-crossfade',
  disposeOutgoingAfterMs: 320,
} satisfies SceneTransitionConfig

export const immediateSceneTransition = {
  type: 'immediate',
  durationMs: 0,
  easing: 'linear',
  reducedMotionType: 'immediate',
  disposeOutgoingAfterMs: 0,
} satisfies SceneTransitionConfig
