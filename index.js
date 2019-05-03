const cookie = require('cookie')
const log = require('lambda-log')
const uuidv4 = require('uuid/v4')
const util = require('./lib/util')
const pages = require('./lib/pages')
const tracker = require('./lib/tracker')
const COOKIE_NAME = '_pxid'

/**
 * Serve a 1x1 pixel and log metrics
 */
exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters || {}
    const headers = util.keysToLowerCase(event.headers) || {}
    const identity = (event.requestContext || {}).identity || {}
    const userId = cookie.parse(headers['cookie'] || '')[COOKIE_NAME]

    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
      return util.text(405, 'Method not allowed')
    } else if (event.path === '' || event.path === '/') {
      return pages.home()
    } else if (event.path === '/admin') {
      return await pages.admin(query, headers)
    } else if ((event.path === '/i.gif' && userId) || event.path === '/r.gif') {
      await tracker.log(query, headers, identity, userId)
      return util.pixel()
    } else if (event.path === '/i.gif') {
      const params = util.encodeQuery(query)
      const domain = headers['host']
      const expires = util.future(1)
      const setCookie = cookie.serialize(COOKIE_NAME, uuidv4(), {domain, expires})
      return util.redirect(`/r.gif${params}`, setCookie)
    } else {
      return util.text(404, 'Pixel not found')
    }
  } catch (err) {
    log.error(err)
    return util.text(500, `Well that didn't work`)
  }
}
