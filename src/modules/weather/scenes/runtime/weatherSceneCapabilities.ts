import type { ResolvedWeatherScene } from '@/modules/weather/scenes/weatherSceneTypes'

export const PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'

export function isPartlyCloudyDayScene(scene: ResolvedWeatherScene) {
  return scene.preset.id === PARTLY_CLOUDY_DAY_SCENE_ID
}

export function shouldUseConfigDrivenRenderer(scene: ResolvedWeatherScene) {
  return (
    isPartlyCloudyDayScene(scene) &&
    scene.context.timeline !== 'night' &&
    scene.selectedQuality !== 'static' &&
    !scene.context.reducedMotion
  )
}
