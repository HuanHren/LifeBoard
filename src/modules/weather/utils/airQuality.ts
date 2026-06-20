import type {
  AirQualityCategoryResult,
  AirQualityScale,
  EuropeanAqiCategoryId,
  UsAqiCategoryId,
} from '@/modules/weather/types/airQuality'

export function isValidAirQualityNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function formatAirQualityValue(value: number | null) {
  return value === null ? null : String(Math.round(value))
}

export function getUsAqiCategory(
  value: number | null,
): AirQualityCategoryResult | null {
  if (!isValidAirQualityNumber(value)) {
    return null
  }

  const rounded = Math.round(value)
  const result = (categoryId: UsAqiCategoryId, level: number) => ({
    scale: 'us-aqi' as const,
    categoryId,
    level,
  })

  if (rounded <= 50) return result('good', 1)
  if (rounded <= 100) return result('moderate', 2)
  if (rounded <= 150) return result('sensitive', 3)
  if (rounded <= 200) return result('unhealthy', 4)
  if (rounded <= 300) return result('veryUnhealthy', 5)
  return result('hazardous', 6)
}

export function getEuropeanAqiCategory(
  value: number | null,
): AirQualityCategoryResult | null {
  if (!isValidAirQualityNumber(value)) {
    return null
  }

  const rounded = Math.round(value)
  const result = (categoryId: EuropeanAqiCategoryId, level: number) => ({
    scale: 'european-aqi' as const,
    categoryId,
    level,
  })

  if (rounded <= 20) return result('good', 1)
  if (rounded <= 40) return result('fair', 2)
  if (rounded <= 60) return result('moderate', 3)
  if (rounded <= 80) return result('poor', 4)
  if (rounded <= 100) return result('veryPoor', 5)
  return result('extremelyPoor', 6)
}

export function getAirQualityCategory(
  scale: AirQualityScale,
  value: number | null,
) {
  return scale === 'us-aqi'
    ? getUsAqiCategory(value)
    : getEuropeanAqiCategory(value)
}
