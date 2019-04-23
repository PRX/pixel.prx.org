const isBot = require('isbot')

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
