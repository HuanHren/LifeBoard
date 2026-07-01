import type { ResolvedWeatherScene } from '@/modules/weather/scenes/weatherSceneTypes'

export const PARTLY_CLOUDY_DAY_SCENE_ID = 'partly-cloudy-day'
export const PARTLY_CLOUDY_NIGHT_SCENE_ID = 'partly-cloudy-night'

export function isPartlyCloudyDayScene(scene: ResolvedWeatherScene) {
  return scene.preset.id === PARTLY_CLOUDY_DAY_SCENE_ID
}

export function isPartlyCloudyNightScene(scene: ResolvedWeatherScene) {
  return scene.preset.id === PARTLY_CLOUDY_NIGHT_SCENE_ID
}

export function isConfigDrivenPartlyCloudyScene(scene: ResolvedWeatherScene) {
  return isPartlyCloudyDayScene(scene) || isPartlyCloudyNightScene(scene)
}

export function shouldUseConfigDrivenRenderer(scene: ResolvedWeatherScene) {
  const isValidPartlyCloudyDay =
    isPartlyCloudyDayScene(scene) && scene.context.timeline !== 'night'
  const isValidPartlyCloudyNight =
    isPartlyCloudyNightScene(scene) && scene.context.timeline === 'night'

  return (
    (isValidPartlyCloudyDay || isValidPartlyCloudyNight) &&
    scene.selectedQuality !== 'static' &&
    !scene.context.reducedMotion
  )
}
