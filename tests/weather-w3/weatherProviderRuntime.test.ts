import { describe, expect, it, vi } from 'vitest'
import type { WeatherProviderRuntimeDependencies } from '@/modules/weather/providers/weatherProviderRuntime'
import {
  createWeatherProviderRuntime,
  WeatherProviderRuntimeError,
} from '@/modules/weather/providers/weatherProviderRuntime'
import { XiaomiProviderError } from '@/modules/weather/providers/xiaomi/xiaomiProvider'
import {
  createLegacySnapshot,
  createXiaomiProviderSnapshot,
  weatherLocation,
  xiaomiWeatherLocation,
} from './fixtures'

function dependencies(): WeatherProviderRuntimeDependencies {
  return {
    fetchOpenMeteo: vi.fn<WeatherProviderRuntimeDependencies['fetchOpenMeteo']>()
      .mockResolvedValue({} as Awaited<ReturnType<WeatherProviderRuntimeDependencies['fetchOpenMeteo']>>),
    fetchCaiyun: vi.fn<WeatherProviderRuntimeDependencies['fetchCaiyun']>()
      .mockResolvedValue({} as Awaited<ReturnType<WeatherProviderRuntimeDependencies['fetchCaiyun']>>),
    normalizeOpenMeteo: vi.fn<WeatherProviderRuntimeDependencies['normalizeOpenMeteo']>()
      .mockReturnValue(createLegacySnapshot('openMeteo')),
    normalizeCaiyun: vi.fn<WeatherProviderRuntimeDependencies['normalizeCaiyun']>()
      .mockReturnValue(createLegacySnapshot('caiyun')),
    readCaiyunToken: vi.fn<WeatherProviderRuntimeDependencies['readCaiyunToken']>()
      .mockReturnValue({ ok: true, data: 'safe-placeholder' }),
    fetchXiaomi: vi.fn<WeatherProviderRuntimeDependencies['fetchXiaomi']>()
      .mockResolvedValue(createXiaomiProviderSnapshot()),
    searchXiaomi: vi.fn<WeatherProviderRuntimeDependencies['searchXiaomi']>()
      .mockResolvedValue([createXiaomiProviderSnapshot().location]),
  }
}

