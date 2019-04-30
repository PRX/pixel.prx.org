const crypto = require('crypto')
const SIGN_PARAM = 's'

/**
 * Sign a string
 */
exports.sign = (str, secret) => {
  secret = secret || process.env['SIGNER_SECRET'] || 'some-secret'
  const hmac = crypto.createHmac('sha256', secret)
  return hmac.update(str || '').digest('base64').replace(/\+|\/|=/g, match => {
    if (match === '+') {
      return '-'
    } else if (match === '/') {
      return '_'
    } else {
      return ''
    }
  })
}

/**
 * Check the signature for a string
 */
exports.isValid = (str, signature, secret) => {
  return exports.sign(str, secret) === signature
}

/**
 * Sign an object
 */
exports.signObject = (obj, secret) => {
  const copy = JSON.parse(JSON.stringify(obj || {}))
  delete copy[SIGN_PARAM]
  const sorted = Object.keys(copy).sort().map(key => [key, copy[key]])
  copy[SIGN_PARAM] = exports.sign(JSON.stringify(sorted), secret)
  return copy
}

/**
 * Check signature on an object
 */
exports.isValidObject = (obj, secret) => {
  const signed = exports.signObject(obj, secret)
  return signed[SIGN_PARAM] === (obj || {})[SIGN_PARAM]
}
