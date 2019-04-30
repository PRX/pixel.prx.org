const log = require('lambda-log')
const util = require('./lib/util')
const pages = require('./lib/pages')
const tracker = require('./lib/tracker')

/**
 * Serve a 1x1 pixel and log metrics
 */
exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters
    const headers = util.keysToLowerCase(event.headers)
    const identity = (event.requestContext || {}).identity

    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
      return util.text(405, 'Method not allowed')
    } else if (event.path === '' || event.path === '/') {
      return pages.home()
    } else if (event.path === '/admin') {
      return await pages.admin(query, headers)
    } else if (event.path === '/i.gif') {
      await tracker.log(query, headers, identity)
      return util.pixel()
    } else {
      return util.text(404, 'Pixel not found')
    }
  } catch (err) {
    log.error(err)
    return util.text(500, `Well that didn't work`)
  }
}
