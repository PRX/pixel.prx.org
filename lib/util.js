const isBot = require('isbot')
const querystring = require('querystring')
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
 * Query param object to string
 */
exports.encodeQuery = (obj) => {
  if (obj && Object.keys(obj).length > 0) {
    return '?' + querystring.stringify(obj)
  } else {
    return ''
  }
}

/**
 * In the year 2000...
 */
exports.future = (addYears = 1, now = new Date()) => {
  const d = new Date(now)
  d.setFullYear(d.getFullYear() + addYears)
  return d
}

/**
 * API Gateway responses
 */
exports.text = (statusCode, body) => {
  return {statusCode, body, headers: {'content-type': 'text/plain'}}
}
exports.redirect = (location, setCookie) => {
  const body = `Redirecting to ${location}`
  const headers = {location, 'content-type': 'text/plain'}
  if (setCookie) {
    return {statusCode: 302, body, headers: {...headers, 'set-cookie': setCookie}}
  } else {
    return {statusCode: 302, body, headers}
  }
}
exports.html = body => {
  return {statusCode: 200, body, headers: {'content-type': 'text/html'}}
}
exports.pixel = () => {
  const headers = {'content-type': 'image/gif', 'content-length': pixelSize}
  return {statusCode: 200, body: base64Pixel, isBase64Encoded: true, headers}
}
