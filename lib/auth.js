const http = require('http')
const https = require('https')

/**
 * Send any cookies to id, to check if a user is logged in
 */
exports.currentUser = async (cookieStr) => {
  if (process.env.ID_HOST) {
    if (cookieStr) {
      return await getUserInfo(process.env.ID_HOST, cookieStr)
    } else {
      return false
    }
  } else {
    return {sub: 0, name: 'Anonymous', preferred_username: 'anonymous'}
  }
}

/**
 * Get ID userinfo, sending cookies
 */
const getUserInfo = (host, cookie) => {
  return new Promise((resolve, reject) => {
    const opts = {host: host, path: '/userinfo?scope=profile', headers: {cookie}}
    const useHttps = host.match(/prx\.(dev|docker|tech|org)/)
    const proto = useHttps ? https : http
    proto.request(opts, res => {
      if (res.statusCode === 200) {
        const body = []
        res.on('data', chunk => body.push(chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(body).toString()))
          } catch(e) {
            reject(e)
          }
        })
      } else if (res.statusCode === 401) {
        resolve(false)
      } else {
        const url = useHttps ? `https://${host}/userinfo` : `http://${host}/userinfo`
        reject(new Error(`Got ${res.statusCode} from ${url}`))
      }
    }).on('error', err => reject(err)).end()
  })
}
