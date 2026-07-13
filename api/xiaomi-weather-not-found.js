import { sendError } from '../server/weather/xiaomi/response.js'

export default function handleUnknownXiaomiRoute(_request, response) {
  sendError(response, 404, 'xiaomiRouteNotFound')
}
