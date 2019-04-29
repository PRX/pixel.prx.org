const log = require('lambda-log')
const util = require('./util')

/**
 * Log a pixel tracking impression
 */
exports.log = async (query, headers, identity) => {
  query = query || {}
  headers = headers || {}
  identity = identity || {}

  const key = query['k']
  const canonical = query['c']
  const agent = headers['user-agent']
  const ip = headers['x-forwarded-for'] || identity['sourceIp']
  const referrer = headers['referer']

  const reason = skipReason(key, canonical, agent, ip)
  if (reason) {
    log.info('skip', {reason, key, canonical, agent, ip, referrer})
  } else {
    log.info('track', {key, canonical, agent, ip, referrer})
  }
}

const skipReason = (key, canonical, agent, ip) => {
  if (!key || !canonical) return 'no-data'
  if (!agent) return 'no-agent'
  if (!ip) return 'no-ip'
  if (util.isBot(agent)) return 'bot'
}
