import { getWeatherSceneAsset } from '@/modules/weather/scenes/weatherSceneAssets'
import type { WeatherSceneAssetId } from '@/modules/weather/scenes/weatherSceneTypes'
import type {
  ResolvedWeatherSceneAsset,
  WeatherSceneRuntimeIssue,
} from '@/modules/weather/scenes/runtime/weatherSceneRuntimeTypes'

function hasRenderableSource(source: ResolvedWeatherSceneAsset | null) {
  return Boolean(
    source?.desktop?.avif ||
      source?.desktop?.webp ||
      source?.desktop?.png ||
      source?.mobile?.avif ||
      source?.mobile?.webp ||
      source?.mobile?.png ||
      source?.fallback?.avif ||
      source?.fallback?.webp ||
      source?.fallback?.png,
  )
}

export function resolveWeatherSceneAsset(
  assetId: WeatherSceneAssetId,
): {
  asset: ResolvedWeatherSceneAsset | null
  issues: readonly WeatherSceneRuntimeIssue[]
} {
  const asset = getWeatherSceneAsset(assetId)

  if (!asset) {
    return {
      asset: null,
      issues: [
        {
          code: 'ASSET_RESOLUTION_FAILED',
          message: `Scene asset ${assetId} is not registered.`,
          path: `assets.${assetId}`,
        },
      ],
    }
  }

  const resolvedAsset = {
    id: asset.id,
    desktop: asset.desktop,
    mobile: asset.mobile,
    fallback: asset.fallback,
  } satisfies ResolvedWeatherSceneAsset

  if (!hasRenderableSource(resolvedAsset)) {
    return {
      asset: null,
      issues: [
        {
          code: 'ASSET_RESOLUTION_FAILED',
          message: `Scene asset ${assetId} has no renderable source.`,
          path: `assets.${assetId}`,
        },
      ],
    }
  }

  return {
    asset: resolvedAsset,
    issues: [],
  }
}
