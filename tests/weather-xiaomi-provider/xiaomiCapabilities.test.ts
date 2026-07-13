import { describe, expect, it } from 'vitest'
import { getXiaomiCapabilityStates } from '@/modules/weather/providers/xiaomi/xiaomiNormalizer'
import type { XiaomiWeatherAllRaw } from '@/modules/weather/providers/xiaomi/xiaomiRawTypes'

describe('Xiaomi capability states', () => {
  it.each([
    ['absent', {}, 'missing'],
    ['null', { alerts: null }, 'null'],
    ['empty array', { alerts: [] }, 'empty-array'],
    ['empty object', { alerts: {} }, 'empty-object'],
    ['available array', { alerts: [{}] }, 'available'],
    ['available object', { alerts: { status: 0 } }, 'available'],
    ['zero primitive', { alerts: 0 }, 'available'],
  ] as const)('classifies %s', (_label, raw, expected) => {
    expect(getXiaomiCapabilityStates(raw as XiaomiWeatherAllRaw).alerts).toBe(expected)
  })

  it('maps Xiaomi root names to provider-neutral capability names', () => {
    const states = getXiaomiCapabilityStates({ forecastHourly: {}, forecastDaily: {} })
    expect(states.hourly).toBe('empty-object')
    expect(states.daily).toBe('empty-object')
    expect(states.current).toBe('missing')
  })
})
