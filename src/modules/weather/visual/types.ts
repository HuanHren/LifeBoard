export type LifeBoardCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'haze'
  | 'drizzle'
  | 'light-rain'
  | 'moderate-rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'light-snow'
  | 'moderate-snow'
  | 'heavy-snow'
  | 'sleet-freezing'
  | 'sand-dust'
  | 'unknown'

export type WeatherEffectGroup =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'haze'
  | 'light-rain'
  | 'moderate-rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'light-snow'
  | 'moderate-snow'
  | 'heavy-snow'
  | 'sleet-freezing'
  | 'sand-dust'
  | 'unknown'

export type WeatherIntensity = 'none' | 'light' | 'moderate' | 'heavy' | 'severe'

export interface WeatherIntensityPreset {
  density: number
  speed: number
  opacity: number
  cloudDarkness: number
  atmosphereOpacity: number
}

export type WeatherTimeline = 'sunrise' | 'day' | 'sunset' | 'night'

export type WeatherMotionPresetName =
  | 'static'
  | 'partly-cloudy-gentle'
  | 'partly-cloudy-night-gentle'
  | 'fallback-calm'

export type WeatherContentTone = 'light' | 'dark' | 'adaptive'

export type WeatherFallbackReason =
  | 'registered'
  | 'unregistered-visual'
  | 'missing-asset'
  | 'unknown-condition'

export interface WeatherVisualAssetSource {
  avif?: string
  webp?: string
  png?: string
  width: number
  height: number
}

export interface WeatherVisualAssetPair {
  desktop?: WeatherVisualAssetSource
  mobile?: WeatherVisualAssetSource
}

export interface WeatherVisualDefinition {
  condition: LifeBoardCondition
  effectGroup: WeatherEffectGroup
  timeline: WeatherTimeline
  desktopAsset?: WeatherVisualAssetSource
  mobileAsset?: WeatherVisualAssetSource
  motionPreset: WeatherMotionPresetName
  contentTone: WeatherContentTone
  fallbackKey: string
}

export interface ResolveWeatherVisualInput {
  weatherCode: number
  isDay?: boolean | null
  sunrise?: string | null
  sunset?: string | null
  currentTime?: string | null
}

export interface ResolvedWeatherVisual {
  weatherCode: number
  condition: LifeBoardCondition
  effectGroup: WeatherEffectGroup
  intensity: WeatherIntensity
  timeline: WeatherTimeline
  desktopAsset?: WeatherVisualAssetSource
  mobileAsset?: WeatherVisualAssetSource
  motionPreset: WeatherMotionPresetName
  contentTone: WeatherContentTone
  fallbackKey: string
  fallbackReason: WeatherFallbackReason
  hasRegisteredVisual: boolean
}
