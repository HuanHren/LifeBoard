export function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
}

export function sendError(response, statusCode, code, details = {}) {
  sendJson(response, statusCode, {
    ok: false,
    error: {
      code,
      ...details,
    },
  })
}

export function sendSuccess(response, { operation, data, upstreamStatus, capabilities, now = new Date() }) {
  const meta = {
    receivedAt: now.toISOString(),
    upstreamStatus,
  }

  if (capabilities) meta.capabilities = capabilities

  sendJson(response, 200, {
    ok: true,
    provider: 'xiaomi',
    operation,
    data,
    meta,
  })
}