describe('Weather W3 provider runtime', () => {
  it('dispatches Open-Meteo and returns ProviderWeatherSnapshot', async () => {
    const deps = dependencies()
    const runtime = createWeatherProviderRuntime(deps)
    const result = await runtime.fetchSnapshot({
      provider: 'openMeteo', location: weatherLocation, locale: 'en-US',
    })
    expect(deps.fetchOpenMeteo).toHaveBeenCalledOnce()
    expect(result.provider).toBe('openMeteo')
    expect(result.current.temperatureC).toBe(0)
  })

  it('keeps Caiyun in the same normalized dispatch path', async () => {
    const deps = dependencies()
    const runtime = createWeatherProviderRuntime(deps)
    const result = await runtime.fetchSnapshot({
      provider: 'caiyun', location: weatherLocation, locale: 'zh-CN',
    })
    expect(deps.readCaiyunToken).toHaveBeenCalledOnce()
    expect(deps.fetchCaiyun).toHaveBeenCalledWith(
      weatherLocation, 'safe-placeholder', undefined,
    )
    expect(result.provider).toBe('caiyun')
  })

  it('dispatches Xiaomi with only the verified locale and days contract', async () => {
    const deps = dependencies()
    const runtime = createWeatherProviderRuntime(deps)
    await runtime.fetchSnapshot({
      provider: 'xiaomi', location: xiaomiWeatherLocation, locale: 'zh-CN',
    })
    expect(deps.fetchXiaomi).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'zh-CN',
        days: 15,
        location: expect.objectContaining({
          provider: 'xiaomi', providerLocationId: 'opaque-location',
        }),
      }),
      { signal: undefined },
    )
  })

  it('requires an opaque Xiaomi location identity and never derives it from coordinates', async () => {
    const deps = dependencies()
    const runtime = createWeatherProviderRuntime(deps)
    await expect(runtime.fetchSnapshot({
      provider: 'xiaomi', location: weatherLocation, locale: 'zh-CN',
    })).rejects.toMatchObject({
      category: 'location-resolution', code: 'locationResolutionRequired',
    })
    expect(deps.fetchXiaomi).not.toHaveBeenCalled()
  })

  it('preserves Xiaomi proxy error codes as structured runtime diagnostics', async () => {
    const deps = dependencies()
    vi.mocked(deps.fetchXiaomi).mockRejectedValue(
      new XiaomiProviderError('proxy', 'xiaomiTimeout', 504),
    )
    const runtime = createWeatherProviderRuntime(deps)
    await expect(runtime.fetchSnapshot({
      provider: 'xiaomi', location: xiaomiWeatherLocation, locale: 'zh-CN',
    })).rejects.toMatchObject({
      provider: 'xiaomi', operation: 'forecast', category: 'proxy', code: 'xiaomiTimeout',
    })
  })

  it('preserves aborts without turning them into user-facing network errors', async () => {
    const deps = dependencies()
    vi.mocked(deps.fetchXiaomi).mockRejectedValue(
      new XiaomiProviderError('aborted', 'xiaomiAborted'),
    )
    const runtime = createWeatherProviderRuntime(deps)
    await expect(runtime.fetchSnapshot({
      provider: 'xiaomi', location: xiaomiWeatherLocation, locale: 'zh-CN',
    })).rejects.toMatchObject({ category: 'aborted', code: 'requestAborted' })
  })

  it('keeps Xiaomi search ordering and returns provider-neutral locations', async () => {
    const deps = dependencies()
    const second = {
      ...createXiaomiProviderSnapshot().location,
      providerLocationId: 'second',
      name: 'Second City',
    }
    vi.mocked(deps.searchXiaomi).mockResolvedValue([
      createXiaomiProviderSnapshot().location,
      second,
    ])
    const runtime = createWeatherProviderRuntime(deps)
    const results = await runtime.searchXiaomi('测试', undefined)
    expect(results.map((item) => item.providerLocationIds?.xiaomi)).toEqual([
      'opaque-location', 'second',
    ])
    expect(results.map((item) => item.name)).toEqual(['Test City', 'Second City'])
  })

  it('does not convert an empty Xiaomi search result into a failure', async () => {
    const deps = dependencies()
    vi.mocked(deps.searchXiaomi).mockResolvedValue([])
    await expect(createWeatherProviderRuntime(deps).searchXiaomi('No match')).resolves.toEqual([])
  })

  it('fails unknown providers before any transport runs', async () => {
    const deps = dependencies()
    const runtime = createWeatherProviderRuntime(deps)
    await expect(runtime.fetchSnapshot({
      provider: 'unknown' as 'xiaomi', location: weatherLocation, locale: 'en-US',
    })).rejects.toBeInstanceOf(WeatherProviderRuntimeError)
    expect(deps.fetchOpenMeteo).not.toHaveBeenCalled()
    expect(deps.fetchCaiyun).not.toHaveBeenCalled()
    expect(deps.fetchXiaomi).not.toHaveBeenCalled()
  })

  it('accepts AbortSignal for search and forecast without adding retries', async () => {
    const deps = dependencies()
    const runtime = createWeatherProviderRuntime(deps)
    const controller = new AbortController()
    await runtime.searchXiaomi('City', controller.signal)
    await runtime.fetchSnapshot({
      provider: 'xiaomi', location: xiaomiWeatherLocation, locale: 'zh-CN', signal: controller.signal,
    })
    expect(deps.searchXiaomi).toHaveBeenCalledTimes(1)
    expect(deps.fetchXiaomi).toHaveBeenCalledTimes(1)
  })
})
