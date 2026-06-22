import type { WeatherMotionPresetName } from '@/modules/weather/visual/types'

export interface WeatherMotionPreset {
  name: WeatherMotionPresetName
  durationMs: number
  reducedMotion: 'static' | 'short-transition'
}

export const WEATHER_MOTION_PRESETS = {
  static: {
    name: 'static',
    durationMs: 0,
    reducedMotion: 'static',
  },
  'partly-cloudy-gentle': {
    name: 'partly-cloudy-gentle',
    durationMs: 42000,
    reducedMotion: 'static',
  },
  'fallback-calm': {
    name: 'fallback-calm',
    durationMs: 0,
    reducedMotion: 'static',
  },
} satisfies Record<WeatherMotionPresetName, WeatherMotionPreset>
