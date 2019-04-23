const log = require('lambda-log')
const util = require('./lib/util')
const tracker = require('./lib/tracker')
const {base64Pixel, pixelSize} = require('./lib/constants')

const TARGET_PATH = '/i.gif'
const text = (statusCode, body) => {
  return {statusCode, body, headers: {'content-type': 'text/plain'}}
}

/**
 * Serve a 1x1 pixel and log metrics
 */
exports.handler = async (event) => {
  try {
    if (event.path === TARGET_PATH && ['GET', 'HEAD'].indexOf(event.httpMethod) > -1) {
      const headers = util.keysToLowerCase(event.headers)
      const identity = (event.requestContext || {}).identity || {}
      const query = event.queryStringParameters || {}

      await tracker.log(
        query['k'],
        query['c'],
        headers['user-agent'],
        headers['x-forwarded-for'] || identity['sourceIp'],
        headers['referer'],
      )

      return {
        statusCode: 200,
        body: base64Pixel,
        isBase64Encoded: true,
        headers: {'content-type': 'image/gif', 'content-length': pixelSize},
      }
    } else if (event.path === TARGET_PATH) {
      return text(405, 'Method not allowed')
    } else {
      return text(404, 'Pixel not found')
    }
  } catch (err) {
    log.error(err)
    return text(500, `Well that didn't work`)
  }
}
