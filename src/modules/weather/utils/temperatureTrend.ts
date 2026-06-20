export const LONG_RANGE_DAY_WIDTH = 136
export const TEMPERATURE_TREND_HEIGHT = 168
export const TEMPERATURE_TREND_PADDING_X = 18
export const TEMPERATURE_TREND_PADDING_Y = 28

export interface TemperatureTrendPoint {
  index: number
  value: number | null
}

export interface TemperatureTrendPlotPoint {
  index: number
  value: number
  x: number
  y: number
}

export function isUsableTemperature(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function temperatureRange(points: TemperatureTrendPoint[]) {
  const values = points
    .map((point) => point.value)
    .filter(isUsableTemperature)

  if (values.length === 0) {
    return null
  }

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return {
      min: min - 1,
      max: max + 1,
    }
  }

  return { min, max }
}

export function createTemperatureTrendPoints(
  points: TemperatureTrendPoint[],
  width: number,
  height = TEMPERATURE_TREND_HEIGHT,
) {
  const range = temperatureRange(points)

  if (!range) {
    return []
  }

  const usableHeight = height - TEMPERATURE_TREND_PADDING_Y * 2

  return points.flatMap<TemperatureTrendPlotPoint>((point) => {
    const pointValue = point.value

    if (!isUsableTemperature(pointValue)) {
      return []
    }

    const x = Math.min(
      width - TEMPERATURE_TREND_PADDING_X,
      point.index * LONG_RANGE_DAY_WIDTH + LONG_RANGE_DAY_WIDTH / 2,
    )
    const ratio = (pointValue - range.min) / (range.max - range.min)
    const y = height - TEMPERATURE_TREND_PADDING_Y - ratio * usableHeight

    return [{
      index: point.index,
      value: pointValue,
      x,
      y,
    }]
  })
}

export function createTemperatureTrendSegments(
  points: TemperatureTrendPoint[],
  width: number,
  height = TEMPERATURE_TREND_HEIGHT,
) {
  const plotted = createTemperatureTrendPoints(points, width, height)
  const plottedByIndex = new Map(plotted.map((point) => [point.index, point]))
  const segments: TemperatureTrendPlotPoint[][] = []
  let current: TemperatureTrendPlotPoint[] = []

  points.forEach((point) => {
    const plottedPoint = plottedByIndex.get(point.index)

    if (!plottedPoint) {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
      return
    }

    current.push(plottedPoint)
  })

  if (current.length > 0) {
    segments.push(current)
  }

  return segments
}

export function polylinePoints(points: TemperatureTrendPlotPoint[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}
