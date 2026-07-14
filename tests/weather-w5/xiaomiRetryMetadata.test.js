import { describe, expect, it } from 'vitest'
import { createXiaomiHandlers } from '../../server/weather/xiaomi/handlers.js'
import { xiaomiRequestTestInternals } from '../../server/weather/xiaomi/request.js'
import { createRequest, createResponse, TEST_ENVIRONMENT } from '../weather-xiaomi/helpers.js'

function validAllUrl() {
  return '/api/weather/xiaomi/all?locationKey=opaque%3Akey&latitude=34.1&longitude=114.1&locale=zh-CN&days=15'
}

describe('Weather W5 sanitized retry metadata', () => {
  it('accepts bounded Retry-After seconds and HTTP dates without exposing upstream text', () => {
    expect(xiaomiRequestTestInternals.parseRetryAfterSeconds('120')).toBe(120)
    expect(xiaomiRequestTestInternals.parseRetryAfterSeconds('999999')).toBeUndefined()
    expect(xiaomiRequestTestInternals.parseRetryAfterSeconds('not-a-date')).toBeUndefined()
  })

  it('returns only stable status and retry metadata for an upstream rejection', async () => {
    const handlers = createXiaomiHandlers({
      environment: TEST_ENVIRONMENT,
      fetchImpl: async () => new Response('sensitive upstream body', {
        status: 429,
        headers: { 'Retry-After': '90', 'Content-Type': 'text/plain' },
      }),
    })
    const response = createResponse()
    await handlers.all(createRequest(validAllUrl()), response)

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual({
      ok: false,
      error: { code: 'xiaomiRejected', upstreamStatus: 429, retryAfterSeconds: 90 },
    })
    expect(JSON.stringify(response.body)).not.toContain('sensitive upstream body')
  })
})
