import type { LifeBoardCondition } from '@/modules/weather/visual/types'

const wmoConditionMap: Record<number, LifeBoardCondition> = {
  0: 'clear',
  1: 'clear',
  2: 'partly-cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'sleet-freezing',
  57: 'sleet-freezing',
  61: 'light-rain',
  63: 'moderate-rain',
  65: 'heavy-rain',
  66: 'sleet-freezing',
  67: 'sleet-freezing',
  71: 'light-snow',
  73: 'moderate-snow',
  75: 'heavy-snow',
  77: 'light-snow',
  80: 'light-rain',
  81: 'moderate-rain',
  82: 'heavy-rain',
  85: 'light-snow',
  86: 'heavy-snow',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
}

export function getLifeBoardConditionFromWmo(
  code: number,
): LifeBoardCondition {
  return wmoConditionMap[code] ?? 'unknown'
}

export const weatherConditionTestInternals = {
  wmoConditionMap,
}
