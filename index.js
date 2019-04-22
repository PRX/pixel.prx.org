const log = require('lambda-log')
const {base64Pixel, pixelSize} = require('./lib/constants')

/**
 * Serve a 1x1 pixel and log metrics
 */
exports.handler = async (event) => {
  if (event.path === '/i.gif') {
    return {
      statusCode: 200,
      body: base64Pixel,
      isBase64Encoded: true,
      headers: {'content-type': 'image/gif', 'content-length': pixelSize},
    }
  } else {
    return {
      statusCode: 404,
      body: 'Pixel not found',
      headers: {'content-type': 'text/plain'},
    }
  }
}
