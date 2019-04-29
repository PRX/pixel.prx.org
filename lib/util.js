const isBot = require('isbot')
const {base64Pixel, pixelSize} = require('./constants')

/**
 * Check if a user agent looks like a bot
 */
exports.isBot = (userAgent) => {
  return !userAgent || isBot(userAgent)
}

/**
 * Consistently lowercase header keys
 */
exports.keysToLowerCase = (obj) => {
  const lower = {}
  Object.keys(obj || {}).forEach(k => {
    lower[k.toLowerCase()] = obj[k]
  })
  return lower
}

/**
 * API Gateway responses
 */
exports.text = (statusCode, body) => {
  return {statusCode, body, headers: {'content-type': 'text/plain'}}
}
exports.html = body => {
  return {statusCode: 200, body, headers: {'content-type': 'text/html'}}
}
exports.pixel = () => {
  const headers = {'content-type': 'image/gif', 'content-length': pixelSize}
  return {statusCode: 200, body: base64Pixel, isBase64Encoded: true, headers}
}
